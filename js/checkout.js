(function(){
  var token = localStorage.getItem('token');
  if (!token) {
    var el = document.getElementById('coAuthWarning');
    if (el) el.style.display = 'block';
    return;
  }

  var config = { default_fields: {}, custom_fields: [], labels: {} };

  var params = new URLSearchParams(window.location.search);
  var payStatus = params.get('status');
  if (payStatus === 'failed') {
    showPaymentAlert(__('checkout.payment_failed'), 'error');
  } else if (payStatus === 'cancelled') {
    showPaymentAlert(__('checkout.payment_cancelled'), 'error');
  }

  function showPaymentAlert(msg, type) {
    var div = document.createElement('div');
    div.style.cssText = 'padding:14px 18px;border-radius:8px;margin-bottom:16px;font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px;animation:fadeInUp 0.3s;grid-column:1/-1;';
    if (type === 'error') {
      div.style.background = '#fef2f2'; div.style.border = '1px solid #fecaca'; div.style.color = '#991b1b';
    } else {
      div.style.background = '#f0fdf4'; div.style.border = '1px solid #bbf7d0'; div.style.color = '#166534';
    }
    div.innerHTML = '<span style="font-size:18px;">' + (type === 'error' ? '⚠️' : '✅') + '</span> ' + msg +
      '<button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:inherit;">&times;</button>';
    var wrap = document.querySelector('.checkout-form-wrap');
    if (wrap) {
      wrap.insertBefore(div, wrap.firstChild);
    }
  }

  loadCartSummary();
  loadCheckoutConfig();

  var deliveryCharge = 0;
  var cartTotal = 0;
  var dcConfig = { inside_dhaka: 80, outside_dhaka: 160 };

  function getDeliveryCharge() {
    var area = getFieldValue('area');
    if (area === 'Inside Dhaka') return dcConfig.inside_dhaka;
    if (area === 'Outside Dhaka') return dcConfig.outside_dhaka;
    return 0;
  }

  function updateDeliveryCharge() {
    deliveryCharge = getDeliveryCharge();
    var el = document.getElementById('orderSummary');
    if (!el || !cartTotal) return;
    var lang = window.getLang ? getLang() : 'bn';
    var total = cartTotal + deliveryCharge;
    var dcLabel = __('checkout.delivery_charge');
    var totalLabel = __('checkout.total');
    var existingDC = document.getElementById('csDeliveryCharge');
    var existingTotal = document.getElementById('csGrandTotal');
    if (existingDC) {
      var dcText = deliveryCharge > 0 ? taka(deliveryCharge) : __('checkout.select_area');
      existingDC.innerHTML = '<span>' + dcLabel + '</span><span>' + dcText + '</span>';
    }
    if (existingTotal) {
      existingTotal.innerHTML = '<span>' + totalLabel + '</span><span>' + taka(total) + '</span>';
    }
  }

  function loadCartSummary() {
    api('GET', '/cart').then(function(data) {
      var el = document.getElementById('orderSummary');
      if (!el) return;
      if (!data.items || data.items.length === 0) {
        el.innerHTML = '<p style="color:var(--gray);">' + __('checkout.cart_empty') + '</p>';
        return;
      }
      cartTotal = data.total || 0;
      var dcLabel = __('checkout.delivery_charge');
      var html = '';
      data.items.forEach(function(item) {
        html += '<div class="cs-item">' +
          '<div class="cs-item-info">' +
          '<div class="cs-item-name">' + esc(window.productName(item)) + '</div>' +
          (item.color || item.size ? '<div class="cs-item-variant">' + (item.color ? esc(item.color) : '') + (item.color && item.size ? ' / ' : '') + (item.size ? esc(item.size) : '') + '</div>' : '') +
          '<div class="cs-item-meta">x' + item.quantity + ' × ' + taka(item.price) + '</div>' +
          '</div>' +
          '<div class="cs-item-total">' + taka(item.subtotal) + '</div>' +
          '</div>';
      });
      html += '<div id="csDeliveryCharge" class="cs-total" style="color:#6b7280;font-weight:500;"><span>' + dcLabel + '</span><span>' + __('checkout.select_area') + '</span></div>';
      html += '<div id="csGrandTotal" class="cs-total" style="border-top:2px solid #e5e7eb;padding-top:10px;font-size:18px;"><span>' + __('checkout.total') + '</span><span>' + taka(cartTotal) + '</span></div>';
      el.innerHTML = html;
      updateDeliveryCharge();
    });
  }

  function loadCheckoutConfig() {
    fetch('/api/checkout-config?t=' + Date.now()).then(function(r) { return r.json(); }).then(function(cfg) {
      config.labels = cfg.labels || {};
      config.custom_fields = cfg.custom_fields || [];
      config.default_fields = cfg.labels || {};
      if (cfg.delivery_charge) dcConfig = cfg.delivery_charge;
      renderPage();
      renderForm();
    }).catch(function() {
      renderForm();
    });
  }

  function renderPage() {
    var L = config.labels;
    if (L.heading) document.getElementById('coPageTitle').textContent = L.heading;
    if (L.desc) document.getElementById('coPageDesc').textContent = L.desc;
    if (L.summary) document.getElementById('coSummaryTitle').textContent = L.summary;
    if (L.terms) document.getElementById('coTermsText').textContent = L.terms;
    if (L.confirm_btn) document.getElementById('placeOrderBtn').textContent = L.confirm_btn;
    if (L.custom_note) {
      var noteEl = document.getElementById('coCustomNote');
      noteEl.innerHTML = '<div style="padding:12px 16px;background:#fffbe6;border-radius:8px;margin-bottom:16px;font-size:14px;border-left:4px solid #f59e0b;">' + esc(L.custom_note) + '</div>';
    }
  }

  var lang = window.getLang ? getLang() : 'bn';

  var defaultFieldDefs = [
    { key: 'name', bn: __('checkout.default_name'), en: 'Name', type: 'text', req: true, ph_bn: __('checkout.name_placeholder'), ph_en: 'Your name' },
    { key: 'phone', bn: __('checkout.default_phone'), en: 'Phone Number', type: 'phone', req: true, ph_bn: __('checkout.phone_placeholder'), ph_en: '01XXXXXXXXX' },
    { key: 'address', bn: __('checkout.default_address'), en: 'Address', type: 'textarea', req: true, ph_bn: __('checkout.default_address_ph'), ph_en: 'Your full address' },
    { key: 'area', bn: __('checkout.default_area'), en: 'Area', type: 'select', req: false, options: [{v:'Inside Dhaka',l:__('checkout.area_inside')},{v:'Outside Dhaka',l:__('checkout.area_outside')}] },
    { key: 'district', bn: __('checkout.default_district'), en: 'District', type: 'district', req: false },
    { key: 'upazila', bn: __('checkout.default_upazila'), en: 'Upazila', type: 'upazila', req: false },
    { key: 'payment', bn: __('checkout.default_payment'), en: 'Payment Type', type: 'payment_dropdown', req: true }
  ];

  var paymentMethods = [
    { id: 'bkash', name: 'bKash' },
    { id: 'nagad', name: 'Nagad' },
    { id: 'rocket', name: 'Rocket' },
    { id: 'ucash', name: 'UCash' },
    { id: 'visa', name: 'Visa / Mastercard' },
    { id: 'cod', name: __('checkout.default_cod') }
  ];

  function renderForm() {
    var el = document.getElementById('coFormFields');
    var L = config.labels;
    var lang = window.getLang ? getLang() : 'bn';
    var html = '';

    defaultFieldDefs.forEach(function(f) {
      var cfg = config.default_fields[f.key] || {};
      if (cfg.enabled === false) return;
      var label = cfg.label || (lang === 'en' ? f.en : f.bn);
      var req = f.req ? ' *' : '';

      if (f.type === 'text') {
        var ph = (lang === 'en' ? f.ph_en : f.ph_bn);
        html += '<div class="checkout-field"><label>' + esc(label) + req + '</label>' +
          '<input type="text" id="coField_' + f.key + '" placeholder="' + esc(ph) + '"></div>';
      } else if (f.type === 'phone') {
        var ph = (lang === 'en' ? f.ph_en : f.ph_bn);
        html += '<div class="checkout-field"><label>' + esc(label) + req + '</label>' +
          '<div style="display:flex;align-items:center;gap:0;">' +
          '<span style="padding:10px 12px;background:#f3f4f6;border:1px solid #d1d5db;border-right:none;border-radius:8px 0 0 8px;font-size:14px;font-weight:600;color:#374151;white-space:nowrap;user-select:none;">+880</span>' +
          '<input type="tel" id="coField_phone" placeholder="' + esc(ph) + '" maxlength="11" pattern="01[3-9]\\d{8}" style="border-radius:0 8px 8px 0;flex:1;" oninput="validateCoPhone(this)">' +
          '</div>' +
          '<span id="coPhoneError" style="display:none;font-size:12px;color:#dc2626;margin-top:4px;"></span>' +
          '</div>';
      } else if (f.type === 'textarea') {
        var ph = (lang === 'en' ? f.ph_en : f.ph_bn);
        html += '<div class="checkout-field"><label>' + esc(label) + req + '</label>' +
          '<textarea id="coField_' + f.key + '" rows="3" placeholder="' + esc(ph) + '"></textarea></div>';
      } else if (f.type === 'select') {
        html += '<div class="checkout-field"><label>' + esc(label) + '</label>' +
          '<select id="coField_' + f.key + '"><option value="">' + __('checkout.default_select') + '</option>';
        (f.options || []).forEach(function(o) {
          html += '<option value="' + esc(o.v) + '">' + esc(o.l) + '</option>';
        });
        html += '</select></div>';
      } else if (f.type === 'district') {
        html += '<div class="checkout-field"><label>' + esc(label) + '</label>' +
          '<select id="coField_district"><option value="">' + __('checkout.default_district_ph') + '</option></select></div>';
      } else if (f.type === 'upazila') {
        html += '<div class="checkout-field"><label>' + esc(label) + '</label>' +
          '<select id="coField_upazila"><option value="">' + __('checkout.default_upazila_ph') + '</option></select></div>';
      } else if (f.type === 'payment') {
        html += '<div class="checkout-field"><label>' + esc(label) + '</label>' +
          '<select id="coField_payment"><option value="">' + __('checkout.default_select') + '</option><option value="cod">' + __('checkout.default_cod') + '</option><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="rocket">Rocket</option><option value="ucash">UCash</option><option value="visa">Visa / Mastercard</option></select></div>';
      } else if (f.type === 'payment_dropdown') {
        html += '<div class="checkout-field"><label>' + esc(label) + req + '</label>' +
          '<select id="coField_payment"><option value="">' + __('checkout.select_method') + '</option>';
        paymentMethods.forEach(function(m) {
          html += '<option value="' + m.id + '">' + esc(m.name) + '</option>';
        });
        html += '</select></div>';
      }
    });

    config.custom_fields.forEach(function(f, i) {
      var label = (lang === 'en' && f.label_en) ? f.label_en : f.label_bn;
      var req = f.required ? ' *' : '';
      var id = 'coCF_' + i;
      var ph = lang === 'en' && f.placeholder_en ? f.placeholder_en : (f.placeholder_bn || '');
      html += '<div class="checkout-field"><label>' + esc(label) + req + '</label>';
      if (f.type === 'text') {
        html += '<input type="text" id="' + id + '" placeholder="' + esc(ph) + '">';
      } else if (f.type === 'textarea') {
        html += '<textarea id="' + id + '" rows="2" placeholder="' + esc(ph) + '"></textarea>';
      } else if (f.type === 'select') {
        html += '<select id="' + id + '"><option value="">-- ' + esc(label) + ' --</option>';
        (f.options || []).forEach(function(o) { html += '<option value="' + esc(o) + '">' + esc(o) + '</option>'; });
        html += '</select>';
      } else if (f.type === 'checkbox') {
        html += '<label class="checkout-terms-label"><input type="checkbox" id="' + id + '"> ' + esc(label) + '</label>';
      }
      html += '</div>';
    });

    el.innerHTML = html;

    var distEl = document.getElementById('coField_district');
    if (distEl && window.bdLocations) {
      Object.keys(window.bdLocations).forEach(function(d) {
        distEl.innerHTML += '<option value="' + d + '">' + d + '</option>';
      });
      distEl.onchange = function() {
        var upaEl = document.getElementById('coField_upazila');
        if (!upaEl) return;
        upaEl.innerHTML = '<option value="">' + __('checkout.default_upazila_ph') + '</option>';
        if (distEl.value && window.bdLocations[distEl.value]) {
          window.bdLocations[distEl.value].forEach(function(u) {
            upaEl.innerHTML += '<option value="' + u + '">' + u + '</option>';
          });
        }
      };
    }

    var areaEl = document.getElementById('coField_area');
    if (areaEl) {
      areaEl.onchange = function() { updateDeliveryCharge(); };
    }
  }

  function getFieldValue(key) {
    var el = document.getElementById('coField_' + key);
    return el ? el.value.trim() : '';
  }

  window.validateCoPhone = function(inp) {
    var val = inp.value.replace(/\D/g, '');
    inp.value = val;
    var errEl = document.getElementById('coPhoneError');
    if (!errEl) return;
    if (val.length === 0) { errEl.style.display = 'none'; return; }
    if (!/^01[3-9]/.test(val)) {
      errEl.textContent = __('checkout.phone_start');
      errEl.style.display = 'block';
    } else if (val.length < 11) {
      errEl.textContent = __('checkout.phone_length', {n: val.length});
      errEl.style.display = 'block';
    } else if (val.length > 11) {
      errEl.textContent = __('checkout.phone_max');
      errEl.style.display = 'block';
    } else {
      errEl.style.display = 'none';
    }
  };

  window.placeOrder = function() {
    var name = getFieldValue('name');
    var phone = getFieldValue('phone');
    var address = getFieldValue('address');
    var district = getFieldValue('district');
    var upazila = getFieldValue('upazila');
    var area = getFieldValue('area');
    var payment = getFieldValue('payment');
    var terms = document.getElementById('coTerms').checked;
    var btn = document.getElementById('placeOrderBtn');

    if (!name) { toast(__('toast.enter_name'), 'error'); return; }
    if (!phone) { toast(__('toast.enter_phone'), 'error'); return; }
    if (!/^01[3-9]\d{8}$/.test(phone)) { toast(__('checkout.phone_invalid'), 'error'); return; }
    if (!address) { toast(__('toast.enter_address'), 'error'); return; }
    if (!area) { toast(__('checkout.area_required'), 'error'); return; }
    if (!payment) { toast(__('checkout.select_payment'), 'error'); return; }
    if (!terms) { toast(__('checkout.accept_terms'), 'error'); return; }

    deliveryCharge = getDeliveryCharge();
    var orderTotal = cartTotal + deliveryCharge;

    var cfData = {};
    config.custom_fields.forEach(function(f, i) {
      var el = document.getElementById('coCF_' + i);
      if (!el) return;
      if (f.type === 'checkbox') cfData[f.label_bn] = el.checked ? 'yes' : 'no';
      else cfData[f.label_bn] = el.value;
    });

    btn.disabled = true;
    btn.textContent = __('checkout.processing');

    var isOnline = payment !== 'cod';

    api('POST', '/orders', {
      name: name,
      shipping_address: address,
      phone: phone,
      district: district,
      upazila: upazila,
      area: area,
      payment_method: payment,
      note: '',
      delivery_charge: deliveryCharge,
      custom_fields: cfData
    }).then(function(order) {
      if (order.error) { toast(order.error, 'error'); btn.disabled = false; btn.textContent = __('checkout.confirm_btn'); return; }

      if (isOnline) {
        api('POST', '/payment/initiate', { order_id: order.id, payment_brand: payment }).then(function(payRes) {
          if (payRes.redirect) { window.location = payRes.redirect; }
          else { toast(payRes.error || __('checkout.payment_error'), 'error'); btn.disabled = false; btn.textContent = __('checkout.confirm_btn'); }
        }).catch(function(err) {
          toast(__('checkout.gateway_error') + ' ' + (err.message || ''), 'error');
          btn.disabled = false;
          btn.textContent = __('checkout.confirm_btn');
        });
      } else {
        toast(__('checkout.order_success'), 'success');
        setTimeout(function() { window.location = '/orders.html'; }, 1500);
      }
    }).catch(function() {
      toast(__('checkout.server_error'), 'error');
      btn.disabled = false;
      btn.textContent = __('checkout.confirm_btn');
    });
  };
})();
