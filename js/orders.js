/* ==========================================================
   ORDERS.JS — Order list and detail
   ========================================================== */
(function(){
  var token = localStorage.getItem('token');
  if (!token) {
    var el = document.getElementById('ordersList') || document.getElementById('orderDetail');
    if (el) el.innerHTML = '<div class=\"empty-state\"><h3>' + __('orders.login_prompt') + '</h3><p><a href=\"/auth.html\">' + __('orders.login_link') + '</a></p></div>';
    return;
  }

  var orderId = new URLSearchParams(window.location.search).get('id');

  if (document.getElementById('orderDetail')) {
    loadOrderDetail();
  } else if (document.getElementById('ordersList')) {
    loadOrders();
  }

  function loadOrders() {
    api('GET', '/orders').then(function(orders) {
      var el = document.getElementById('ordersList');
      if (!el) return;
      if (!orders || orders.length === 0) {
        el.innerHTML = '<div class=\"empty-state\"><h3>' + __('orders.empty') + '</h3><p><a href=\"/products.html\">' + __('orders.see_products') + '</a></p></div>';
        return;
      }
      el.innerHTML = orders.map(function(o) {
        var badgeClass = 'badge-' + (o.status || 'pending');
        var itemCount = (o.items || []).length;
        return '<div class=\"card\" style=\"padding:16px;margin-bottom:12px;cursor:pointer;\" onclick=\"window.location=\'' + window.location.origin + '/order-detail.html?id=' + o.id + '\">' +
          '<div style=\"display:flex;justify-content:space-between;align-items:center;\">' +
          '<div><strong>অর্ডার #' + o.id + '</strong><br>' +
          '<span style=\"color:var(--gray);font-size:13px;\">' + timeAgo(o.created_at) + ' — ' + __('orders.item_count', {count: itemCount}) + '</span></div>' +
          '<div style=\"text-align:right;\"><div class=\"badge ' + badgeClass + '\">' + (o.status || 'pending') + '</div>' +
          '<div style=\"font-weight:700;margin-top:4px;\">' + taka(o.total) + '</div></div></div></div>';
      }).join('');
    });
  }

  function loadOrderDetail() {
    api('GET', '/orders/' + orderId).then(function(o) {
      var el = document.getElementById('orderDetail');
      if (!el) return;
      if (!o || o.error) {
        el.innerHTML = '<div class=\"empty-state\"><h3>' + __('orders.not_found') + '</h3></div>';
        return;
      }

      var statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered'];
      var currentIdx = statuses.indexOf(o.status);
      if (currentIdx === -1) currentIdx = 0;

      var trackerHtml = statuses.map(function(s, i) {
        var labels = { pending: __('orders.status_pending'), paid: __('orders.status_paid'), processing: __('orders.status_processing'), shipped: __('orders.status_shipped'), delivered: __('orders.status_delivered') };
        return '<div class=\"status-step' + (i <= currentIdx ? ' active' : '') + '\">' +
          '<div class=\"status-dot\">' + (i <= currentIdx ? '✓' : i + 1) + '</div>' +
          '<div class=\"status-label\">' + labels[s] + '</div></div>';
      }).join('');

      var html = '<a href=\"/orders.html\" style=\"color:var(--gray);\">' + __('orders.back') + '</a>';
      html += '<div class=\"card\" style=\"padding:24px;margin-top:12px;\">';
      html += '<div style=\"display:flex;justify-content:space-between;align-items:start;\">';
      html += '<div><h2>অর্ডার #' + o.id + '</h2>';
      html += '<span style=\"color:var(--gray);\">' + new Date(o.created_at).toLocaleDateString('bn-BD') + '</span></div>';
      html += '<div><span class=\"badge badge-' + (o.status || 'pending') + '\">' + (o.status || 'pending') + '</span></div></div>';

      html += '<div class=\"status-tracker\">' + trackerHtml + '</div>';
      html += '<hr style=\"margin:20px 0;\">';

      html += '<h3 style=\"margin-bottom:12px;\">' + __('orders.items') + '</h3>';
      (o.items || []).forEach(function(item) {
        html += '<div style=\"display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);\">' +
          '<span>' + esc(window.productName(item)) + ' x' + item.quantity + '</span>' +
          '<span>' + taka(item.price * item.quantity) + '</span></div>';
      });

      html += '<div style=\"display:flex;justify-content:space-between;padding:12px 0;font-size:20px;font-weight:700;\">' +
        '<span>' + __('orders.total') + '</span><span>' + taka(o.total) + '</span></div>';

      html += '<hr style=\"margin:20px 0;\">';
      html += '<h3 style=\"margin-bottom:8px;\">' + __('orders.shipping') + '</h3>';
      html += '<p><strong>' + __('orders.address') + '</strong> ' + esc(o.shipping_address || '') + '</p>';
      html += '<p><strong>' + __('orders.phone') + '</strong> ' + esc(o.phone || '') + '</p>';
      if (o.note) html += '<p><strong>' + __('orders.note') + '</strong> ' + esc(o.note) + '</p>';
      html += '<p><strong>' + __('orders.payment') + '</strong> ' + esc(o.payment_method || '') + ' — ' + o.payment_status + '</p>';

      html += '</div>';
      el.innerHTML = html;
    });
  }
})();
