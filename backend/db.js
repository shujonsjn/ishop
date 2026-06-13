/* ==========================================================
   DB.JS — libSQL (Turso / local file) wrapper
   e-commerce database schema
   ========================================================== */

import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tursoUrl   = process.env.TURSO_URL;
const tursoToken = process.env.TURSO_TOKEN;

const client = tursoUrl
  ? createClient({ url: tursoUrl, authToken: tursoToken })
  : createClient({ url: 'file:' + path.join(__dirname, 'data.db') });

class Statement {
  constructor(sql) { this.sql = sql; }
  async all(...args) {
    const r = await client.execute({ sql: this.sql, args });
    return r.rows || [];
  }
  async get(...args) {
    const r = await client.execute({ sql: this.sql, args });
    return r.rows && r.rows[0] ? r.rows[0] : null;
  }
  async run(...args) {
    const r = await client.execute({ sql: this.sql, args });
    return { lastInsertRowid: r.lastInsertRowid != null ? Number(r.lastInsertRowid) : undefined, changes: r.rowsAffected };
  }
}

class DB {
  prepare(sql) { return new Statement(sql); }
  async exec(sql) { await client.execute(sql); }
}

const db = new DB();

let schemaReady = (async () => {
  await db.exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,phone TEXT,password TEXT NOT NULL,address TEXT DEFAULT '',role TEXT DEFAULT 'user',created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  await db.exec("CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,en_name TEXT DEFAULT '',slug TEXT UNIQUE NOT NULL,description TEXT DEFAULT '',image TEXT,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  try { await db.exec("ALTER TABLE categories ADD COLUMN en_name TEXT DEFAULT ''"); } catch {}
  try { await db.exec("ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0"); } catch {}
  try { await db.exec("UPDATE categories SET sort_order = id WHERE sort_order IS NULL OR sort_order = 0"); } catch {}
  await db.exec("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,slug TEXT UNIQUE NOT NULL,description TEXT DEFAULT '',price REAL NOT NULL,purchase_price REAL DEFAULT 0,compare_price REAL,category_id INTEGER REFERENCES categories(id),images TEXT DEFAULT '[]',stock INTEGER DEFAULT 0,featured INTEGER DEFAULT 0,active INTEGER DEFAULT 1,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  try { await db.exec("ALTER TABLE products ADD COLUMN colors TEXT DEFAULT '[]'"); } catch {}
  try { await db.exec("ALTER TABLE products ADD COLUMN purchase_price REAL DEFAULT 0"); } catch {}
  await db.exec("CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER NOT NULL REFERENCES products(id),user_id INTEGER NOT NULL REFERENCES users(id),rating INTEGER NOT NULL,comment TEXT DEFAULT '',created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  await db.exec("CREATE TABLE IF NOT EXISTS cart (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER REFERENCES users(id),session_id TEXT,product_id INTEGER NOT NULL REFERENCES products(id),quantity INTEGER DEFAULT 1,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  try { await db.exec("ALTER TABLE cart ADD COLUMN color TEXT DEFAULT ''"); } catch {}
  await db.exec("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL REFERENCES users(id),total REAL NOT NULL,status TEXT DEFAULT 'pending',payment_method TEXT DEFAULT '',payment_status TEXT DEFAULT 'unpaid',shipping_address TEXT NOT NULL,phone TEXT,note TEXT DEFAULT '',created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  await db.exec("CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT,order_id INTEGER NOT NULL REFERENCES orders(id),product_id INTEGER NOT NULL,name TEXT NOT NULL,price REAL NOT NULL,quantity INTEGER NOT NULL,image TEXT)");
  try { await db.exec("ALTER TABLE order_items ADD COLUMN color TEXT DEFAULT ''"); } catch {}
  await db.exec("CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY AUTOINCREMENT,order_id INTEGER NOT NULL REFERENCES orders(id),method TEXT NOT NULL,transaction_id TEXT,amount REAL NOT NULL,status TEXT DEFAULT 'pending',created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  try { await db.exec("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT ''"); } catch {}
  await db.exec("CREATE TABLE IF NOT EXISTS otps (id INTEGER PRIMARY KEY AUTOINCREMENT,identifier TEXT NOT NULL,code TEXT NOT NULL,expires_at INTEGER NOT NULL,used INTEGER DEFAULT 0,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  await db.exec("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)");
  await db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('site_name', 'ইশপ')").run();
  await db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('logo_url', '')").run();
  var defaultEnd = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('flash_sale_end', ?)").run(defaultEnd.toISOString());
  await db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('flash_sale_color', '#e74c3c')").run();
  try {
    const existing = await db.prepare("SELECT value FROM settings WHERE key = 'banners'").get();
    if (!existing) {
      const defaultBanners = JSON.stringify([
        { bg: 'linear-gradient(135deg,#1a73e8,#7c3aed)', bgImage: '', title: 'বিশেষ গ্রীষ্মকালীন সেল', titleEn: 'Special Summer Sale', desc: 'সেরা ব্র্যান্ডের পণ্য সেরা দামে, ডেলিভারি সারা বাংলাদেশ', descEn: 'Best brand products at best prices, delivery across Bangladesh', btnText: 'এখনই কেনাকাটা করুন', btnTextEn: 'Shop Now', btnLink: '/products.html', btnColor: '#ffffff' },
        { bg: 'linear-gradient(135deg,#ff6b00,#ec4899)', bgImage: '', title: 'ফ্ল্যাশ সেল — ৭০% পর্যন্ত ছাড়', titleEn: 'Flash Sale — Up to 70% off', desc: 'সীমিত সময়ের অফার, দেরি করবেন না!', descEn: 'Limited time offer, don\'t delay!', btnText: 'সেল দেখুন', btnTextEn: 'See Sale', btnLink: '/products.html', btnColor: '#ffffff' },
        { bg: 'linear-gradient(135deg,#00a86b,#0d9488)', bgImage: '', title: 'ফ্রি ডেলিভারি', titleEn: 'Free Delivery', desc: '৫০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি', descEn: 'Free delivery on orders above 500 Taka', btnText: 'পণ্য দেখুন', btnTextEn: 'See Products', btnLink: '/products.html', btnColor: '#ffffff' }
      ]);
      await db.prepare("INSERT INTO settings (key, value) VALUES ('banners', ?)").run(defaultBanners);
    }
  } catch(e) {}
})();

export async function ready() {
  await schemaReady;
}

export default db;