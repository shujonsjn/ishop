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
    loadCategories();
    loadProducts(false);
    applyProductsPageOverrides();
    if (searchQuery) {
      var inp = document.getElementById('searchInput');
      if (inp) inp.value = searchQuery;
    }
    document.addEventListener('click', function(e) {
      var link = e.target.closest('.dz-cat-link');
      if (!link) return;
      e.preventDefault();
      var href = link.getAttribute('href');
      var params2 = new URL(href, window.location.origin).searchParams;
      categorySlug = params2.get('category') || '';
      page = 1;
      var url2 = new URL(window.location.pathname, window.location.origin);
      if (categorySlug) url2.searchParams.set('category', categorySlug);
      window.history.pushState({}, '', url2);
      var sidebar = document.getElementById('categoryList');
      if (sidebar) sidebar.querySelectorAll('.dz-cat-link').forEach(function(a) {
        var aHref = new URL(a.getAttribute('href'), window.location.origin).searchParams;
        a.classList.toggle('active', aHref.get('category') === categorySlug);
      });
      var grid = document.getElementById('productGrid');
      if (grid) {
        var sk = '';
        for (var i = 0; i < 8; i++) sk += '<div class="product-card skeleton-card"><div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton-line w80"></div><div class="skeleton-line w60"></div><div class="skeleton-line w40"></div></div></div>';
        grid.innerHTML = sk;
      }
      loadProducts(true);
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
      if (countEl) countEl.textContent = __('products.count', {count: total});
      var resultEl = document.getElementById('resultCount');
      if (resultEl) resultEl.textContent = __('products.results', {count: total});

      var emptyEl = document.getElementById('emptyState');
      if (products.length === 0 && page === 1) {
        grid.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
      }
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
        var emptyEl = document.getElementById('emptyState');
        if (emptyEl) emptyEl.style.display = 'block';
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

  function loadCategories() {
    api('GET', '/categories').then(function(cats) {
      allCats = cats || [];
      var sidebar = document.getElementById('categoryList');
      if (!sidebar) return;
      var html = '<a href="/products.html" class="dz-cat-link' + (!categorySlug ? ' active' : '') + '" data-i18n="products.sidebar_all">' + __('products.sidebar_all') + '</a>';
      cats.forEach(function(c) {
        var active = categorySlug === c.slug ? ' active' : '';
        html += '<a href="/products.html?category=' + encodeURIComponent(c.slug) + '" class="dz-cat-link' + active + '">' + esc(window.catName(c)) + '</a>';
      });
      sidebar.innerHTML = html;
    });
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

      var sidebarTitle = document.querySelector('#catSidebar h3');
      if (sidebarTitle) {
        var st = lang === 'en' ? (pp.sidebarTitleEn || pp.sidebarTitle) : pp.sidebarTitle;
        if (st) sidebarTitle.textContent = st;
      }

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
})();
