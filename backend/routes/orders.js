import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from './users.js';

const router = Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { shipping_address, phone, note, payment_method, name, district, upazila, area, custom_fields, delivery_charge } = req.body || {};
    if (!shipping_address || !phone) {
      return res.status(400).json({ error: 'shipping_address and phone are required' });
    }

    const items = await db.prepare('SELECT c.*, p.name, p.price, p.images, p.color_images, p.stock FROM cart c JOIN products p ON p.id = c.product_id WHERE c.user_id = ?').all(req.user.id);
    if (items.length === 0) { return res.status(400).json({ error: 'Cart is empty' }); }

    for (const item of items) {
      const color = item.color || '';
      const size = item.size || '';
      const v = await db.prepare('SELECT stock FROM product_variants WHERE product_id = ? AND color = ? AND size = ?').get(item.product_id, color, size);
      if (v) {
        if (item.quantity > v.stock) return res.status(400).json({ error: item.name + (color ? ' (' + color + ')' : '') + (size ? ' (' + size + ')' : '') + ' স্টক নেই। আছে: ' + v.stock });
      } else {
        if (item.quantity > item.stock) return res.status(400).json({ error: item.name + ' স্টক নেই। আছে: ' + item.stock });
      }
    }

    const itemsTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const dc = Number(delivery_charge) || 0;
    const total = itemsTotal + dc;
    const method = payment_method || 'cod';

    const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Dhaka' }).replace(' ', 'T');
    const result = await db.prepare('INSERT INTO orders (user_id, total, status, payment_method, payment_status, shipping_address, phone, note, customer_name, district, upazila, area, custom_fields, delivery_charge, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(req.user.id, total, 'pending', method, 'unpaid', shipping_address, phone, note || '', name || '', district || '', upazila || '', area || '', JSON.stringify(custom_fields || {}), dc, now);
    const orderId = Number(result.lastInsertRowid);

    for (const item of items) {
      let img = '';
      try {
        if (item.color) {
          const ci = item.color_images ? JSON.parse(item.color_images) : {};
          if (ci[item.color] && ci[item.color].length > 0) img = ci[item.color][0];
        }
        if (!img) {
          const imgs = item.images ? JSON.parse(item.images) : [];
          if (imgs.length > 0) img = imgs[0];
        }
      } catch(e) {}
      await db.prepare('INSERT INTO order_items (order_id, product_id, name, price, quantity, image, color, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(orderId, item.product_id, item.name, item.price, item.quantity, img, item.color || '', item.size || '');
      await db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?').run(item.quantity, item.product_id);
      const color = item.color || '';
      const size = item.size || '';
      const v = await db.prepare('SELECT id FROM product_variants WHERE product_id = ? AND color = ? AND size = ?').get(item.product_id, color, size);
      if (v) {
        await db.prepare('UPDATE product_variants SET stock = MAX(0, stock - ?) WHERE product_id = ? AND color = ? AND size = ?').run(item.quantity, item.product_id, color, size);
      } else {
        await db.prepare('INSERT INTO product_variants (product_id, color, size, stock) VALUES (?, ?, ?, MAX(0, ? - ?))').run(item.product_id, color, size, 0, item.quantity);
      }
    }

    await db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);

    const order = await db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    res.status(201).json({ ...order, items: orderItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const rows = await db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
    const orders = [];
    for (const o of rows) {
      const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      for (const item of items) {
        if (item.product_id) {
          try {
            const prod = await db.prepare('SELECT images, color_images FROM products WHERE id = ?').get(item.product_id);
            if (prod) {
              let newImg = item.image;
              if (item.color && prod.color_images) {
                const ci = JSON.parse(prod.color_images);
                if (ci[item.color] && ci[item.color].length > 0) newImg = ci[item.color][0];
              }
              if (!newImg) {
                const imgs = prod.images ? JSON.parse(prod.images) : [];
                if (imgs.length > 0) newImg = imgs[0];
              }
              if (newImg !== item.image) item.image = newImg;
            }
          } catch(e) {}
        }
      }
      orders.push({ ...o, items });
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    for (const item of items) {
      if (item.product_id) {
        try {
          const prod = await db.prepare('SELECT images, color_images FROM products WHERE id = ?').get(item.product_id);
          if (prod) {
            let newImg = item.image;
            if (item.color && prod.color_images) {
              const ci = JSON.parse(prod.color_images);
              if (ci[item.color] && ci[item.color].length > 0) newImg = ci[item.color][0];
            }
            if (!newImg) {
              const imgs = prod.images ? JSON.parse(prod.images) : [];
              if (imgs.length > 0) newImg = imgs[0];
            }
            if (newImg !== item.image) item.image = newImg;
          }
        } catch(e) {}
      }
    }
    const payments = await db.prepare('SELECT * FROM payments WHERE order_id = ?').all(order.id);
    res.json({ ...order, items, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (['shipped', 'delivered', 'cancelled', 'cancel_requested'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel this order' });
    }
    await db.prepare("UPDATE orders SET status = 'cancel_requested', payment_status = 'unpaid' WHERE id = ?").run(order.id);
    res.json({ ok: true, status: 'cancel_requested' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/reorder', authMiddleware, async (req, res) => {
  try {
    const order = await db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    let firstProductId = null;
    for (const item of items) {
      const product = await db.prepare('SELECT id, active FROM products WHERE id = ?').get(item.product_id);
      if (product && product.active && !firstProductId) {
        firstProductId = item.product_id;
      }
    }
    res.json({ ok: true, first_product_id: firstProductId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
