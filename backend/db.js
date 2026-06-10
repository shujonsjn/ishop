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
  await db.exec("CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,slug TEXT UNIQUE NOT NULL,description TEXT DEFAULT '',image TEXT,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  await db.exec("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,slug TEXT UNIQUE NOT NULL,description TEXT DEFAULT '',price REAL NOT NULL,compare_price REAL,category_id INTEGER REFERENCES categories(id),images TEXT DEFAULT '[]',stock INTEGER DEFAULT 0,featured INTEGER DEFAULT 0,active INTEGER DEFAULT 1,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  try { await db.exec("ALTER TABLE products ADD COLUMN colors TEXT DEFAULT '[]'"); } catch {}
  await db.exec("CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER NOT NULL REFERENCES products(id),user_id INTEGER NOT NULL REFERENCES users(id),rating INTEGER NOT NULL,comment TEXT DEFAULT '',created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  await db.exec("CREATE TABLE IF NOT EXISTS cart (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER REFERENCES users(id),session_id TEXT,product_id INTEGER NOT NULL REFERENCES products(id),quantity INTEGER DEFAULT 1,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  try { await db.exec("ALTER TABLE cart ADD COLUMN color TEXT DEFAULT ''"); } catch {}
  await db.exec("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL REFERENCES users(id),total REAL NOT NULL,status TEXT DEFAULT 'pending',payment_method TEXT DEFAULT '',payment_status TEXT DEFAULT 'unpaid',shipping_address TEXT NOT NULL,phone TEXT,note TEXT DEFAULT '',created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  await db.exec("CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT,order_id INTEGER NOT NULL REFERENCES orders(id),product_id INTEGER NOT NULL,name TEXT NOT NULL,price REAL NOT NULL,quantity INTEGER NOT NULL,image TEXT)");
  try { await db.exec("ALTER TABLE order_items ADD COLUMN color TEXT DEFAULT ''"); } catch {}
  await db.exec("CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY AUTOINCREMENT,order_id INTEGER NOT NULL REFERENCES orders(id),method TEXT NOT NULL,transaction_id TEXT,amount REAL NOT NULL,status TEXT DEFAULT 'pending',created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
})();

export async function ready() {
  await schemaReady;
}

export default db;