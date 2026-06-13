/* ==========================================================
   CHECKOUT.JS — Checkout page
   ========================================================== */
(function(){
  var token = localStorage.getItem('token');
  if (!token) {
    toast(__('toast.please_login'), 'error');
    window.location = '/auth.html?redirect=checkout.html';
    return;
  }

  loadCartSummary();

  function loadCartSummary() {
    api('GET', '/cart').then(function(data) {
      var el = document.getElementById('orderSummary');
      if (!el) return;
      if (!data.items || data.items.length === 0) {
        el.innerHTML = '<p style=\"color:var(--gray);\">' + __('checkout.cart_empty') + '</p>';
        return;
      }
      var html = '';
      data.items.forEach(function(item) {
        html += '<div style=\"display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);\">' +
          '<span>' + esc(window.productName(item)) + (item.color ? ' (' + esc(item.color) + ')' : '') + ' x' + item.quantity + '</span>' +
          '<span>' + taka(item.subtotal) + '</span></div>';
      });
      html += '<div style=\"display:flex;justify-content:space-between;padding:12px 0;font-weight:700;font-size:18px;\">' +
        '<span>' + __('checkout.total') + '</span><span>' + taka(data.total) + '</span></div>';
      el.innerHTML = html;
    });
  }

  window.placeOrder = function() {
    var address = document.getElementById('address').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var note = document.getElementById('note').value.trim();
    var paymentMethod = document.getElementById('paymentMethod').value;
    var btn = document.getElementById('placeOrderBtn');

    if (!address) { toast(__('toast.enter_address'), 'error'); return; }
    if (!phone) { toast(__('toast.enter_phone'), 'error'); return; }

    btn.disabled = true;
    btn.textContent = __('checkout.order_processing');

    api('POST', '/orders', {
      shipping_address: address,
      phone: phone,
      note: note,
      payment_method: paymentMethod
    }).then(function(order) {
      if (order.error) { toast(order.error, 'error'); btn.disabled = false; btn.textContent = __('checkout.order_btn'); return; }

      if (paymentMethod === 'sslcommerz') {
        api('POST', '/payment/initiate', { order_id: order.id }).then(function(payRes) {
          if (payRes.redirect) {
            window.location = payRes.redirect;
          } else {
            toast(__('toast.payment_error'), 'error');
            btn.disabled = false;
            btn.textContent = __('checkout.order_btn');
          }
        });
      } else {
        toast(__('toast.order_success'), 'success');
        setTimeout(function() { window.location = '/orders.html?id=' + order.id; }, 1500);
      }
    }).catch(function() {
      toast(__('toast.server_error'), 'error');
      btn.disabled = false;
      btn.textContent = __('checkout.order_btn');
    });
  };
})();
