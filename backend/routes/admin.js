import { Router } from 'express';
import bcrypt from 'bcryptjs';
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
    const { date_from, date_to } = req.query;
    let dateFilter = '';
    let dateParams = [];
    if (date_from && date_to) {
      dateFilter = " AND date(o.created_at) >= date(?) AND date(o.created_at) <= date(?)";
      dateParams = [date_from, date_to];
    } else if (date_from) {
      dateFilter = " AND date(o.created_at) >= date(?)";
      dateParams = [date_from];
    } else if (date_to) {
      dateFilter = " AND date(o.created_at) <= date(?)";
      dateParams = [date_to];
    }
    const productCount = await db.prepare('SELECT COUNT(*) AS c FROM products').get();
    const userCount = await db.prepare('SELECT COUNT(*) AS c FROM users').get();
    const lowStock = await db.prepare("SELECT COUNT(*) AS c FROM products WHERE stock <= 5 AND stock > 0").get();
    const outOfStock = await db.prepare("SELECT COUNT(*) AS c FROM products WHERE stock = 0").get();

    const orderCount = await db.prepare("SELECT COUNT(*) AS c FROM orders o WHERE 1=1" + dateFilter).get(...dateParams);
    const revenue = await db.prepare("SELECT COALESCE(SUM(o.total), 0) AS total FROM orders o WHERE (o.payment_status = 'paid' OR o.status = 'paid')" + dateFilter).get(...dateParams);
    const pendingOrders = await db.prepare("SELECT COUNT(*) AS c FROM orders o WHERE o.status = 'pending'" + dateFilter).get(...dateParams);
    const totalPurchase = await db.prepare("SELECT COALESCE(SUM(oi.quantity * p.purchase_price), 0) AS total FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN orders o ON o.id = oi.order_id WHERE (o.payment_status = 'paid' OR o.status IN ('paid','delivered','shipped','processing'))" + dateFilter).get(...dateParams);
    const totalSales = await db.prepare("SELECT COALESCE(SUM(o.total), 0) AS total FROM orders o WHERE o.status IN ('paid','processing','shipped','delivered')" + dateFilter).get(...dateParams);
    const pendingDelivery = await db.prepare("SELECT COALESCE(SUM(o.total), 0) AS total FROM orders o WHERE o.status IN ('paid','processing','shipped')" + dateFilter).get(...dateParams);
    const recentOrders = await db.prepare("SELECT o.*, u.name AS user_name FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE 1=1" + dateFilter + " ORDER BY o.id DESC LIMIT 5").all(...dateParams);
    for (const o of recentOrders) {
      o.items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
    }

    const statusBreakdown = await db.prepare("SELECT status, COUNT(*) AS count, COALESCE(SUM(total),0) AS total FROM orders o WHERE 1=1" + dateFilter + " GROUP BY status").all(...dateParams);

    let dailyData = [];
    if (date_from && date_to) {
      dailyData = await db.prepare(
        "SELECT date(o.created_at) AS day, COUNT(*) AS orders, COALESCE(SUM(o.total),0) AS revenue FROM orders o WHERE 1=1" + dateFilter + " GROUP BY date(o.created_at) ORDER BY date(o.created_at) ASC"
      ).all(...dateParams);
    } else {
      dailyData = await db.prepare(
        "SELECT date(o.created_at) AS day, COUNT(*) AS orders, COALESCE(SUM(o.total),0) AS revenue FROM orders o WHERE date(o.created_at) >= date('now','-30 days') GROUP BY date(o.created_at) ORDER BY date(o.created_at) ASC"
      ).all();
    }

    const topProducts = await db.prepare(
      "SELECT p.name, p.en_name, SUM(oi.quantity) AS sold, SUM(oi.quantity * oi.price) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN orders o ON o.id = oi.order_id WHERE (o.payment_status='paid' OR o.status IN ('paid','processing','shipped','delivered'))" + dateFilter + " GROUP BY oi.product_id ORDER BY sold DESC LIMIT 5"
    ).all(...dateParams);

    res.json({ products: productCount.c, orders: orderCount.c, users: userCount.c, revenue: revenue.total, pendingOrders: pendingOrders.c, lowStock: lowStock.c, outOfStock: outOfStock.c, totalPurchase: totalPurchase.total, totalSales: totalSales.total, pendingDelivery: pendingDelivery.total, recentOrders, statusBreakdown, dailyData, topProducts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const rows = await db.prepare('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.id DESC').all();
    res.json(rows.map(r => ({ ...r, images: JSON.parse(r.images || '[]'), colors: JSON.parse(r.colors || '[]'), sizes: JSON.parse(r.sizes || '[]'), color_images: JSON.parse(r.color_images || '{}'), has_sizes: !!r.has_sizes })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, en_name, description, price, purchase_price, compare_price, category_id, stock, featured, active, images, colors, brand, sku, has_sizes, sizes, color_images, size_chart_image } = req.body || {};
    if (!name || !price) return res.status(400).json({ error: 'name and price are required' });
    const slug = name.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '') || 'product';
    const result = await db.prepare('INSERT INTO products (name, en_name, slug, description, price, purchase_price, compare_price, category_id, stock, featured, active, images, colors, brand, sku, has_sizes, sizes, color_images, size_chart_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(name, en_name || '', slug, description || '', Number(price), Number(purchase_price) || 0, compare_price ? Number(compare_price) : null, category_id || null, stock || 0, featured ? 1 : 0, active !== 0 ? 1 : 0, JSON.stringify(images || []), JSON.stringify(colors || []), brand || '', sku || '', has_sizes ? 1 : 0, JSON.stringify(sizes || []), JSON.stringify(color_images || {}), size_chart_image || '');
    const productId = Number(result.lastInsertRowid);
    if (req.body.variant_stocks && typeof req.body.variant_stocks === 'object') {
      for (const [key, qty] of Object.entries(req.body.variant_stocks)) {
        const [c, s] = key.split('||');
        await db.prepare('INSERT OR REPLACE INTO product_variants (product_id, color, size, stock) VALUES (?, ?, ?, ?)').run(productId, c || '', s || '', Number(qty) || 0);
      }
    }
    const row = await db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    res.status(201).json({ ...row, images: JSON.parse(row.images || '[]'), color_images: JSON.parse(row.color_images || '{}'), size_chart_image: row.size_chart_image || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, en_name, description, price, purchase_price, compare_price, category_id, stock, featured, active, images, colors, brand, sku, has_sizes, sizes, color_images, size_chart_image } = req.body || {};
    const existing = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const slug = name ? name.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '') : existing.slug;
    await db.prepare('UPDATE products SET name = ?, en_name = ?, slug = ?, description = ?, price = ?, purchase_price = ?, compare_price = ?, category_id = ?, stock = ?, featured = ?, active = ?, images = ?, colors = ?, brand = ?, sku = ?, has_sizes = ?, sizes = ?, color_images = ?, size_chart_image = ? WHERE id = ?').run(name || existing.name, en_name !== undefined ? en_name : existing.en_name || '', slug, description !== undefined ? description : existing.description, price !== undefined ? Number(price) : existing.price, purchase_price !== undefined ? Number(purchase_price) : (existing.purchase_price || 0), compare_price !== undefined ? Number(compare_price) : existing.compare_price, category_id !== undefined ? category_id : existing.category_id, stock !== undefined ? stock : existing.stock, featured !== undefined ? (featured ? 1 : 0) : existing.featured, active !== undefined ? (active ? 1 : 0) : existing.active, images ? JSON.stringify(images) : existing.images, colors !== undefined ? JSON.stringify(colors) : existing.colors, brand !== undefined ? brand : existing.brand || '', sku !== undefined ? sku : (existing.sku || ''), has_sizes !== undefined ? (has_sizes ? 1 : 0) : (existing.has_sizes || 0), sizes ? JSON.stringify(sizes) : (existing.sizes || '[]'), color_images !== undefined ? JSON.stringify(color_images) : (existing.color_images || '{}'), size_chart_image !== undefined ? size_chart_image : (existing.size_chart_image || ''), req.params.id);
    if (req.body.variant_stocks && typeof req.body.variant_stocks === 'object') {
      await db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(req.params.id);
      for (const [key, qty] of Object.entries(req.body.variant_stocks)) {
        const [c, s] = key.split('||');
        await db.prepare('INSERT INTO product_variants (product_id, color, size, stock) VALUES (?, ?, ?, ?)').run(req.params.id, c || '', s || '', Number(qty) || 0);
      }
    }
    const row = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json({ ...row, images: JSON.parse(row.images || '[]'), color_images: JSON.parse(row.color_images || '{}') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try { await db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/categories', authMiddleware, adminMiddleware, async (req, res) => {
  try { const rows = await db.prepare('SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id) AS product_count FROM categories c ORDER BY c.sort_order ASC, c.id ASC').all(); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/categories', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, en_name, description, image } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const slug = name.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '') || 'category';
    const maxRow = await db.prepare('SELECT MAX(sort_order) AS m FROM categories').get();
    const sortOrder = (maxRow && maxRow.m != null ? Number(maxRow.m) : 0) + 1;
    const result = await db.prepare('INSERT INTO categories (name, en_name, slug, description, image, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(name, en_name || '', slug, description || '', image || '', sortOrder);
    const row = await db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/categories/order', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
    for (let i = 0; i < ids.length; i++) {
      await db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?').run(i + 1, ids[i]);
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, en_name, description, image } = req.body || {};
    const existing = await db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Category not found' });
    const slug = name ? name.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '') : existing.slug;
    await db.prepare('UPDATE categories SET name = ?, en_name = ?, slug = ?, description = ?, image = ? WHERE id = ?').run(name || existing.name, en_name !== undefined ? en_name : existing.en_name || '', slug, description !== undefined ? description : existing.description, image !== undefined ? image : existing.image, req.params.id);
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

router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT id, name, email, phone, address, role, created_at FROM users';
    const args = [];
    if (role) { sql += ' WHERE role = ?'; args.push(role); }
    sql += ' ORDER BY id DESC';
    const rows = await db.prepare(sql).all(...args);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, date_from, date_to, payment_method } = req.query;
    let sql = 'SELECT o.*, u.name AS user_name, u.email AS user_email FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE 1=1';
    const args = [];
    if (status) { sql += ' AND o.status = ?'; args.push(status); }
    if (payment_method) { sql += ' AND o.payment_method = ?'; args.push(payment_method); }
    if (date_from) { sql += ' AND date(o.created_at) >= date(?)'; args.push(date_from); }
    if (date_to) { sql += ' AND date(o.created_at) <= date(?)'; args.push(date_to); }
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
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'cancel_requested'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const existingOrder = await db.prepare('SELECT status FROM orders WHERE id = ?').get(req.params.id);
    const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
    await db.prepare('UPDATE orders SET status = ?, payment_status = COALESCE(?, payment_status) WHERE id = ?').run(status, payment_status || null, req.params.id);
    if (status === 'cancelled' && existingOrder && existingOrder.status !== 'cancelled') {
      for (const item of items) {
        await db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.product_id);
        const color = item.color || '';
        const size = item.size || '';
        await db.prepare('UPDATE product_variants SET stock = stock + ? WHERE product_id = ? AND color = ? AND size = ?').run(item.quantity, item.product_id, color, size);
      }
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* Public — no auth needed */
router.get('/settings', async (req, res) => {
  try {
    const rows = await db.prepare("SELECT key, value FROM settings WHERE key IN ('site_name', 'logo_url', 'banners', 'footer_content', 'flash_sale_end', 'header_bg', 'header_text_color', 'body_bg', 'primary_color', 'footer_bg', 'footer_text_color', 'footer_copyright', 'text_flash_title_bn', 'text_flash_title_en', 'text_flash_all_bn', 'text_flash_all_en', 'text_flash_all_link', 'text_categories_title_bn', 'text_categories_title_en', 'text_jfy_title_bn', 'text_jfy_title_en', 'checkout_labels', 'checkout_custom_fields', 'sslcommerz_store_id', 'sslcommerz_store_pass', 'sslcommerz_sandbox', 'sslcommerz_base_url', 'delivery_inside_dhaka', 'delivery_outside_dhaka', 'trust_badges', 'page_about', 'page_blog', 'page_privacy', 'page_terms', 'page_refund', 'page_how_to_buy', 'page_help', 'page_app', 'page_seller', 'page_home', 'page_products', 'header_search_placeholder_bn', 'header_search_placeholder_en', 'header_show_search', 'header_show_home', 'header_show_products', 'header_show_cart', 'header_show_orders', 'header_show_admin', 'header_show_lang', 'header_show_auth', 'header_padding')").all();
    const settings = {};
    rows.forEach(function(r) { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/settings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const allowed = ['site_name', 'logo_url', 'banners', 'footer_content', 'flash_sale_end', 'header_bg', 'header_text_color', 'body_bg', 'primary_color', 'footer_bg', 'footer_text_color', 'footer_copyright', 'text_flash_title_bn', 'text_flash_title_en', 'text_flash_all_bn', 'text_flash_all_en', 'text_flash_all_link', 'text_categories_title_bn', 'text_categories_title_en', 'text_jfy_title_bn', 'text_jfy_title_en', 'sslcommerz_store_id', 'sslcommerz_store_pass', 'sslcommerz_sandbox', 'sslcommerz_base_url', 'delivery_inside_dhaka', 'delivery_outside_dhaka', 'trust_badges', 'page_about', 'page_blog', 'page_privacy', 'page_terms', 'page_refund', 'page_how_to_buy', 'page_help', 'page_app', 'page_seller', 'page_home', 'page_products', 'header_search_placeholder_bn', 'header_search_placeholder_en', 'header_show_search', 'header_show_home', 'header_show_products', 'header_show_cart', 'header_show_orders', 'header_show_admin', 'header_show_lang', 'header_show_auth', 'header_padding'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        const val = typeof req.body[key] === 'object' ? JSON.stringify(req.body[key]) : String(req.body[key]);
        await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(key, val, val);
      }
    }
    const rows = await db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach(function(r) { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/questions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const rows = await db.prepare("SELECT pq.*, p.name AS product_name, p.en_name AS product_en_name, u.name AS user_name FROM product_questions pq LEFT JOIN products p ON p.id = pq.product_id LEFT JOIN users u ON u.id = pq.user_id ORDER BY pq.id DESC").all();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/questions/:id/answer', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { answer } = req.body || {};
    if (!answer || !answer.trim()) return res.status(400).json({ error: 'Answer is required' });
    await db.prepare('UPDATE product_questions SET answer = ? WHERE id = ?').run(answer.trim(), req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/upload', authMiddleware, adminMiddleware, multerUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (req.file) {
    const uploadType = req.query.type || '';
    if (uploadType !== 'banner') {
      try {
        const sharp = (await import('sharp')).default;
        const filePath = req.file.path;
        const isCategory = uploadType === 'category';
        await sharp(filePath)
          .resize(isCategory ? 200 : 800, isCategory ? 200 : 800, { fit: 'cover', position: 'centre' })
          .jpeg({ quality: 85 })
          .toFile(filePath + '.tmp');
        const fs = await import('fs');
        fs.unlinkSync(filePath);
        fs.renameSync(filePath + '.tmp', filePath);
      } catch (e) { /* keep original if resize fails */ }
    }
  }
  const url = '/uploads/' + req.file.filename;
  res.json({ url, filename: req.file.filename });
});

router.post('/checkout', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, phone, shipping_address, area, district, upazila, payment_method, note, items, custom_fields } = req.body || {};
    if (!name || !phone || !shipping_address) return res.status(400).json({ error: 'name, phone, shipping_address are required' });
    if (!items || !items.length) return res.status(400).json({ error: 'No items' });

    const method = payment_method || 'cod';
    const total = items.reduce((s, i) => s + (Number(i.price) * Number(i.quantity)), 0);

    const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Dhaka' }).replace(' ', 'T');
    const result = await db.prepare('INSERT INTO orders (user_id, total, status, payment_method, payment_status, shipping_address, phone, note, customer_name, district, upazila, area, custom_fields, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(req.user.id || 1, total, 'pending', method, 'unpaid', shipping_address, phone, note || '', name, district || '', upazila || '', area || '', JSON.stringify(custom_fields || {}), now);
    const orderId = Number(result.lastInsertRowid);

    for (const item of items) {
      let img = '';
      try {
        const prod = await db.prepare('SELECT images, color_images FROM products WHERE id = ?').get(item.product_id);
        if (prod) {
          if (item.color) {
            const ci = prod.color_images ? JSON.parse(prod.color_images) : {};
            if (ci[item.color] && ci[item.color].length > 0) img = ci[item.color][0];
          }
          if (!img) {
            const imgs = prod.images ? JSON.parse(prod.images) : [];
            if (imgs.length > 0) img = imgs[0];
          }
        }
      } catch(e) {}
      await db.prepare('INSERT INTO order_items (order_id, product_id, name, price, quantity, image, color, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(orderId, item.product_id, item.name, item.price, item.quantity, img, item.color || '', item.size || '');
      await db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?').run(item.quantity, item.product_id);
    }

    const order = await db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    res.status(201).json({ ...order, items: orderItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products/:id/variants', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const variants = await db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(req.params.id);
    res.json(variants);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ── Admin User Management ── */

router.put('/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body || {};
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot change own role' });
    await db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
    res.json({ ok: true, role });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot delete own account' });
    if (user.role === 'admin') return res.status(400).json({ error: 'Cannot delete admin user' });
    await db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/create-admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password are required' });
    if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
    const existing = await db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const result = await db.prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)').run(name, email, phone || '', hash, 'admin');
    const u = await db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json(u);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
