/* ==========================================================
   PRODUCTS.JS — Product list and detail
   ========================================================== */
(function(){
  loadCartCount();

  var page = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
  var productId = new URLSearchParams(window.location.search).get('id');

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

  /* ---- Detail page ---- */
  if (document.getElementById('productDetail')) {
    loadProductDetail();
    return;
  }

  /* ---- List page ---- */
  loadCategories();
  loadProducts();

  function loadProducts() {
    var cat = document.getElementById('categoryFilter');
    var sort = document.getElementById('sortFilter');
    var params = new URLSearchParams(window.location.search);
    var search = params.get('search') || '';
    var feat = params.get('featured') || '';
    if (search) {
      var si = document.getElementById('searchInput');
      if (si) si.value = search;
    }

    var catVal = cat ? cat.value : (params.get('category') || '');
    var sortVal = sort ? sort.value : 'newest';
    var query = '?page=' + page + '&limit=12&sort=' + sortVal;
    if (catVal) query += '&category=' + encodeURIComponent(catVal);
    if (search) query += '&search=' + encodeURIComponent(search);
    if (feat) query += '&featured=1';

    api('GET', '/products' + query).then(function(data) {
      var grid = document.getElementById('productGrid');
      var empty = document.getElementById('emptyState');
      var pag = document.getElementById('pagination');
      if (!grid) return;

      if (!data.products || data.products.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        if (pag) pag.innerHTML = '';
        return;
      }
      if (empty) empty.style.display = 'none';

      grid.innerHTML = data.products.map(function(p) {
        var img = (p.images && p.images.length) ? p.images[0] : '';
        var inStock = p.stock > 0;
        return '<div class=\"product-card\" onclick=\"window.location=\'' + window.location.origin + '/product.html?id=' + p.id + '\'">' +
          (img ? '<img class=\"product-card-image\" src=\"' + esc(img) + '\" alt=\"' + esc(p.name) + '\" loading=\"lazy\">' : '<div class=\"product-card-image\" style=\"display:flex;align-items:center;justify-content:center;color:var(--gray);\">ছবি নেই</div>') +
          '<div class=\"product-card-body\">' +
          '<div class=\"product-card-category\">' + esc(p.category_name || '') + '</div>' +
          '<div class=\"product-card-title\">' + esc(p.name) + '</div>' +
          '<div class=\"product-card-price\">' + taka(p.price) +
          (p.compare_price ? ' <span class=\"compare\">' + taka(p.compare_price) + '</span>' : '') +
          '</div>' +
          '<div class=\"product-card-actions\">' +
          (inStock
            ? '<button class=\"btn-card-cart\" onclick=\"event.stopPropagation();addToCart(' + p.id + ')\">কার্টে যোগ করুন</button><button class=\"btn-card-buy\" onclick=\"event.stopPropagation();buyNow(' + p.id + ')\">এখনই কিনুন</button>'
            : '<button class=\"btn-card-cart\" disabled>স্টক আউট</button>') +
          '</div></div></div>';
      }).join('');

      if (pag && data.totalPages > 1) {
        var q = new URLSearchParams(window.location.search);
        pag.innerHTML = '';
        for (var i = 1; i <= data.totalPages; i++) {
          var a = document.createElement('a');
          a.href = '?page=' + i + (catVal ? '&category=' + catVal : '') + (search ? '&search=' + search : '') + (feat ? '&featured=1' : '');
          a.textContent = i;
          if (i === data.page) a.className = 'active';
          pag.appendChild(a);
        }
      }
    });
  };

  window.loadProducts = loadProducts;

  function loadCategories() {
    api('GET', '/categories').then(function(cats) {
      var sel = document.getElementById('categoryFilter');
      if (!sel) return;
      var params = new URLSearchParams(window.location.search);
      var selected = params.get('category') || '';
      sel.innerHTML = '<option value=\"\">সব ক্যাটাগরি</option>' +
        cats.map(function(c) {
          return '<option value=\"' + esc(c.slug) + '\"' + (c.slug === selected ? ' selected' : '') + '>' + esc(c.name) + '</option>';
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
      document.getElementById('productDetail').innerHTML = '<div class="empty-state"><h3>পণ্য পাওয়া যায়নি</h3></div>';
      return;
    }
    api('GET', '/products/' + productId).then(function(p) {
      if (!p || p.error) {
        document.getElementById('productDetail').innerHTML = '<div class="empty-state"><h3>' + (p ? esc(p.error) : 'পণ্য পাওয়া যায়নি') + '</h3></div>';
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
        (mainImg ? '<img id="pdMainImg" src="' + esc(mainImg) + '" alt="' + esc(p.name) + '">' : '<div style="height:400px;display:flex;align-items:center;justify-content:center;color:var(--gray);">ছবি নেই</div>') +
        '</div>' +
        (thumbsHtml ? '<div class="pd-thumbnails" id="pdThumbs">' + thumbsHtml + '</div>' : '') +
        '</div>' +
        '<div class="pd-info">' +
        '<h1 class="pd-title">' + esc(p.name) + '</h1>' +
        '<div class="pd-rating"><span class="stars">' + stars + '</span><span class="pd-review-count">(' + (p.review_count || 0) + ' রিভিউ)</span></div>' +
        '<div class="pd-price-section">' +
        '<div class="pd-price">' + taka(p.price) + '</div>' +
        (p.compare_price ? '<div><span class="pd-compare">' + taka(p.compare_price) + '</span>' + savePercent + '</div>' : '') +
        '</div>' +
        '<div class="pd-brand">ব্র্যান্ড: <span>ইশপ</span></div>' +
        '<hr class="pd-divider">' +
        '<label class="pd-qty-label">পরিমাণ</label>' +
        '<div class="pd-qty-row">' +
        '<button class="pd-qty-btn" onclick="changeQty(-1)">−</button>' +
        '<input class="pd-qty-input" type="text" id="detailQty" value="1" readonly>' +
        '<button class="pd-qty-btn" onclick="changeQty(1)">+</button>' +
        '<span class="pd-stock' + (p.stock > 0 ? ' available' : '') + '">' + (p.stock > 0 ? 'স্টকে ' + p.stock + ' টি' : 'স্টকে নেই') + '</span>' +
        '</div>' +
        '<button class="pd-cart-btn" onclick="addToCart(' + p.id + ')"' + (p.stock < 1 ? ' disabled' : '') + '>' + (p.stock > 0 ? 'কার্টে যোগ করুন' : 'স্টক আউট') + '</button>' +
        '</div>' +
        '</div>' +
        '<div class="pd-section">' +
        '<h3>বিবরণ</h3>' +
        '<div class="pd-desc">' + (p.description || 'কোনো বিবরণ নেই').replace(/\\n/g, '<br>') + '</div>' +
        '</div>' +
        '<div class="pd-section">' +
        '<h3>রিভিউ (' + (p.review_count || 0) + ')</h3>';

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
        html += '<p style="color:var(--gray);">কোনো রিভিউ নেই</p>';
      }

      html += '<div class="pd-review-form">' +
        '<h4>রিভিউ দিন</h4>' +
        '<select id="reviewRating"><option value="5">৫ ★</option><option value="4">৪ ★</option><option value="3">৩ ★</option><option value="2">২ ★</option><option value="1">১ ★</option></select>' +
        '<textarea id="reviewComment" placeholder="আপনার মন্তব্য..." rows="3"></textarea>' +
        '<button class="btn btn-primary" onclick="submitReview(' + p.id + ')">রিভিউ পাঠান</button>' +
        '</div>' +
        '</div>';

      document.getElementById('productDetail').innerHTML = html;
      window.pdImages = imgs;
    });
  }

  window.addToCart = function(productId) {
    var qtyEl = document.getElementById('detailQty');
    var qty = qtyEl ? parseInt(qtyEl.value) || 1 : 1;
    api('POST', '/cart', { product_id: productId, quantity: qty }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      toast('কার্টে যোগ করা হয়েছে!');
      loadCartCount();
    });
  };

  window.buyNow = function(productId) {
    api('POST', '/cart', { product_id: productId, quantity: 1 }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      window.location = '/checkout.html';
    });
  };

  window.submitReview = function(productId) {
    var token = localStorage.getItem('token');
    if (!token) { toast('দয়া করে লগইন করুন', 'error'); window.location = '/auth.html'; return; }
    var rating = document.getElementById('reviewRating').value;
    var comment = document.getElementById('reviewComment').value;
    api('POST', '/products/' + productId + '/review', { rating: parseInt(rating), comment: comment }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      toast('রিভিউ দেওয়া হয়েছে!');
      setTimeout(function(){ window.location.reload(); }, 1000);
    });
  };

  window.searchProducts = function() {
    var q = document.getElementById('searchInput');
    if (q && q.value) window.location = '/products.html?search=' + encodeURIComponent(q.value);
  };
})();
