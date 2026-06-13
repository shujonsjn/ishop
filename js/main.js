/* ==========================================================
   MAIN.JS — Homepage logic
   ========================================================== */
(function(){
  loadCartCount();

  window.addToCart = function(productId) {
    api('POST', '/cart', { product_id: productId, quantity: 1 }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      if (data.sessionId) localStorage.setItem('sessionId', data.sessionId);
      toast(__('toast.added_to_cart'));
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
  var bannerInterval;

  window.moveBanner = function(dir) {
    var track = document.getElementById('bannerTrack');
    if (!track || !track.children.length) return;
    var slides = track.children;
    bannerIndex = (bannerIndex + dir + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + (bannerIndex * 100) + '%)';
    var dots = document.querySelectorAll('#bannerDots span');
    dots.forEach(function(d, i) { d.classList.toggle('active', i === bannerIndex); });
  };

  function initBanner() {
    var track = document.getElementById('bannerTrack');
    if (!track) return;
    var wrap = track.parentElement;
    var dots = document.getElementById('bannerDots');
    if (!dots) {
      dots = document.createElement('div');
      dots.id = 'bannerDots';
      dots.className = 'dz-banner-dots';
      wrap.appendChild(dots);
    }
    if (!wrap.querySelector('.dz-banner-prev')) {
      var prevBtn = document.createElement('button');
      prevBtn.className = 'dz-banner-arrow dz-banner-prev';
      prevBtn.innerHTML = '&#10094;';
      prevBtn.onclick = function() { moveBanner(-1); };
      wrap.appendChild(prevBtn);
      var nextBtn = document.createElement('button');
      nextBtn.className = 'dz-banner-arrow dz-banner-next';
      nextBtn.innerHTML = '&#10095;';
      nextBtn.onclick = function() { moveBanner(1); };
      wrap.appendChild(nextBtn);
    }
    dots.innerHTML = '';
    for (var i = 0; i < track.children.length; i++) {
      var dot = document.createElement('span');
      if (i === 0) dot.className = 'active';
      dot.onclick = function(j) { return function() { moveBanner(j - bannerIndex); }; }(i);
      dots.appendChild(dot);
    }
    if (bannerInterval) clearInterval(bannerInterval);
    if (track.children.length > 1) {
      bannerInterval = setInterval(function() { moveBanner(1); }, 5000);
    }
  }

  function renderBanners(banners) {
    var track = document.getElementById('bannerTrack');
    if (!track) return;
    if (!banners || banners.length === 0) {
      track.innerHTML = '';
      initBanner();
      return;
    }
    var lang = window.getLang ? window.getLang() : 'bn';
    track.innerHTML = banners.map(function(s) {
      var title = lang === 'en' ? (s.titleEn || s.title) : s.title;
      var desc = lang === 'en' ? (s.descEn || s.desc) : s.desc;
      var btnText = lang === 'en' ? (s.btnTextEn || s.btnText) : s.btnText;
      var bgStyle = s.bgImage ? 'background-image:url(' + esc(s.bgImage) + ');background-size:cover;background-position:center;' : 'background:' + (s.bg || 'linear-gradient(135deg,#1a73e8,#7c3aed)');
      return '<div class="dz-banner-slide" style="' + bgStyle + '">' +
        '<div class="dz-banner-content">' +
          (title ? '<h2>' + esc(title) + '</h2>' : '') +
          (desc ? '<p>' + esc(desc) + '</p>' : '') +
          (btnText ? '<a href="' + esc(s.btnLink || '/products.html') + '" class="dz-banner-btn" style="background:' + esc(s.btnColor || '#ffffff') + '">' + esc(btnText) + '</a>' : '') +
        '</div></div>';
    }).join('');
    initBanner();
  }

  fetch('/api/admin/settings').then(function(r) { return r.json(); }).then(function(s) {
    var banners;
    try { banners = s.banners ? JSON.parse(s.banners) : null; } catch(e) { banners = null; }
    if (banners && banners.length) {
      renderBanners(banners);
    }
  }).catch(function(){});

  /* ---- Flash Sale Timer ---- */
  (function startFlashTimer() {
    var el = document.getElementById('flashTimer');
    if (!el) return;
    fetch('/api/admin/settings').then(function(r) { return r.json(); }).then(function(s) {
      if (s.flash_sale_color) {
        var section = el.closest('.section');
        if (section) section.style.setProperty('--flash-color', s.flash_sale_color);
      }
      var endTime = s && s.flash_sale_end ? new Date(s.flash_sale_end).getTime() : 0;
      if (!endTime) { el.textContent = __('flash.ended'); return; }
      setInterval(function() {
        var now = Date.now();
        var diff = Math.max(0, Math.floor((endTime - now) / 1000));
        if (diff <= 0) { el.textContent = __('flash.ended'); return; }
        var h = Math.floor(diff / 3600);
        var m = Math.floor((diff % 3600) / 60);
        var s = diff % 60;
        var timeStr = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        el.textContent = __('flash.timer', {time: timeStr});
      }, 1000);
    }).catch(function() { el.textContent = __('flash.ended'); });
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
        '<h3>' + esc(window.catName(c)) + '</h3></div>';
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
    if (btn) btn.textContent = __('more.loading');
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
        btn.textContent = jfyHasMore ? __('more.show') : __('more.all_shown');
        if (!jfyHasMore) btn.style.display = 'none';
      }
      loadCartCount();
    }).catch(function() {
      jfyLoading = false;
      var btn = document.getElementById('moreBtn');
      if (btn) btn.textContent = __('more.show');
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
    grid.innerHTML = products.slice(0, 8).map(function(p) {
      var img = (p.images && p.images.length) ? p.images[0] : '';
      var discount = p.compare_price ? Math.round((1 - p.price / p.compare_price) * 100) : 0;
      var sold = Math.floor(Math.random() * 80) + 10;
      var total = sold + Math.floor(Math.random() * 50) + 5;
      var pct = Math.round((sold / total) * 100);
      return '<div class=\"dz-flash-card\" onclick=\"window.location=\'' + window.location.origin + '/product.html?id=' + p.id + '\'">' +
        (discount > 0 ? '<div class=\"dz-flash-badge\">-' + discount + '%</div>' : '') +
        (img ? '<img class=\"dz-flash-image\" src=\"' + esc(img) + '\" alt=\"' + esc(window.productName(p)) + '\" loading=\"lazy\">' : '<div class=\"dz-flash-image\" style=\"display:flex;align-items:center;justify-content:center;color:var(--gray);font-size:12px;\">' + __('products.no_image') + '</div>') +
        '<div class=\"dz-flash-body\">' +
        '<div class=\"dz-flash-title\">' + esc(window.productName(p)) + '</div>' +
        '<div class=\"dz-flash-price\">' + taka(p.price) +
        (p.compare_price ? ' <span class=\"dz-flash-compare\">' + taka(p.compare_price) + '</span>' : '') +
        '</div>' +
        '<div class=\"dz-flash-progress\"><div class=\"dz-flash-progress-bar\" style=\"width:' + pct + '%\"></div></div>' +
        '<div class=\"dz-flash-sold\">' + __('flash.sold', {count: sold}) + '</div>' +
        '</div></div>';
    }).join('');
  });

  function renderProductCard(p) {
    var img = (p.images && p.images.length) ? p.images[0] : '';
    var discount = p.compare_price ? Math.round((1 - p.price / p.compare_price) * 100) : 0;
    return '<div class=\"product-card\" onclick=\"window.location=\'' + window.location.origin + '/product.html?id=' + p.id + '\'">' +
      (discount > 0 ? '<div class=\"product-card-discount\">-' + discount + '%</div>' : '') +
      (img ? '<img class=\"product-card-image\" src=\"' + esc(img) + '\" alt=\"' + esc(window.productName(p)) + '\" loading=\"lazy\">' : '<div class=\"product-card-image\" style=\"display:flex;align-items:center;justify-content:center;color:var(--gray);\">' + __('products.no_image') + '</div>') +
      '<div class=\"product-card-body\">' +
      '<div class=\"product-card-category\">' + esc(window.catNameStr(p.category_name, p.category_en_name) || '') + '</div>' +
      '<div class=\"product-card-title\">' + esc(window.productName(p)) + '</div>' +
      '<div class=\"product-card-price\">' + taka(p.price) +
      (p.compare_price ? ' <span class=\"compare\">' + taka(p.compare_price) + '</span>' : '') +
      '</div></div></div>';
  }
})();
