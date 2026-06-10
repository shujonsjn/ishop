import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from './users.js';

const router = Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { shipping_address, phone, note, payment_method } = req.body || {};
    if (!shipping_address || !phone) {
      return res.status(400).json({ error: 'shipping_address and phone are required' });
    }

    const items = await db.prepare('SELECT c.*, p.name, p.price, p.images, p.stock FROM cart c JOIN products p ON p.id = c.product_id WHERE c.user_id = ?').all(req.user.id);
    if (items.length === 0) { return res.status(400).json({ error: 'Cart is empty' }); }

    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const method = payment_method || 'cod';

    const result = await db.prepare('INSERT INTO orders (user_id, total, status, payment_method, payment_status, shipping_address, phone, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(req.user.id, total, method === 'cod' ? 'pending' : 'pending', method, 'unpaid', shipping_address, phone, note || '');
    const orderId = Number(result.lastInsertRowid);

    for (const item of items) {
      await db.prepare('INSERT INTO order_items (order_id, product_id, name, price, quantity, image, color) VALUES (?, ?, ?, ?, ?, ?, ?)').run(orderId, item.product_id, item.name, item.price, item.quantity, item.images ? JSON.parse(item.images)[0] || '' : '', item.color || '');
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
    const payments = await db.prepare('SELECT * FROM payments WHERE order_id = ?').all(order.id);
    res.json({ ...order, items, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
