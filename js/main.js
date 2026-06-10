/* ==========================================================
   MAIN.JS — Homepage logic
   ========================================================== */
(function(){
  loadCartCount();

  window.addToCart = function(productId) {
    api('POST', '/cart', { product_id: productId, quantity: 1 }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      if (data.sessionId) localStorage.setItem('sessionId', data.sessionId);
      toast('কার্টে যোগ করা হয়েছে!');
      loadCartCount();
    });
  };

  window.buyNow = function(productId) {
    api('POST', '/cart', { product_id: productId, quantity: 1 }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      if (data.sessionId) localStorage.setItem('sessionId', data.sessionId);
      window.location = '/checkout.html';
    });
  };

  window.searchProducts = function() {
    var q = document.getElementById('searchInput');
    if (q && q.value) window.location = '/products.html?search=' + encodeURIComponent(q.value);
  };

  /* ---- Banner Carousel ---- */
  var bannerIndex = 0;
  window.moveBanner = function(dir) {
    var track = document.getElementById('bannerTrack');
    var slides = track.children;
    bannerIndex = (bannerIndex + dir + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + (bannerIndex * 100) + '%)';
    var dots = document.querySelectorAll('#bannerDots span');
    dots.forEach(function(d, i) { d.classList.toggle('active', i === bannerIndex); });
  };

  (function initBanner() {
    var track = document.getElementById('bannerTrack');
    if (!track) return;
    var dots = document.getElementById('bannerDots');
    for (var i = 0; i < track.children.length; i++) {
      var dot = document.createElement('span');
      if (i === 0) dot.className = 'active';
      dot.onclick = function(j) { return function() { moveBanner(j - bannerIndex); }; }(i);
      dots.appendChild(dot);
    }
    setInterval(function() { moveBanner(1); }, 5000);
  })();

  /* ---- Flash Sale Timer ---- */
  (function startFlashTimer() {
    var el = document.getElementById('flashTimer');
    if (!el) return;
    var total = 2 * 60 * 60;
    setInterval(function() {
      if (total <= 0) { el.textContent = 'অফার শেষ!'; return; }
      total--;
      var h = Math.floor(total / 3600);
      var m = Math.floor((total % 3600) / 60);
      var s = total % 60;
      el.textContent = 'শেষ হবে ' +
        String(h).padStart(2, '0') + ':' +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0');
    }, 1000);
  })();

  /* ---- Categories ---- */
  var catIcons = ['📱','💻','⌚','👗','👟','🏠','📚','🎮','🔧','🎵','🖨️','📷','🧴','🎒'];
  api('GET', '/categories').then(function(cats) {
    var grid = document.getElementById('categoryGrid');
    if (!grid) return;
    grid.innerHTML = cats.map(function(c, i) {
      var colors = ['#e3f2fd,#bbdefb','#fce4ec,#f8bbd0','#e8f5e9,#c8e6c9','#fff3e0,#ffe0b2','#f3e5f5,#e1bee7','#e0f7fa,#b2ebf2','#fff8e1,#ffecb3','#fbe9e7,#ffccbc'];
      var bg = colors[i % colors.length];
      return '<div class=\"dz-cat-card\" onclick=\"window.location=\'' + window.location.origin + '/products.html?category=' + encodeURIComponent(c.slug) + '\'">' +
        '<div class=\"dz-cat-icon\" style=\"background:linear-gradient(135deg,' + bg + ')\">' + catIcons[i % catIcons.length] + '</div>' +
        '<h3>' + esc(c.name) + '</h3></div>';
    }).join('');
  });

  /* ---- Just for You (paginated) ---- */
  var jfyPage = 1;
  var jfyLoading = false;
  var jfyHasMore = true;
  var JFY_PAGE_SIZE = 20;

  window.loadMore = function() {
    if (jfyLoading || !jfyHasMore) return;
    jfyLoading = true;
    var btn = document.getElementById('moreBtn');
    if (btn) btn.textContent = 'লোড হচ্ছে...';
    api('GET', '/products?page=' + jfyPage + '&limit=' + JFY_PAGE_SIZE).then(function(data) {
      var grid = document.getElementById('featuredGrid');
      if (!grid) return;
      if (!data.products || data.products.length === 0) {
        jfyHasMore = false;
        if (btn) btn.style.display = 'none';
        jfyLoading = false;
        return;
      }
      grid.innerHTML += data.products.map(renderProductCard).join('');
      jfyPage++;
      jfyHasMore = data.page < data.totalPages;
      jfyLoading = false;
      if (btn) {
        btn.textContent = jfyHasMore ? 'আরও দেখুন' : 'সব দেখানো হয়েছে';
        if (!jfyHasMore) btn.style.display = 'none';
      }
      loadCartCount();
    }).catch(function() {
      jfyLoading = false;
      var btn = document.getElementById('moreBtn');
      if (btn) btn.textContent = 'আরও দেখুন';
    });
  };

  loadMore();

  /* ---- Flash Sale Products ---- */
  api('GET', '/products/featured').then(function(products) {
    var grid = document.getElementById('flashGrid');
    if (!grid) return;
    if (!products || products.length === 0) {
      grid.innerHTML = '';
      return;
    }
    grid.innerHTML = products.slice(0, 6).map(function(p) {
      var img = (p.images && p.images.length) ? p.images[0] : '';
      var discount = p.compare_price ? Math.round((1 - p.price / p.compare_price) * 100) : 0;
      var sold = Math.floor(Math.random() * 80) + 10;
      var total = sold + Math.floor(Math.random() * 50) + 5;
      var pct = Math.round((sold / total) * 100);
      return '<div class=\"dz-flash-card\" onclick=\"window.location=\'' + window.location.origin + '/product.html?id=' + p.id + '\'">' +
        (discount > 0 ? '<div class=\"dz-flash-badge\">-' + discount + '%</div>' : '') +
        (img ? '<img class=\"dz-flash-image\" src=\"' + esc(img) + '\" alt=\"' + esc(p.name) + '\" loading=\"lazy\">' : '<div class=\"dz-flash-image\" style=\"display:flex;align-items:center;justify-content:center;color:var(--gray);font-size:12px;\">ছবি নেই</div>') +
        '<div class=\"dz-flash-body\">' +
        '<div class=\"dz-flash-title\">' + esc(p.name) + '</div>' +
        '<div class=\"dz-flash-price\">' + taka(p.price) +
        (p.compare_price ? ' <span class=\"dz-flash-compare\">' + taka(p.compare_price) + '</span>' : '') +
        '</div>' +
        '<div class=\"dz-flash-progress\"><div class=\"dz-flash-progress-bar\" style=\"width:' + pct + '%\"></div></div>' +
        '<div class=\"dz-flash-sold\">ইতিমধ্যে ' + sold + ' টি বিক্রি হয়েছে</div>' +
        '</div></div>';
    }).join('');
  });

  function renderProductCard(p) {
    var img = (p.images && p.images.length) ? p.images[0] : '';
    var discount = p.compare_price ? Math.round((1 - p.price / p.compare_price) * 100) : 0;
    return '<div class=\"product-card\" onclick=\"window.location=\'' + window.location.origin + '/product.html?id=' + p.id + '\'">' +
      (discount > 0 ? '<div class=\"product-card-discount\">-' + discount + '%</div>' : '') +
      (img ? '<img class=\"product-card-image\" src=\"' + esc(img) + '\" alt=\"' + esc(p.name) + '\" loading=\"lazy\">' : '<div class=\"product-card-image\" style=\"display:flex;align-items:center;justify-content:center;color:var(--gray);\">ছবি নেই</div>') +
      '<div class=\"product-card-body\">' +
      '<div class=\"product-card-category\">' + esc(p.category_name || '') + '</div>' +
      '<div class=\"product-card-title\">' + esc(p.name) + '</div>' +
      '<div class=\"product-card-price\">' + taka(p.price) +
      (p.compare_price ? ' <span class=\"compare\">' + taka(p.compare_price) + '</span>' : '') +
      '</div></div></div>';
  }
})();
