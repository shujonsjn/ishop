import db, { ready } from './db.js';

const colorMap = [
  { ids: [1, 9, 10], colors: ['কালো', 'সাদা', 'নীল'] },
  { ids: [2, 11, 12], colors: ['রূপালী', 'ধূসর'] },
  { ids: [3, 13], colors: ['কালো', 'সাদা'] },
  { id: 4, colors: ['লাল', 'নীল', 'সবুজ', 'কালো'] },
  { id: 5, colors: ['লাল', 'সবুজ', 'নীল'] },
  { ids: [6, 7, 20], colors: ['সাদা', 'কালো'] },
  { ids: [14], colors: ['পিঙ্ক', 'পার্পল', 'লাল'] },
  { id: 15, colors: ['নীল', 'কালো', 'সাদা'] },
  { ids: [16, 17, 18], colors: ['লাল', 'নীল', 'সবুজ'] },
  { id: 19, colors: ['কালো', 'সিলভার'] },
  { id: 21, colors: ['কালো', 'সাদা', 'লাল'] },
  { id: 22, colors: ['কালো', 'সিলভার'] },
  { id: 23, colors: ['কালো', 'সিলভার', 'গোল্ড'] },
];

async function migrate() {
  await ready();
  for (const entry of colorMap) {
    const ids = entry.ids || [entry.id];
    const colors = JSON.stringify(entry.colors);
    for (const id of ids) {
      await db.prepare('UPDATE products SET colors = ? WHERE id = ?').run(colors, id);
    }
  }
  console.log('Colors migration done — ' + colorMap.reduce((s, e) => s + (e.ids || [e.id]).length, 0) + ' products updated');
  process.exit();
}
migrate().catch(err => { console.error(err); process.exit(1); });
