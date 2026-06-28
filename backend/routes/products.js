import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { authMiddleware } from './users.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '') || 'product';
}

router.get('/', async (req, res) => {
  try {
    const { category, search, page, limit, sort, featured } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const offset = (pageNum - 1) * limitNum;
    const where = ['p.active = 1'];
    const args = [];

    if (category) {
      where.push('(c.slug = ? OR c.id = ?)');
      args.push(category, category);
    }
    if (search) {
      where.push('(p.name LIKE ? OR p.en_name LIKE ? OR p.description LIKE ?)');
      args.push('%' + search + '%', '%' + search + '%', '%' + search + '%');
    }
    if (featured === '1') {
      where.push('p.featured = 1');
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const orderBy = sort === 'price_asc' ? 'ORDER BY p.price ASC'
      : sort === 'price_desc' ? 'ORDER BY p.price DESC'
      : sort === 'oldest' ? 'ORDER BY p.id ASC'
      : sort === 'bestselling' ? 'ORDER BY p.stock ASC, p.id DESC'
      : sort === 'ai' ? 'ORDER BY p.id DESC'
      : 'ORDER BY p.id DESC';

    const countSql = 'SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON c.id = p.category_id ' + whereClause;
    const countResult = await db.prepare(countSql).get(...args);
    const total = countResult.total;

    const sql = 'SELECT p.*, c.name AS category_name, c.en_name AS category_en_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id ' + whereClause + ' ' + orderBy + ' LIMIT ? OFFSET ?';
    const rows = await db.prepare(sql).all(...args, limitNum, offset);

    res.json({
      products: rows.map(r => ({ ...r, images: JSON.parse(r.images || '[]'), colors: JSON.parse(r.colors || '[]'), sizes: JSON.parse(r.sizes || '[]'), has_sizes: !!r.has_sizes })),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const rows = await db.prepare("SELECT p.*, c.name AS category_name, c.en_name AS category_en_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.active = 1 AND (p.featured = 1 OR (p.compare_price IS NOT NULL AND p.compare_price > p.price)) ORDER BY p.featured DESC, (p.compare_price - p.price) DESC LIMIT 8").all();
    res.json(rows.map(r => ({ ...r, images: JSON.parse(r.images || '[]'), colors: JSON.parse(r.colors || '[]'), sizes: JSON.parse(r.sizes || '[]'), has_sizes: !!r.has_sizes })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const row = await db.prepare('SELECT p.*, c.name AS category_name, c.en_name AS category_en_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE (p.slug = ? OR p.id = ?) AND p.active = 1').get(req.params.slug, isNaN(req.params.slug) ? -1 : Number(req.params.slug));
    if (!row) return res.status(404).json({ error: 'Product not found' });
    row.images = JSON.parse(row.images || '[]');
    row.colors = JSON.parse(row.colors || '[]');
    row.sizes = JSON.parse(row.sizes || '[]');
    row.color_images = JSON.parse(row.color_images || '{}');
    row.has_sizes = !!row.has_sizes; const reviews = await db.prepare('SELECT r.*, u.name AS user_name FROM reviews r LEFT JOIN users u ON u.id = r.user_id WHERE r.product_id = ? ORDER BY r.id DESC').all(row.id);
    const avgRating = await db.prepare('SELECT COALESCE(AVG(rating), 0) AS avg, COUNT(*) AS count FROM reviews WHERE product_id = ?').get(row.id);

    res.json({ ...row, reviews, avg_rating: avgRating.avg, review_count: avgRating.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await db.prepare('SELECT r.*, u.name AS user_name FROM reviews r LEFT JOIN users u ON u.id = r.user_id WHERE r.product_id = ? ORDER BY r.id DESC').all(req.params.id);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/review-status', authMiddleware, async (req, res) => {
  try {
    const existing = await db.prepare('SELECT 1 FROM reviews WHERE product_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    const purchase = await db.prepare("SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.user_id = ? AND oi.product_id = ? AND o.status IN ('delivered','paid','processing','shipped') LIMIT 1").get(req.user.id, req.params.id);
    res.json({ hasReviewed: !!existing, hasPurchased: !!purchase });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/review', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body || {};
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const product = await db.prepare('SELECT 1 FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = await db.prepare('SELECT 1 FROM reviews WHERE product_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (existing) return res.status(409).json({ error: 'You already reviewed this product' });

    const purchase = await db.prepare("SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.user_id = ? AND oi.product_id = ? AND o.status IN ('delivered','paid','processing','shipped') LIMIT 1").get(req.user.id, req.params.id);
    if (!purchase) return res.status(403).json({ error: 'review.only_purchased' });

    await db.prepare('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)').run(req.params.id, req.user.id, Math.round(rating), comment || '');
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/reviews/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body || {};
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const review = await db.prepare('SELECT * FROM reviews WHERE id = ? AND product_id = ?').get(req.params.reviewId, req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user_id !== req.user.id) return res.status(403).json({ error: 'Not your review' });

    await db.prepare('UPDATE reviews SET rating = ?, comment = ? WHERE id = ?').run(Math.round(rating), comment || '', req.params.reviewId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/reviews/:reviewId', authMiddleware, async (req, res) => {
  try {
    const review = await db.prepare('SELECT * FROM reviews WHERE id = ? AND product_id = ?').get(req.params.reviewId, req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user_id !== req.user.id) return res.status(403).json({ error: 'Not your review' });

    await db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.reviewId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---- Q&A ---- */
router.get('/:id/questions', async (req, res) => {
  try {
    const rows = await db.prepare('SELECT pq.*, u.name AS user_name FROM product_questions pq LEFT JOIN users u ON u.id = pq.user_id WHERE pq.product_id = ? ORDER BY pq.id DESC').all(req.params.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/questions', async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }
    const product = await db.prepare('SELECT 1 FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const userId = req.user ? req.user.id : null;
    const result = await db.prepare('INSERT INTO product_questions (product_id, user_id, question) VALUES (?, ?, ?)').run(req.params.id, userId, question.trim());
    res.status(201).json({ id: Number(result.lastInsertRowid), ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/variants', async (req, res) => {
  try {
    const variants = await db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(req.params.id);
    res.json(variants);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export { upload, slugify };
export default router;
