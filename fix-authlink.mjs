import fs from 'fs';
import path from 'path';

const dir = 'C:\\Users\\atclm\\OneDrive\\Desktop\\ecommerce';
let count = 0;

function walk(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(f => {
    const fp = path.join(d, f.name);
    if (f.isDirectory() && !f.name.includes('node_modules') && !f.name.includes('.git') && !f.name.includes('admin')) walk(fp);
    else if (f.name.endsWith('.html') && !f.name.includes('admin')) {
      let c = fs.readFileSync(fp, 'utf8');
      const old = "if(token){ al.textContent=t('\u09AA\u09CD\u09B0\u09CB\u09AB\u09BE\u0987\u09B2','Profile'); al.href='/profile.html'; }";
      const rep = "if(token){ al.style.display='none'; }";
      if (c.includes(old)) {
        c = c.replace(old, rep);
        fs.writeFileSync(fp, c, 'utf8');
        count++;
        console.log('Fixed: ' + fp);
      }
    }
  });
}

walk(dir);
console.log('Total fixed:', count);
