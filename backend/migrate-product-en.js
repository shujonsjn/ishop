/* Migration: add en_name to products */
import db, { ready } from './db.js';

const adjMap = {
  'গ্রেট': 'Great', 'স্মার্ট': 'Smart', 'কোয়ালিটি': 'Quality',
  'ইকোনমি': 'Economy', 'স্টাইলিশ': 'Stylish', 'এসেনশিয়াল': 'Essential',
  'ডেইলি': 'Daily', 'হট': 'Hot', 'পপুলার': 'Popular',
  'টপ': 'Top', 'রেটেড': 'Rated', 'সুপার': 'Super',
  'এক্সক্লুসিভ': 'Exclusive', 'লিমিটেড': 'Limited', 'স্পেশাল': 'Special',
  'নতুন': 'New', 'ট্রেন্ডিং': 'Trending', 'বেস্ট': 'Best',
  'সেলার': 'Seller', 'প্রিমিয়াম': 'Premium', 'ক্লাসিক': 'Classic',
  'ট্রেন্ডি': 'Trendy', 'লেটেস্ট': 'Latest', 'হাই': 'High',
  'ডিমান্ড': 'Demand', 'ফাস্ট': 'Fast', 'অ্যাফোর্ডেবল': 'Affordable',
};

const wordMap = {
  'ওয়্যারলেস': 'Wireless', 'স্পিকার': 'Speaker', 'ব্লুটুথ': 'Bluetooth',
  'ইউএসবি': 'USB', 'হাব': 'Hub', 'পোর্ট': 'Port', 'এইচডিএমআই': 'HDMI',
  'কেবল': 'Cable', 'মিটার': 'Meter', 'পাওয়ার': 'Power', 'অ্যাডাপ্টার': 'Adapter',
  'এক্সটার্নাল': 'External', 'হার্ড': 'Hard', 'ড্রাইভ': 'Drive',
  'পেনড্রাইভ': 'Pendrive', 'কার্ড': 'Card', 'রিডার': 'Reader',
  'ল্যান': 'LAN', 'ক্যাট': 'Cat', 'ব্লুটুথ': 'Bluetooth',
  'ওয়াইফাই': 'WiFi', 'রাউটার': 'Router', 'ডুয়াল': 'Dual', 'ব্যান্ড': 'Band',
  'নেটওয়ার্ক': 'Network', 'সুইচ': 'Switch', 'মাল্টিপল': 'Multiple',
  'চার্জার': 'চার্জার', 'স্টেশন': 'Station', 'সাউন্ডবার': 'Soundbar',
  'চ্যানেল': 'Channel', 'পোর্টেবল': 'Portable', 'হেডফোন': 'Headphone',
  'স্ট্যান্ড': 'Stand', 'ডেস্ক': 'Desk', 'ম্যানেজমেন্ট': 'Management',
  'বক্স': 'Box', 'সার্জ': 'Surge', 'প্রটেক্টর': 'Protector',
  'আউটলেট': 'Outlet', 'ইউপিএস': 'UPS', 'ব্যাকআপ': 'Backup',
  'এসি': 'AC', 'কনভার্টার': 'Converter', 'ইনভার্টার': 'Inverter',
  'সোলার': 'Solar', 'চার্জ': 'Charge', 'কন্ট্রোলার': 'Controller',
  'স্মার্ট': 'Smart', 'প্লাগ': 'Plug', 'বাল্ব': 'Bulb', 'মোশন': 'Motion',
  'সেন্সর': 'Sensor', 'লাইট': 'Light', 'ডোর': 'Door', 'থার্মোস্ট্যাট': 'Thermostat',
  'সিসিটিভি': 'CCTV', 'ক্যামেরা': 'Camera', 'মেগাপিক্সেল': 'Megapixel',
  'ডিজিটাল': 'Digital', 'টাইমার': 'Timer', 'এক্সটেনশন': 'Extension',
  'কোর্ড': 'Cord', 'ইয়ারবাড': 'Earbud', 'ব্যাংক': 'Bank',
  'এসডি': 'SD', 'স্লিম': 'Slim', 'ডিভিডি': 'DVD', 'ড্রাইভ': 'Drive',
  'ল্যাপটপ': 'Laptop', 'কুলিং': 'Cooling', 'প্যাড': 'Pad',
  'মনিটর': 'Monitor', 'আরামদায়ক': 'Comfortable',
  'ওয়েবক্যাম': 'Webcam', 'এইচডি': 'HD', 'মাইক্রোফোন': 'Microphone',
  'কন্ডেনসার': 'Condenser', 'ভিডিও': 'Video', 'ক্যাপচার': 'Capture',
  'গ্রাফিক্স': 'Graphics', 'ট্যাবলেট': 'Tablet', 'ড্রইং': 'Drawing',
  'পোর্টেবল': 'Portable', 'ইঞ্চি': 'Inch', 'ব্যাগ': 'Bag',
  'ওয়াটারপ্রুফ': 'Waterproof', 'লক': 'Lock', 'সিকিউরিটি': 'Security',
  'কী-ক্যাপ': 'Keycap', 'কাস্টম': 'Custom', 'জায়ান্ট': 'Giant',
  'আরজিবি': 'RGB', 'মেকানিক্যাল': 'Mechanical', 'সুইচ': 'Switch',
  'তারের': 'Wired', 'মাউস': 'Mouse', 'অপটিক্যাল': 'Optical',
  'ইউনিভার্সাল': 'Universal', 'সেল': 'Cell', 'ফোন': 'Phone',
  'সিগনাল': 'Signal', 'বুস্টার': 'Booster', 'সিম': 'SIM', 'স্লট': 'Slot',
  'টুল': 'Tool', 'প্রিন্টার': 'Printer', 'স্ক্যানার': 'Scanner',
  'ফটোকপি': 'Photocopy', 'মেশিন': 'Machine', 'অফিস': 'Office',
  'ডেস্ক': 'Desk', 'চেয়ার': 'Chair', 'এর্গোনমিক': 'Ergonomic',
  'বইয়ের': 'Book', 'তাক': 'Shelf', 'ফাইল': 'File', 'ক্যাবিনেট': 'Cabinet',
  'স্টোরেজ': 'Storage', 'র্যাক': 'Rack', 'শেল্ফ': 'Shelf',
  'ড্রয়ার': 'Drawer', 'লকার': 'Locker', 'মেটাল': 'Metal',
  'স্টিল': 'Steel', 'প্লাস্টিক': 'Plastic', 'কাঠের': 'Wooden',
  'গ্লাস': 'Glass', 'এক্রাইলিক': 'Acrylic', 'ফ্রেম': 'Frame',
  'পেইন্টিং': 'Painting', 'ওয়াল': 'Wall', 'আর্ট': 'Art',
  'ফটো': 'Photo', 'আলবাম': 'Album', 'পিকচার': 'Picture',
  'পোস্টার': 'Poster', 'ক্যালেন্ডার': 'Calendar', 'ডায়েরি': 'Diary',
  'নোটবুক': 'Notebook', 'পেন': 'Pen', 'পেন্সিল': 'Pencil',
  'ইরেজার': 'Eraser', 'স্কেল': 'Scale', 'কাটার': 'Cutter',
  'গাম': 'Gum', 'টেপ': 'Tape', 'স্ট্যাপলার': 'Stapler',
  'পিন': 'Pin', 'ক্লিপ': 'Clip', 'ব্যাজ': 'Badge',
  'মেডেল': 'Medal', 'ট্রফি': 'Trophy', 'শিল্ড': 'Shield',
  'সার্টিফিকেট': 'Certificate', 'হোল্ডার': 'Holder',
  'ওয়াচ': 'Watch', 'ঘড়ি': 'Clock', 'স্মার্টওয়াচ': 'Smartwatch',
  'ব্রেসলেট': 'Bracelet', 'নেকলেস': 'Necklace', 'রিং': 'Ring',
  'কানের': 'Earring', 'দুল': 'Pendant', 'চেইন': 'Chain',
  'গয়না': 'Jewelry', 'বক্স': 'Box', 'অর্গানাইজার': 'Organizer',
  'ট্রে': 'Tray', 'বাস্কেট': 'Basket', 'কন্টেইনার': 'Container',
  'জার': 'Jar', 'বোতল': 'Bottle', 'মগ': 'Mug', 'কাপ': 'Cup',
  'গ্লাস': 'Glass', 'প্লেট': 'Plate', 'বাটি': 'Bowl',
  'চামচ': 'Spoon', 'কাটা': 'Knife', 'চপস্টিক': 'Chopstick',
  'পাত্র': 'Pot', 'প্যান': 'Pan', 'কড়াই': 'Wok',
  'ফ্রাইং': 'Frying', 'প্রেসার': 'Pressure', 'কুকার': 'Cooker',
  'ব্লেন্ডার': 'Blender', 'জুসার': 'Juicer', 'মিক্সার': 'Mixer',
  'গ্রাইন্ডার': 'Grinder', 'টোস্টার': 'Toaster', 'ওভেন': 'Oven',
  'মাইক্রোওয়েভ': 'Microwave', 'ফ্রিজ': 'Fridge', 'ফ্রিজার': 'Freezer',
  'ওয়াশিং': 'Washing', 'মেশিন': 'Machine', 'ড্রায়ার': 'Dryer',
  'আয়রন': 'Iron', 'ফ্যান': 'Fan', 'হিটার': 'Heater',
  'এয়ার': 'Air', 'কন্ডিশনার': 'Conditioner', 'পিউরিফায়ার': 'Purifier',
  'হিউমিডিফায়ার': 'Humidifier', 'ভ্যাকুয়াম': 'Vacuum',
  'ক্লিনার': 'Cleaner', 'রোবট': 'Robot', 'মপ': 'Mop',
  'ব্রাশ': 'Brush', 'ঝাড়ু': 'Broom', 'ডাস্টার': 'Duster',
  'বালতি': 'Bucket', 'মগ': 'Mug', 'গ্লাস': 'Glass',
  'থালা': 'Plate', 'পিয়ালা': 'Bowl', 'গামলা': 'Basin',
  'বদনা': 'Pitcher', 'জগ': 'Jug', 'ফ্লাস্ক': 'Flask',
  'টিফিন': 'Tiffin', 'লাঞ্চ': 'Lunch', 'বক্স': 'Box',
  'ব্যাগ': 'Bag', 'ব্যাকপ্যাক': 'Backpack', 'স্যুটকেস': 'Suitcase',
  'ট্রলি': 'Trolley', 'ওয়ালেট': 'Wallet', 'পার্স': 'Purse',
  'বেল্ট': 'Belt', 'স্কার্ফ': 'Scarf', 'টুপি': 'Hat',
  'ক্যাপ': 'Cap', 'গ্লাভস': 'Gloves', 'মোজা': 'Socks',
  'আন্ডারওয়্যার': 'Underwear', 'প্যান্ট': 'Pants', 'শার্ট': 'Shirt',
  'টি-শার্ট': 'T-Shirt', 'জিন্স': 'Jeans', 'শর্টস': 'Shorts',
  'জ্যাকেট': 'Jacket', 'কোট': 'Coat', 'সোয়েটার': 'Sweater',
  'হুডি': 'Hoodie', 'পোলো': 'Polo', 'কুর্তা': 'Kurta',
  'পাঞ্জাবি': 'Panjabi', 'লুঙ্গি': 'Lungi', 'থ্রি-পিস': 'Three-piece',
  'শাড়ি': 'Saree', 'সালোয়ার': 'Salwar', 'কামিজ': 'Kameez',
  'হিজাব': 'Hijab', 'বোরকা': 'Burqa', 'নিকাব': 'Niqab',
  'তোয়ালে': 'Towel', 'গামছা': 'Gamcha', 'বেডশিট': 'Bedsheet',
  'কম্বল': 'Blanket', 'বালিশ': 'Pillow', 'কভার': 'Cover',
  'মশারি': 'Mosquito Net', 'কার্পেট': 'Carpet', 'ম্যাট': 'Mat',
  'পর্দা': 'Curtain', 'সলución': 'Solution',
  /* Add more mappings as needed */
};

