import { Router } from 'express';
import SSLCommerzPayment from 'sslcommerz-lts';
import db from '../db.js';
import { authMiddleware } from './users.js';

const router = Router();

async function restoreVariantStock(item) {
  const color = item.color || '';
  const size = item.size || '';
  await db.prepare('UPDATE product_variants SET stock = stock + ? WHERE product_id = ? AND color = ? AND size = ?').run(item.quantity, item.product_id, color, size);
}

async function getPaymentConfig() {
  const rows = await db.prepare(
    "SELECT key, value FROM settings WHERE key IN ('sslcommerz_store_id','sslcommerz_store_pass','sslcommerz_sandbox','sslcommerz_base_url')"
  ).all();
  const cfg = {};
  rows.forEach(r => { cfg[r.key] = r.value; });
  return {
    store_id: cfg.sslcommerz_store_id || process.env.SSLCOMMERZ_STORE_ID || '',
    store_pass: cfg.sslcommerz_store_pass || process.env.SSLCOMMERZ_STORE_PASS || '',
    sandbox: String(cfg.sslcommerz_sandbox || process.env.SSLCOMMERZ_SANDBOX || 'true').toLowerCase() !== 'false',
    base_url: cfg.sslcommerz_base_url || process.env.BASE_URL || 'http://localhost:3001'
  };
}

async function getSslcz() {
  const cfg = await getPaymentConfig();
  if (!cfg.store_id) return null;
  const isLive = cfg.sandbox ? false : true;
  return new SSLCommerzPayment(cfg.store_id, cfg.store_pass, isLive);
}

function tranId(orderId) {
  return 'ORD' + orderId + '_' + Date.now();
}

