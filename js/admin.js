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
    var opts = { method: method, headers: headers };
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        delete headers['Content-Type'];
        opts.body = body;
      } else {
        headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      }
    }
    return fetch('/api/admin' + path, opts).then(function(r) { return r.json(); });
  }
  window.apiAdmin = apiAdmin;

  function checkLogin() {
    var p = document.getElementById('loginPrompt');
    var s = document.querySelector('.admin-sidebar');
    if (!adminToken && !localStorage.getItem('adminToken')) {
      if (p) p.style.display = 'block';
      if (s) s.style.display = 'none';
      return false;
    }
    if (p) p.style.display = 'none';
    if (s) s.style.display = '';
    return true;
  }

  window.initAdmin = function() {
    if (!checkLogin()) return;
    var page = window.location.pathname;

    if (page.indexOf('/admin/index.html') !== -1 || page === '/admin/') {
      loadDashboard();
    } else if (page.indexOf('/admin/products.html') !== -1) {
      loadAdminProducts();
      if (window.location.search.indexOf('new=1') !== -1) showProductForm();
    } else if (page.indexOf('/admin/product-new.html') !== -1) {
      var editId = new URLSearchParams(window.location.search).get('id');
      if (editId) {
        document.getElementById('pageTitle').textContent = (window.__ ? __('admin.edit') : 'Edit') + ' #' + editId;
        apiAdmin('GET', '/products').then(function(products) {
          var p = products.find(function(x) { return String(x.id) === String(editId); });
          if (p) {
            showProductForm(p);
            // showProductForm also loads categories, but we need to set pfCategory
          }
        });
      } else {
        // Load categories for new product
        apiAdmin('GET', '/categories').then(function(cats) {
          var sel = document.getElementById('pfCategory');
          if (sel) sel.innerHTML = '<option value=\"\">' + __('admin.select_category') + '</option>' +
            (cats || []).map(function(c) {
              return '<option value=\"' + c.id + '\">' + esc(c.name) + (c.en_name ? ' / ' + esc(c.en_name) : '') + '</option>';
            }).join('');
        });
      }
    } else if (page.indexOf('/admin/categories.html') !== -1) {
      loadAdminCategories();
    } else if (page.indexOf('/admin/users.html') !== -1) {
      loadAdminUsers();
    } else if (page.indexOf('/admin/orders.html') !== -1) {
      loadAdminOrders();
    } else if (page.indexOf('/admin/profile.html') !== -1) {
      loadAdminProfile();
    } else if (page.indexOf('/admin/settings.html') !== -1) {
      loadAdminSettings();
    }
  };

  /* ---- Dashboard ---- */
  function loadDashboard() {
    apiAdmin('GET', '/dashboard').then(function(d) {
      var grid = document.getElementById('statsGrid');
      if (!grid) return;
      if (d.error) { grid.innerHTML = '<p style=\"color:var(--danger);\">' + esc(d.error) + '</p>'; return; }
      grid.innerHTML = [
        { label: __('admin.products'), value: d.products || 0 },
        { label: __('admin.orders'), value: d.orders || 0 },
        { label: __('admin.users'), value: d.users || 0 },
        { label: __('admin.revenue'), value: taka(d.revenue || 0) },
        { label: __('admin.pending_orders'), value: d.pendingOrders || 0 }
      ].map(function(s) {
        return '<div class=\"stat-card\"><h3>' + s.label + '</h3><div class=\"value\">' + s.value + '</div></div>';
      }).join('');
    });
  }

  window.showProductForm = function(data) {
    var modal = document.getElementById('productModal');
    var title = document.getElementById('modalTitle');
    if (modal) {
      modal.style.display = 'block';
      if (title) title.textContent = data ? __('admin.edit') : __('admin.new_product');
    }

    apiAdmin('GET', '/categories').then(function(cats) {
      var sel = document.getElementById('pfCategory');
      if (!sel) return;
      sel.innerHTML = '<option value=\"\">' + __('admin.select_category') + '</option>' +
        (cats || []).map(function(c) {
          return '<option value=\"' + c.id + '\"' + (data && Number(data.category_id) === Number(c.id) ? ' selected' : '') + '>' + esc(c.name) + (c.en_name ? ' / ' + esc(c.en_name) : '') + '</option>';
        }).join('');
    });

    ['pfName','pfEName','pfPrice','pfPurchasePrice','pfCompare','pfStock','pfDesc','pfImages','pfColors'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (id === 'pfName') el.value = data ? data.name || '' : '';
      else if (id === 'pfEName') el.value = data ? data.en_name || '' : '';
      else if (id === 'pfPrice') el.value = data ? data.price || '' : '';
      else if (id === 'pfPurchasePrice') el.value = data ? data.purchase_price || 0 : 0;
      else if (id === 'pfCompare') el.value = data ? data.compare_price || '' : '';
      else if (id === 'pfStock') el.value = data ? data.stock || 0 : 10;
      else if (id === 'pfDesc') el.value = data ? data.description || '' : '';
      else if (id === 'pfImages') el.value = data && data.images ? JSON.stringify(data.images) : '[]';
      else if (id === 'pfColors') el.value = data && data.colors ? data.colors.join(', ') : '';
    });
    document.getElementById('pfFeatured').checked = data ? !!data.featured : false;
    if (modal) modal.dataset.editId = data ? data.id : '';
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
    status.textContent = __('admin.uploading');
    var t = adminToken || localStorage.getItem('adminToken') || localStorage.getItem('token');
    fetch('/api/admin/upload', {
      method: 'POST',
      headers: t ? { 'Authorization': 'Bearer ' + t } : {},
      body: fd
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.error) { status.textContent = __('admin.upload_error', {msg: data.error}); return; }
      status.textContent = __('admin.upload_ok');
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

  /* ── Description Formatting ── */
  window.descFormat = function(cmd) {
    var ta = document.getElementById('pfDesc');
    if (!ta) return;
    var selStart = ta.selectionStart, selEnd = ta.selectionEnd;
    var text = ta.value;
    var selected = text.substring(selStart, selEnd);
    var before = text.substring(0, selStart);
    var after = text.substring(selEnd);
    var replacement = '';
    switch (cmd) {
      case 'bold':      replacement = '<b>' + (selected || 'বোল্ড') + '</b>'; break;
      case 'italic':    replacement = '<i>' + (selected || 'ইটালিক') + '</i>'; break;
      case 'underline': replacement = '<u>' + (selected || 'আন্ডারলাইন') + '</u>'; break;
      case 'h1':        replacement = '\n<h1>' + (selected || 'শিরোনাম') + '</h1>\n'; break;
      case 'h2':        replacement = '\n<h2>' + (selected || 'শিরোনাম') + '</h2>\n'; break;
      case 'h3':        replacement = '\n<h3>' + (selected || 'শিরোনাম') + '</h3>\n'; break;
      case 'ul':        replacement = '\n<ul>\n  <li>' + (selected || 'আইটেম') + '</li>\n</ul>\n'; break;
      case 'ol':        replacement = '\n<ol>\n  <li>' + (selected || 'আইটেম') + '</li>\n</ol>\n'; break;
      case 'link': {
        var url = prompt('URL লিখুন:', 'https://');
        if (!url) return;
        replacement = '<a href="' + url + '">' + (selected || 'লিংক') + '</a>';
        break;
      }
      case 'image': {
        var imgUrl = prompt('ছবির URL লিখুন:', 'https://');
        if (!imgUrl) return;
        replacement = '\n<img src="' + imgUrl + '" alt="image">\n';
        break;
      }
      case 'left':   replacement = '<div style="text-align:left">' + (selected || 'টেক্সট') + '</div>'; break;
      case 'center': replacement = '<div style="text-align:center">' + (selected || 'টেক্সট') + '</div>'; break;
    }
    if (replacement !== '') {
      ta.value = before + replacement + after;
      var newPos = before.length + replacement.length;
      ta.focus();
      ta.setSelectionRange(newPos, newPos);
      autoDescPreview();
    }
  };

  window.toggleDescPreview = function() {
    var preview = document.getElementById('pfDescPreview');
    var btn = document.getElementById('descPreviewBtn');
    if (!preview || !btn) return;
    var shown = preview.style.display !== 'none';
    preview.style.display = shown ? 'none' : 'block';
    btn.textContent = shown ? (window.__ ? __('admin.preview') : 'Preview') : (window.__ ? __('admin.edit') : 'Edit');
    if (!shown) autoDescPreview();
  };

  window.autoDescPreview = function autoDescPreview() {
    var preview = document.getElementById('pfDescPreview');
    if (!preview || preview.style.display === 'none') return;
    var html = document.getElementById('pfDesc').value;
    preview.innerHTML = html;
  }

  window.saveProduct = function() {
    var colorsStr = document.getElementById('pfColors').value.trim();
      var data = {
        name: document.getElementById('pfName').value.trim(),
        en_name: document.getElementById('pfEName').value.trim(),
        category_id: document.getElementById('pfCategory').value,
        price: document.getElementById('pfPrice').value,
        purchase_price: document.getElementById('pfPurchasePrice').value || 0,
        compare_price: document.getElementById('pfCompare').value || null,
        stock: parseInt(document.getElementById('pfStock').value) || 0,
        description: document.getElementById('pfDesc').value,
        images: JSON.parse(document.getElementById('pfImages').value || '[]'),
        featured: document.getElementById('pfFeatured').checked ? 1 : 0,
        active: 1,
        colors: colorsStr ? colorsStr.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : []
      };
      if (!data.name) { toast(__('toast.enter_name'), 'error'); return; }
      if (!data.price) { toast(__('toast.enter_price'), 'error'); return; }

      var params = new URLSearchParams(window.location.search);
      var editId = params.get('id') || ((document.getElementById('productModal') || {}).dataset || {}).editId || '';
      var method = editId ? 'PUT' : 'POST';
      var path = editId ? '/products/' + editId : '/products';

      apiAdmin(method, path, data).then(function(res) {
        if (res.error) { toast(res.error, 'error'); return; }
        toast(__('admin.saved'));
        if (window.location.pathname.indexOf('product-new') !== -1) {
          window.location = '/admin/products.html';
        } else {
          closeProductForm();
          loadAdminProducts();
        }
      });
  };

  var loadAdminProducts = window.loadAdminProducts = function() {
    apiAdmin('GET', '/products').then(function(products) {
      var el = document.getElementById('productTableWrap');
      if (!el) return;
      if (products.error) { el.innerHTML = '<p style=\"color:var(--danger);\">' + esc(products.error) + '</p>'; return; }
      var q = (document.getElementById('productSearchInput') || {}).value || '';
      if (q) {
        var lq = q.toLowerCase();
        products = products.filter(function(p) {
          return String(p.id).indexOf(q) !== -1 ||
                 (p.name && p.name.toLowerCase().indexOf(lq) !== -1) ||
                 (p.en_name && p.en_name.toLowerCase().indexOf(lq) !== -1) ||
                 (p.category_name && p.category_name.toLowerCase().indexOf(lq) !== -1);
        });
      }
      if (!products || products.length === 0) {
        el.innerHTML = '<p style=\"color:var(--gray);\">' + __('admin.no_products') + '</p>';
        return;
      }
      var html = '<table><thead><tr><th>' + __('admin.id') + '</th><th>' + __('admin.image') + '</th><th>' + __('admin.name') + '</th><th>' + __('admin.category') + '</th><th>' + __('admin.price') + '</th><th>' + __('admin.stock') + '</th><th>' + __('admin.featured') + '</th><th></th></tr></thead><tbody>';
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
          '<button class=\"btn btn-sm btn-outline\" onclick=\"window.location=\'/admin/product-new.html?id=' + p.id + '\'\">' + __('admin.edit') + '</button> ' +
          '<button class=\"btn btn-sm btn-danger\" onclick=\"deleteProduct(' + p.id + ')\">' + __('admin.delete') + '</button>' +
          '</td></tr>';
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    });
  }

  window.deleteProduct = function(id) {
    if (!confirm(__('admin.confirm'))) return;
    apiAdmin('DELETE', '/products/' + id).then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      toast(__('admin.deleted'));
      loadAdminProducts();
    });
  };

  /* ---- Categories ---- */
  window.showCategoryForm = function(data) {
    var modal = document.getElementById('categoryModal');
    if (!modal) return;
    modal.style.display = 'block';
    document.getElementById('catModalTitle').textContent = data ? __('admin.edit') : __('admin.new_category');
    document.getElementById('cfName').value = data ? data.name : '';
    document.getElementById('cfEName').value = data ? data.en_name || '' : '';
    document.getElementById('cfDesc').value = data ? data.description || '' : '';
    modal.dataset.editId = data ? data.id : '';
  };

  window.closeCategoryForm = function() {
    document.getElementById('categoryModal').style.display = 'none';
  };

  window.saveCategory = function() {
    var data = {
      name: document.getElementById('cfName').value.trim(),
      en_name: document.getElementById('cfEName').value.trim(),
      description: document.getElementById('cfDesc').value.trim()
    };
    if (!data.name) { toast(__('toast.enter_name'), 'error'); return; }

    var modal = document.getElementById('categoryModal');
    var editId = modal ? modal.dataset.editId : '';
    var method = editId ? 'PUT' : 'POST';
    var path = editId ? '/categories/' + editId : '/categories';

    apiAdmin(method, path, data).then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      toast(__('admin.saved'));
      closeCategoryForm();
      loadAdminCategories();
    });
  };

  function loadAdminCategories() {
    apiAdmin('GET', '/categories').then(function(cats) {
      var el = document.getElementById('categoryTableWrap');
      if (!el) return;
      if (!cats || cats.length === 0) {
        el.innerHTML = '<p style=\"color:var(--gray);\">' + __('admin.no_categories') + '</p>';
        return;
      }
      var html = '<table id=\"catTable\"><thead><tr><th style=\"width:30px;\"></th><th>' + __('admin.id') + '</th><th>' + __('admin.name') + '</th><th>EN Name</th><th>Slug</th><th></th></tr></thead><tbody>';
      cats.forEach(function(c, i) {
        html += '<tr draggable=\"true\" data-id=\"' + c.id + '\" style=\"cursor:grab;\">' +
          '<td style=\"text-align:center;color:var(--gray);font-size:18px;cursor:grab;\">\u2261</td>' +
          '<td>' + c.id + '</td><td>' + esc(c.name) + '</td><td>' + esc(c.en_name || '') + '</td><td>' + esc(c.slug) + '</td>' +
'<td><button class=\"btn btn-sm btn-outline\" onclick=\"showCategoryForm(' + JSON.stringify(c).replace(/\"/g,'&quot;') + ')\">' + __('admin.edit') + '</button> ' +
          '<button class=\"btn btn-sm btn-danger\" onclick=\"deleteCategory(' + c.id + ')\">' + __('admin.delete') + '</button></td></tr>';
      });
      html += '</tbody></table>';
      el.innerHTML = html;

      // Drag-and-drop reorder
      var rows = el.querySelectorAll('tr[draggable]');
      var dragSrc = null;
      rows.forEach(function(row) {
        row.addEventListener('dragstart', function(e) {
          dragSrc = this;
          this.style.opacity = '0.4';
          e.dataTransfer.effectAllowed = 'move';
        });
        row.addEventListener('dragend', function() {
          this.style.opacity = '1';
        });
        row.addEventListener('dragover', function(e) {
          e.preventDefault();
          this.classList.add('drag-over');
        });
        row.addEventListener('dragleave', function() {
          this.classList.remove('drag-over');
        });
        row.addEventListener('drop', function(e) {
          e.preventDefault();
          this.classList.remove('drag-over');
          if (dragSrc && dragSrc !== this) {
            var tbody = this.parentNode;
            var items = Array.from(tbody.querySelectorAll('tr[draggable]'));
            var fromIdx = items.indexOf(dragSrc);
            var toIdx = items.indexOf(this);
            if (fromIdx < toIdx) {
              tbody.insertBefore(dragSrc, this.nextSibling);
            } else {
              tbody.insertBefore(dragSrc, this);
            }
            // Save new order
            var order = Array.from(tbody.querySelectorAll('tr[draggable]')).map(function(r) { return r.dataset.id; });
            apiAdmin('PUT', '/categories/order', { ids: order }).then(function(res) {
              if (res.error) { toast(res.error, 'error'); return; }
            });
          }
          dragSrc = null;
        });
      });
    });
  }

  window.deleteCategory = function(id) {
    if (!confirm(__('admin.confirm'))) return;
    apiAdmin('DELETE', '/categories/' + id).then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      toast(__('admin.deleted'));
      loadAdminCategories();
    });
  };

  /* ---- Users ---- */
  function loadAdminUsers() {
    apiAdmin('GET', '/users').then(function(users) {
      var el = document.getElementById('usersTableWrap');
      if (!el) return;
      if (!users || users.length === 0) {
        el.innerHTML = '<p style="color:var(--gray);">' + __('admin.no_users') + '</p>';
        return;
      }
      var html = '<table><thead><tr><th>' + __('admin.id') + '</th><th>' + __('admin.name') + '</th><th>Email</th><th>Phone</th><th>' + __('admin.role') + '</th><th>' + __('admin.date') + '</th></tr></thead><tbody>';
      users.forEach(function(u) {
        html += '<tr>' +
          '<td>' + u.id + '</td>' +
          '<td>' + esc(u.name || '') + '</td>' +
          '<td>' + esc(u.email || '') + '</td>' +
          '<td>' + esc(u.phone || '') + '</td>' +
          '<td>' + esc(u.role || '') + '</td>' +
          '<td>' + (u.created_at || '') + '</td>' +
          '</tr>';
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    });
  }

  /* ---- Orders ---- */
  window.loadAdminOrders = function() {
    var status = document.getElementById('statusFilter');
    var filter = status ? status.value : '';
    var query = filter ? '?status=' + filter : '';
    apiAdmin('GET', '/orders' + query).then(function(orders) {
      var el = document.getElementById('ordersTableWrap');
      if (!el) return;
      if (!orders || orders.length === 0) {
        el.innerHTML = '<p style=\"color:var(--gray);\">' + __('admin.no_orders') + '</p>';
        return;
      }
      var html = '<table><thead><tr><th>' + __('admin.id') + '</th><th>' + __('admin.customer') + '</th><th>' + __('admin.items') + '</th><th>' + __('orders.total') + '</th><th>' + __('admin.status') + '</th><th>' + __('admin.payment') + '</th><th>' + __('admin.date') + '</th><th></th></tr></thead><tbody>';
      orders.forEach(function(o) {
        var items = o.items || [];
        var productNames = items.map(function(item) { return esc(item.name); }).join(', ');
        html += '<tr>' +
          '<td>#' + o.id + '</td>' +
          '<td>' + esc(o.user_name || '') + '</td>' +
          '<td style="max-width:250px;font-size:13px;">' + productNames + '</td>' +
          '<td>' + taka(o.total) + '</td>' +
          '<td><span class=\"badge badge-' + (o.status || 'pending') + '\">' + (o.status || 'pending') + '</span></td>' +
          '<td>' + (o.payment_status || '') + '</td>' +
          '<td>' + timeAgo(o.created_at) + '</td>' +
          '<td>' +
          '<select onchange=\"updateOrderStatus(' + o.id + ', this.value)\" style=\"padding:4px;border:1px solid var(--border);border-radius:4px;\">' +
          '<option value=\"\">' + __('admin.update') + '</option>' +
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
    apiAdmin('PUT', '/orders/' + id + '/status', { status: status, payment_status: status === 'paid' ? 'paid' : undefined }).then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      toast(__('toast.order_updated', {id: id, status: status}));
      loadAdminOrders();
    });
  };

  function loadAdminProfile() {
    api('GET', '/users/me').then(function(user) {
      if (user.error) { toast(user.error, 'error'); return; }
      document.getElementById('profileName').value = user.name || '';
      document.getElementById('profileEmail').value = user.email || '';
      document.getElementById('profilePhone').value = user.phone || '';
      document.getElementById('profileAddress').value = user.address || '';
      var avatar = document.getElementById('profileAvatar');
      if (user.avatar) {
        avatar.src = user.avatar;
        avatar.style.display = 'inline-block';
      }
    });
  }

  window.updateProfile = function() {
    var data = {
      name: document.getElementById('profileName').value.trim(),
      phone: document.getElementById('profilePhone').value.trim(),
      address: document.getElementById('profileAddress').value.trim()
    };
    if (!data.name) { toast(__('toast.enter_name'), 'error'); return; }
    api('PUT', '/users/me', data).then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      toast(__('admin.saved'));
      loadAdminProfile();
    });
  };

  function loadAdminSettings() {
    apiAdmin('GET', '/settings').then(function(s) {
      if (s.error) return;
      document.getElementById('settingSiteName').value = s.site_name || '';
      document.getElementById('settingLogoUrl').value = s.logo_url || '';
      if (s.logo_url) {
        document.getElementById('logoPreview').src = s.logo_url;
        document.getElementById('logoPreviewWrap').style.display = 'block';
      }
      if (s.flash_sale_end) {
        var d = new Date(s.flash_sale_end);
        if (!isNaN(d.getTime())) {
          var pad = function(n) { return String(n).padStart(2, '0'); };
          document.getElementById('settingFlashEnd').value = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
        }
      }
      if (s.flash_sale_color) {
        document.getElementById('settingFlashColor').value = s.flash_sale_color;
        document.getElementById('settingFlashColorText').value = s.flash_sale_color;
      }
      if (typeof bannerSlides !== 'undefined') {
        try {
          bannerSlides = s.banners ? JSON.parse(s.banners) : [];
        } catch(e) { bannerSlides = []; }
        if (bannerSlides.length === 0) {
          bannerSlides = [
            { bg: 'linear-gradient(135deg,#1a73e8,#7c3aed)', bgImage: '', title: 'বিশেষ গ্রীষ্মকালীন সেল', titleEn: 'Special Summer Sale', desc: 'সেরা ব্র্যান্ডের পণ্য সেরা দামে', descEn: 'Best brand products at best prices', btnText: 'এখনই কেনাকাটা করুন', btnTextEn: 'Shop Now', btnLink: '/products.html', btnColor: '#ffffff' },
            { bg: 'linear-gradient(135deg,#ff6b00,#ec4899)', bgImage: '', title: 'ফ্ল্যাশ সেল — ৭০% পর্যন্ত ছাড়', titleEn: 'Flash Sale — Up to 70% off', desc: 'সীমিত সময়ের অফার, দেরি করবেন না!', descEn: 'Limited time offer', btnText: 'সেল দেখুন', btnTextEn: 'See Sale', btnLink: '/products.html', btnColor: '#ffffff' },
            { bg: 'linear-gradient(135deg,#00a86b,#0d9488)', bgImage: '', title: 'ফ্রি ডেলিভারি', titleEn: 'Free Delivery', desc: '৫০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি', descEn: 'Free delivery on orders above 500 Taka', btnText: 'পণ্য দেখুন', btnTextEn: 'See Products', btnLink: '/products.html', btnColor: '#ffffff' }
          ];
        }
        renderBannerEditor();
      }
    });
  }

  window.saveSettings = function() {
    var data = {
      site_name: document.getElementById('settingSiteName').value.trim(),
      logo_url: document.getElementById('settingLogoUrl').value.trim()
    };
    if (!data.site_name) { toast(__('toast.enter_site_name'), 'error'); return; }
    apiAdmin('PUT', '/settings', data).then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      toast(__('admin.saved'));
      updateSiteHeader(data);
    });
  };

  initAdmin();
})();

window.adminLogout = function() {
  localStorage.removeItem('token');
  localStorage.removeItem('adminToken');
  window.location = '/admin/';
};
