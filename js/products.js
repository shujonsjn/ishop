/* ==========================================================
   PRODUCTS.JS — Product list and detail
   ========================================================== */
(function(){
  loadCartCount();

  var page = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
  var productId = new URLSearchParams(window.location.search).get('id');

  function formatDesc(str) {
    if (!str) return '';
    if (/<[a-z][\s\S]*>/i.test(str)) return str;
    return str.replace(/\n/g, '<br>');
  }

  window.switchImage = function(idx) {
    var img = document.getElementById('pdMainImg');
    var thumbs = document.querySelectorAll('.pd-thumb');
    if (img && window.pdImages && window.pdImages[idx]) {
      img.src = window.pdImages[idx];
      thumbs.forEach(function(t, i) { t.classList.toggle('active', i === idx); });
    }
  };

  window.changeQty = function(delta) {
    var el = document.getElementById('detailQty');
    var val = parseInt(el.value) || 1;
    var max = 99;
    val += delta;
    if (val < 1) val = 1;
    if (val > max) val = max;
    el.value = val;
  };

  window.selectedColor = '';

  window.selectColor = function(color, el) {
    window.selectedColor = color;
    var label = document.getElementById('pdColorSelected');
    if (label) label.textContent = color;
    var swatches = document.querySelectorAll('.pd-color-swatch');
    swatches.forEach(function(s) { s.classList.remove('active'); });
    if (el) el.classList.add('active');
  };

  window.addToCart = function(productId) {
    var qtyEl = document.getElementById('detailQty');
    var qty = qtyEl ? parseInt(qtyEl.value) || 1 : 1;
    var color = window.selectedColor;
    api('POST', '/cart', { product_id: productId, quantity: qty, color: color }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      if (data.sessionId) localStorage.setItem('sessionId', data.sessionId);
      toast(__('toast.added_to_cart'));
      loadCartCount();
    });
  };

  window.buyNow = function(productId) {
    var color = window.selectedColor;
    api('POST', '/cart', { product_id: productId, quantity: 1, color: color }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      if (data.sessionId) localStorage.setItem('sessionId', data.sessionId);
      window.location = '/checkout.html';
    });
  };

  /* Globals used by both detail & list pages */
  window.submitReview = function(productId) {
    var token = localStorage.getItem('token');
    if (!token) { toast(__('toast.please_login'), 'error'); window.location = '/auth.html'; return; }
    var rating = document.getElementById('reviewRating').value;
    var comment = document.getElementById('reviewComment').value;
    api('POST', '/products/' + productId + '/review', { rating: parseInt(rating), comment: comment }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      toast(__('toast.review_submitted'));
      setTimeout(function(){ window.location.reload(); }, 1000);
    });
  };

  window.searchProducts = function() {
    var q = document.getElementById('searchInput');
    if (q && q.value) window.location = '/products.html?search=' + encodeURIComponent(q.value);
  };

  /* ---- Detail page ---- */
  if (document.getElementById('productDetail')) {
    loadProductDetail();
    return;
  }

  /* ---- List page ---- */
  loadSidebarCategories();
  loadProducts();
  loadAiRecs();

  function loadProducts(resetPage) {
    var sort = document.getElementById('sortFilter');
    var params = new URLSearchParams(window.location.search);
    var search = params.get('search') || '';
    var catVal = params.get('category') || '';
    var sortVal = sort ? sort.value : 'newest';
    if (resetPage) page = 1;
    if (search) {
      var si = document.getElementById('searchInput');
      if (si) si.value = search;
    }

    var query = '?page=' + page + '&limit=24&sort=' + sortVal;
    if (catVal) query += '&category=' + encodeURIComponent(catVal);
    if (search) query += '&search=' + encodeURIComponent(search);

    api('GET', '/products' + query).then(function(data) {
      var grid = document.getElementById('productGrid');
      var empty = document.getElementById('emptyState');
      var pag = document.getElementById('pagination');
      var count = document.getElementById('catCount');
      var title = document.getElementById('catTitle');
      var resultCount = document.getElementById('resultCount');
      var breadcrumb = document.getElementById('breadcrumb');
      if (!grid) return;

      if (count && data.total !== undefined) count.textContent = __('products.count', {count: data.total});
      if (resultCount && data.total !== undefined) resultCount.textContent = __('products.results', {count: data.total});

      if (catVal && data.products && data.products.length) {
        if (title) title.textContent = window.catNameStr(data.products[0].category_name, data.products[0].category_en_name) || __('products.heading');
        if (breadcrumb) breadcrumb.innerHTML = '<a href="/">' + __('products.breadcrumb_home') + '</a> <span class="sep">›</span> <a href="/products.html">' + __('products.heading') + '</a> <span class="sep">›</span> <span class="current">' + esc(window.catNameStr(data.products[0].category_name, data.products[0].category_en_name) || catVal) + '</span>';
        document.getElementById('pageTitle').textContent = (window.catNameStr(data.products[0].category_name, data.products[0].category_en_name) || '') + ' — ' + __('detail.brand_default');
      } else if (search) {
        if (title) title.textContent = __('products.search_title', {query: search});
        if (breadcrumb) breadcrumb.innerHTML = '<a href="/">' + __('products.breadcrumb_home') + '</a> <span class="sep">›</span> <a href="/products.html">' + __('products.heading') + '</a> <span class="sep">›</span> <span class="current">' + __('products.breadcrumb_search') + '</span>';
        document.getElementById('pageTitle').textContent = __('products.search_page_title') + ' — ' + __('detail.brand_default');
      } else {
        if (title) title.textContent = __('products.heading');
        if (breadcrumb) breadcrumb.innerHTML = '<a href="/">' + __('products.breadcrumb_home') + '</a> <span class="sep">›</span> <span class="current">' + __('products.heading') + '</span>';
      }

      if (!data.products || data.products.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        if (pag) pag.innerHTML = '';
        return;
      }
      if (empty) empty.style.display = 'none';

      grid.innerHTML = data.products.map(function(p) {
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
      }).join('');

      if (pag) {
        if (data.totalPages > 1) {
          var qp = [];
          if (catVal) qp.push('category=' + encodeURIComponent(catVal));
          if (search) qp.push('search=' + encodeURIComponent(search));
          var qs = qp.length ? '&' + qp.join('&') : '';
          pag.innerHTML = '';
          if (data.page > 1) {
            var prev = document.createElement('a');
            prev.href = '?page=' + (data.page - 1) + qs;
            prev.textContent = __('products.paging_prev');
            prev.className = 'paging-prev';
            pag.appendChild(prev);
          }
          var startPage = Math.max(1, data.page - 4);
          var endPage = Math.min(data.totalPages, data.page + 4);
          if (startPage > 1) {
            var first = document.createElement('a');
            first.href = '?page=1' + qs;
            first.textContent = '1';
            pag.appendChild(first);
            if (startPage > 2) {
              var dots = document.createElement('span');
              dots.textContent = '...';
              dots.style.cssText = 'padding:0 4px;color:var(--gray);';
              pag.appendChild(dots);
            }
          }
          for (var i = startPage; i <= endPage; i++) {
            var a = document.createElement('a');
            a.href = '?page=' + i + qs;
            a.textContent = i;
            if (i === data.page) a.className = 'active';
            pag.appendChild(a);
          }
          if (endPage < data.totalPages) {
            if (endPage < data.totalPages - 1) {
              var dots2 = document.createElement('span');
              dots2.textContent = '...';
              dots2.style.cssText = 'padding:0 4px;color:var(--gray);';
              pag.appendChild(dots2);
            }
            var last = document.createElement('a');
            last.href = '?page=' + data.totalPages + qs;
            last.textContent = data.totalPages;
            pag.appendChild(last);
          }
          if (data.page < data.totalPages) {
            var next = document.createElement('a');
            next.href = '?page=' + (data.page + 1) + qs;
            next.textContent = __('products.paging_next');
            next.className = 'paging-next';
            pag.appendChild(next);
          }
        } else {
          pag.innerHTML = '';
        }
      }
    });
  };

  window.loadProducts = loadProducts;

  function loadSidebarCategories() {
    api('GET', '/categories').then(function(cats) {
      var list = document.getElementById('categoryList');
      if (!list) return;
      var params = new URLSearchParams(window.location.search);
      var selected = params.get('category') || '';
      var search = params.get('search') || '';
      var base = '/products.html?';
      list.innerHTML = '<a class="cat-link' + (selected === '' && !search ? ' active' : '') + '" href="/products.html">' + __('products.sidebar_all') + '</a>' +
        cats.map(function(c) {
          return '<a class="cat-link' + (c.slug === selected ? ' active' : '') + '" href="?category=' + encodeURIComponent(c.slug) + '">' +
            esc(window.catName(c)) + '</a>';
        }).join('');
    });
  }

  function loadAiRecs() {
    var recsEl = document.getElementById('aiRecsRow');
    if (!recsEl) return;
    api('GET', '/products?page=1&limit=8&sort=ai').then(function(data) {
      if (!data.products || !data.products.length) { document.getElementById('aiRecs').style.display = 'none'; return; }
      recsEl.innerHTML = data.products.map(function(p) {
        var img = (p.images && p.images.length) ? p.images[0] : '';
        return '<div class="dz-ai-rec-card" onclick="window.location=\'' + window.location.origin + '/product.html?id=' + p.id + '\'">' +
          (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : '<div style="height:100px;display:flex;align-items:center;justify-content:center;color:var(--gray);font-size:12px;">' + __('products.no_image') + '</div>') +
          '<div class="title">' + esc(window.productName(p)) + '</div>' +
          '<div class="price">' + taka(p.price) + '</div></div>';
      }).join('');
    });
  }

  window.doSearch = function() {
    var q = document.getElementById('searchInput');
    if (q) window.location = '/products.html?search=' + encodeURIComponent(q.value);
  };

  /* ---- Product Detail ---- */
  function loadProductDetail() {
    if (!productId) {
      document.getElementById('productDetail').innerHTML = '<div class="empty-state"><h3>' + __('detail.not_found') + '</h3></div>';
      return;
    }
    api('GET', '/products/' + productId).then(function(p) {
      if (!p || p.error) {
        document.getElementById('productDetail').innerHTML = '<div class="empty-state"><h3>' + (p ? esc(p.error) : __('detail.not_found')) + '</h3></div>';
        return;
      }

      var imgs = (p.images && p.images.length) ? p.images : [];
      var mainImg = imgs.length ? imgs[0] : '';
      var rating = Math.round(p.avg_rating || 0);
      var stars = '';
      for (var i = 1; i <= 5; i++) stars += '<span class="' + (i <= rating ? '' : 'empty') + '">★</span>';

      var thumbsHtml = '';
      imgs.forEach(function(url, idx) {
        thumbsHtml += '<div class="pd-thumb' + (idx === 0 ? ' active' : '') + '" onclick="switchImage(' + idx + ')"><img src="' + esc(url) + '" alt=""></div>';
      });

      var savePercent = '';
      if (p.compare_price && Number(p.compare_price) > Number(p.price)) {
        var saved = Math.round((1 - Number(p.price) / Number(p.compare_price)) * 100);
        savePercent = '<span class="pd-save">-' + saved + '%</span>';
      }

      var html = '<div class="pd-layout">' +
        '<div class="pd-gallery">' +
        '<div class="pd-main-image">' +
        (mainImg ? '<img id="pdMainImg" src="' + esc(mainImg) + '" alt="' + esc(window.productName(p)) + '">' : '<div style="height:400px;display:flex;align-items:center;justify-content:center;color:var(--gray);">' + __('products.no_image') + '</div>') +
        '</div>' +
        (thumbsHtml ? '<div class="pd-thumbnails" id="pdThumbs">' + thumbsHtml + '</div>' : '') +
        '</div>' +
        '<div class="pd-info">' +
        '<h1 class="pd-title">' + esc(window.productName(p)) + '</h1>' +
        '<div class="pd-rating"><span class="stars">' + stars + '</span><span class="pd-review-count">' + __('detail.reviews', {count: p.review_count || 0}) + '</span></div>' +
        '<div class="pd-price-section">' +
        '<div class="pd-price">' + taka(p.price) + '</div>' +
        (p.compare_price ? '<div><span class="pd-compare">' + taka(p.compare_price) + '</span>' + savePercent + '</div>' : '') +
        '</div>' +
        '<div class="pd-brand">' + __('detail.brand') + ' <span>' + __('detail.brand_default') + '</span></div>' +
        (p.colors && p.colors.length ? '<div class="pd-color-label">' + __('detail.color') + ' <span class="pd-color-selected" id="pdColorSelected">' + esc(p.colors[0]) + '</span></div><div class="pd-color-row" id="pdColorRow">' + p.colors.map(function(c, i) { return '<span class="pd-color-swatch' + (i === 0 ? ' active' : '') + '" data-color="' + esc(c) + '" onclick="selectColor(\'' + esc(c) + '\', this)">' + esc(c) + '</span>'; }).join('') + '</div>' : '') +
        '<hr class="pd-divider">' +
        '<label class="pd-qty-label">' + __('detail.qty_label') + '</label>' +
        '<div class="pd-qty-row">' +
        '<button class="pd-qty-btn" onclick="changeQty(-1)">−</button>' +
        '<input class="pd-qty-input" type="text" id="detailQty" value="1" readonly>' +
        '<button class="pd-qty-btn" onclick="changeQty(1)">+</button>' +
        '<span class="pd-stock' + (p.stock > 0 ? ' available' : '') + '">' + (p.stock > 0 ? __('detail.in_stock', {count: p.stock}) : __('detail.out_of_stock')) + '</span>' +
        '</div>' +
        (p.stock > 0
  ? '<div class="pd-btn-row"><button class="pd-buy-btn" onclick="buyNow(' + p.id + ')">' + __('detail.buy_now') + '</button><button class="pd-cart-btn" onclick="addToCart(' + p.id + ')">' + __('detail.add_to_cart') + '</button></div>'
  : '<button class="pd-cart-btn" disabled>' + __('detail.stock_out_btn') + '</button>') +
        '</div>' +
        '</div>' +
        '<div class="pd-section">' +
        '<h3>' + __('detail.section_desc') + '</h3>' +
        '<div class="pd-desc">' + formatDesc(p.description) + '</div>' +
        '</div>' +
        '<div class="pd-section">' +
        '<h3>' + __('detail.section_reviews', {count: p.review_count || 0}) + '</h3>';

      if (p.reviews && p.reviews.length) {
        html += p.reviews.map(function(r) {
          var s = '';
          for (var j = 1; j <= 5; j++) s += '<span class="' + (j <= r.rating ? '' : 'empty') + '">★</span>';
          return '<div class="pd-review-card">' +
            '<div class="pd-review-header"><span class="stars" style="font-size:14px;">' + s + '</span><span class="pd-review-name">' + esc(r.user_name || '') + '</span><span class="pd-review-date">' + timeAgo(r.created_at) + '</span></div>' +
            (r.comment ? '<div class="pd-review-comment">' + esc(r.comment) + '</div>' : '') +
            '</div>';
        }).join('');
      } else {
        html += '<p style="color:var(--gray);">' + __('detail.no_reviews') + '</p>';
      }

      html += '<div class="pd-review-form">' +
        '<h4>' + __('detail.review_title') + '</h4>' +
        '<select id="reviewRating"><option value="5">' + __('detail.review_rating_5') + '</option><option value="4">' + __('detail.review_rating_4') + '</option><option value="3">' + __('detail.review_rating_3') + '</option><option value="2">' + __('detail.review_rating_2') + '</option><option value="1">' + __('detail.review_rating_1') + '</option></select>' +
        '<textarea id="reviewComment" placeholder="' + __('detail.review_placeholder') + '" rows="3"></textarea>' +
        '<button class="btn btn-primary" onclick="submitReview(' + p.id + ')">' + __('detail.review_submit') + '</button>' +
        '</div>' +
        '</div>';

      document.getElementById('productDetail').innerHTML = html;
      window.pdImages = imgs;
    });
  }

})();
