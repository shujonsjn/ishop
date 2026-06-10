/* ==========================================================
   CART.JS — Shopping cart
   ========================================================== */
(function(){
  loadCartCount();
  loadCart();

  function loadCart() {
    api('GET', '/cart').then(function(data) {
      var el = document.getElementById('cartContent');
      if (!el) return;
      if (!data.items || data.items.length === 0) {
        el.innerHTML = '<div class=\"empty-state\"><h3>আপনার কার্ট খালি</h3><p>পণ্য দেখতে <a href=\"/products.html\">পণ্যের তালিকা</a> দেখুন</p></div>';
        return;
      }
      var html = '<div style=\"max-width:800px;margin:0 auto;\">';
      data.items.forEach(function(item) {
        var img = (item.images && item.images.length) ? item.images[0] : '';
        html += '<div class=\"cart-item\">' +
          (img ? '<img class=\"cart-item-image\" src=\"' + esc(img) + '\">' : '<div class=\"cart-item-image\" style=\"background:var(--light-gray);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--gray);\">ছবি</div>') +
          '<div class=\"cart-item-info\">' +
          '<div class=\"cart-item-title\">' + esc(item.name) + '</div>' +
          '<div class=\"cart-item-price\">' + taka(item.price) + '</div>' +
          '</div>' +
          '<div class=\"cart-item-actions\">' +
          '<button class=\"qty-btn\" onclick=\"updateQty(' + item.id + ',' + (item.quantity - 1) + ')\">-</button>' +
          '<input class=\"qty-input\" type=\"text\" value=\"' + item.quantity + '\" readonly>' +
          '<button class=\"qty-btn\" onclick=\"updateQty(' + item.id + ',' + (item.quantity + 1) + ')\">+</button>' +
          '<button class=\"btn btn-sm btn-danger\" onclick=\"removeItem(' + item.id + ')\">সরান</button>' +
          '</div>' +
          '<div style=\"font-weight:700;min-width:80px;text-align:right;\">' + taka(item.subtotal) + '</div>' +
          '</div>';
      });
      html += '<div style=\"text-align:right;padding:20px 0;font-size:20px;font-weight:700;\">মোট: ' + taka(data.total) + '</div>';
      html += '<div style=\"text-align:right;\"><a href=\"/checkout.html\" class=\"btn btn-secondary\">অর্ডার করুন</a></div>';
      html += '</div>';
      el.innerHTML = html;
    });
  }

  window.updateQty = function(id, qty) {
    if (qty < 1) {
      removeItem(id);
      return;
    }
    api('PUT', '/cart/' + id, { quantity: qty }).then(function() {
      loadCart();
      loadCartCount();
    });
  };

  window.removeItem = function(id) {
    api('DELETE', '/cart/' + id).then(function() {
      loadCart();
      loadCartCount();
    });
  };
})();
