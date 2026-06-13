/* Migration: add en_name to categories and set English names */
import db, { ready } from './db.js';

const names = {
  'ইলেকট্রনিক্স': 'Electronics',
  'ফ্যাশন': 'Fashion',
  'হোম অ্যাপ্লায়েন্স': 'Home Appliances',
  'মোবাইল': 'Mobile',
  'বই': 'Books',
  'কম্পিউটার ও এক্সেসরিজ': 'Computer & Accessories',
  'খেলাধুলা ও ফিটনেস': 'Sports & Fitness',
  'স্বাস্থ্য ও সৌন্দর্য': 'Health & Beauty',
  'শিশু খেলনা ও গিফট': 'Kids Toys & Gifts',
  'অটোমোবাইল': 'Automobile',
  'ক্যামেরা ও ফটোগ্রাফি': 'Camera & Photography',
  'ঘড়ি ও এক্সেসরিজ': 'Watch & Accessories',
  'গৃহস্থালি পণ্য': 'Household Items',
  'ফুড অ্যান্ড বেভারেজ': 'Food & Beverage',
};

(async () => {
  await ready();
  try { await db.exec("ALTER TABLE categories ADD COLUMN en_name TEXT DEFAULT ''"); } catch {}
  for (const [bn, en] of Object.entries(names)) {
    await db.prepare('UPDATE categories SET en_name = ? WHERE name = ?').run(en, bn);
    console.log('  ', bn, '->', en);
  }
  console.log('Done.');
  process.exit(0);
})();
