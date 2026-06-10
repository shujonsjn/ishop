/* ==========================================================
   MAIN.JS — Homepage logic
   ========================================================== */
(function(){
  loadCartCount();

  window.searchProducts = function() {
    var q = document.getElementById('searchInput');
    if (q && q.value) window.location = '/products.html?search=' + encodeURIComponent(q.value);
  };

  api('GET', '/categories').then(function(cats) {
    var grid = document.getElementById('categoryGrid');
    if (!grid) return;
    grid.innerHTML = cats.map(function(c) {
      return '<div class=\"category-card\" onclick=\"window.location=\'' + window.location.origin + '/products.html?category=' + encodeURIComponent(c.slug) + '\'">' +
        '<h3>' + esc(c.name) + '</h3>' +
        '<div class=\"count\">' + (c.product_count || 0) + ' টি পণ্য</div></div>';
    }).join('');
  });

  api('GET', '/products/featured').then(function(products) {
    var grid = document.getElementById('featuredGrid');
    if (!grid) return;
    if (!products || products.length === 0) {
      grid.innerHTML = '<div class=\"empty-state\"><h3>কোনো ফিচার্ড পণ্য নেই</h3></div>';
      return;
    }
    grid.innerHTML = products.map(renderProductCard).join('');
  });

  function renderProductCard(p) {
    var img = (p.images && p.images.length) ? p.images[0] : '';
    return '<div class=\"product-card\" onclick=\"window.location=\'' + window.location.origin + '/product.html?id=' + p.id + '\'">' +
      (img ? '<img class=\"product-card-image\" src=\"' + esc(img) + '\" alt=\"' + esc(p.name) + '\" loading=\"lazy\">' : '<div class=\"product-card-image\" style=\"display:flex;align-items:center;justify-content:center;color:var(--gray);\">ছবি নেই</div>') +
      '<div class=\"product-card-body\">' +
      '<div class=\"product-card-category\">' + esc(p.category_name || '') + '</div>' +
      '<div class=\"product-card-title\">' + esc(p.name) + '</div>' +
      '<div class=\"product-card-price\">' + taka(p.price) +
      (p.compare_price ? ' <span class=\"compare\">' + taka(p.compare_price) + '</span>' : '') +
      '</div></div></div>';
  }
})();
