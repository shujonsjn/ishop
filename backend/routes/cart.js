import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authMiddleware } from './users.js';

const router = Router();

function getCartQuery(userId, sessionId) {
  if (userId) return db.prepare('SELECT c.*, p.name, p.price, p.images, p.stock, p.active FROM cart c JOIN products p ON p.id = c.product_id WHERE c.user_id = ? ORDER BY c.id DESC').all(userId);
  return db.prepare('SELECT c.*, p.name, p.price, p.images, p.stock, p.active FROM cart c JOIN products p ON p.id = c.product_id WHERE c.session_id = ? ORDER BY c.id DESC').all(sessionId);
}

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization || '';
    let userId = null;
    if (token.startsWith('Bearer ')) {
      try {
        const jwt = await import('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce-secret-key-change-in-production';
        const decoded = jwt.default.verify(token.slice(7), JWT_SECRET);
        userId = decoded.id;
      } catch {}
    }
    const sessionId = req.headers['x-session-id'] || '';
    const items = await getCartQuery(userId, sessionId);
    const parsed = items.map(i => ({
      ...i,
      images: JSON.parse(i.images || '[]'),
      subtotal: i.price * i.quantity
    }));
    const total = parsed.reduce((s, i) => s + i.subtotal, 0);
    res.json({ items: parsed, total, count: parsed.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { product_id, quantity } = req.body || {};
    if (!product_id) return res.status(400).json({ error: 'product_id required' });
    const qty = Math.max(1, parseInt(quantity) || 1);

    const product = await db.prepare('SELECT id, stock, active FROM products WHERE id = ?').get(product_id);
    if (!product || !product.active) return res.status(404).json({ error: 'Product not found' });

    const token = req.headers.authorization || '';
    let userId = null;
    let sessionId = req.headers['x-session-id'] || '';
    if (token.startsWith('Bearer ')) {
      try {
        const jwt = await import('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce-secret-key-change-in-production';
        const decoded = jwt.default.verify(token.slice(7), JWT_SECRET);
        userId = decoded.id;
      } catch {}
    }
    if (!userId && !sessionId) { sessionId = uuidv4(); }

    const existing = userId
      ? await db.prepare('SELECT * FROM cart WHERE user_id = ? AND product_id = ?').get(userId, product_id)
      : await db.prepare('SELECT * FROM cart WHERE session_id = ? AND product_id = ?').get(sessionId, product_id);

    if (existing) {
      const newQty = Math.min(existing.quantity + qty, product.stock || 99);
      await db.prepare('UPDATE cart SET quantity = ? WHERE id = ?').run(newQty, existing.id);
    } else {
      if (userId) {
        await db.prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)').run(userId, product_id, qty);
      } else {
        await db.prepare('INSERT INTO cart (session_id, product_id, quantity) VALUES (?, ?, ?)').run(sessionId, product_id, qty);
      }
    }

    const items = await getCartQuery(userId, sessionId);
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({ items, total, count: items.length, sessionId: sessionId || undefined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body || {};
    const qty = Math.max(0, parseInt(quantity) || 0);
    if (qty === 0) { await db.prepare('DELETE FROM cart WHERE id = ?').run(req.params.id); }
    else { await db.prepare('UPDATE cart SET quantity = ? WHERE id = ?').run(qty, req.params.id); }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.prepare('DELETE FROM cart WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/merge', authMiddleware, async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || '';
    if (!sessionId) return res.json({ ok: true });
    const guestItems = await db.prepare('SELECT * FROM cart WHERE session_id = ?').all(sessionId);
    for (const item of guestItems) {
      const existing = await db.prepare('SELECT * FROM cart WHERE user_id = ? AND product_id = ?').get(req.user.id, item.product_id);
      if (existing) {
        await db.prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?').run(item.quantity, existing.id);
      } else {
        await db.prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)').run(req.user.id, item.product_id, item.quantity);
      }
      await db.prepare('DELETE FROM cart WHERE id = ?').run(item.id);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
