import db, { ready } from './db.js';

async function migrate() {
  await ready();
  const updates = [
    { id: 1, colors: ['কালো', 'নীল', 'সাদা'] },
    { id: 2, colors: ['রূপালী', 'ধূসর'] },
    { id: 3, colors: ['কালো', 'সাদা'] },
    { id: 4, colors: ['লাল', 'নীল', 'সবুজ', 'কালো'] },
    { id: 5, colors: ['লাল', 'সবুজ', 'নীল'] },
  ];
  for (const u of updates) {
    await db.prepare('UPDATE products SET colors = ? WHERE id = ?').run(JSON.stringify(u.colors), u.id);
  }
  console.log('Colors migration done');
  process.exit();
}
migrate().catch(err => { console.error(err); process.exit(1); });
