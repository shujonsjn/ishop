/* ==========================================================
   SERVER.JS — Express + libSQL e-commerce backend
   Works as standalone Node server AND Vercel serverless
   ========================================================== */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { ready } from './db.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import usersRouter from './routes/users.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import paymentRouter from './routes/payment.js';
import adminRouter from './routes/admin.js';
import facebookRouter from './routes/facebook.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce-secret-key-change-in-production';
const IS_SERVERLESS = !!process.env.VERCEL;

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (!IS_SERVERLESS) {
  app.use(express.static(path.join(__dirname, '..')));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/facebook', facebookRouter);

app.get('/api/checkout-config', async (req, res) => {
  try {
    const rows = await db.prepare("SELECT key, value FROM settings WHERE key IN ('checkout_labels', 'checkout_custom_fields', 'delivery_inside_dhaka', 'delivery_outside_dhaka')").all();
    const config = {};
    rows.forEach(r => { config[r.key] = r.value; });
    res.json({
      labels: config.checkout_labels ? JSON.parse(config.checkout_labels) : {},
      custom_fields: config.checkout_custom_fields ? JSON.parse(config.checkout_custom_fields) : [],
      delivery_charge: {
        inside_dhaka: Number(config.delivery_inside_dhaka) || 80,
        outside_dhaka: Number(config.delivery_outside_dhaka) || 160
      }
    });
  } catch (err) { res.json({ labels: {}, custom_fields: [], delivery_charge: { inside_dhaka: 80, outside_dhaka: 160 } }); }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

export default async function handler(req, res) {
  await ready();
  return app(req, res);
}

if (!IS_SERVERLESS && process.argv[1] && process.argv[1].endsWith('server.js')) {
  ready().then(() => {
    app.listen(PORT, () => {
      console.log('');
      console.log('  E-Commerce Backend');
      console.log('  ──────────────────');
      console.log('  ➜  http://localhost:' + PORT);
      console.log('  ➜  DB:    ' + (process.env.TURSO_URL ? 'Turso (' + process.env.TURSO_URL + ')' : 'local file'));
      console.log('');
    });
  });
}
