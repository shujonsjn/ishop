import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { authMiddleware } from './users.js';
import { upload as multerUpload } from './products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = Router();

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const productCount = await db.prepare('SELECT COUNT(*) AS c FROM products').get();
    const orderCount = await db.prepare('SELECT COUNT(*) AS c FROM orders').get();
    const userCount = await db.prepare('SELECT COUNT(*) AS c FROM users').get();
    const revenue = await db.prepare("SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE payment_status = 'paid'").get();
    const pendingOrders = await db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'pending'").get();
    res.json({ products: productCount.c, orders: orderCount.c, users: userCount.c, revenue: revenue.total, pendingOrders: pendingOrders.c });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const rows = await db.prepare('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.id DESC').all();
    res.json(rows.map(r => ({ ...r, images: JSON.parse(r.images || '[]'), colors: JSON.parse(r.colors || '[]') })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, compare_price, category_id, stock, featured, active, images, colors } = req.body || {};
    if (!name || !price) return res.status(400).json({ error: 'name and price are required' });
    const slug = name.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '') || 'product';
    const result = await db.prepare('INSERT INTO products (name, slug, description, price, compare_price, category_id, stock, featured, active, images, colors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(name, slug, description || '', Number(price), compare_price ? Number(compare_price) : null, category_id || null, stock || 0, featured ? 1 : 0, active !== 0 ? 1 : 0, JSON.stringify(images || []), JSON.stringify(colors || []));
    const row = await db.prepare('SELECT * FROM products WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json({ ...row, images: JSON.parse(row.images || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, compare_price, category_id, stock, featured, active, images, colors } = req.body || {};
    const existing = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const slug = name ? name.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '') : existing.slug;
    await db.prepare('UPDATE products SET name = ?, slug = ?, description = ?, price = ?, compare_price = ?, category_id = ?, stock = ?, featured = ?, active = ?, images = ?, colors = ? WHERE id = ?').run(name || existing.name, slug, description !== undefined ? description : existing.description, price !== undefined ? Number(price) : existing.price, compare_price !== undefined ? Number(compare_price) : existing.compare_price, category_id !== undefined ? category_id : existing.category_id, stock !== undefined ? stock : existing.stock, featured !== undefined ? (featured ? 1 : 0) : existing.featured, active !== undefined ? (active ? 1 : 0) : existing.active, images ? JSON.stringify(images) : existing.images, colors !== undefined ? JSON.stringify(colors) : existing.colors, req.params.id);
    const row = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json({ ...row, images: JSON.parse(row.images || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try { await db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/categories', authMiddleware, adminMiddleware, async (req, res) => {
  try { const rows = await db.prepare('SELECT * FROM categories ORDER BY name ASC').all(); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/categories', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, image } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const slug = name.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '') || 'category';
    const result = await db.prepare('INSERT INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)').run(name, slug, description || '', image || '');
    const row = await db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, image } = req.body || {};
    const existing = await db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Category not found' });
    const slug = name ? name.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '') : existing.slug;
    await db.prepare('UPDATE categories SET name = ?, slug = ?, description = ?, image = ? WHERE id = ?').run(name || existing.name, slug, description !== undefined ? description : existing.description, image !== undefined ? image : existing.image, req.params.id);
    const row = await db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const used = await db.prepare('SELECT COUNT(*) AS c FROM products WHERE category_id = ?').get(req.params.id);
    if (used.c > 0) return res.status(409).json({ error: 'Category has ' + used.c + ' products. Remove them first.' });
    await db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT o.*, u.name AS user_name, u.email AS user_email FROM orders o LEFT JOIN users u ON u.id = o.user_id';
    const args = [];
    if (status) { sql += ' WHERE o.status = ?'; args.push(status); }
    sql += ' ORDER BY o.id DESC';
    const rows = await db.prepare(sql).all(...args);
    const orders = [];
    for (const o of rows) {
      const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      orders.push({ ...o, items });
    }
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/orders/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, payment_status } = req.body || {};
    if (!status) return res.status(400).json({ error: 'status required' });
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    await db.prepare('UPDATE orders SET status = ?, payment_status = COALESCE(?, payment_status) WHERE id = ?').run(status, payment_status || null, req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/upload', authMiddleware, adminMiddleware, multerUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = '/uploads/' + req.file.filename;
  res.json({ url, filename: req.file.filename });
});

export default router;
