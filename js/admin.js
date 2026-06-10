/* ==========================================================
   ADMIN.JS — Admin panel (uses JWT + admin role)
   ========================================================== */
(function(){
  var token = localStorage.getItem('token');
  var adminToken = localStorage.getItem('adminToken');

  window.adminLogin = function() {
    var email = document.getElementById('adminEmail').value.trim();
    var pass = document.getElementById('adminPass').value;
    if (!email || !pass) { toast('Credentials required', 'error'); return; }

    fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pass })
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      if (data.user && data.user.role !== 'admin') {
        toast('Admin access required', 'error');
        return;
      }
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('token', data.token);
      adminToken = data.token;
      toast('Admin logged in');
      initAdmin();
    });
  };

  function getHeaders() {
    var t = adminToken || localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!t) return {};
    return { 'Authorization': 'Bearer ' + t, 'Content-Type': 'application/json' };
  }

  function apiAdmin(method, path, body) {
    var headers = getHeaders();
    if (body && method !== 'GET') headers['Content-Type'] = 'application/json';
    var opts = { method: method, headers: headers };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);
    return fetch('/api/admin' + path, opts).then(function(r) { return r.json(); });
  }

  function checkLogin() {
    var p = document.getElementById('loginPrompt');
    if (!adminToken && !localStorage.getItem('adminToken')) { if (p) p.style.display = 'block'; return false; }
    if (p) p.style.display = 'none';
    return true;
  }

  window.initAdmin = function() {
    if (!checkLogin()) return;
    var page = window.location.pathname;

    if (page.indexOf('/admin/index.html') !== -1 || page === '/admin/') {
      loadDashboard();
    } else if (page.indexOf('/admin/products.html') !== -1) {
      loadAdminProducts();
    } else if (page.indexOf('/admin/categories.html') !== -1) {
      loadAdminCategories();
    } else if (page.indexOf('/admin/orders.html') !== -1) {
      loadAdminOrders();
    }
  };

  /* ---- Dashboard ---- */
  function loadDashboard() {
    apiAdmin('GET', '/dashboard').then(function(d) {
      var grid = document.getElementById('statsGrid');
      if (!grid) return;
      if (d.error) { grid.innerHTML = '<p style=\"color:var(--danger);\">' + esc(d.error) + '</p>'; return; }
      grid.innerHTML = [
        { label: 'পণ্য', value: d.products || 0 },
        { label: 'অর্ডার', value: d.orders || 0 },
        { label: 'ব্যবহারকারী', value: d.users || 0 },
        { label: 'রেভিনিউ', value: taka(d.revenue || 0) },
        { label: 'Pending অর্ডার', value: d.pendingOrders || 0 }
      ].map(function(s) {
        return '<div class=\"stat-card\"><h3>' + s.label + '</h3><div class=\"value\">' + s.value + '</div></div>';
      }).join('');
    });
  }

  /* ---- Products ---- */
  window.showProductForm = function(data) {
    var modal = document.getElementById('productModal');
    var title = document.getElementById('modalTitle');
    if (!modal) return;
    modal.style.display = 'block';
    title.textContent = data ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য';

    apiAdmin('GET', '/categories').then(function(cats) {
      var sel = document.getElementById('pfCategory');
      if (!sel) return;
      sel.innerHTML = '<option value=\"\">ক্যাটাগরি নির্বাচন করুন</option>' +
        (cats || []).map(function(c) {
          return '<option value=\"' + c.id + '\"' + (data && Number(data.category_id) === Number(c.id) ? ' selected' : '') + '>' + esc(c.name) + '</option>';
        }).join('');
    });

    ['pfName','pfPrice','pfCompare','pfStock','pfDesc','pfImages'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (id === 'pfName') el.value = data ? data.name || '' : '';
      else if (id === 'pfPrice') el.value = data ? data.price || '' : '';
      else if (id === 'pfCompare') el.value = data ? data.compare_price || '' : '';
      else if (id === 'pfStock') el.value = data ? data.stock || 0 : 10;
      else if (id === 'pfDesc') el.value = data ? data.description || '' : '';
      else if (id === 'pfImages') el.value = data && data.images ? JSON.stringify(data.images) : '[]';
    });
    document.getElementById('pfFeatured').checked = data ? !!data.featured : false;
    modal.dataset.editId = data ? data.id : '';
    renderImagePreviews();
  };

  window.closeProductForm = function() {
    var modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
  };

  window.uploadProductImage = function(input) {
    var status = document.getElementById('uploadStatus');
    if (!input.files || !input.files[0]) return;
    var fd = new FormData();
    fd.append('image', input.files[0]);
    status.textContent = 'আপলোড হচ্ছে...';
    var t = adminToken || localStorage.getItem('adminToken') || localStorage.getItem('token');
    fetch('/api/admin/upload', {
      method: 'POST',
      headers: t ? { 'Authorization': 'Bearer ' + t } : {},
      body: fd
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.error) { status.textContent = 'ত্রুটি: ' + data.error; return; }
      status.textContent = 'আপলোড সফল!';
      var ta = document.getElementById('pfImages');
      var arr = JSON.parse(ta.value || '[]');
      arr.push(data.url);
      ta.value = JSON.stringify(arr);
      renderImagePreviews();
    });
  };

  function renderImagePreviews() {
    var el = document.getElementById('pfPreview');
    if (!el) return;
    var arr = JSON.parse(document.getElementById('pfImages').value || '[]');
    el.innerHTML = arr.map(function(u, i) {
      return '<div style=\"position:relative;display:inline-block;\">' +
        '<img src=\"' + u + '\" style=\"width:80px;height:80px;object-fit:cover;border-radius:6px;border:1px solid var(--border);\">' +
        '<button type="button" onclick="removeImage(' + i + ')" style=\"position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;border:none;background:var(--danger);color:white;cursor:pointer;font-size:12px;line-height:20px;text-align:center;\">×</button></div>';
    }).join('');
  }

  window.removeImage = function(idx) {
    var ta = document.getElementById('pfImages');
    var arr = JSON.parse(ta.value || '[]');
    arr.splice(idx, 1);
    ta.value = JSON.stringify(arr);
    renderImagePreviews();
  };

  window.saveProduct = function() {
    var data = {
      name: document.getElementById('pfName').value.trim(),
      category_id: document.getElementById('pfCategory').value,
      price: document.getElementById('pfPrice').value,
      compare_price: document.getElementById('pfCompare').value || null,
      stock: parseInt(document.getElementById('pfStock').value) || 0,
      description: document.getElementById('pfDesc').value,
      images: JSON.parse(document.getElementById('pfImages').value || '[]'),
      featured: document.getElementById('pfFeatured').checked ? 1 : 0,
      active: 1
    };
    if (!data.name) { toast('নাম দিন', 'error'); return; }
    if (!data.price) { toast('দাম দিন', 'error'); return; }

    var modal = document.getElementById('productModal');
    var editId = modal ? modal.dataset.editId : '';
    var method = editId ? 'PUT' : 'POST';
    var path = editId ? '/products/' + editId : '/products';

    apiAdmin(method, path, data).then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      toast('সংরক্ষিত!');
      closeProductForm();
      loadAdminProducts();
    });
  };

  function loadAdminProducts() {
    apiAdmin('GET', '/products').then(function(products) {
      var el = document.getElementById('productTableWrap');
      if (!el) return;
      if (products.error) { el.innerHTML = '<p style=\"color:var(--danger);\">' + esc(products.error) + '</p>'; return; }
      if (!products || products.length === 0) {
        el.innerHTML = '<p style=\"color:var(--gray);\">কোনো পণ্য নেই</p>';
        return;
      }
      var html = '<table><thead><tr><th>ID</th><th>ছবি</th><th>নাম</th><th>ক্যাটাগরি</th><th>দাম</th><th>স্টক</th><th>ফিচার্ড</th><th></th></tr></thead><tbody>';
      products.forEach(function(p) {
        var img = (p.images && p.images.length) ? p.images[0] : '';
        html += '<tr>' +
          '<td>' + p.id + '</td>' +
          '<td>' + (img ? '<img src=\"' + esc(img) + '\" style=\"width:50px;height:50px;object-fit:cover;border-radius:4px;\">' : '-') + '</td>' +
          '<td>' + esc(p.name) + '</td>' +
          '<td>' + esc(p.category_name || '') + '</td>' +
          '<td>' + taka(p.price) + '</td>' +
          '<td>' + (p.stock || 0) + '</td>' +
          '<td>' + (p.featured ? '★' : '-') + '</td>' +
          '<td>' +
          '<button class=\"btn btn-sm btn-outline\" onclick=\"showProductForm(' + JSON.stringify(p).replace(/\"/g,'&quot;') + ')\">সম্পাদনা</button> ' +
          '<button class=\"btn btn-sm btn-danger\" onclick=\"deleteProduct(' + p.id + ')\">মুছুন</button>' +
          '</td></tr>';
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    });
  }

  window.deleteProduct = function(id) {
    if (!confirm('নিশ্চিত?')) return;
    apiAdmin('DELETE', '/products/' + id).then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      toast('মুছে ফেলা হয়েছে');
      loadAdminProducts();
    });
  };

  /* ---- Categories ---- */
  window.showCategoryForm = function(data) {
    var modal = document.getElementById('categoryModal');
    if (!modal) return;
    modal.style.display = 'block';
    document.getElementById('catModalTitle').textContent = data ? 'সম্পাদনা' : 'নতুন ক্যাটাগরি';
    document.getElementById('cfName').value = data ? data.name : '';
    document.getElementById('cfDesc').value = data ? data.description || '' : '';
    modal.dataset.editId = data ? data.id : '';
  };

  window.closeCategoryForm = function() {
    document.getElementById('categoryModal').style.display = 'none';
  };

  window.saveCategory = function() {
    var data = {
      name: document.getElementById('cfName').value.trim(),
      description: document.getElementById('cfDesc').value.trim()
    };
    if (!data.name) { toast('নাম দিন', 'error'); return; }

    var modal = document.getElementById('categoryModal');
    var editId = modal ? modal.dataset.editId : '';
    var method = editId ? 'PUT' : 'POST';
    var path = editId ? '/categories/' + editId : '/categories';

    apiAdmin(method, path, data).then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      toast('সংরক্ষিত!');
      closeCategoryForm();
      loadAdminCategories();
    });
  };

  function loadAdminCategories() {
    apiAdmin('GET', '/categories').then(function(cats) {
      var el = document.getElementById('categoryTableWrap');
      if (!el) return;
      if (!cats || cats.length === 0) {
        el.innerHTML = '<p style=\"color:var(--gray);\">কোনো ক্যাটাগরি নেই</p>';
        return;
      }
      var html = '<table><thead><tr><th>ID</th><th>নাম</th><th>Slug</th><th></th></tr></thead><tbody>';
      cats.forEach(function(c) {
        html += '<tr><td>' + c.id + '</td><td>' + esc(c.name) + '</td><td>' + esc(c.slug) + '</td>' +
          '<td><button class=\"btn btn-sm btn-outline\" onclick=\"showCategoryForm(' + JSON.stringify(c).replace(/\"/g,'&quot;') + ')\">সম্পাদনা</button> ' +
          '<button class=\"btn btn-sm btn-danger\" onclick=\"deleteCategory(' + c.id + ')\">মুছুন</button></td></tr>';
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    });
  }

  window.deleteCategory = function(id) {
    if (!confirm('নিশ্চিত?')) return;
    apiAdmin('DELETE', '/categories/' + id).then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      toast('মুছে ফেলা হয়েছে');
      loadAdminCategories();
    });
  };

  /* ---- Orders ---- */
  window.loadAdminOrders = function() {
    var status = document.getElementById('statusFilter');
    var filter = status ? status.value : '';
    var query = filter ? '?status=' + filter : '';
    apiAdmin('GET', '/orders' + query).then(function(orders) {
      var el = document.getElementById('ordersTableWrap');
      if (!el) return;
      if (!orders || orders.length === 0) {
        el.innerHTML = '<p style=\"color:var(--gray);\">কোনো অর্ডার নেই</p>';
        return;
      }
      var html = '<table><thead><tr><th>ID</th><th>গ্রাহক</th><th>আইটেম</th><th>মোট</th><th>স্ট্যাটাস</th><th>পেমেন্ট</th><th>তারিখ</th><th></th></tr></thead><tbody>';
      orders.forEach(function(o) {
        var itemCount = (o.items || []).length;
        html += '<tr>' +
          '<td>#' + o.id + '</td>' +
          '<td>' + esc(o.user_name || '') + '</td>' +
          '<td>' + itemCount + ' টি</td>' +
          '<td>' + taka(o.total) + '</td>' +
          '<td><span class=\"badge badge-' + (o.status || 'pending') + '\">' + (o.status || 'pending') + '</span></td>' +
          '<td>' + (o.payment_status || '') + '</td>' +
          '<td>' + timeAgo(o.created_at) + '</td>' +
          '<td>' +
          '<select onchange=\"updateOrderStatus(' + o.id + ', this.value)\" style=\"padding:4px;border:1px solid var(--border);border-radius:4px;\">' +
          '<option value=\"\">আপডেট</option>' +
          '<option value=\"paid\">Paid</option>' +
          '<option value=\"processing\">Processing</option>' +
          '<option value=\"shipped\">Shipped</option>' +
          '<option value=\"delivered\">Delivered</option>' +
          '<option value=\"cancelled\">Cancelled</option>' +
          '</select>' +
          '</td></tr>';
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    });
  };

  window.updateOrderStatus = function(id, status) {
    if (!status) return;
    apiAdmin('PUT', '/orders/' + id + '/status', { status: status }).then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      toast('অর্ডার #' + id + ' → ' + status);
      loadAdminOrders();
    });
  };

  initAdmin();
})();
