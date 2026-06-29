/* ==========================================================
   PRODUCT-LIST.JS — Products listing page
   ========================================================== */
(function(){
  var lang = window.getLang ? getLang() : 'bn';
  var params = new URLSearchParams(window.location.search);
  var searchQuery = params.get('search') || '';
  var categorySlug = params.get('category') || '';
  var page = parseInt(params.get('page')) || 1;
  var LIMIT = 20;
  var allCats = [];

  document.addEventListener('DOMContentLoaded', function() {
    loadBrands();
    loadProducts(false);
    applyProductsPageOverrides();
    if (searchQuery) {
      var inp = document.getElementById('searchInput');
      if (inp) inp.value = searchQuery;
    }
    document.querySelectorAll('.dz-rating-item').forEach(function(item) {
      item.addEventListener('click', function() {
        document.querySelectorAll('.dz-rating-item').forEach(function(i) { i.classList.remove('active'); });
        item.classList.add('active');
        loadProducts(true);
      });
    });
    document.querySelectorAll('.dz-filter-checks input[type="checkbox"]').forEach(function(cb) {
      cb.addEventListener('change', function() { loadProducts(true); });
    });
    var priceTimeout;
    document.querySelectorAll('.dz-price-filter input').forEach(function(inp) {
      inp.addEventListener('input', function() {
        clearTimeout(priceTimeout);
        priceTimeout = setTimeout(function() { loadProducts(true); }, 500);
      });
    });
  });

  window.doSearch = function() {
    var q = document.getElementById('searchInput');
    if (q && q.value.trim()) {
      window.location = '/products.html?search=' + encodeURIComponent(q.value.trim());
    }
  };

  window.loadProducts = function(reset) {
    if (reset) {
      page = 1;
    }
    var grid = document.getElementById('productGrid');
    if (!grid) return;

    grid.classList.add('product-grid-loading');
    var existingSpinner = grid.querySelector('.grid-loading-spinner');
    if (!existingSpinner) {
      var sp = document.createElement('div');
      sp.className = 'grid-loading-spinner';
      grid.appendChild(sp);
    }

    if (reset && categorySlug) {
      var bc = document.getElementById('breadcrumb');
      if (bc) bc.innerHTML = '<a href="/">' + __('products.breadcrumb_home') + '</a> <span class="sep">\u203A</span> <a href="/products.html">' + __('products.breadcrumb_products') + '</a> <span class="sep">\u203A</span> <span id="bcCat"></span>';
      var h1 = document.getElementById('catTitle');
      var cat = allCats.find(function(c) { return c.slug === categorySlug; });
      if (h1) h1.textContent = cat ? window.catName(cat) : categorySlug;
      var bc2 = document.getElementById('bcCat');
      if (bc2) bc2.textContent = cat ? window.catName(cat) : categorySlug;
    } else if (reset && !categorySlug) {
      var bc = document.getElementById('breadcrumb');
      if (bc) bc.innerHTML = '<a href="/">' + __('products.breadcrumb_home') + '</a> <span class="sep">\u203A</span> <span>' + __('products.breadcrumb_products') + '</span>';
      var h1 = document.getElementById('catTitle');
      if (h1) h1.textContent = __('products.heading');
    }
    var sort = document.getElementById('sortFilter');
    var sortVal = sort ? sort.value : 'ai';
    var grid = document.getElementById('productGrid');
    if (!grid) return;

    var url = '/products?page=' + page + '&limit=' + LIMIT;
    if (sortVal && sortVal !== 'ai') url += '&sort=' + sortVal;
    if (searchQuery) url += '&search=' + encodeURIComponent(searchQuery);
    if (categorySlug) url += '&category=' + encodeURIComponent(categorySlug);

    var selectedBrands = [];
    document.querySelectorAll('.brand-filter:checked').forEach(function(cb) {
      selectedBrands.push(cb.value);
    });
    if (selectedBrands.length > 0) url += '&brand=' + encodeURIComponent(selectedBrands.join(','));

    var activeRating = document.querySelector('.dz-rating-item.active');
    if (activeRating) url += '&min_rating=' + activeRating.getAttribute('data-rating');

    var priceMin = document.getElementById('priceMin');
    var priceMax = document.getElementById('priceMax');
    if (priceMin && priceMin.value) url += '&min_price=' + priceMin.value;
    if (priceMax && priceMax.value) url += '&max_price=' + priceMax.value;

    var fastCb = document.querySelector('.dz-filter-checks input[value="fast"]');
    if (fastCb && fastCb.checked) url += '&is_fast=1';
    var verifiedCb = document.querySelector('.dz-filter-checks input[value="verified"]');
    if (verifiedCb && verifiedCb.checked) url += '&is_verified=1';

    api('GET', url).then(function(data) {
      grid.classList.remove('product-grid-loading');
      var spinner = grid.querySelector('.grid-loading-spinner');
      if (spinner) spinner.remove();
      var products = data.products || [];
      var total = data.total || products.length;

      if (categorySlug) {
        var h1 = document.getElementById('catTitle');
        if (h1) {
          var cat = allCats.find(function(c) { return c.slug === categorySlug; });
          h1.textContent = cat ? window.catName(cat) : categorySlug;
        }
      } else if (searchQuery) {
        var h1 = document.getElementById('catTitle');
        if (h1) h1.textContent = __('products.search_title', {query: searchQuery});
        var bc = document.getElementById('breadcrumb');
        if (bc) bc.innerHTML = '<a href="/" data-i18n="products.breadcrumb_home">' + __('products.breadcrumb_home') + '</a> <span class="sep">›</span> <span>' + esc(searchQuery) + '</span>';
      }

      var countEl = document.getElementById('catCount');
      if (countEl) countEl.textContent = total + ' ' + __('products.items_found');
      var resultEl = document.getElementById('resultCount');
      if (resultEl) resultEl.textContent = total + ' ' + __('products.items_found');

      var emptyEl = document.getElementById('emptyState');
      if (products.length === 0 && page === 1) {
        grid.innerHTML = '';
        grid.style.minHeight = '300px';
        if (emptyEl) emptyEl.style.display = 'none';
        var pag = document.getElementById('pagination');
        if (pag) pag.innerHTML = '';
        return;
      }
      grid.style.minHeight = '';
      if (emptyEl) emptyEl.style.display = 'none';

      var html = products.map(renderProductCard).join('');
      if (page > 1) {
        grid.insertAdjacentHTML('beforeend', html);
      } else {
        grid.innerHTML = html;
      }
      renderPagination(total);
    }).catch(function() {
      grid.classList.remove('product-grid-loading');
      var spinner = grid.querySelector('.grid-loading-spinner');
      if (spinner) spinner.remove();
      if (page === 1) {
        grid.innerHTML = '';
        grid.style.minHeight = '300px';
        var emptyEl = document.getElementById('emptyState');
        if (emptyEl) emptyEl.style.display = 'none';
        var pag = document.getElementById('pagination');
        if (pag) pag.innerHTML = '';
      }
    });
  };

  function renderProductCard(p) {
    var img = window.productImage(p);
    var discount = p.compare_price ? Math.round((1 - p.price / p.compare_price) * 100) : 0;
    return '<a href="/product.html?id=' + p.id + '" class="product-card">' +
      (discount > 0 ? '<div class="product-card-discount">-' + discount + '%</div>' : '') +
      (img ? '<img class="product-card-image" src="' + esc(img) + '" alt="' + esc(window.productName(p)) + '" loading="lazy">' : '<div class="product-card-image" style="display:flex;align-items:center;justify-content:center;color:var(--gray);">' + __('products.no_image') + '</div>') +
      '<div class="product-card-body">' +
      '<div class="product-card-category">' + esc(window.catNameStr(p.category_name, p.category_en_name) || '') + '</div>' +
      '<div class="product-card-title">' + esc(window.productName(p)) + '</div>' +
      '<div class="product-card-price">' + taka(p.price) +
      (p.compare_price ? ' <span class="compare">' + taka(p.compare_price) + '</span>' : '') +
      '</div></div></a>';
  }

  function renderPagination(total) {
    var el = document.getElementById('pagination');
    if (!el) return;
    var totalPages = Math.ceil(total / LIMIT);
    if (page < totalPages) {
      el.innerHTML = '<button onclick="showMore()" class="more-btn">' + __('products.show_more') + '</button>';
    } else {
      el.innerHTML = '';
    }
  }

  window.showMore = function() {
    page++;
    loadProducts(false);
  };

  function loadBrands() {
    fetch('/api/admin/settings').then(function(){}).catch(function(){});
    api('GET', '/products?limit=500').then(function(data) {
      var products = data.products || [];
      var brandMap = {};
      products.forEach(function(p) {
        if (p.brand && p.brand.trim()) {
          var b = p.brand.trim();
          brandMap[b] = (brandMap[b] || 0) + 1;
        }
      });
      var brands = Object.keys(brandMap).sort();
      var sidebar = document.getElementById('brandList');
      if (!sidebar) return;
      if (brands.length === 0) {
        sidebar.innerHTML = '<p style="color:#9ca3af;font-size:13px;">কোনো ব্র্যান্ড পাওয়া যায়নি</p>';
        return;
      }
      var html = '';
      brands.forEach(function(b) {
        html += '<label class="dz-check-item"><input type="checkbox" value="' + esc(b) + '" class="brand-filter"> ' + esc(b) + ' <span style="color:#9ca3af;font-size:12px;">(' + brandMap[b] + ')</span></label>';
      });
      sidebar.innerHTML = html;
      sidebar.querySelectorAll('.brand-filter').forEach(function(cb) {
        cb.addEventListener('change', function() { loadProducts(true); });
      });
    }).catch(function() {});
  }

  function applyProductsPageOverrides() {
    fetch('/api/admin/settings').then(function(r){return r.json()}).then(function(s){
      var pp;
      try { pp = typeof s.page_products === 'string' ? JSON.parse(s.page_products) : (s.page_products || {}); } catch(e) { pp = {}; }
      var lang = localStorage.getItem('lang') || 'bn';

      var h1 = document.getElementById('catTitle');
      if (h1 && !searchQuery && !categorySlug) {
        var t = lang === 'en' ? (pp.titleEn || pp.title) : pp.title;
        if (t) h1.textContent = t;
      }

      var sortLabel = document.querySelector('.dz-sort-label');
      if (sortLabel) {
        var sl = lang === 'en' ? (pp.sortLabelEn || pp.sortLabel) : pp.sortLabel;
        if (sl) sortLabel.textContent = sl;
      }

      // Sidebar title no longer overridden (brands/services/price/rating sections are fixed)

      var aiTitle = document.querySelector('.dz-ai-recs-header');
      if (aiTitle) {
        var at = lang === 'en' ? (pp.aiTitleEn || pp.aiTitle) : pp.aiTitle;
        if (at) aiTitle.innerHTML = '<span class="dz-ai-recs-icon">🤖</span> ' + at;
      }

      var emptyTitle = document.querySelector('#emptyState h3');
      if (emptyTitle) {
        var et = lang === 'en' ? (pp.emptyTitleEn || pp.emptyTitle) : pp.emptyTitle;
        if (et) emptyTitle.textContent = et;
      }

      var emptyHint = document.querySelector('#emptyState p');
      if (emptyHint) {
        var eh = lang === 'en' ? (pp.emptyHintEn || pp.emptyHint) : pp.emptyHint;
        if (eh) emptyHint.textContent = eh;
      }

      var breadHome = document.querySelector('.dz-breadcrumb a:first-child');
      if (breadHome) {
        var bh = lang === 'en' ? (pp.breadHomeEn || pp.breadHome) : pp.breadHome;
        if (bh) breadHome.textContent = bh;
      }
    }).catch(function(){});
  }

  window.toggleMobileSidebar = function() {
    var sb = document.getElementById('catSidebar');
    if (sb) {
      var isOpen = sb.style.display === 'block';
      sb.style.display = isOpen ? '' : 'block';
      sb.style.position = isOpen ? '' : 'fixed';
      sb.style.top = isOpen ? '' : '0';
      sb.style.left = isOpen ? '' : '0';
      sb.style.right = isOpen ? '' : '0';
      sb.style.bottom = isOpen ? '' : '0';
      sb.style.zIndex = isOpen ? '' : '999';
      sb.style.overflow = isOpen ? '' : 'auto';
      sb.style.borderRadius = isOpen ? '' : '0';
    }
  };

  window.toggleMobileSort = function() {
    var sel = document.getElementById('sortFilter');
    if (sel) sel.focus();
  };
})();