// POST /api/payment/initiate
router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const { order_id, payment_brand } = req.body || {};
    if (!order_id) return res.status(400).json({ error: 'order_id required' });

    const order = await db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(order_id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.payment_status === 'paid') return res.status(400).json({ error: 'Already paid' });

    if (order.payment_method === 'cod') {
      await db.prepare('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?').run('processing', 'unpaid', order.id);
      return res.json({ redirect: '/orders.html?id=' + order.id });
    }

    const cfg = await getPaymentConfig();
    console.log('[Payment] store_id:', cfg.store_id ? '***set***' : 'EMPTY', 'sandbox:', cfg.sandbox);
    const sslcz = await getSslcz();
    if (!sslcz) {
      console.log('[Payment] No store_id — running dev mode');
      await db.prepare('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?').run('paid', 'processing', order.id);
      await db.prepare('INSERT INTO payments (order_id, method, transaction_id, amount, status) VALUES (?, ?, ?, ?, ?)')
        .run(order.id, 'sslcommerz', 'DEV_' + Date.now(), order.total, 'success');
      return res.json({ redirect: '/orders.html?id=' + order.id, dev_mode: true });
    }

    const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const productNames = items.map(i => i.name).slice(0, 5).join(', ');
    const tid = tranId(order.id);

    const data = {
      total_amount: order.total,
      currency: 'BDT',
      tran_id: tid,
      success_url: cfg.base_url + '/api/payment/success?tran_id=' + tid,
      fail_url: cfg.base_url + '/api/payment/fail?tran_id=' + tid,
      cancel_url: cfg.base_url + '/api/payment/cancel?tran_id=' + tid,
      ipn_url: cfg.base_url + '/api/payment/ipn',
      cus_name: order.customer_name || req.user.name || 'Customer',
      cus_email: req.user.email || '',
      cus_phone: order.phone || '',
      cus_add1: order.shipping_address || '',
      cus_city: order.district || '',
      cus_state: order.upazila || '',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      shipping_method: 'YES',
      num_of_item: items.length,
      ship_name: order.customer_name || req.user.name || '',
      ship_add1: order.shipping_address || '',
      ship_city: order.district || '',
      ship_state: order.upazila || '',
      ship_postcode: '1000',
      ship_country: 'Bangladesh',
      product_name: productNames || 'Order #' + order.id,
      productcategory: 'General',
      product_category: 'General',
      product_profile: 'general',
      value_a: String(order.id),
      value_b: String(req.user.id)
    };

    console.log('[Payment] Calling sslcz.init with tid:', tid);
    const sslRes = await sslcz.init(data);
    console.log('[Payment] SSL response status:', sslRes?.status, 'GatewayPageURL:', sslRes?.GatewayPageURL ? 'YES' : 'NO');
    if (sslRes?.GatewayPageURL) {
      await db.prepare('UPDATE orders SET transaction_id = ? WHERE id = ?').run(tid, order.id);
      res.json({ redirect: sslRes.GatewayPageURL });
    } else {
      console.log('[Payment] Gateway error:', JSON.stringify(sslRes));
      res.status(502).json({ error: 'Payment gateway error', details: sslRes });
    }
  } catch (err) {
    console.error('[Payment] Error:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payment/ipn — Instant Payment Notification from SSLCommerz
router.post('/ipn', async (req, res) => {
  try {
    const { tran_id, val_id, amount, status } = req.body || {};
    if (!tran_id || !val_id) return res.status(400).send('Bad Request');

    const sslcz = await getSslcz();
    if (!sslcz) return res.status(200).send('OK');

    const validation = await sslcz.validate({ val_id });
    const orderId = tran_id.split('_')[0].replace('ORD', '');

    if (validation?.status === 'VALID' || validation?.bank_tran_id) {
      const payStatus = validation.status === 'VALID' ? 'paid' : 'failed';
      const orderStatus = validation.status === 'VALID' ? 'paid' : 'pending';

      await db.prepare('UPDATE orders SET payment_status = ?, status = ? WHERE id = ? AND payment_status != ?')
        .run(payStatus, orderStatus, orderId, 'paid');
      await db.prepare('INSERT OR IGNORE INTO payments (order_id, method, transaction_id, amount, status) VALUES (?, ?, ?, ?, ?)')
        .run(orderId, 'sslcommerz', tran_id, Number(amount || validation.amount || 0), payStatus);
    }

    res.status(200).send('OK');
  } catch {
    res.status(200).send('OK');
  }
});

// POST /api/payment/success — redirect after successful payment
router.post('/success', async (req, res) => {
  try {
    const { tran_id, val_id } = req.body || req.query || {};
    const orderId = tran_id ? tran_id.split('_')[0].replace('ORD', '') : null;

    if (orderId && val_id) {
      const sslcz = await getSslcz();
      if (sslcz) {
        const validation = await sslcz.validate({ val_id });
        if (validation?.status === 'VALID') {
          await db.prepare('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?')
            .run('paid', 'paid', orderId);
          await db.prepare('INSERT OR IGNORE INTO payments (order_id, method, transaction_id, amount, status) VALUES (?, ?, ?, ?, ?)')
            .run(orderId, 'sslcommerz', tran_id, Number(validation.amount || 0), 'success');
        }
      }
    } else if (orderId) {
      await db.prepare('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?')
        .run('paid', 'paid', orderId);
      await db.prepare('INSERT OR IGNORE INTO payments (order_id, method, transaction_id, amount, status) VALUES (?, ?, ?, ?, ?)')
        .run(orderId, 'sslcommerz', tran_id || 'TXN_' + Date.now(), 0, 'success');
    }
    res.redirect('/order-detail.html' + (orderId ? '?id=' + orderId : '') + '&payment=success');
  } catch { res.redirect('/orders.html'); }
});

// GET /api/payment/success — some browsers send GET after redirect
router.get('/success', async (req, res) => {
  try {
    const { tran_id, val_id } = req.query || {};
    const orderId = tran_id ? tran_id.split('_')[0].replace('ORD', '') : null;

    if (orderId && val_id) {
      const sslcz = await getSslcz();
      if (sslcz) {
        const validation = await sslcz.validate({ val_id });
        if (validation?.status === 'VALID') {
          await db.prepare('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?')
            .run('paid', 'paid', orderId);
          await db.prepare('INSERT OR IGNORE INTO payments (order_id, method, transaction_id, amount, status) VALUES (?, ?, ?, ?, ?)')
            .run(orderId, 'sslcommerz', tran_id, Number(validation.amount || 0), 'success');
        }
      }
    } else if (orderId) {
      await db.prepare('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?')
        .run('paid', 'paid', orderId);
    }
    res.redirect('/order-detail.html' + (orderId ? '?id=' + orderId : '') + '&payment=success');
  } catch { res.redirect('/orders.html'); }
});

// POST /api/payment/fail
router.post('/fail', async (req, res) => {
  try {
    const { tran_id } = req.body || req.query || {};
    const orderId = tran_id ? tran_id.split('_')[0].replace('ORD', '') : null;
    if (orderId) {
      const order = await db.prepare('SELECT user_id FROM orders WHERE id = ?').get(orderId);
      const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
      for (const item of items) {
        await db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.product_id);
        await restoreVariantStock(item);
        if (order && order.user_id) {
          await db.prepare('INSERT INTO cart (user_id, product_id, quantity, color, size) VALUES (?, ?, ?, ?, ?)').run(order.user_id, item.product_id, item.quantity, item.color || '', item.size || '');
        }
      }
      await db.prepare('DELETE FROM order_items WHERE order_id = ?').run(orderId);
      await db.prepare('DELETE FROM payments WHERE order_id = ?').run(orderId);
      await db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
    }
    res.redirect('/checkout.html?status=failed');
  } catch { res.redirect('/checkout.html?status=failed'); }
});

// GET /api/payment/fail — SSLCommerz browser redirect
router.get('/fail', async (req, res) => {
  try {
    const { tran_id } = req.query || {};
    const orderId = tran_id ? tran_id.split('_')[0].replace('ORD', '') : null;
    if (orderId) {
      const order = await db.prepare('SELECT user_id FROM orders WHERE id = ?').get(orderId);
      const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
      for (const item of items) {
        await db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.product_id);
        await restoreVariantStock(item);
        if (order && order.user_id) {
          await db.prepare('INSERT INTO cart (user_id, product_id, quantity, color, size) VALUES (?, ?, ?, ?, ?)').run(order.user_id, item.product_id, item.quantity, item.color || '', item.size || '');
        }
      }
      await db.prepare('DELETE FROM order_items WHERE order_id = ?').run(orderId);
      await db.prepare('DELETE FROM payments WHERE order_id = ?').run(orderId);
      await db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
    }
    res.redirect('/checkout.html?status=failed');
  } catch { res.redirect('/checkout.html?status=failed'); }
});

