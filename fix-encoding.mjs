import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');

const files = [
  'about.html',
  'app.html',
  'blog.html',
  'help.html',
  'how-to-buy.html',
  'privacy.html',
  'refund-return.html',
  'refund.html',
  'seller.html',
  'terms.html',
];

const titleMap = {
  'about.html':         { from: '<title>?????? ???????? v2.0</title>',        to: '<title>আমাদের সম্পর্কে v2.0</title>' },
  'app.html':           { from: '<title>App v2.0</title>',                     to: '<title>ইশপ অ্যাপ v2.0</title>' },
  'blog.html':          { from: '<title>???? v2.0</title>',                    to: '<title>ব্লগ v2.0</title>' },
  'help.html':          { from: '<title>??????? ??????? v2.0</title>',         to: '<title>সাহায্য ও সহায়তা v2.0</title>' },
  'how-to-buy.html':    { from: '<title>?????? ?????? v2.0</title>',           to: '<title>কিভাবে কিনবেন v2.0</title>' },
  'privacy.html':       { from: '<title>????????? ???? v2.0</title>',          to: '<title>গোপনীয়তা নীতি v2.0</title>' },
  'refund-return.html': { from: '<title>??????? ? ??????? ???? v2.0</title>',  to: '<title>রিফান্ড ও রিটার্ন নীতি v2.0</title>' },
  'seller.html':        { from: '<title>????? ??? v2.0</title>',               to: '<title>বিক্রেতা হন v2.0</title>' },
  'terms.html':         { from: '<title>???????? v2.0</title>',                to: '<title>শর্তাবলী v2.0</title>' },
};

const commonReplacements = [
  // Emojis
  { from: '>??</button>',             to: '>🔍</button>' },
  { from: 'cart-icon">??<span',       to: 'cart-icon">🛒<span' },
  { from: 'id="siteLogo">???</a>',    to: 'id="siteLogo">ইশপ</a>' },

  // Footer copyright
  { from: '2026 \ufffd ??? ?????? ????????',  to: '2026 — সকল অধিকার সংরক্ষিত' },
  { from: '2026 ??? ?????? ????????',         to: '2026 — সকল অধিকার সংরক্ষিত' },

  // Header placeholder and JS strings
  { from: 'placeholder="???? ??????..."',                     to: 'placeholder="পণ্য খুঁজুন..."' },
  { from: "t('???? ??????...','Search products...')",         to: "t('পণ্য খুঁজুন...','Search products...')" },
  { from: "lang==='bn'?'EN':'?????'",                        to: "lang==='bn'?'EN':'বাংলা'" },
  { from: "t('????????','Profile')",                          to: "t('প্রোফাইল','Profile')" },
  { from: "t('????','Login')",                                to: "t('লগইন','Login')" },

  // data-i18n nav items (hardcoded fallback text in HTML)
  { from: '>???</a>\n',                       to: '>হোম</a>\n' },
  { from: '>????</a>\n',                      to: '>পণ্য</a>\n' },
  { from: '>?????</span>',                    to: '>কার্ট</span>' },
  { from: '>??????</a>\n',                   to: '>অর্ডার</a>\n' },
  { from: '>????????</a>\n',                 to: '>অ্যাডমিন</a>\n' },
  { from: 'id="authLink" data-no-i18n="1">????</a>',  to: 'id="authLink" data-no-i18n="1">লগইন</a>' },
];

const pageSpecificReplacements = {
  'blog.html': [
    { from: '<h1>????</h1>',                          to: '<h1>ব্লগ</h1>' },
    { from: '<div class="icon">??</div>',             to: '<div class="icon">📝</div>' },
    { from: '???? ???? ???? ????? ???',               to: 'এখনো কোনো পোস্ট যুক্ত হয়নি' },
  ],
  'help.html': [
    { from: '<h1>??????? ???????</h1>',               to: '<h1>সাহায্য ও সহায়তা</h1>' },
    { from: '???? ?????? ??????? ???? ???? \ufffd ????? ???????? ????? ??????', to: 'আপনার প্রশ্নের উত্তর খুঁজুন অথবা আমাদের সাথে যোগাযোগ করুন' },
    { from: '???? ?????? ??????? ???? ???? ??? ????? ???????? ????? ??????',    to: 'আপনার প্রশ্নের উত্তর খুঁজুন অথবা আমাদের সাথে যোগাযোগ করুন' },
    { from: 'placeholder="????? ?????? ?????..."',     to: 'placeholder="আপনার প্রশ্ন খুঁজুন..."' },
    { from: '>??????</button>',                        to: '>খুঁজুন</button>' },
    { from: '<h2>??????? ????</h2>',                   to: '<h2>যোগাযোগ</h2>' },
    { from: '<div class="icon">??</div>\n          <h3>???? ?????</h3>',   to: '<div class="icon">📞</div>\n          <h3>ফোনে কল করুন</h3>' },
    { from: '<p>???? ?:?? - ??? ??:??</p>',           to: '<p>সকাল ৯:০০ - রাত ১০:০০</p>' },
    { from: '<div class="icon">??</div>\n          <h3>?????</h3>',       to: '<div class="icon">📧</div>\n          <h3>ইমেইল</h3>' },
    { from: '<div class="icon">??</div>\n          <h3>???</h3>',         to: '<div class="icon">💬</div>\n          <h3>চ্যাট</h3>' },
  ],
  'how-to-buy.html': [
    { from: '<h3>????</h3>',                           to: '<h3>টিপস</h3>' },
  ],
  'seller.html': [
    { from: '<h2>?????? ???? ?????</h2>',             to: '<h2>কিভাবে সেলার হবেন</h2>' },
    { from: '<h3>????? ???????</h3>',                  to: '<h3>যোগাযোগ</h3>' },
  ],
};

function fixFile(filename) {
  const filePath = path.join(__dirname, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  const changes = [];

  // Common replacements
  for (const r of commonReplacements) {
    if (content.includes(r.from)) {
      content = content.replace(r.from, r.to);
      changes.push(r.from.substring(0, 50) + '...');
    }
  }

  // Title replacements
  if (titleMap[filename]) {
    const t = titleMap[filename];
    if (content.includes(t.from)) {
      content = content.replace(t.from, t.to);
      changes.push('title');
    }
  }

  // Page-specific replacements
  if (pageSpecificReplacements[filename]) {
    for (const r of pageSpecificReplacements[filename]) {
      if (content.includes(r.from)) {
        content = content.replace(r.from, r.to);
        changes.push(r.from.substring(0, 50) + '...');
      }
    }
  }

  // Final scan: find remaining sequences of ?? or ??? that look like corruption
  // (but skip things inside script strings that are dynamically translated)
  const remaining = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const matches = lines[i].match(/\?{2,}/g);
    if (matches) {
      for (const m of matches) {
        remaining.push(`  Line ${i + 1}: ${lines[i].trim().substring(0, 80)}`);
      }
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n✅ ${filename} — ${changes.length} replacement(s):`);
    for (const c of changes) {
      console.log(`   • ${c}`);
    }
  } else {
    console.log(`\n⏭️  ${filename} — no changes needed`);
  }

  if (remaining.length > 0) {
    console.log(`   ⚠️  Remaining ? sequences (may be OK if dynamic):`);
    for (const r of remaining.slice(0, 10)) {
      console.log(r);
    }
  }
}

console.log('Fixing corrupted Bengali text in HTML files...\n');
for (const file of files) {
  fixFile(file);
}
console.log('\nDone!');
