/* ==========================================================
   CART.JS — Shopping cart (Daraz-style)
   ========================================================== */
(function(){
  loadCartCount();
  loadCart();

  function loadCart() {
    api('GET', '/cart').then(function(data) {
      var el = document.getElementById('cartContent');
      if (!el) return;
      if (!data.items || data.items.length === 0) {
        el.innerHTML = '<div class="empty-state"><div style="font-size:64px;margin-bottom:16px;">🛒</div><h3>' + __('cart.empty') + '</h3><p>' + __('cart.see_products') + ' <a href="/products.html">' + __('cart.product_list') + '</a></p></div>';
        return;
      }

      var itemCount = data.items.reduce(function(sum, i) { return sum + i.quantity; }, 0);

      var html = '<div class="cart-layout">';

      html += '<div class="cart-items-col">';
      html += '<div class="cart-items-header"><span>' + __('cart.heading') + '</span><span class="cart-items-count">' + itemCount + ' ' + __('cart.items') + '</span></div>';

      data.items.forEach(function(item) {
        var img = '';
        if (item.color && item.color_images) {
          var ci = item.color_images;
          if (typeof ci === 'string') { try { ci = JSON.parse(ci); } catch(e) { ci = {}; } }
          if (ci[item.color] && ci[item.color].length) img = ci[item.color][0];
        }
        if (!img) img = window.productImage(item);

        var variants = [];
        if (item.color) variants.push(esc(item.color));
        if (item.size) variants.push(esc(item.size));

        html += '<div class="cart-item">' +
          '<a href="/product.html?id=' + item.product_id + '" class="cart-item-img-wrap">' +
          (img ? '<img class="cart-item-image" src="' + esc(img) + '" alt="' + esc(window.productName(item)) + '">' : '<div class="cart-item-image cart-item-no-img">📷</div>') +
          '</a>' +
          '<div class="cart-item-info">' +
          '<a href="/product.html?id=' + item.product_id + '" class="cart-item-title">' + esc(window.productName(item)) + '</a>' +
          (variants.length ? '<div class="cart-item-variants">' + variants.map(function(v) { return '<span class="cart-variant-tag">' + v + '</span>'; }).join('') + '</div>' : '') +
          '<div class="cart-item-price">' + taka(item.price) + '</div>' +
          '</div>' +
          '<div class="cart-item-right">' +
          '<div class="cart-item-qty">' +
          '<button class="qty-btn" onclick="updateQty(' + item.id + ',' + (item.quantity - 1) + ')">−</button>' +
          '<span class="qty-display">' + item.quantity + '</span>' +
          '<button class="qty-btn" onclick="updateQty(' + item.id + ',' + (item.quantity + 1) + ')">+</button>' +
          '</div>' +
          '<div class="cart-item-subtotal">' + taka(item.subtotal) + '</div>' +
          '<button class="cart-item-remove" onclick="removeItem(' + item.id + ')" title="' + __('cart.remove') + '">✕</button>' +
          '</div>' +
          '</div>';
      });
      html += '</div>';

      html += '<div class="cart-summary-col">';
      html += '<div class="cart-summary-box">';
      html += '<h3>' + __('cart.order_summary') + '</h3>';
      html += '<div class="cart-summary-row"><span>' + __('cart.items') + ' (' + itemCount + ')</span><span>' + taka(data.total) + '</span></div>';
      html += '<div class="cart-summary-row"><span>' + __('cart.delivery') + '</span><span>' + __('cart.calculated_at_checkout') + '</span></div>';
      html += '<div class="cart-summary-divider"></div>';
      html += '<div class="cart-summary-row cart-summary-total"><span>' + __('cart.total') + '</span><span>' + taka(data.total) + '</span></div>';
      html += '<a href="/checkout.html" class="btn btn-primary btn-block cart-checkout-btn">' + __('cart.checkout') + '</a>';
      html += '<div class="cart-summary-note">🔒 ' + __('cart.secure_checkout') + '</div>';
      html += '</div>';
      html += '</div>';

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
