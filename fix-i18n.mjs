import fs from 'fs';
import path from 'path';

const FILES = [
  'index.html',
  'products.html',
  'auth.html',
  'cart.html',
  'checkout.html',
  'order-detail.html',
  'product.html',
  'profile.html',
];

const DIR = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');

const FULL_FOOTER = `<footer class="dz-footer">
  <div class="dz-footer-inner"></div>
  <div class="dz-footer-bottom">
    <p data-i18n="footer.copyright">&copy; 2026 — সকল অধিকার সংরক্ষিত</p>
  </div>
</footer>`;

for (const file of FILES) {
  const filePath = path.join(DIR, file);
  const original = fs.readFileSync(filePath, 'utf8');
  let content = original;
  const changes = [];

  // ── Change A: siteLang → lang ──
  const aMatches = content.match(/localStorage\.getItem\('siteLang'\)/g);
  if (aMatches) {
    content = content.replaceAll("localStorage.getItem('siteLang')", "localStorage.getItem('lang')");
    changes.push(`Change A: replaced ${aMatches.length} siteLang → lang`);
  }

  // ── Change B: insert i18n-strings.js before pre-render script ──
  const preRenderRe = /<script>\s*\(function\(\)\{[\s\S]*?try\s*\{[\s\S]*?var\s+s\s*=\s*JSON\.parse\(localStorage\.getItem\('siteSettings'\)/;
  if (preRenderRe.test(content) && !content.includes('js/i18n-strings.js')) {
    content = content.replace(/(<script>\s*\(function\(\)\{)/, '<script src="js/i18n-strings.js"></script>\n$1');
    changes.push('Change B: inserted i18n-strings.js before pre-render script');
  }

  // ── Change C: replace i18nKeys one-liner ──
  const cRe = /var i18nKeys = \{[^}]*\};/;
  if (cRe.test(content)) {
    content = content.replace(cRe, 'var i18nKeys = window.__i18nStrings || {};');
    changes.push('Change C: replaced i18nKeys with window.__i18nStrings');
  }

  // ── Change D: footer fixes ──
  const hasDzFooter = content.includes('<footer class="dz-footer">');

  if (file === 'profile.html' || file === 'checkout.html' || file === 'order-detail.html') {
    if (!hasDzFooter) {
      // Insert before the first <script> tag
      const scriptIdx = content.indexOf('<script ');
      if (scriptIdx !== -1) {
        content = content.slice(0, scriptIdx) + '\n' + FULL_FOOTER + '\n\n' + content.slice(scriptIdx);
        changes.push('Change D: added full dz-footer');
      }
    }
  } else if (file === 'product.html' || file === 'auth.html') {
    // Change <footer> to <footer class="dz-footer"> and replace inner structure
    if (!hasDzFooter && content.includes('<footer>')) {
      content = content.replace(
        /<footer>\s*<div class="container">\s*<p[^>]*>.*?<\/p>\s*<\/div>\s*<\/footer>/s,
        FULL_FOOTER
      );
      changes.push('Change D: replaced plain footer with dz-footer');
    }
  } else if (file === 'cart.html') {
    // Update copyright text to have data-i18n if it's short
    const copyrightRe = /<footer>[\s\S]*?<p[^>]*>(&copy;[^<]*)<\/p>[\s\S]*?<\/footer>/;
    const copyrightMatch = content.match(copyrightRe);
    if (copyrightMatch) {
      const text = copyrightMatch[1].trim();
      // If it's short (just © 2026 or © 2026 ইশপ), update it
      if (text.length < 40 && !content.includes('footer.copyright')) {
        content = content.replace(
          /<p([^>]*)>(&copy;[^<]*)<\/p>/,
          '<p data-i18n="footer.copyright">&copy; 2026 — সকল অধিকার সংরক্ষিত</p>'
        );
        changes.push('Change D: updated copyright text with data-i18n');
      }
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${file}: ${changes.join('; ')}`);
  } else {
    console.log(`— ${file}: no changes needed`);
  }
}
