import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import db from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce-secret-key-change-in-production';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/send-otp', async (req, res) => {
  try {
    const { email, phone } = req.body || {};
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone is required' });
    }
    const identifier = email || phone;
    if (email) {
      const existing = await db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
      if (existing) return res.status(409).json({ error: 'Email already registered' });
    }
    if (phone) {
      const existing = await db.prepare("SELECT 1 FROM users WHERE phone = ? AND phone != ''").get(phone);
      if (existing) return res.status(409).json({ error: 'Phone already registered' });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    await db.prepare('DELETE FROM otps WHERE identifier = ?').run(identifier);
    await db.prepare('INSERT INTO otps (identifier, code, expires_at) VALUES (?, ?, ?)').run(identifier, code, expiresAt);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body || {};
    if (!name || !password || !otp) {
      return res.status(400).json({ error: 'name, password and otp are required' });
    }
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone is required' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    const identifier = email || phone;
    const otpRow = await db.prepare('SELECT * FROM otps WHERE identifier = ? AND code = ? AND used = 0 AND expires_at > ?').get(identifier, otp, Date.now());
    if (!otpRow) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    if (email) {
      const existing = await db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
      if (existing) return res.status(409).json({ error: 'Email already registered' });
    }
    if (phone) {
      const existing = await db.prepare("SELECT 1 FROM users WHERE phone = ? AND phone != ''").get(phone);
      if (existing) return res.status(409).json({ error: 'Phone already registered' });
    }
    await db.prepare("UPDATE otps SET used = 1 WHERE identifier = ?").run(identifier);
    var finalEmail = email;
    if (!finalEmail) {
      finalEmail = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + '@local.ishop';
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await db.prepare(
      'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)'
    ).run(name, finalEmail, phone || '', hash);
    const token = jwt.sign({ id: Number(result.lastInsertRowid), email: finalEmail, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: Number(result.lastInsertRowid), name, email: finalEmail, phone: phone || '', role: 'user' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body || {};
    const identifier = email || phone;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'email/phone and password are required' });
    }
    let user;
    if (email) {
      user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    } else {
      user = await db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.prepare('SELECT id, name, email, phone, address, role, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body || {};
    await db.prepare(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?'
    ).run(name || null, phone || null, address || null, req.user.id);
    const user = await db.prepare('SELECT id, name, email, phone, address, role, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me/password', authMiddleware, async (req, res) => {
  try {
    const { current_password, new_password } = req.body || {};
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }
    if (new_password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const ok = await bcrypt.compare(current_password, user.password);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
    const hash = await bcrypt.hash(new_password, 10);
    await db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.user.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
      const sharp = (await import('sharp')).default;
      const filePath = req.file.path;
      await sharp(filePath)
        .resize(400, 400, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 85 })
        .toFile(filePath + '.tmp');
      const fs = await import('fs');
      fs.unlinkSync(filePath);
      fs.renameSync(filePath + '.tmp', filePath);
    } catch (e) { /* keep original if resize fails */ }
    const url = '/uploads/' + req.file.filename;
    await db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(url, req.user.id);
    res.json({ avatar: url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { authMiddleware };
export default router;
