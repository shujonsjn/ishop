import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const data = JSON.parse(readFileSync('./seed-pages.json', 'utf8'));

async function login() {
  const r = await fetch('http://localhost:3001/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'email=admin@ishop.com&password=admin123'
  });
  const d = await r.json();
  return d.token;
}

const token = await login();
const keys = ['page_about','page_terms','page_privacy','page_refund','page_how_to_buy','page_help','page_blog','page_app','page_seller'];

for (const key of keys) {
  const body = { [key]: data[key] };
  const r = await fetch('http://localhost:3001/api/admin/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(body)
  });
  const text = await r.text();
  console.log(`OK: ${key} (status=${r.status})`);
}

// Verify
const r2 = await fetch('http://localhost:3001/api/admin/settings');
const s = await r2.json();
for (const key of keys) {
  const v = s[key] || '';
  console.log(`${key}: ${v.substring(0, 50)}...`);
}
