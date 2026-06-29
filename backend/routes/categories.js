import { Router } from 'express';
import db from '../db.js';

const router = Router();

/* Build hierarchy from flat list */
function buildTree(rows, parentId = 0) {
  return rows
    .filter(r => (r.parent_id || 0) === parentId)
    .map(r => {
      const children = buildTree(rows, r.id);
      return children.length ? { ...r, children } : { ...r };
    });
}

/* Flat list (backward compatible) */
router.get('/', async (req, res) => {
  try {
    const rows = await db.prepare('SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.active = 1 GROUP BY c.id ORDER BY c.sort_order ASC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Hierarchical tree */
router.get('/tree', async (req, res) => {
  try {
    const rows = await db.prepare('SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.active = 1 GROUP BY c.id ORDER BY c.sort_order ASC').all();
    res.json(buildTree(rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await db.prepare('SELECT * FROM categories WHERE id = ? OR slug = ?').get(req.params.id, req.params.id);
    if (!row) return res.status(404).json({ error: 'Category not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
