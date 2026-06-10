/* ==========================================================
   PRODUCTS.JS — Product list and detail
   ========================================================== */
(function(){
  loadCartCount();

  var page = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
  var productId = new URLSearchParams(window.location.search).get('id');

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
        return '<div class=\"product-card\" onclick=\"window.location=\'' + window.location.origin + '/product.html?id=' + p.id + '\">' +
          (img ? '<img class=\"product-card-image\" src=\"' + esc(img) + '\" alt=\"' + esc(p.name) + '\" loading=\"lazy\">' : '<div class=\"product-card-image\" style=\"display:flex;align-items:center;justify-content:center;color:var(--gray);\">ছবি নেই</div>') +
          '<div class=\"product-card-body\">' +
          '<div class=\"product-card-category\">' + esc(p.category_name || '') + '</div>' +
          '<div class=\"product-card-title\">' + esc(p.name) + '</div>' +
          '<div class=\"product-card-price\">' + taka(p.price) +
          (p.compare_price ? ' <span class=\"compare\">' + taka(p.compare_price) + '</span>' : '') +
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
      document.getElementById('productDetail').innerHTML = '<div class=\"empty-state\"><h3>পণ্য পাওয়া যায়নি</h3></div>';
      return;
    }
    api('GET', '/products/' + productId).then(function(p) {
      if (!p || p.error) {
        document.getElementById('productDetail').innerHTML = '<div class=\"empty-state\"><h3>' + (p ? esc(p.error) : 'পণ্য পাওয়া যায়নি') + '</h3></div>';
        return;
      }
      var img = (p.images && p.images.length) ? p.images[0] : '';
      var starsHtml = '';
      var rating = Math.round(p.avg_rating || 0);
      for (var i = 1; i <= 5; i++) {
        starsHtml += '<span class=\"' + (i <= rating ? '' : 'empty') + '\">★</span>';
      }

      var html = '<div class=\"product-detail\">' +
        '<div>' + (img ? '<img class=\"product-detail-image\" src=\"' + esc(img) + '\" alt=\"' + esc(p.name) + '\">' : '<div style=\"background:var(--light-gray);height:400px;border-radius:var(--radius);display:flex;align-items:center;justify-content:center;color:var(--gray);\">ছবি নেই</div>') + '</div>' +
        '<div>' +
        '<h1>' + esc(p.name) + '</h1>' +
        '<div class=\"stars\">' + starsHtml + ' <span style=\"font-size:14px;color:var(--gray);\">(' + (p.review_count || 0) + ' রিভিউ)</span></div>' +
        '<div class=\"price\">' + taka(p.price) +
        (p.compare_price ? ' <span class=\"compare-price\">' + taka(p.compare_price) + '</span>' : '') +
        '</div>' +
        '<div class=\"description\">' + (p.description || '').replace(/\\n/g, '<br>') + '</div>' +
        '<div class=\"form-group\"><label>পরিমাণ</label><input type=\"number\" id=\"detailQty\" value=\"1\" min=\"1\" max=\"' + (p.stock || 99) + '\" style=\"width:80px;\"></div>' +
        '<div class=\"actions\">' +
        '<button class=\"btn btn-primary\" onclick=\"addToCart(' + p.id + ')\">কার্টে যোগ করুন</button>' +
        '<span style=\"color:var(--gray);font-size:14px;\">' + (p.stock > 0 ? p.stock + ' টি stock এ আছে' : 'স্টকে নেই') + '</span>' +
        '</div>' +
        '<div style=\"margin-top:20px;\">' +
        '<h3 style=\"margin-bottom:12px;\">রিভিউ (' + (p.review_count || 0) + ')</h3>';

      if (p.reviews && p.reviews.length) {
        html += p.reviews.map(function(r) {
          var s = '';
          for (var j = 1; j <= 5; j++) s += '<span class=\"' + (j <= r.rating ? '' : 'empty') + '\">★</span>';
          return '<div style=\"padding:12px 0;border-bottom:1px solid var(--border);\">' +
            '<div class=\"stars\" style=\"font-size:14px;\">' + s + '</div>' +
            '<strong>' + esc(r.user_name || '') + '</strong> <span style=\"color:var(--gray);font-size:13px;\">' + timeAgo(r.created_at) + '</span>' +
            (r.comment ? '<p style=\"margin-top:4px;\">' + esc(r.comment) + '</p>' : '') +
            '</div>';
        }).join('');
      } else {
        html += '<p style=\"color:var(--gray);\">কোনো রিভিউ নেই</p>';
      }

      html += '<div style=\"margin-top:16px;padding-top:16px;border-top:1px solid var(--border);\">' +
        '<h4 style=\"margin-bottom:8px;\">রিভিউ দিন</h4>' +
        '<div class=\"form-group\"><label>রেটিং</label><select id=\"reviewRating\"><option value=\"5\">৫ ★</option><option value=\"4\">৪ ★</option><option value=\"3\">৩ ★</option><option value=\"2\">২ ★</option><option value=\"1\">১ ★</option></select></div>' +
        '<div class=\"form-group\"><textarea id=\"reviewComment\" placeholder=\"আপনার মন্তব্য...\" rows=\"2\"></textarea></div>' +
        '<button class=\"btn btn-sm btn-primary\" onclick=\"submitReview(' + p.id + ')\">রিভিউ পাঠান</button>' +
        '</div>';

      html += '</div></div></div>';
      document.getElementById('productDetail').innerHTML = html;
    });
  }

  window.addToCart = function(productId) {
    var qty = parseInt(document.getElementById('detailQty').value) || 1;
    api('POST', '/cart', { product_id: productId, quantity: qty }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      toast('কার্টে যোগ করা হয়েছে!');
      loadCartCount();
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
