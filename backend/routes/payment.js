import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from './users.js';

const router = Router();

const SSLCOMMERZ_STORE_ID = process.env.SSLCOMMERZ_STORE_ID || '';
const SSLCOMMERZ_STORE_PASS = process.env.SSLCOMMERZ_STORE_PASS || '';
const SSLCOMMERZ_SANDBOX = process.env.SSLCOMMERZ_SANDBOX !== 'false';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const { order_id } = req.body || {};
    if (!order_id) return res.status(400).json({ error: 'order_id required' });

    const order = await db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(order_id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.payment_status === 'paid') return res.status(400).json({ error: 'Already paid' });

    if (order.payment_method === 'cod') {
      await db.prepare('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?').run('processing', 'unpaid', order.id);
      return res.json({ redirect: '/orders.html?id=' + order.id });
    }

    if (!SSLCOMMERZ_STORE_ID) {
      await db.prepare('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?').run('paid', 'processing', order.id);
      await db.prepare('INSERT INTO payments (order_id, method, transaction_id, amount, status) VALUES (?, ?, ?, ?, ?)')
        .run(order.id, 'sslcommerz', 'DEV_MODE_' + Date.now(), order.total, 'success');
      return res.json({ redirect: '/orders.html?id=' + order.id, dev_mode: true });
    }

    const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const productNames = items.map(i => i.name).slice(0, 5).join(', ');

    const postData = {
      store_id: SSLCOMMERZ_STORE_ID,
      store_passwd: SSLCOMMERZ_STORE_PASS,
      total_amount: order.total.toFixed(2),
      currency: 'BDT',
      tran_id: 'ORDER_' + order.id + '_' + Date.now(),
      success_url: BASE_URL + '/api/payment/success',
      fail_url: BASE_URL + '/api/payment/fail',
      cancel_url: BASE_URL + '/api/payment/cancel',
      cus_name: req.user.name || 'Customer',
      cus_email: req.user.email || '',
      cus_phone: order.phone || '',
      product_name: productNames,
      product_category: 'General',
      product_profile: 'general',
    };

    const gatewayUrl = SSLCOMMERZ_SANDBOX
      ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://secure.sslcommerz.com/gwprocess/v4/api.php';

    const fetch = (await import('node-fetch')).default || global.fetch;
    const params = new URLSearchParams(postData);
    const sslRes = await fetch(gatewayUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const sslData = await sslRes.json();

    if (sslData.status === 'SUCCESS') {
      res.json({ redirect: sslData.GatewayPageURL });
    } else {
      res.status(502).json({ error: 'Payment gateway error', details: sslData });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/success', async (req, res) => {
  try {
    const { tran_id, order_id } = req.body || req.query || {};
    const orderId = order_id || (tran_id ? tran_id.split('_')[1] : null);
    if (orderId) {
      await db.prepare('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?').run('processing', 'paid', orderId);
      await db.prepare('INSERT INTO payments (order_id, method, transaction_id, amount, status) VALUES (?, ?, ?, ?, ?)')
        .run(orderId, 'sslcommerz', tran_id || 'TXN_' + Date.now(), 0, 'success');
    }
    res.redirect('/orders.html' + (orderId ? '?id=' + orderId : ''));
  } catch { res.redirect('/orders.html'); }
});

router.post('/fail', async (req, res) => {
  try {
    const { tran_id } = req.body || req.query || {};
    const orderId = tran_id ? tran_id.split('_')[1] : null;
    if (orderId) {
      await db.prepare('UPDATE orders SET payment_status = ? WHERE id = ?').run('failed', orderId);
    }
    res.redirect('/checkout.html?status=failed');
  } catch { res.redirect('/checkout.html?status=failed'); }
});

router.post('/cancel', async (req, res) => {
  try {
    const { tran_id } = req.body || req.query || {};
    const orderId = tran_id ? tran_id.split('_')[1] : null;
    if (orderId) {
      await db.prepare('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?').run('cancelled', 'unpaid', orderId);
    }
    res.redirect('/checkout.html?status=cancelled');
  } catch { res.redirect('/checkout.html?status=cancelled'); }
});

export default router;

