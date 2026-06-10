/* ==========================================================
   SEED.JS — Populate database with sample data
   ========================================================== */
import db, { ready } from './db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  await ready();
  console.log('Seeding database...');

  const adminPass = await bcrypt.hash('admin123', 10);
  await db.prepare('INSERT OR IGNORE INTO users (name, email, phone, password, address, role) VALUES (?, ?, ?, ?, ?, ?)').run('Admin', 'admin@ishop.com', '01900000000', adminPass, 'Dhaka', 'admin');

  const userPass = await bcrypt.hash('1234', 10);
  await db.prepare('INSERT OR IGNORE INTO users (name, email, phone, password, address, role) VALUES (?, ?, ?, ?, ?, ?)').run('Rahim', 'rahim@email.com', '01711111111', userPass, 'Dhaka', 'user');

  const cats = [
    { name: 'ইলেকট্রনিক্স', slug: 'electronics' },
    { name: 'ফ্যাশন', slug: 'fashion' },
    { name: 'হোম অ্যাপ্লায়েন্স', slug: 'home-appliances' },
    { name: 'মোবাইল', slug: 'mobile' },
    { name: 'বই', slug: 'books' }
  ];
  for (const c of cats) {
    await db.prepare('INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)').run(c.name, c.slug);
  }

  const products = [
    { name: 'স্মার্টফোন X100', slug: 'smartphone-x100', price: 24999, compare_price: 29999, cat: 'mobile', featured: 1, stock: 25 },
    { name: 'ল্যাপটপ Pro 15', slug: 'laptop-pro-15', price: 65999, compare_price: 75000, cat: 'electronics', featured: 1, stock: 10 },
    { name: 'ওয়্যারলেস ইয়ারবাড', slug: 'wireless-earbud', price: 2499, compare_price: 3999, cat: 'electronics', featured: 1, stock: 50 },
    { name: 'কটন টি-শার্ট', slug: 'cotton-tshirt', price: 599, compare_price: 899, cat: 'fashion', featured: 1, stock: 100 },
    { name: 'ডিজাইন শাড়ি', slug: 'designer-saree', price: 2999, compare_price: 4500, cat: 'fashion', featured: 0, stock: 30 },
    { name: 'রেফ্রিজারেটর ৬.৫ কিউ.ফুট', slug: 'refrigerator-6.5', price: 35999, compare_price: 42000, cat: 'home-appliances', featured: 1, stock: 8 },
    { name: 'মাইক্রোওয়েভ ওভেন', slug: 'microwave-oven', price: 8999, compare_price: 12000, cat: 'home-appliances', featured: 0, stock: 15 },
    { name: 'প্রোগ্রামিং বই — Python', slug: 'python-book', price: 450, compare_price: null, cat: 'books', featured: 0, stock: 200 },
  ];

  for (const p of products) {
    const catRow = await db.prepare('SELECT id FROM categories WHERE slug = ?').get(p.cat);
    const catId = catRow ? catRow.id : null;
    await db.prepare('INSERT OR IGNORE INTO products (name, slug, description, price, compare_price, category_id, stock, featured, active, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)').run(p.name, p.slug, p.name + ' - সেরা মানের পণ্য', p.price, p.compare_price, catId, p.stock, p.featured, JSON.stringify([]));
  }

  console.log('Seed complete!');
  console.log('  Admin: admin@ishop.com / admin123');
  console.log('  User:  rahim@email.com / 1234');
  process.exit();
}

seed().catch(err => { console.error(err); process.exit(1); });