async function translateWord(w) {
  w = w.trim();
  if (adjMap[w]) return adjMap[w];
  if (wordMap[w]) return wordMap[w];
  /* Keep as-is if already English-looking */
  if (/^[A-Za-z0-9\s.\-−–—°"']+$/.test(w)) return w;
  return w; /* fallback: keep Bengali */
}

/* Map Bengali digits to English */
function toEnglishDigits(s) {
  return s.replace(/[০-৯]/g, function(d) {
    return '০১২৩৪৫৬৭৮৯'.indexOf(d).toString();
  });
}

(async () => {
  await ready();
  try { await db.exec("ALTER TABLE products ADD COLUMN en_name TEXT DEFAULT ''"); } catch {}

  /* Load categories for en_name lookup */
  const cats = await db.prepare('SELECT id, name, en_name FROM categories').all();
  const catMap = {};
  cats.forEach(c => { catMap[c.id] = c; });

  const rows = await db.prepare('SELECT id, name, slug, category_id FROM products').all();
  let count = 0;

  for (const row of rows) {
    let enName = '';
    const name = row.name;

    if (row.slug && row.slug.includes('fill')) {
      /* Bulk product: pattern <Adjective> <CategoryBNName> <Number> */
      const m = name.match(/^(\S+)\s+(.+?)\s*(\d+)$/);
      if (m) {
        const adj = m[1];
        const cat = catMap[row.category_id];
        const enAdj = await translateWord(adj);
        const enCat = cat && cat.en_name ? cat.en_name : adj;
        enName = enAdj + ' ' + enCat + ' ' + m[3];
      }
    }

    if (!enName) {
      /* Original seed product or fallback: word-by-word translation */
      const words = name.split(/\s+/);
      const translated = [];
      for (const w of words) {
        const t = await translateWord(w);
        translated.push(t);
      }
      enName = translated.join(' ');
    }

    await db.prepare('UPDATE products SET en_name = ? WHERE id = ?').run(enName, row.id);
    count++;
    if (count % 200 === 0) console.log('  Processed', count);
  }

  console.log('Done. Updated', count, 'products.');
  process.exit(0);
})();