// POST /api/payment/cancel
router.post('/cancel', async (req, res) => {
  try {
    const { tran_id } = req.body || req.query || {};
    const orderId = tran_id ? tran_id.split('_')[0].replace('ORD', '') : null;
    if (orderId) {
      const order = await db.prepare('SELECT user_id FROM orders WHERE id = ?').get(orderId);
      const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
      for (const item of items) {
        await db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.product_id);
        await restoreVariantStock(item);
        if (order && order.user_id) {
          await db.prepare('INSERT INTO cart (user_id, product_id, quantity, color, size) VALUES (?, ?, ?, ?, ?)').run(order.user_id, item.product_id, item.quantity, item.color || '', item.size || '');
        }
      }
      await db.prepare('DELETE FROM order_items WHERE order_id = ?').run(orderId);
      await db.prepare('DELETE FROM payments WHERE order_id = ?').run(orderId);
      await db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
    }
    res.redirect('/checkout.html?status=cancelled');
  } catch { res.redirect('/checkout.html?status=cancelled'); }
});

// GET /api/payment/cancel — SSLCommerz browser redirect
router.get('/cancel', async (req, res) => {
  try {
    const { tran_id } = req.query || {};
    const orderId = tran_id ? tran_id.split('_')[0].replace('ORD', '') : null;
    if (orderId) {
      const order = await db.prepare('SELECT user_id FROM orders WHERE id = ?').get(orderId);
      const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
      for (const item of items) {
        await db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.product_id);
        await restoreVariantStock(item);
        if (order && order.user_id) {
          await db.prepare('INSERT INTO cart (user_id, product_id, quantity, color, size) VALUES (?, ?, ?, ?, ?)').run(order.user_id, item.product_id, item.quantity, item.color || '', item.size || '');
        }
      }
      await db.prepare('DELETE FROM order_items WHERE order_id = ?').run(orderId);
      await db.prepare('DELETE FROM payments WHERE order_id = ?').run(orderId);
      await db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
    }
    res.redirect('/checkout.html?status=cancelled');
  } catch { res.redirect('/checkout.html?status=cancelled'); }
});

export default router;
