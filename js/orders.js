(function(){
  var lang = window.getLang ? getLang() : 'bn';
  var allOrders = [];
  var currentTab = localStorage.getItem('orderTab') || 'all';

  function statusText(s) {
    var map = {
      pending: __('orders.status_pending'),
      paid: __('orders.status_paid'),
      processing: __('orders.status_processing'),
      shipped: __('orders.status_shipped'),
      delivered: __('orders.status_delivered'),
      cancelled: __('orders.status_cancelled') || 'বাতিল',
      cancel_requested: __('orders.status_cancel_requested') || 'বাতিল অনুরোধ'
    };
    return map[s] || s;
  }

  function statusColor(s) {
    var map = { pending:'#f59e0b', paid:'#1a73e8', processing:'#7c3aed', shipped:'#0d9488', delivered:'#00a86b', cancelled:'#dc3545', cancel_requested:'#d97706' };
    return map[s] || '#6b7280';
  }

  function statusIcon(s) {
    var map = { pending:'⏳', paid:'💳', processing:'⚙️', shipped:'🚚', delivered:'✅', cancelled:'❌', cancel_requested:'⏳' };
    return map[s] || '📋';
  }

  function paymentLabel(m) {
    var map = { cod:'COD', bkash:'bKash', nagad:'Nagad', rocket:'Rocket', ucash:'UCash', visa:'Visa/Mastercard', sslcommerz:'SSLCommerz' };
    return map[m] || m || 'COD';
  }

  function formatDesc(d) {
    if (!d) return '';
    return esc(d).replace(/\n/g, '<br>');
  }

  function isDetailView() {
    var p = new URLSearchParams(window.location.search);
    return p.has('id');
  }

  function loadOrderDetail(orderId) {
    var el = document.getElementById('orderDetail');
    if (!el) return;
    el.innerHTML = '<div class="ol-loading"><div class="ol-spinner"></div><p>' + __('orders.loading') + '</p></div>';

    var params = new URLSearchParams(window.location.search);
    var paymentSuccess = params.get('payment') === 'success';

    api('GET', '/orders/' + orderId).then(function(order) {
      if (order.error) {
        el.innerHTML = '<div class="ol-empty"><div class="ol-empty-icon">❌</div><p>' + esc(order.error) + '</p><a href="/profile.html#orders" class="btn btn-primary">' + __('orders.back') + '</a></div>';
        return;
      }

      var canCancel = ['pending','paid','processing'].indexOf(order.status) !== -1;
      var html = '<a href="/profile.html#orders" class="od-back">' + __('orders.back') + '</a>';

      if (paymentSuccess) {
        html += '<div class="od-payment-success">✅ ' + __('orders.payment_success') + '</div>';
      }

      html += '<div class="od-card">';
      html += '<div class="od-header">';
      html += '<div><div class="od-id">' + __('orders.order_id') + ' #' + order.id + '</div><div class="od-date">' + timeAgo(order.created_at) + '</div></div>';
      html += '<div class="od-status" style="background:' + statusColor(order.status) + '15;color:' + statusColor(order.status) + '">' + statusIcon(order.status) + ' ' + statusText(order.status) + '</div>';
      html += '</div>';

      html += '<div class="od-items">';
      var orderDelivered = order.status === 'delivered' || order.status === 'paid' || order.status === 'processing' || order.status === 'shipped';
      (order.items || []).forEach(function(item) {
        var img = item.image || 'https://picsum.photos/seed/default/80/80';
        html += '<div class="od-item">';
        html += '<img src="' + esc(img) + '" alt="" class="od-item-img">';
        html += '<div class="od-item-info">';
        html += '<div class="od-item-name">' + esc(item.name) + '</div>';
        var variantTags = '';
        if (item.color) variantTags += '<span class="od-tag od-tag-color">🎨 ' + esc(item.color) + '</span>';
        if (item.size) variantTags += '<span class="od-tag od-tag-size">📐 ' + esc(item.size) + '</span>';
        if (variantTags) html += '<div class="od-item-variant">' + variantTags + '</div>';
        html += '<div class="od-item-meta">x' + item.quantity + ' × ' + taka(item.price) + ' = ' + taka(item.price * item.quantity) + '</div>';
        if (item.product_id && orderDelivered) {
          html += '<a href="/product.html?id=' + item.product_id + '#reviews" class="od-item-review-btn" onclick="event.stopPropagation()">✍️ ' + __('orders.review') + '</a>';
        }
        html += '</div>';
        html += '<div class="od-item-total">' + taka(item.price * item.quantity) + '</div>';
        html += '</div>';
      });
      html += '</div>';

      html += '<div class="od-total"><span>' + __('orders.total') + '</span><span>' + taka(order.total) + '</span></div>';

      html += '<div class="od-info-grid">';
      html += '<div class="od-info-box"><div class="od-info-label">🚚 ' + __('orders.shipping') + '</div>';
      html += '<div class="od-info-row"><span>' + __('orders.address') + ':</span> ' + esc(order.shipping_address || '') + '</div>';
      html += '<div class="od-info-row"><span>' + __('orders.phone') + ':</span> ' + esc(order.phone || '') + '</div>';
      if (order.district) html += '<div class="od-info-row"><span>' + __('orders.district') + ':</span> ' + esc(order.district) + (order.upazila ? ', ' + esc(order.upazila) : '') + '</div>';
      if (order.note) html += '<div class="od-info-row"><span>' + __('orders.note') + ':</span> ' + esc(order.note) + '</div>';
      html += '</div>';

      html += '<div class="od-info-box"><div class="od-info-label">💳 ' + __('orders.payment') + '</div>';
      html += '<div class="od-info-row"><span>' + __('admin.payment') + ':</span> ' + paymentLabel(order.payment_method) + '</div>';
      html += '<div class="od-info-row"><span>' + __('admin.status') + ':</span> ' + statusText(order.payment_status || 'unpaid') + '</div>';
      if (order.transaction_id) html += '<div class="od-info-row"><span>Transaction:</span> ' + esc(order.transaction_id) + '</div>';
      html += '</div>';
      html += '</div>';

      if (canCancel) {
        html += '<div class="od-cancel-wrap">';
        html += '<button class="btn btn-outline" onclick="reorderOrder(' + order.id + ')">' + __('orders.reorder') + '</button>';
        html += '<button class="btn btn-danger" onclick="cancelOrder(' + order.id + ')">' + __('orders.cancel_btn') + '</button>';
        html += '</div>';
      } else {
        html += '<div class="od-cancel-wrap">';
        html += '<button class="btn btn-primary" onclick="reorderOrder(' + order.id + ')">' + __('orders.reorder') + '</button>';
        html += '</div>';
      }

      html += '</div>';
      el.innerHTML = html;
    }).catch(function() {
      el.innerHTML = '<div class="ol-empty"><div class="ol-empty-icon">😕</div><p>' + __('orders.not_found') + '</p><a href="/profile.html#orders" class="btn btn-primary">' + __('orders.back') + '</a></div>';
    });
  }

  function renderOrderCards(orders) {
    var el = document.getElementById('ordersList');
    if (!el) return;

    if (!orders || orders.length === 0) {
      el.innerHTML = '<div class="ol-empty"><div class="ol-empty-icon">📭</div><p>' + __('orders.empty') + '</p><a href="/products.html" class="btn btn-primary">' + __('orders.see_products') + '</a></div>';
      return;
    }

    var html = '';
    orders.forEach(function(order) {
      var items = order.items || [];
      var totalQty = items.reduce(function(sum, it) { return sum + (it.quantity || 1); }, 0);
      var stColor = statusColor(order.status);
      var stText = statusText(order.status);
      var stIcon = statusIcon(order.status);

      html += '<a href="/order-detail.html?id=' + order.id + '" class="dz-order-card">';

      html += '<div class="dz-order-header">';
      html += '<div class="dz-order-id">' + __('orders.order_id') + ' #' + order.id + '</div>';
      html += '<div class="dz-order-date">' + timeAgo(order.created_at) + '</div>';
      html += '</div>';

      html += '<div class="dz-order-items">';
      items.forEach(function(item) {
        var img = item.image || 'https://picsum.photos/seed/default/80/80';
        html += '<div class="dz-order-item">';
        html += '<img src="' + esc(img) + '" class="dz-order-item-img" alt="">';
        html += '<div class="dz-order-item-info">';
        html += '<div class="dz-order-item-name">' + esc(item.name) + '</div>';
        if (item.color || item.size) {
          html += '<div class="dz-order-item-variants">';
          if (item.color) html += '<span class="od-tag od-tag-color">🎨 ' + esc(item.color) + '</span>';
          if (item.size) html += '<span class="od-tag od-tag-size">📐 ' + esc(item.size) + '</span>';
          html += '</div>';
        }
        html += '<div class="dz-order-item-meta">x' + item.quantity + '</div>';
        html += '</div>';
        html += '<div class="dz-order-item-price">' + taka(item.price * item.quantity) + '</div>';
        html += '</div>';
      });
      html += '</div>';

      html += '<div class="dz-order-footer">';
      html += '<div class="dz-order-footer-left">';
      html += '<span class="dz-order-item-count">' + __('orders.item_count', {count: totalQty}) + '</span>';
      html += '<span class="dz-order-payment">' + paymentLabel(order.payment_method) + '</span>';
      html += '<button class="dz-order-reorder-btn" onclick="event.preventDefault();event.stopPropagation();reorderOrder(' + order.id + ')">🔄 ' + __('orders.reorder') + '</button>';
      html += '</div>';
      html += '<div class="dz-order-footer-right">';
      html += '<span class="dz-order-status-badge" style="background:' + stColor + '15;color:' + stColor + '">' + stIcon + ' ' + stText + '</span>';
      html += '<span class="dz-order-total">' + taka(order.total) + '</span>';
      html += '</div>';
      html += '</div>';

      html += '</a>';
    });
    el.innerHTML = html;
  }

  function filterOrders() {
    var searchVal = '';
    var searchEl = document.getElementById('orderSearch');
    if (searchEl) searchVal = searchEl.value.toLowerCase().trim();

    var filtered = allOrders.filter(function(o) {
      if (currentTab !== 'all') {
        if (currentTab === 'cancelled') {
          if (o.status !== 'cancelled' && o.status !== 'cancel_requested') return false;
        } else if (currentTab === 'pending') {
          if (o.status !== 'pending' && o.status !== 'paid') return false;
        } else if (currentTab === 'delivered') {
          if (o.status !== 'delivered') return false;
        } else {
          if (o.status !== currentTab) return false;
        }
      }
      if (searchVal) {
        var match = false;
        if (('#' + o.id).indexOf(searchVal) !== -1) match = true;
        (o.items || []).forEach(function(it) {
          if (it.name && it.name.toLowerCase().indexOf(searchVal) !== -1) match = true;
          if (it.color && it.color.toLowerCase().indexOf(searchVal) !== -1) match = true;
        });
        if (!match) return false;
      }
      return true;
    });

    document.querySelectorAll('.order-tab').forEach(function(tab) {
      var t = tab.getAttribute('data-tab');
      var count = 0;
      if (t === 'all') count = allOrders.length;
      else if (t === 'cancelled') count = allOrders.filter(function(o) { return o.status === 'cancelled' || o.status === 'cancel_requested'; }).length;
      else if (t === 'pending') count = allOrders.filter(function(o) { return o.status === 'pending' || o.status === 'paid'; }).length;
      else if (t === 'delivered') count = allOrders.filter(function(o) { return o.status === 'delivered'; }).length;
      else count = allOrders.filter(function(o) { return o.status === t; }).length;
      var badge = tab.querySelector('.order-tab-count');
      if (badge) badge.textContent = count;
    });

    renderOrderCards(filtered);
  }

  function loadOrdersList() {
    var el = document.getElementById('ordersList');
    if (!el) return;
    el.innerHTML = '<div class="ol-loading"><div class="ol-spinner"></div><p>' + __('orders.loading') + '</p></div>';

    api('GET', '/orders').then(function(orders) {
      allOrders = orders || [];
      filterOrders();
    }).catch(function() {
      el.innerHTML = '<div class="ol-empty"><div class="ol-empty-icon">😕</div><p>' + __('orders.empty') + '</p></div>';
    });
  }

  document.querySelectorAll('.order-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.order-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentTab = tab.getAttribute('data-tab');
      localStorage.setItem('orderTab', currentTab);
      filterOrders();
    });
  });

  var searchEl = document.getElementById('orderSearch');
  if (searchEl) {
    var savedSearch = localStorage.getItem('orderSearch') || '';
    if (savedSearch) searchEl.value = savedSearch;
    searchEl.addEventListener('input', function() {
      localStorage.setItem('orderSearch', searchEl.value);
      filterOrders();
    });
  }

  window.cancelOrder = function(orderId) {
    if (!confirm(__('orders.cancel_confirm'))) return;
    api('PUT', '/orders/' + orderId + '/cancel').then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      toast(__('orders.cancel_success'));
      loadOrderDetail(orderId);
    }).catch(function() {
      toast(__('toast.server_error'), 'error');
    });
  };

  window.reorderOrder = function(orderId) {
    api('POST', '/orders/' + orderId + '/reorder').then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      if (res.first_product_id) {
        window.location = '/product.html?id=' + res.first_product_id;
      }
    }).catch(function() {
      toast(__('toast.server_error'), 'error');
    });
  };

  if (isDetailView()) {
    var orderId = new URLSearchParams(window.location.search).get('id');
    loadOrderDetail(orderId);
  } else {
    document.querySelectorAll('.order-tab').forEach(function(tab) {
      if (tab.getAttribute('data-tab') === currentTab) {
        document.querySelectorAll('.order-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
      }
    });
    loadOrdersList();
  }
})();
