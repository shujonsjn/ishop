/* ==========================================================
   ADMIN.JS — Admin panel (uses JWT + admin role)
   ========================================================== */
(function(){
  var token = localStorage.getItem('token');
  var adminToken = localStorage.getItem('adminToken');

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.getElementById('loginPrompt').classList.contains('is-show')) {
      window.adminLogin();
    }
  });

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
      if (p) p.classList.add('is-show');
      if (s) s.style.display = 'none';
      return false;
    }
    if (p) p.classList.remove('is-show');
    if (s) s.style.display = '';
    return true;
  }

  window.initAdmin = function() {
    if (!checkLogin()) return;
    var page = window.location.pathname;

    if (page.indexOf('/admin/index.html') !== -1 || page === '/admin/') {
      initDashDates();
      loadDashboard();
      document.querySelectorAll('.dash-chart-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          this.parentElement.querySelectorAll('.dash-chart-tab').forEach(function(t) { t.classList.remove('active'); });
          this.classList.add('active');
        });
      });
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
    } else if (page.indexOf('/admin/questions.html') !== -1) {
      window.loadAdminQuestions();
    }
  };

  /* ---- Dashboard Calendar ---- */
  var dashDateFrom = '';
  var dashDateTo = '';
  var dashCalMonth = new Date().getMonth();
  var dashCalYear = new Date().getFullYear();
  var dashCalClickMode = 'from';
  var dashCalTempFrom = '';
  var dashCalTempTo = '';

  function getBDDate(d) {
    return new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  }
  function toBDStr(y, m, d) {
    var dt = new Date(y, m, d);
    var bd = getBDDate(dt);
    return bd.getFullYear() + '-' + String(bd.getMonth()+1).padStart(2,'0') + '-' + String(bd.getDate()).padStart(2,'0');
  }
  function fmtBD(d) {
    if (!d) return '-';
    var p = d.split('-');
    if (p.length !== 3) return d;
    var lang = window.getLang ? window.getLang() : 'bn';
    if (lang === 'en') return p[2] + '/' + p[1] + '/' + p[0];
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  function renderDashCalendar() {
    var el = document.getElementById('dashCalendar');
    if (!el) return;
    var lang = window.getLang ? window.getLang() : 'bn';
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var monthsBn = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
    var mNames = lang === 'en' ? months : monthsBn;
    var weekdays = lang === 'en' ? ['Su','Mo','Tu','We','Th','Fr','Sa'] : ['শনি','রবি','সোম','মঙ্গল','বুধ','বৃহ','শুক্র'];
    var firstDay = new Date(dashCalYear, dashCalMonth, 1).getDay();
    var daysInMonth = new Date(dashCalYear, dashCalMonth + 1, 0).getDate();
    var bdToday = getBDDate(new Date());
    var todayStr = bdToday.getFullYear() + '-' + String(bdToday.getMonth()+1).padStart(2,'0') + '-' + String(bdToday.getDate()).padStart(2,'0');
    var titleText = mNames[dashCalMonth] + ' ' + dashCalYear;

    var html = '<div class="dash-cal-header"><span class="dash-cal-title">' + titleText + '</span>';
    html += '<div class="dash-cal-nav"><button onclick="dashCalNav(-1)">‹</button><button onclick="dashCalNav(1)">›</button></div></div>';
    html += '<div class="dash-cal-weekdays">';
    for (var w = 0; w < 7; w++) html += '<span>' + weekdays[w] + '</span>';
    html += '</div><div class="dash-cal-days">';
    for (var e = 0; e < firstDay; e++) html += '<div class="dash-cal-day empty"></div>';
    for (var d = 1; d <= daysInMonth; d++) {
      var ds = dashCalYear + '-' + String(dashCalMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
      var cls = ['dash-cal-day'];
      var dayOfWeek = new Date(dashCalYear, dashCalMonth, d).getDay();
      if (dayOfWeek === 0) cls.push('friday');
      if (ds === todayStr) cls.push('today');
      if (ds === dashCalTempFrom && ds === dashCalTempTo) cls.push('range-start','range-end','selected');
      else if (ds === dashCalTempFrom) cls.push('range-start','selected');
      else if (ds === dashCalTempTo) cls.push('range-end','selected');
      else if (dashCalTempFrom && dashCalTempTo && ds > dashCalTempFrom && ds < dashCalTempTo) cls.push('in-range');
      html += '<div class="' + cls.join(' ') + '" onclick="dashCalPick(\'' + ds + '\')">' + d + '</div>';
    }
    html += '</div>';
    el.innerHTML = html;
    updateDashCalRangeInfo();
  }

  function updateDashCalRangeInfo() {
    var f = document.getElementById('dashCalFromDisp');
    var t = document.getElementById('dashCalToDisp');
    if (f) f.textContent = fmtBD(dashCalTempFrom);
    if (t) t.textContent = fmtBD(dashCalTempTo);
  }

  window.dashCalOpen = function() {
    dashCalTempFrom = dashDateFrom;
    dashCalTempTo = dashDateTo;
    dashCalClickMode = 'from';
    var bd = getBDDate(new Date());
    if (!dashCalTempFrom) {
      dashCalMonth = bd.getMonth();
      dashCalYear = bd.getFullYear();
    } else {
      var p = dashCalTempFrom.split('-');
      dashCalYear = parseInt(p[0]);
      dashCalMonth = parseInt(p[1]) - 1;
    }
    renderDashCalendar();
    document.getElementById('dashCalOverlay').classList.add('is-show');
    document.body.style.overflow = 'hidden';
  };

  window.dashCalClose = function(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('dashCalOverlay').classList.remove('is-show');
    document.body.style.overflow = '';
  };

  window.dashCalApply = function() {
    dashDateFrom = dashCalTempFrom;
    dashDateTo = dashCalTempTo;
    document.getElementById('dashDateFrom').value = dashDateFrom;
    document.getElementById('dashDateTo').value = dashDateTo;
    document.getElementById('dashDateFromDisp').textContent = fmtBD(dashDateFrom);
    document.getElementById('dashDateToDisp').textContent = fmtBD(dashDateTo);
    document.getElementById('dashCalOverlay').classList.remove('is-show');
    document.body.style.overflow = '';
    loadDashboard();
  };

  window.dashCalNav = function(dir) {
    dashCalMonth += dir;
    if (dashCalMonth > 11) { dashCalMonth = 0; dashCalYear++; }
    if (dashCalMonth < 0) { dashCalMonth = 11; dashCalYear--; }
    renderDashCalendar();
  };

  window.dashCalPick = function(ds) {
    if (dashCalClickMode === 'from') {
      dashCalTempFrom = ds;
      dashCalTempTo = ds;
      dashCalClickMode = 'to';
    } else {
      if (ds < dashCalTempFrom) {
        dashCalTempTo = dashCalTempFrom;
        dashCalTempFrom = ds;
      } else {
        dashCalTempTo = ds;
      }
      dashCalClickMode = 'from';
    }
    renderDashCalendar();
  };

  window.dashQuickDate = function(range) {
    var bd = getBDDate(new Date());
    var y = bd.getFullYear(), m = bd.getMonth(), d = bd.getDate();
    document.querySelectorAll('.dash-quick-btn').forEach(function(b){b.classList.remove('active');});
    event.target.classList.add('active');
    if (range === 'today') {
      dashCalTempFrom = toBDStr(y, m, d);
      dashCalTempTo = dashCalTempFrom;
    } else if (range === 'yesterday') {
      var yd = new Date(y, m, d - 1);
      dashCalTempFrom = toBDStr(yd.getFullYear(), yd.getMonth(), yd.getDate());
      dashCalTempTo = dashCalTempFrom;
    } else if (range === 'week') {
      var dayOfWeek = bd.getDay();
      var sun = new Date(y, m, d - dayOfWeek);
      var sat = new Date(y, m, d - dayOfWeek + 6);
      dashCalTempFrom = toBDStr(sun.getFullYear(), sun.getMonth(), sun.getDate());
      dashCalTempTo = toBDStr(sat.getFullYear(), sat.getMonth(), sat.getDate());
    } else if (range === 'month') {
      dashCalTempFrom = toBDStr(y, m, 1);
      dashCalTempTo = toBDStr(y, m, new Date(y, m + 1, 0).getDate());
    }
    dashCalMonth = m;
    dashCalYear = y;
    renderDashCalendar();
  };

  function initDashDates() {
    var today = getBDDate(new Date());
    dashDateFrom = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
    dashDateTo = dashDateFrom;
    dashCalMonth = today.getMonth();
    dashCalYear = today.getFullYear();
    var fromEl = document.getElementById('dashDateFrom');
    var toEl = document.getElementById('dashDateTo');
    if (fromEl) fromEl.value = dashDateFrom;
    if (toEl) toEl.value = dashDateTo;
    document.getElementById('dashDateFromDisp').textContent = fmtBD(dashDateFrom);
    document.getElementById('dashDateToDisp').textContent = fmtBD(dashDateTo);
  }

  window.applyDashFilter = function() {
    loadDashboard();
  };

  window.resetDashFilter = function() {
    dashDateFrom = '';
    dashDateTo = '';
    var fromEl = document.getElementById('dashDateFrom');
    var toEl = document.getElementById('dashDateTo');
    if (fromEl) fromEl.value = '';
    if (toEl) toEl.value = '';
    document.getElementById('dashDateFromDisp').textContent = '-';
    document.getElementById('dashDateToDisp').textContent = '-';
    loadDashboard();
  };

  function loadDashboard() {
    var params = [];
    if (dashDateFrom) params.push('date_from=' + dashDateFrom);
    if (dashDateTo) params.push('date_to=' + dashDateTo);
    var qs = params.length ? '?' + params.join('&') : '';
    apiAdmin('GET', '/dashboard' + qs).then(function(d) {
      var grid = document.getElementById('statsGrid');
      if (!grid) return;
      if (d.error) { grid.innerHTML = '<p style="color:#dc2626;">' + esc(d.error) + '</p>'; return; }
      var lang = window.getLang ? window.getLang() : 'bn';
      var accents = ['#6366f1', '#16a34a', '#f97316', '#dc2626'];
      var stats = [
        { icon: '💰', value: taka(d.revenue || 0), label: (lang === 'en' ? 'Total Revenue' : 'মোট রেভিনিউ') },
        { icon: '📤', value: taka(d.totalSales || 0), label: (lang === 'en' ? "Today's Sales" : 'আজকের বিক্রি') },
        { icon: '📈', value: d.orders > 0 && d.users > 0 ? ((d.orders / d.users * 100).toFixed(1) + '%') : '0%', label: (lang === 'en' ? 'Conversion' : 'রূপান্তর') },
        { icon: '👥', value: d.users || 0, label: (lang === 'en' ? 'Total Users' : 'মোট ব্যবহারকারী') }
      ];
      grid.innerHTML = stats.map(function(s, i) {
        return '<div class="stat-card" style="--stat-accent:' + accents[i % accents.length] + ';"><div class="stat-icon">' + s.icon + '</div><div class="stat-info"><div class="stat-value">' + s.value + '</div><div class="stat-label">' + s.label + '</div></div></div>';
      }).join('');

      renderDashCharts(d, lang);
      renderRevenueHistory(d, lang);
    });
  }

  var dashChartInstances = { donut: null, bar: null, line: null };

  function renderDashCharts(d, lang) {
    if (dashChartInstances.donut) dashChartInstances.donut.destroy();
    if (dashChartInstances.bar) dashChartInstances.bar.destroy();
    if (dashChartInstances.line) dashChartInstances.line.destroy();

    var totalRevenue = d.revenue || 0;
    var totalSales = d.totalSales || 0;
    var totalOrders = d.orders || 0;
    var targetRevenue = Math.max(totalRevenue * 1.3, 100000);
    var revenuePercent = Math.round((totalRevenue / targetRevenue) * 100);

    /* ── Line Chart (Analytics) ── */
    var lineEl = document.getElementById('dashLineChart');
    if (lineEl) {
      var days = (d.dailyData || []).map(function(r){ return r.day ? r.day.slice(5) : ''; });
      var revData = (d.dailyData || []).map(function(r){ return r.revenue; });
      var ordData = (d.dailyData || []).map(function(r){ return r.orders; });
      dashChartInstances.line = new Chart(lineEl, {
        type: 'line',
        data: {
          labels: days,
          datasets: [
            { label: lang === 'en' ? 'Revenue' : 'রেভিনিউ', data: revData, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.08)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, yAxisID: 'y' },
            { label: lang === 'en' ? 'Orders' : 'অর্ডার', data: ordData, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.08)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, yAxisID: 'y1' }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { position: 'top', align: 'end', labels: { color: '#6b7280', usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 12, family: 'Inter' } } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11, family: 'Inter' } } },
            y: { position: 'left', grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af', font: { size: 11, family: 'Inter' }, callback: function(v){ return taka(v); } } },
            y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#9ca3af', font: { size: 11, family: 'Inter' }, stepSize: 1 } }
          }
        }
      });
    }

    /* ── Donut Chart (Status) ── */
    var donutEl = document.getElementById('dashDonutChart');
    if (donutEl) {
      var statusData = d.statusBreakdown || [];
      var donutColors = ['#22c55e', '#f97316', '#3b82f6', '#8b5cf6', '#06b6d4', '#ef4444'];
      var donutLabels = statusData.map(function(s){ return __('orders.status_' + s.status); });
      var donutValues = statusData.map(function(s){ return s.count; });
      var total = donutValues.reduce(function(a,b){ return a + b; }, 0);
      dashChartInstances.donut = new Chart(donutEl, {
        type: 'doughnut',
        data: {
          labels: donutLabels,
          datasets: [{ data: donutValues, backgroundColor: donutColors.slice(0, donutValues.length), borderWidth: 0, borderRadius: 4 }]
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          cutout: '72%',
          plugins: { legend: { display: false }, tooltip: { enabled: true } }
        }
      });
      var paidCount = 0;
      statusData.forEach(function(s){ if (s.status === 'paid' || s.status === 'delivered') paidCount += s.count; });
      var pct = total > 0 ? Math.round(paidCount / total * 100) : 0;
      var center = document.getElementById('donutPercent');
      if (center) center.textContent = pct + '%';
    }

    var donutStats = document.getElementById('donutStats');
    if (donutStats) {
      var rows = statusData.slice(0, 4).map(function(s, i) {
        return '<div class="dash-donut-stat-row"><span class="stat-name" style="display:flex;align-items:center;gap:6px;"><span style="width:8px;height:8px;border-radius:50%;background:' + donutColors[i] + ';display:inline-block;"></span>' + __('orders.status_' + s.status) + '</span><span class="stat-val">' + s.count + '</span></div>';
      }).join('');
      donutStats.innerHTML = rows || '<p style="color:#9ca3af;font-size:13px;text-align:center;padding:20px 0;">No data</p>';
    }

    /* ── Bar Chart (Top Products) ── */
    var topData = d.topProducts || [];
    var barEl = document.getElementById('dashBarChart');
    if (barEl) {
      if (topData.length) {
        var barLabels = topData.map(function(p){ return p.en_name || p.name || ''; });
        var barSold = topData.map(function(p){ return p.sold; });
        dashChartInstances.bar = new Chart(barEl, {
          type: 'bar',
          data: {
            labels: barLabels,
            datasets: [{
              label: lang === 'en' ? 'Sold' : 'বিক্রি',
              data: barSold,
              backgroundColor: '#3b82f6',
              borderRadius: 6, barPercentage: 0.55
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af', font: { size: 11, family: 'Inter' } } },
              y: { grid: { display: false }, ticks: { color: '#374151', font: { size: 12, family: 'Inter', weight: 500 } } }
            }
          }
        });
      } else {
        var days2 = (d.dailyData || []).map(function(r){ return r.day ? r.day.slice(5) : ''; });
        var revData2 = (d.dailyData || []).map(function(r){ return r.revenue; });
        if (days2.length) {
          dashChartInstances.bar = new Chart(barEl, {
            type: 'bar',
            data: {
              labels: days2,
              datasets: [{ label: lang === 'en' ? 'Revenue' : 'রেভিনিউ', data: revData2, backgroundColor: '#3b82f6', borderRadius: 6, barPercentage: 0.55 }]
            },
            options: {
              responsive: true, maintainAspectRatio: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11, family: 'Inter' } } },
                y: { grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af', font: { size: 11, family: 'Inter' }, callback: function(v){ return taka(v); } } }
              }
            }
          });
        }
      }
    }
  }

  function renderRevenueHistory(d, lang) {
    var el = document.getElementById('dashRevenueHistory');
    if (!el) return;
    var orders = d.recentOrders || [];
    if (!orders.length) {
      el.innerHTML = '<p style="color:#9ca3af;font-size:13px;text-align:center;padding:20px 0;">' + (lang === 'en' ? 'No recent orders' : 'সাম্প্রতিক অর্ডার নেই') + '</p>';
      return;
    }
    var statusMap = { pending: 'pending', paid: 'completed', processing: 'pending', shipped: 'completed', delivered: 'completed', cancelled: 'failed' };
    var html = '<table class="dash-rev-table"><thead><tr><th>' + (lang === 'en' ? 'Order ID' : 'অর্ডার আইডি') + '</th><th>' + (lang === 'en' ? 'Customer' : 'গ্রাহক') + '</th><th>' + (lang === 'en' ? 'Total' : 'মোট') + '</th><th>' + (lang === 'en' ? 'Status' : 'অবস্থা') + '</th><th>' + (lang === 'en' ? 'Time' : 'সময়') + '</th></tr></thead><tbody>';
    orders.slice(0, 6).forEach(function(o) {
      var sCls = statusMap[(o.status || 'pending')] || 'pending';
      html += '<tr><td style="font-weight:600;color:#6366f1;">#' + o.id + '</td>' +
        '<td>' + esc(o.user_name || '') + '</td>' +
        '<td style="font-weight:600;color:#16a34a;">' + taka(o.total) + '</td>' +
        '<td><span class="dash-rev-status ' + sCls + '">' + __('orders.status_' + (o.status || 'pending')) + '</span></td>' +
        '<td style="color:#9ca3af;font-size:12px;">' + timeAgo(o.created_at) + '</td></tr>';
    });
    html += '</tbody></table>';
    el.innerHTML = html;
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

    ['pfName','pfEName','pfBrand','pfSku','pfPrice','pfPurchasePrice','pfCompare','pfStock','pfDesc','pfImages'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (id === 'pfName') el.value = data ? data.name || '' : '';
      else if (id === 'pfEName') el.value = data ? data.en_name || '' : '';
      else if (id === 'pfBrand') el.value = data ? data.brand || '' : '';
      else if (id === 'pfSku') el.value = data ? data.sku || '' : '';
      else if (id === 'pfPrice') el.value = data ? data.price || '' : '';
      else if (id === 'pfPurchasePrice') el.value = data ? data.purchase_price || 0 : 0;
      else if (id === 'pfCompare') el.value = data ? data.compare_price || '' : '';
      else if (id === 'pfStock') el.value = data ? data.stock || 0 : 10;
      else if (id === 'pfDesc') el.innerHTML = data ? data.description || '' : '';
      else if (id === 'pfImages') el.value = data && data.images ? JSON.stringify(data.images) : '[]';
    });
    document.getElementById('pfFeatured').checked = data ? !!data.featured : false;
    document.getElementById('pfHasSizes').checked = data ? !!data.has_sizes : false;
    toggleSizesField();
    if (modal) modal.dataset.editId = data ? data.id : '';
    renderImagePreviews();
    if (data && data.color_images) { setColorImages(typeof data.color_images === 'string' ? JSON.parse(data.color_images) : data.color_images); }
    var scImg = data ? (data.size_chart_image || '') : '';
    var scEl = document.getElementById('pfSizeChartImage');
    var scPreview = document.getElementById('pfSizeChartPreview');
    if (scEl) scEl.value = scImg;
    if (scPreview && scImg) scPreview.innerHTML = '<img src="' + esc(scImg) + '" style="max-width:200px;border-radius:8px;border:1px solid #ddd;">';
    renderColorImages();
    var colorArr = data && data.colors ? data.colors : [];
    var sizeArr = data && data.sizes ? data.sizes : [];
    colorArr.forEach(function(c) { if (c) addColorChip(c); });
    sizeArr.forEach(function(s) { if (s) addSizeChip(s); });
    renderVariantStockMatrix();
    if (data && data.id) {
      apiAdmin('GET', '/products/' + data.id + '/variants').then(function(variants) {
        if (variants && variants.length) {
          var map = {};
          variants.forEach(function(v) { map[(v.color || '') + '||' + (v.size || '')] = v.stock; });
          setVariantStocks(map);
        }
      });
    }
  };

  window.toggleSizesField = function() {
    var wrap = document.getElementById('pfSizesWrap');
    var scWrap = document.getElementById('pfSizeChartWrap');
    var checked = document.getElementById('pfHasSizes').checked;
    if (wrap) wrap.style.display = checked ? 'block' : 'none';
    if (scWrap) scWrap.style.display = checked ? 'block' : 'none';
    renderVariantStockMatrix();
  };

  function getColors() {
    var chips = document.querySelectorAll('#pfColorChips .chip');
    var arr = [];
    chips.forEach(function(c) { var t = c.dataset.value || c.textContent.replace('×','').trim(); if (t) arr.push(t); });
    return arr;
  }
  function getSizes() {
    if (!(document.getElementById('pfHasSizes') || {}).checked) return [];
    var chips = document.querySelectorAll('#pfSizeChips .chip');
    var arr = [];
    chips.forEach(function(c) { var t = c.dataset.value || c.textContent.replace('×','').trim(); if (t) arr.push(t); });
    return arr;
  }

  function renderChip(containerId, items, chipClass) {
    var wrap = document.getElementById(containerId);
    if (!wrap) return;
    wrap.querySelectorAll('.chip').forEach(function(c) { c.remove(); });
    var input = wrap.querySelector('.chip-input');
    items.forEach(function(val) {
      var chip = document.createElement('span');
      chip.className = 'chip ' + (chipClass || '');
      chip.dataset.value = val;
      chip.innerHTML = esc(val) + '<button type="button" class="chip-remove" onclick="this.parentElement.remove();renderVariantStockMatrix();renderColorImages();">×</button>';
      wrap.insertBefore(chip, input);
    });
  }

  window.addColorChip = function(val) {
    if (!val) return;
    var exist = getColors();
    if (exist.indexOf(val) !== -1) return;
    var wrap = document.getElementById('pfColorChips');
    var input = document.getElementById('pfColorInput');
    var chip = document.createElement('span');
    chip.className = 'chip color-chip';
    chip.dataset.value = val;
    chip.innerHTML = esc(val) + '<button type="button" class="chip-remove" onclick="this.parentElement.remove();renderVariantStockMatrix();renderColorImages();">×</button>';
    wrap.insertBefore(chip, input);
    renderVariantStockMatrix();
    renderColorImages();
  };

  window.addSizeChip = function(val) {
    if (!val) return;
    var exist = getSizes();
    if (exist.indexOf(val) !== -1) return;
    var wrap = document.getElementById('pfSizeChips');
    var input = wrap.querySelector('.chip-input');
    var chip = document.createElement('span');
    chip.className = 'chip size-chip';
    chip.dataset.value = val;
    chip.innerHTML = esc(val) + '<button type="button" class="chip-remove" onclick="this.parentElement.remove();renderVariantStockMatrix();">×</button>';
    wrap.insertBefore(chip, input);
    renderVariantStockMatrix();
  };

  window.addColorWithImage = function(fileInput) {
    var file = fileInput.files[0];
    if (!file) return;
    var colorName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    addColorChip(colorName);
    var t = localStorage.getItem('adminToken');
    var fd = new FormData();
    fd.append('image', file);
    fetch('/api/admin/upload', { method: 'POST', headers: { 'Authorization': 'Bearer ' + t }, body: fd })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (!d.url) return;
      var ci = getColorImages();
      if (!ci[colorName]) ci[colorName] = [];
      ci[colorName].push(d.url);
      setColorImages(ci);
      renderColorImages();
    });
    fileInput.value = '';
  };

  function updateTotalVariantStock() {
    var total = 0;
    var hasVariants = document.querySelectorAll('.pf-variant-stock').length > 0;
    document.querySelectorAll('.pf-variant-stock').forEach(function(inp) {
      total += parseInt(inp.value) || 0;
    });
    var el = document.getElementById('pfTotalVariantStock');
    if (el) el.textContent = total;
    var mainStock = document.getElementById('pfStock');
    var note = document.getElementById('pfStockNote');
    if (hasVariants) {
      if (mainStock) { mainStock.readOnly = true; mainStock.style.opacity = '0.6'; }
      if (note) note.style.display = 'inline';
    } else {
      if (mainStock) { mainStock.readOnly = false; mainStock.style.opacity = '1'; }
      if (note) note.style.display = 'none';
    }
    if (mainStock && hasVariants) mainStock.value = total;
  }

  function renderColorImagePreview(containerId, color) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var ci = getColorImages();
    var imgs = ci[color] || [];
    el.innerHTML = imgs.map(function(url, i) {
      return '<span class="ci-remove" onclick="removeColorImage(\'' + esc(color) + '\',' + i + ')"><img src="' + esc(url) + '"></span>';
    }).join('');
  }

  window.uploadColorImage = function(color, input) {
    if (!input.files || !input.files[0]) return;
    var t = localStorage.getItem('adminToken');
    var fd = new FormData();
    fd.append('image', input.files[0]);
    fetch('/api/admin/upload', { method: 'POST', headers: { 'Authorization': 'Bearer ' + t }, body: fd })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (!d.url) return;
      var ci = getColorImages();
      if (!ci[color]) ci[color] = [];
      ci[color].push(d.url);
      setColorImages(ci);
      var previewEl = document.getElementById('ciPreview_' + color);
      if (previewEl) renderColorImagePreview('ciPreview_' + color, color);
      else renderColorImages();
    });
  };

  window.removeColorImage = function(color, idx) {
    var ci = getColorImages();
    if (ci[color]) { ci[color].splice(idx, 1); if (!ci[color].length) delete ci[color]; }
    setColorImages(ci);
    var previewEl = document.getElementById('ciPreview_' + color);
    if (previewEl) renderColorImagePreview('ciPreview_' + color, color);
    else renderColorImages();
  };

  window.renderVariantStockMatrix = function() {
    var wrap = document.getElementById('pfVariantStockWrap');
    var matrix = document.getElementById('pfVariantStockMatrix');
    if (!wrap || !matrix) return;
    var colors = getColors();
    var sizes = getSizes();
    if (colors.length === 0 && sizes.length === 0) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';

    function imgBtnHtml(c) {
      var inputId = 'ciInput_' + c.replace(/[^a-zA-Z0-9]/g, '_');
      return '<label class="color-img-btn"><input type="file" accept="image/*" onchange="uploadColorImage(\'' + esc(c) + '\',this)"><span data-i18n="admin.image_upload">📷 Image</span></label>' +
        '<div class="color-img-preview" id="ciPreview_' + esc(c) + '"></div>';
    }

    if (colors.length > 0 && sizes.length > 0) {
      var html = '<table class="variant-table"><thead><tr><th data-i18n="admin.color_size_header">রং \ সাইজ</th>';
      sizes.forEach(function(s) { html += '<th>' + esc(s) + '</th>'; });
      html += '<th data-i18n="admin.image_upload">📷 Image</th></tr></thead><tbody>';
      colors.forEach(function(c) {
        html += '<tr><td>' + esc(c) + '</td>';
        sizes.forEach(function(s) {
          html += '<td><input type="number" class="pf-variant-stock" data-color="' + esc(c) + '" data-size="' + esc(s) + '" min="0" value="0"></td>';
        });
        html += '<td style="text-align:left;">' + imgBtnHtml(c) + '</td></tr>';
      });
      html += '</tbody></table>';
      matrix.innerHTML = html;
    } else if (colors.length > 0) {
      var html = '<table class="variant-table"><thead><tr><th data-i18n="admin.color">রং</th><th data-i18n="admin.stock">স্টক</th><th data-i18n="admin.image_upload">📷 Image</th></tr></thead><tbody>';
      colors.forEach(function(c) {
        html += '<tr><td>' + esc(c) + '</td>';
        html += '<td><input type="number" class="pf-variant-stock" data-color="' + esc(c) + '" data-size="" min="0" value="0"></td>';
        html += '<td style="text-align:left;">' + imgBtnHtml(c) + '</td></tr>';
      });
      html += '</tbody></table>';
      matrix.innerHTML = html;
    } else if (sizes.length > 0) {
      var html = '<table class="variant-table"><thead><tr><th data-i18n="admin.size">সাইজ</th><th data-i18n="admin.stock">স্টক</th></tr></thead><tbody>';
      sizes.forEach(function(s) {
        html += '<tr><td>' + esc(s) + '</td>';
        html += '<td><input type="number" class="pf-variant-stock" data-color="" data-size="' + esc(s) + '" min="0" value="0"></td>';
        html += '</tr>';
      });
      html += '</tbody></table>';
      matrix.innerHTML = html;
    }

    colors.forEach(function(c) { renderColorImagePreview('ciPreview_' + c, c); });
    matrix.querySelectorAll('.pf-variant-stock').forEach(function(inp) {
      inp.addEventListener('input', updateTotalVariantStock);
    });
    updateTotalVariantStock();
  };

  function collectVariantStocks() {
    var stocks = {};
    document.querySelectorAll('.pf-variant-stock').forEach(function(inp) {
      var c = inp.dataset.color || '';
      var s = inp.dataset.size || '';
      var key = c + '||' + s;
      stocks[key] = parseInt(inp.value) || 0;
    });
    return stocks;
  }

  function setVariantStocks(stocks) {
    if (!stocks) return;
    document.querySelectorAll('.pf-variant-stock').forEach(function(inp) {
      var c = inp.dataset.color || '';
      var s = inp.dataset.size || '';
      var key = c + '||' + s;
      if (stocks[key] !== undefined) inp.value = stocks[key];
    });
    updateTotalVariantStock();
  }

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

  window.uploadSizeChart = function(input) {
    if (!input.files || !input.files[0]) return;
    var fd = new FormData();
    fd.append('image', input.files[0]);
    var t = adminToken || localStorage.getItem('adminToken') || localStorage.getItem('token');
    fetch('/api/admin/upload', {
      method: 'POST',
      headers: t ? { 'Authorization': 'Bearer ' + t } : {},
      body: fd
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (!d.url) return;
      document.getElementById('pfSizeChartImage').value = d.url;
      document.getElementById('pfSizeChartPreview').innerHTML = '<img src="' + esc(d.url) + '" style="max-width:200px;border-radius:8px;border:1px solid #ddd;">';
    });
  };

  function renderImagePreviews() {
    var el = document.getElementById('pfPreview');
    if (!el) return;
    var arr = JSON.parse(document.getElementById('pfImages').value || '[]');
    el.innerHTML = arr.map(function(u, i) {
      return '<div style=\"position:relative;display:inline-block;\">' +
        '<img src=\"' + esc(u) + '\" style=\"width:80px;height:80px;object-fit:cover;border-radius:6px;border:1px solid var(--border);\">' +
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

  /* ── Per-Color Image Management ── */
  function renderColorImages() {
    var colors = getColors();
    var card = document.getElementById('pfColorImagesCard');
    var list = document.getElementById('pfColorImagesList');
    if (!card || !list) return;
    if (colors.length === 0) { card.style.display = 'none'; return; }
    card.style.display = 'block';
    var ci = getColorImages();
    list.innerHTML = colors.map(function(c) {
      var imgs = ci[c] || [];
      var preview = imgs.map(function(u, i) {
        return '<div style="position:relative;display:inline-block;margin:4px;">' +
          '<img src="' + esc(u) + '" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #ddd;">' +
          '<button type="button" onclick="removeColorImage(\'' + esc(c) + '\',' + i + ')" style="position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:50%;border:none;background:#e53935;color:#fff;cursor:pointer;font-size:11px;line-height:18px;text-align:center;">×</button></div>';
      }).join('');
      return '<div style="margin-bottom:10px;padding:8px;border:1px solid #e5e7eb;border-radius:6px;background:#fafafa;">' +
        '<div style="font-weight:600;font-size:13px;margin-bottom:6px;color:#333;">🎨 ' + esc(c) + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px;">' + preview +
        '<label style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border:1px dashed #999;border-radius:4px;cursor:pointer;font-size:12px;color:#666;background:#fff;">+ ছবি' +
        '<input type="file" accept="image/*" style="display:none;" onchange="uploadColorImage(\'' + esc(c) + '\', this)"></label>' +
        '</div></div>';
    }).join('');
  }
  window.renderColorImages = renderColorImages;

  function getColorImages() {
    var el = document.getElementById('pfColorImagesList');
    if (!el || !el.dataset.ci) return {};
    try { return JSON.parse(el.dataset.ci); } catch { return {}; }
  }
  function setColorImages(obj) {
    var el = document.getElementById('pfColorImagesList');
    if (el) el.dataset.ci = JSON.stringify(obj);
  }

  /* uploadColorImage / removeColorImage defined in renderVariantStockMatrix */

  /* ── Description Formatting ── */
  window.descFormat = function(cmd) {
    var editor = document.getElementById('pfDesc');
    if (!editor) return;
    editor.focus();
    switch (cmd) {
      case 'bold':      document.execCommand('bold', false, null); break;
      case 'italic':    document.execCommand('italic', false, null); break;
      case 'underline': document.execCommand('underline', false, null); break;
      case 'strike':    document.execCommand('strikeThrough', false, null); break;
      case 'h2':        document.execCommand('formatBlock', false, '<h2>'); break;
      case 'h3':        document.execCommand('formatBlock', false, '<h3>'); break;
      case 'ul':        document.execCommand('insertUnorderedList', false, null); break;
      case 'ol':        document.execCommand('insertOrderedList', false, null); break;
      case 'quote':     document.execCommand('formatBlock', false, '<blockquote>'); break;
      case 'hr':        document.execCommand('insertHorizontalRule', false, null); break;
      case 'left':      document.execCommand('justifyLeft', false, null); break;
      case 'center':    document.execCommand('justifyCenter', false, null); break;
      case 'link': {
        var url = prompt('URL লিখুন:', 'https://');
        if (!url) return;
        document.execCommand('createLink', false, url);
        break;
      }
      case 'image': {
        var imgUrl = prompt('ছবির URL লিখুন:', 'https://');
        if (!imgUrl) return;
        document.execCommand('insertImage', false, imgUrl);
        break;
      }
      case 'color': {
        var clr = prompt('রং লিখুন (e.g. red, #ff0000):', 'red');
        if (!clr) return;
        document.execCommand('foreColor', false, clr);
        break;
      }
    }
  };

  window.autoDescPreview = function() {};

  window.toggleDescPreview = function() {
    var btn = document.getElementById('descPreviewBtn');
    if (btn) btn.style.display = 'none';
  };

  window.saveProduct = function() {
      var data = {
        name: document.getElementById('pfName').value.trim(),
        en_name: document.getElementById('pfEName').value.trim(),
        category_id: document.getElementById('pfCategory').value,
        price: document.getElementById('pfPrice').value,
        purchase_price: document.getElementById('pfPurchasePrice').value || 0,
        compare_price: document.getElementById('pfCompare').value || null,
        stock: parseInt(document.getElementById('pfStock').value) || 0,
        description: document.getElementById('pfDesc').innerHTML,
        sku: document.getElementById('pfSku') ? document.getElementById('pfSku').value.trim() : '',
        images: JSON.parse(document.getElementById('pfImages').value || '[]'),
        brand: document.getElementById('pfBrand').value.trim(),
        has_sizes: document.getElementById('pfHasSizes').checked ? 1 : 0,
        featured: document.getElementById('pfFeatured').checked ? 1 : 0,
        active: 1,
        colors: getColors(),
        sizes: getSizes(),
        color_images: getColorImages(),
        size_chart_image: document.getElementById('pfSizeChartImage') ? document.getElementById('pfSizeChartImage').value || '' : ''
      };
      if (!data.name) { toast(__('toast.enter_name'), 'error'); return; }
      if (!data.price) { toast(__('toast.enter_price'), 'error'); return; }

      var params = new URLSearchParams(window.location.search);
      var editId = params.get('id') || ((document.getElementById('productModal') || {}).dataset || {}).editId || '';
      var method = editId ? 'PUT' : 'POST';
      var path = editId ? '/products/' + editId : '/products';
      data.variant_stocks = collectVariantStocks();

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
    var si = document.getElementById('productSearchInput');
    apiAdmin('GET', '/products').then(function(products) {
      var el = document.getElementById('productTableWrap');
      if (!el) return;
      if (products.error) { el.innerHTML = '<p style=\"color:var(--danger);\">' + esc(products.error) + '</p>'; return; }
      var q = (si || {}).value || '';
      if (q.indexOf('@') !== -1) { si.value = ''; q = ''; }
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
      var countWrap = document.getElementById('productCountWrap');
      if (countWrap) countWrap.innerHTML = '<div class="product-count">' + products.length + ' ' + __('admin.products') + '</div>';
      var html = '<table class="data-table"><thead><tr><th>' + __('admin.id') + '</th><th>' + __('admin.image') + '</th><th>' + __('admin.name') + '</th><th>' + __('admin.brand') + '</th><th>' + __('admin.category') + '</th><th>' + __('admin.price') + '</th><th>' + __('admin.stock') + '</th><th>' + __('admin.featured') + '</th><th class="actions-cell">' + __('admin.actions') + '</th></tr></thead><tbody>';
      products.forEach(function(p) {
        var img = window.productImage(p);
        html += '<tr>' +
          '<td class="cell-id">' + p.id + '</td>' +
          '<td class="cell-img">' + (img ? '<img src=\"' + esc(img) + '\">' : '<span class="no-img">-</span>') + '</td>' +
          '<td class="cell-name"><strong>' + esc(p.name) + '</strong>' + (p.en_name ? '<br><span class="cell-en-name">' + esc(p.en_name) + '</span>' : '') + '</td>' +
          '<td class="cell-brand">' + (p.brand ? esc(p.brand) : '<span class="text-muted">-</span>') + '</td>' +
          '<td class="cell-cat">' + esc(p.category_name || '') + '</td>' +
          '<td class="cell-price">' + taka(p.price) + '</td>' +
          '<td class="cell-stock">' + (p.stock > 0 ? '<span class="stock-badge in-stock">' + (p.stock || 0) + '</span>' : '<span class="stock-badge out-of-stock">' + __('admin.out_of_stock') + '</span>') + '</td>' +
          '<td class="cell-feat">' + (p.featured ? '<span class="feat-badge">★ ' + __('admin.featured') + '</span>' : '-') + '</td>' +
          '<td class="actions-cell">' +
          '<button class=\"btn-icon\" onclick=\"window.location=\'/admin/product-new.html?id=' + p.id + '\'\" title=\"' + __('admin.edit') + '\">✏️</button>' +
          '<button class=\"btn-icon btn-icon-danger\" onclick=\"deleteProduct(' + p.id + ')\" title=\"' + __('admin.delete') + '\">🗑️</button>' +
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
    modal.classList.add('is-show');
    document.getElementById('catModalTitle').textContent = data ? __('admin.edit') : __('admin.new_category');
    document.getElementById('cfName').value = data ? data.name : '';
    document.getElementById('cfEName').value = data ? data.en_name || '' : '';
    document.getElementById('cfDesc').value = data ? data.description || '' : '';
    document.getElementById('cfIcon').value = data ? data.image || '' : '';
    modal.dataset.editId = data ? data.id : '';
    modal.dataset.cfImage = '';
    var preview = document.getElementById('cfImagePreview');
    var placeholder = document.getElementById('cfUploadPlaceholder');
    var img = data ? data.image : '';
    if (img && img.indexOf('/') === 0) {
      preview.src = img;
      preview.style.display = '';
      placeholder.style.display = 'none';
      modal.dataset.cfImage = img;
    } else {
      preview.style.display = 'none';
      placeholder.style.display = '';
    }
    document.getElementById('cfImageInput').value = '';
    renderCfIconPresets(data ? data.image || '' : '');
  };

  window.closeCategoryForm = function() {
    document.getElementById('categoryModal').classList.remove('is-show');
  };

  window.cfUploadImage = function(input) {
    if (!input.files || !input.files[0]) return;
    var fd = new FormData();
    fd.append('image', input.files[0]);
    var token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    fetch('/api/admin/upload?type=category', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, body: fd })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.error) { toast(res.error, 'error'); return; }
        var modal = document.getElementById('categoryModal');
        modal.dataset.cfImage = res.url;
        var preview = document.getElementById('cfImagePreview');
        var placeholder = document.getElementById('cfUploadPlaceholder');
        preview.src = res.url;
        preview.style.display = '';
        placeholder.style.display = 'none';
        document.getElementById('cfIcon').value = '';
        renderCfIconPresets('');
      });
  };

  var cfIconEmojis = ['📱','💻','⌚','👗','👟','🏠','📚','🎮','🔧','🎵','🖨️','📷','🧴','🎒','⚽','🧸','🛒','💊','🍽️','🚗','✈️','💍','🎨','🏗️'];
  function renderCfIconPresets(current) {
    var wrap = document.getElementById('cfIconPresets');
    if (!wrap) return;
    wrap.innerHTML = cfIconEmojis.map(function(e) {
      return '<button type="button" class="cf-icon-preset' + (current === e ? ' active' : '') + '" onclick="pickCfIcon(\'' + e + '\')">' + e + '</button>';
    }).join('');
  }
  window.pickCfIcon = function(emoji) {
    document.getElementById('cfIcon').value = emoji;
    renderCfIconPresets(emoji);
  };

  window.saveCategory = function() {
    var modal = document.getElementById('categoryModal');
    var emojiVal = document.getElementById('cfIcon').value.trim();
    var uploadedImage = modal.dataset.cfImage || '';
    var iconValue = uploadedImage || emojiVal;
    var data = {
      name: document.getElementById('cfName').value.trim(),
      en_name: document.getElementById('cfEName').value.trim(),
      description: document.getElementById('cfDesc').value.trim(),
      image: iconValue
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
      var html = '<div class="product-count">' + cats.length + ' ' + __('admin.categories') + '</div>' +
        '<table id="catTable" class="data-table"><thead><tr><th style="width:36px;"></th><th>' + __('admin.id') + '</th><th>Icon</th><th>' + __('admin.name') + '</th><th>EN Name</th><th>Slug</th><th>পণ্য সংখ্যা</th><th class="actions-cell">' + __('admin.actions') + '</th></tr></thead><tbody>';
      cats.forEach(function(c, i) {
        html += '<tr draggable="true" data-id="' + c.id + '">' +
          '<td class="cell-drag">\u2630</td>' +
          '<td class="cell-id">' + c.id + '</td><td style="text-align:center;font-size:22px;">' + (c.image && c.image.indexOf('/') === 0 ? '<img src="' + esc(c.image) + '" style="width:32px;height:32px;border-radius:6px;object-fit:cover;">' : (c.image || '📁')) + '</td><td class="cell-name"><strong>' + esc(c.name) + '</strong></td><td class="cell-cat">' + esc(c.en_name || '<span class="text-muted">-</span>') + '</td><td class="cell-slug">' + esc(c.slug) + '</td>' +
          '<td class="cell-count"><span class="stock-badge in-stock">' + (c.product_count || 0) + '</span></td>' +
          '<td class="actions-cell">' +
          '<button class="btn-icon" onclick="showCategoryForm(' + JSON.stringify(c).replace(/\"/g,'&quot;') + ')" title="' + __('admin.edit') + '">\u270F\uFE0F</button>' +
          '<button class="btn-icon btn-icon-danger" onclick="deleteCategory(' + c.id + ')" title="' + __('admin.delete') + '">\uD83D\uDDD1\uFE0F</button></td></tr>';
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
    var wrap = document.getElementById('usersAdminWrap');
    if (wrap) wrap.style.display = 'block';
    apiAdmin('GET', '/users?role=user').then(function(users) {
      var el = document.getElementById('usersTableWrap');
      if (!el) return;
      if (!users || users.length === 0) {
        el.innerHTML = '<p style="color:var(--gray);">' + __('admin.no_users') + '</p>';
        return;
      }
      var countEl = document.getElementById('userCount');
      if (countEl) countEl.textContent = users.length + ' ' + __('admin.users');
      var html = '<table class="data-table"><thead><tr>' +
        '<th>' + __('admin.id') + '</th>' +
        '<th>' + __('admin.name') + '</th>' +
        '<th>Email</th>' +
        '<th>Phone</th>' +
        '<th>' + __('admin.role') + '</th>' +
        '<th>' + __('admin.date') + '</th>' +
        '<th>' + __('admin.actions') + '</th>' +
        '</tr></thead><tbody>';
      var currentUserId = null;
      try { var tk = localStorage.getItem('token'); if (tk) { var payload = JSON.parse(atob(tk.split('.')[1])); currentUserId = payload.id; } } catch(e) {}
      users.forEach(function(u) {
        var role = (u.role || '').toLowerCase();
        var roleBadge = role === 'admin'
          ? '<span style="background:#7c3aed;color:#fff;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600;">' + __('admin.brand_admin') + '</span>'
          : '<span style="background:#e5e7eb;color:#374151;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:500;">ইউজার</span>';
        var actions = '';
        if (u.id !== currentUserId) {
          if (role === 'admin') {
            actions += '<button class="btn btn-outline btn-sm" onclick="toggleUserRole(' + u.id + ',\'admin\')" style="font-size:12px;padding:4px 10px;">' + __('admin.demote') + '</button>';
          }
          actions += ' <button class="btn btn-danger btn-sm" onclick="deleteUser(' + u.id + ')" style="font-size:12px;padding:4px 10px;">' + __('admin.delete') + '</button>';
        } else {
          actions = '<span style="color:var(--gray);font-size:12px;">' + __('admin.you') + '</span>';
        }
        html += '<tr>' +
          '<td class="cell-id">' + u.id + '</td>' +
          '<td><strong>' + esc(u.name || '') + '</strong></td>' +
          '<td style="color:#4b5563;">' + esc(u.email || '') + '</td>' +
          '<td style="color:#6b7280;">' + esc(u.phone || '') + '</td>' +
          '<td>' + roleBadge + '</td>' +
          '<td style="color:#6b7280;font-size:13px;">' + (u.created_at || '') + '</td>' +
          '<td>' + actions + '</td>' +
          '</tr>';
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    });
  }

  /* ---- Orders ---- */
  window.resetOrderDateFilter = function() {
    var f = document.getElementById('orderDateFrom');
    var t = document.getElementById('orderDateTo');
    var pf = document.getElementById('paymentFilter');
    if (f) f.value = '';
    if (t) t.value = '';
    if (pf) pf.value = '';
    loadAdminOrders();
  };

  window.loadAdminOrders = function() {
    var status = document.getElementById('statusFilter');
    var filter = status ? status.value : '';
    var payFilter = document.getElementById('paymentFilter');
    var pay = payFilter ? payFilter.value : '';
    var params = [];
    if (filter) params.push('status=' + filter);
    if (pay) params.push('payment_method=' + pay);
    var dateFrom = document.getElementById('orderDateFrom');
    var dateTo = document.getElementById('orderDateTo');
    if (dateFrom && dateFrom.value) params.push('date_from=' + dateFrom.value);
    if (dateTo && dateTo.value) params.push('date_to=' + dateTo.value);
    var query = params.length ? '?' + params.join('&') : '';
    apiAdmin('GET', '/orders' + query).then(function(orders) {
      var el = document.getElementById('ordersTableWrap');
      if (!el) return;
      if (!orders || orders.length === 0) {
        var countWrapEmpty = document.getElementById('orderCountWrap');
        if (countWrapEmpty) countWrapEmpty.innerHTML = '';
        el.innerHTML = '<p style=\"color:var(--gray);\">' + __('admin.no_orders') + '</p>';
        return;
      }
      var countWrap = document.getElementById('orderCountWrap');
      if (countWrap) countWrap.innerHTML = '<span class="product-count">' + orders.length + ' ' + __('admin.orders') + '</span>';
      var html = '<table class="data-table"><thead><tr>' +
        '<th>' + __('admin.id') + '</th>' +
        '<th>' + __('admin.customer') + '</th>' +
        '<th>' + __('admin.items') + '</th>' +
        '<th>' + __('admin.color_header') + '</th>' +
        '<th>' + __('admin.size_header') + '</th>' +
        '<th>' + __('orders.total') + '</th>' +
        '<th>' + __('admin.status') + '</th>' +
        '<th>' + __('admin.payment') + '</th>' +
        '<th>' + __('admin.date') + '</th>' +
        '<th>' + __('admin.actions') + '</th>' +
        '</tr></thead><tbody>';
      orders.forEach(function(o) {
        var items = o.items || [];
        var productNames = items.map(function(item) {
          return esc(item.name) + (item.quantity > 1 ? ' x' + item.quantity : '');
        }).join(', ');
        var colorHtml = items.map(function(item) {
          if (item.color) return '<span style="display:inline-block;background:#ede9fe;color:#6d28d9;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;margin:1px 2px;">🎨 ' + esc(item.color) + '</span>';
          return '<span style="color:#9ca3af;">—</span>';
        }).join('<br>');
        var sizeHtml = items.map(function(item) {
          if (item.size) return '<span style="display:inline-block;background:#dbeafe;color:#1d4ed8;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;margin:1px 2px;">📐 ' + esc(item.size) + '</span>';
          return '<span style="color:#9ca3af;">—</span>';
        }).join('<br>');
        var statusCls = (o.status || 'pending').replace(/\s+/g, '');
        var payCls = (o.payment_status || '').toLowerCase() === 'paid' ? 'in-stock' : 'out-of-stock';
        var payLabels = { cod: 'COD', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', ucash: 'UCash', visa: 'Visa', sslcommerz: 'SSLCommerz' };
        var payMethod = payLabels[o.payment_method] || o.payment_method || '-';
        var payStatusText = (o.payment_status || '').toLowerCase() === 'paid' ? __('orders.status_paid') : (o.payment_status === 'unpaid' ? __('orders.status_pending') : o.payment_status || '-');
        html += '<tr>' +
          '<td class="cell-id">#' + o.id + '</td>' +
          '<td><strong>' + esc(o.user_name || '') + '</strong></td>' +
          '<td style="max-width:200px;font-size:13px;color:#4b5563;">' + productNames + '</td>' +
          '<td style="font-size:12px;max-width:100px;">' + colorHtml + '</td>' +
          '<td style="font-size:12px;max-width:100px;">' + sizeHtml + '</td>' +
          '<td class="cell-price">' + taka(o.total) + '</td>' +
          '<td><span class="stock-badge ' + statusCls + '-badge" style="display:inline-block;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700;">' + __('orders.status_' + (o.status || 'pending')) + '</span></td>' +
          '<td><span class="stock-badge ' + payCls + '">' + payMethod + ' (' + payStatusText + ')</span></td>' +
          '<td style="color:#6b7280;font-size:13px;">' + timeAgo(o.created_at) + '</td>' +
          '<td class="actions-cell">' +
          (o.status === 'cancel_requested'
            ? '<button onclick=\"updateOrderStatus(' + o.id + ', \'cancelled\')\" style=\"padding:6px 12px;border:none;border-radius:8px;font-size:12px;font-weight:700;background:#ef4444;color:#fff;cursor:pointer;\">✓ বাতিল confirm</button> <button onclick=\"updateOrderStatus(' + o.id + ', \'pending\')\" style=\"padding:6px 12px;border:none;border-radius:8px;font-size:12px;font-weight:700;background:#10b981;color:#fff;cursor:pointer;\">↩ পুনরুদ্ধার</button>'
            : '<select onchange=\"updateOrderStatus(' + o.id + ', this.value)\" style=\"padding:6px 10px;border:1.5px solid #e4e4e7;border-radius:8px;font-size:13px;background:#fff;\">' +
          '<option value=\"\">' + __('admin.update') + '</option>' +
          '<option value=\"paid\">Paid</option>' +
          '<option value=\"processing\">Processing</option>' +
          '<option value=\"shipped\">Shipped</option>' +
          '<option value=\"delivered\">Delivered</option>' +
          '<option value=\"cancelled\">Cancelled</option>' +
          '</select>'
          ) +
          ' <button class="btn-icon" onclick="showOrderMemo(' + o.id + ')" title="Memo">🧾</button>' +
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

  window.downloadOrdersExcel = function() {
    var status = document.getElementById('statusFilter');
    var filter = status ? status.value : '';
    var payFilter = document.getElementById('paymentFilter');
    var pay = payFilter ? payFilter.value : '';
    var params = [];
    if (filter) params.push('status=' + filter);
    if (pay) params.push('payment_method=' + pay);
    var dateFrom = document.getElementById('orderDateFrom');
    var dateTo = document.getElementById('orderDateTo');
    if (dateFrom && dateFrom.value) params.push('date_from=' + dateFrom.value);
    if (dateTo && dateTo.value) params.push('date_to=' + dateTo.value);
    var query = params.length ? '?' + params.join('&') : '';
    apiAdmin('GET', '/orders' + query).then(function(orders) {
      if (!orders || orders.length === 0) { toast(__('admin.no_orders'), 'error'); return; }
      var lang = window.getLang ? getLang() : 'bn';
      var rows = [];
      rows.push(['ID', 'Customer', 'Phone', 'District', 'Items', 'Qty', 'Total', 'Status', 'Payment Method', 'Payment Status', 'Date']);
      orders.forEach(function(o) {
        var items = (o.items || []).map(function(i) { return i.name + (i.color ? ' (' + i.color + ')' : '') + (i.size ? ' (' + i.size + ')' : ''); }).join(', ');
        var qty = (o.items || []).reduce(function(s, i) { return s + i.quantity; }, 0);
        var statusLabels = { pending: 'Pending', paid: 'Paid', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', cancel_requested: 'Cancel Requested' };
        var payLabels = { cod: 'COD', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', ucash: 'UCash', visa: 'Visa', sslcommerz: 'SSLCommerz' };
        var date = o.created_at ? new Date(o.created_at).toLocaleDateString('en-US') : '';
        rows.push([
          '#' + o.id,
          o.customer_name || o.user_name || '',
          o.phone || '',
          (o.district || '') + (o.upazila ? ', ' + o.upazila : ''),
          items,
          qty,
          o.total,
          statusLabels[o.status] || o.status,
          payLabels[o.payment_method] || o.payment_method || '-',
          o.payment_status || '-',
          date
        ]);
      });
      var csv = rows.map(function(r) { return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
      var bom = '\uFEFF';
      var blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'orders_' + (filter || 'all') + '_' + new Date().toISOString().slice(0, 10) + '.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast(__('admin.download_success'));
    });
  };

  window.downloadProductsExcel = function() {
    apiAdmin('GET', '/products').then(function(products) {
      if (!products || products.length === 0) { toast(__('admin.no_products'), 'error'); return; }
      var rows = [];
      rows.push(['ID', 'Name (BN)', 'Name (EN)', 'Category', 'Brand', 'Price', 'Purchase Price', 'Compare Price', 'Stock', 'Colors', 'Sizes', 'Featured', 'Active']);
      products.forEach(function(p) {
        rows.push([
          p.id,
          p.name || '',
          p.en_name || '',
          p.category_name || '',
          p.brand || '',
          p.price,
          p.purchase_price || 0,
          p.compare_price || '',
          p.stock || 0,
          (p.colors || []).join(', '),
          (p.sizes || []).join(', '),
          p.featured ? 'Yes' : 'No',
          p.active ? 'Yes' : 'No'
        ]);
      });
      var csv = rows.map(function(r) { return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
      var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'products_' + new Date().toISOString().slice(0, 10) + '.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast(__('admin.download_success'));
    });
  };

  window.showOrderMemo = function(orderId) {
    apiAdmin('GET', '/orders?status=').then(function(orders) {
      var order = null;
      for (var i = 0; i < orders.length; i++) { if (orders[i].id === orderId) { order = orders[i]; break; } }
      if (!order) { toast(__('toast.not_found'), 'error'); return; }
      var lang = window.getLang ? window.getLang() : 'bn';
      var items = order.items || [];
      var itemsHtml = items.map(function(item) {
        var variantTags = '';
        if (item.color) variantTags += '<span style="display:inline-block;background:#ede9fe;color:#6d28d9;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;margin:1px 2px;">🎨 ' + esc(item.color) + '</span>';
        if (item.size) variantTags += '<span style="display:inline-block;background:#dbeafe;color:#1d4ed8;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;margin:1px 2px;">📐 ' + esc(item.size) + '</span>';
        return '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">' + esc(item.name) + '</td><td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;">' + (variantTags || '—') + '</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">' + item.quantity + '</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">' + taka(item.price) + '</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">' + taka(item.price * item.quantity) + '</td></tr>';
      }).join('');
      var title = lang === 'en' ? 'Order Memo' : 'অর্ডার মেমো';
      var info = [
        { label: lang === 'en' ? 'Order ID' : 'অর্ডার আইডি', value: '#' + order.id },
        { label: lang === 'en' ? 'Customer' : 'গ্রাহক', value: order.user_name || '' },
        { label: lang === 'en' ? 'Phone' : 'ফোন', value: order.phone || '-' },
        { label: lang === 'en' ? 'Address' : 'ঠিকানা', value: order.shipping_address || '-' },
        { label: lang === 'en' ? 'Payment' : 'পেমেন্ট', value: order.payment_method || '-' },
        { label: lang === 'en' ? 'Date' : 'তারিখ', value: order.created_at ? new Date(order.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD') : '-' }
      ];
      var infoHtml = info.map(function(f) { return '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:14px;"><span style="color:#666;">' + f.label + ':</span><span style="font-weight:500;">' + f.value + '</span></div>'; }).join('');
      var qrData = 'Order: #' + order.id + '\nCustomer: ' + (order.user_name || '') + '\nPhone: ' + (order.phone || '') + '\nTotal: ' + taka(order.total) + '\nDate: ' + (order.created_at || '');
      var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(qrData);
      var modal = document.getElementById('orderMemoModal');
      var content = document.getElementById('memoContent');
      if (!modal || !content) return;
      content.innerHTML =
        '<div id="memoPrintArea" style="font-family:var(--font-bn);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #1a73e8;">' +
            '<h2 style="margin:0;font-size:20px;">' + title + '</h2>' +
            '<div style="text-align:right;font-size:12px;color:#666;">' + (order.created_at ? new Date(order.created_at).toLocaleString() : '') + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:20px;">' +
            '<div style="flex:1;">' + infoHtml + '</div>' +
            '<div style="flex-shrink:0;text-align:center;"><img src="' + qrUrl + '" alt="QR" style="width:120px;height:120px;border:1px solid #ddd;border-radius:4px;"><div style="font-size:10px;color:#999;margin-top:4px;">' + (lang === 'en' ? 'Scan for details' : 'বিস্তারিত জানতে স্ক্যান করুন') + '</div></div>' +
          '</div>' +
          '<h3 style="margin:16px 0 8px;font-size:16px;">' + __('admin.items_label') + '</h3>' +
          '<table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="background:#f5f5f5;"><th style="padding:6px 8px;text-align:left;">' + __('admin.product_label') + '</th><th style="padding:6px 8px;text-align:left;">' + __('admin.variant') + '</th><th style="padding:6px 8px;text-align:center;">' + __('admin.qty') + '</th><th style="padding:6px 8px;text-align:right;">' + __('admin.price_label') + '</th><th style="padding:6px 8px;text-align:right;">' + __('admin.total_label') + '</th></tr></thead><tbody>' + itemsHtml + '</tbody></table>' +
          '<div style="text-align:right;margin-top:8px;font-size:16px;font-weight:700;padding-top:8px;border-top:2px solid #333;">' + __('admin.grand_total') + ': ' + taka(order.total) + '</div>' +
          (order.note ? '<div style="margin-top:8px;padding:8px;background:#fffbe6;border-radius:4px;font-size:13px;"><strong>' + __('admin.note_label') + ': </strong>' + esc(order.note) + '</div>' : '') +
          '<div style="margin-top:16px;text-align:center;font-size:11px;color:#999;border-top:1px solid #ddd;padding-top:8px;">' + (lang === 'en' ? 'Thank you for your order!' : 'আপনার অর্ডারের জন্য ধন্যবাদ!') + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end;">' +
          '<button class="btn btn-primary" onclick="printMemo()">🖨️ ' + (lang === 'en' ? 'Print / PDF' : 'প্রিন্ট / PDF') + '</button>' +
          '<button class="btn btn-outline" onclick="closeMemo()">' + (lang === 'en' ? 'Close' : 'বন্ধ') + '</button>' +
        '</div>';
      modal.style.display = 'block';
    });
  };

  window.printMemo = function() {
    var printContent = document.getElementById('memoPrintArea');
    if (!printContent) return;
    var win = window.open('', '_blank');
    if (!win) { alert('Pop-up blocked! Please allow pop-ups.'); return; }
    win.document.write('<html><head><title>Order Memo</title><style>body{font-family:Arial, sans-serif;padding:40px;max-width:600px;margin:0 auto;}table{width:100%;border-collapse:collapse;}th,td{padding:8px;text-align:left;}th{background:#f5f5f5;}</style></head><body>' + printContent.innerHTML + '</body></html>');
    win.document.close();
    win.focus();
    win.print();
  };

  window.closeMemo = function() {
    var modal = document.getElementById('orderMemoModal');
    if (modal) modal.style.display = 'none';
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
      setThemeFields(s);
      setTextFields(s);
      loadPaymentSettings(s);
      loadHeaderSettings(s);
      if (s.delivery_inside_dhaka) document.getElementById('settingDcInside').value = s.delivery_inside_dhaka;
      if (s.delivery_outside_dhaka) document.getElementById('settingDcOutside').value = s.delivery_outside_dhaka;
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
      var bhEl = document.getElementById('settingBannerHeight');
      if (bhEl && s.banner_height) bhEl.value = s.banner_height;
      if (typeof footerCols !== 'undefined') {
        try {
          footerCols = s.footer_content ? JSON.parse(s.footer_content) : [];
        } catch(e) { footerCols = []; }
        if (footerCols.length === 0) {
          footerCols = [
            { title: 'গ্রাহক সেবা', titleEn: 'Customer Service', links: [
              { text: 'সাহায্য কেন্দ্র', textEn: 'Help Center', url: '#' },
              { text: 'কিভাবে কিনবেন', textEn: 'How to Buy', url: '#' },
              { text: 'শর্তাবলী', textEn: 'Terms', url: '#' }
            ]},
            { title: 'ইশপ', titleEn: 'Brand', links: [
              { text: 'আমাদের সম্পর্কে', textEn: 'About Us', url: '#' },
              { text: 'ব্লগ', textEn: 'Blog', url: '#' },
              { text: 'সেলার হন', textEn: 'Become a Seller', url: '#' }
            ]},
            { title: 'পেমেন্ট মেথড', titleEn: 'Payment Methods', type: 'payments', links: [] }
          ];
        }
        if (typeof renderFooterEditor === 'function') renderFooterEditor();
      }
    });
  }

  function setThemeFields(s) {
    var pairs = [
      ['settingHeaderBg', 'settingHeaderBgText', 'header_bg', '#1a73e8'],
      ['settingHeaderTextColor', 'settingHeaderTextColorText', 'header_text_color', '#ffffff'],
      ['settingBodyBg', 'settingBodyBgText', 'body_bg', '#f5f5f5'],
      ['settingPrimaryColor', 'settingPrimaryColorText', 'primary_color', '#1a73e8'],
      ['settingFooterBg', 'settingFooterBgText', 'footer_bg', '#1f2937'],
      ['settingFooterTextColor', 'settingFooterTextColorText', 'footer_text_color', '#9ca3af']
    ];
    pairs.forEach(function(p) {
      var val = s[p[2]] || p[3];
      var colorInput = document.getElementById(p[0]);
      var textInput = document.getElementById(p[1]);
      if (colorInput) colorInput.value = val;
      if (textInput) textInput.value = val;
    });
    var cr = document.getElementById('settingFooterCopyright');
    if (cr && s.footer_copyright) cr.value = s.footer_copyright;
  }

  function setTextFields(s) {
    var pairs = [
      ['settingTextFlashTitleBn', 'text_flash_title_bn'],
      ['settingTextFlashTitleEn', 'text_flash_title_en'],
      ['settingTextFlashAllBn', 'text_flash_all_bn'],
      ['settingTextFlashAllEn', 'text_flash_all_en'],
      ['settingTextFlashAllLink', 'text_flash_all_link'],
      ['settingTextCategoriesTitleBn', 'text_categories_title_bn'],
      ['settingTextCategoriesTitleEn', 'text_categories_title_en'],
      ['settingTextJfyTitleBn', 'text_jfy_title_bn'],
      ['settingTextJfyTitleEn', 'text_jfy_title_en']
    ];
    pairs.forEach(function(p) {
      var el = document.getElementById(p[0]);
      if (el && s[p[1]]) el.value = s[p[1]];
    });
  }

  function loadPaymentSettings(s) {
    var fields = [
      ['settingSslStoreId', 'sslcommerz_store_id'],
      ['settingSslStorePass', 'sslcommerz_store_pass'],
      ['settingSslSandbox', 'sslcommerz_sandbox'],
      ['settingSslBaseUrl', 'sslcommerz_base_url']
    ];
    fields.forEach(function(f) {
      var el = document.getElementById(f[0]);
      if (el && s[f[1]] !== undefined && s[f[1]] !== '') el.value = s[f[1]];
    });
    var baseUrl = (s.sslcommerz_base_url || window.location.origin).replace(/\/$/, '');
    var urls = [
      ['sslSuccessUrl', '/api/payment/success'],
      ['sslFailUrl', '/api/payment/fail'],
      ['sslCancelUrl', '/api/payment/cancel'],
      ['sslIpnUrl', '/api/payment/ipn']
    ];
    urls.forEach(function(u) {
      var el = document.getElementById(u[0]);
      if (el) el.textContent = baseUrl + u[1];
    });
  }

  function loadHeaderSettings(s) {
    if (document.getElementById('settingHeaderSearchBn')) {
      document.getElementById('settingHeaderSearchBn').value = s.header_search_placeholder_bn || '';
      document.getElementById('settingHeaderSearchEn').value = s.header_search_placeholder_en || '';
      document.getElementById('settingHeaderShowSearch').checked = s.header_show_search !== '0';
      document.getElementById('settingHeaderShowHome').checked = s.header_show_home !== '0';
      document.getElementById('settingHeaderShowProducts').checked = s.header_show_products !== '0';
      document.getElementById('settingHeaderShowCart').checked = s.header_show_cart !== '0';
      document.getElementById('settingHeaderShowOrders').checked = s.header_show_orders === '1';
      document.getElementById('settingHeaderShowAdmin').checked = s.header_show_admin !== '0';
      document.getElementById('settingHeaderShowLang').checked = s.header_show_lang !== '0';
      document.getElementById('settingHeaderShowAuth').checked = s.header_show_auth !== '0';
      document.getElementById('settingHeaderPadding').value = s.header_padding || '';
      document.getElementById('settingHeaderCustomNavLabelBn').value = s.header_custom_nav_label_bn || '📄 পেজ ▾';
      document.getElementById('settingHeaderCustomNavLabelEn').value = s.header_custom_nav_label_en || '📄 Pages ▾';
      if (typeof customLinks !== 'undefined') {
        try {
          customLinks = s.header_custom_links ? JSON.parse(s.header_custom_links) : [];
        } catch(e) { customLinks = []; }
        if (typeof renderCustomLinksEditor === 'function') renderCustomLinksEditor();
      }
    }
  }

  var customLinks = [];
  var pageOptions = [
    { value: '/about.html', label: 'আমাদের সম্পর্কে / About' },
    { value: '/blog.html', label: 'ব্লগ / Blog' },
    { value: '/privacy.html', label: 'প্রাইভেসি / Privacy' },
    { value: '/terms.html', label: 'শর্তাবলী / Terms' },
    { value: '/refund.html', label: 'রিফান্ড / Refund' },
    { value: '/how-to-buy.html', label: 'কিনবেন কিভাবে / How to Buy' },
    { value: '/help.html', label: 'সাহায্য / Help' },
    { value: '/seller.html', label: 'সেলার / Seller' },
    { value: '/app.html', label: 'অ্যাপ / App' }
  ];

  window.renderCustomLinksEditor = function() {
    var el = document.getElementById('customLinksEditor');
    if (!el) return;
    if (!customLinks.length) {
      el.innerHTML = '<p style="color:#9ca3af;font-size:13px;text-align:center;padding:12px;">কোনো কাস্টম লিংক নেই</p>';
      return;
    }
    el.innerHTML = customLinks.map(function(link, i) {
      var opts = pageOptions.map(function(p) {
        return '<option value="' + p.value + '" ' + (link.url === p.value ? 'selected' : '') + '>' + p.label + '</option>';
      }).join('');
      return '<div style="display:flex;gap:8px;align-items:center;padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;">' +
        '<input type="text" value="' + esc(link.icon || '') + '" placeholder="📱" style="width:48px;padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:16px;text-align:center;background:#fff;">' +
        '<input type="text" value="' + esc(link.labelBn || '') + '" placeholder="বাংলা লেবেল" style="flex:1;padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;background:#fff;">' +
        '<input type="text" value="' + esc(link.labelEn || '') + '" placeholder="English label" style="flex:1;padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;background:#fff;">' +
        '<select style="flex:1;padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;background:#fff;">' +
        '<option value="">লিংক বাছাই</option>' + opts + '</select>' +
        '<label style="display:flex;align-items:center;gap:4px;font-size:12px;color:#6b7280;cursor:pointer;">' +
        '<input type="checkbox" ' + (link.show !== false ? 'checked' : '') + ' style="width:16px;height:16px;"> দেখান</label>' +
        '<button onclick="removeCustomLink(' + i + ')" style="padding:6px 10px;border:none;background:#fee2e2;color:#dc2626;border-radius:6px;cursor:pointer;font-size:14px;">✕</button>' +
        '</div>';
    }).join('');
  };

  window.addCustomLink = function() {
    customLinks.push({ icon: '📄', labelBn: '', labelEn: '', url: '', show: true });
    renderCustomLinksEditor();
  };

  window.removeCustomLink = function(i) {
    customLinks.splice(i, 1);
    renderCustomLinksEditor();
  };

  function collectCustomLinks() {
    var el = document.getElementById('customLinksEditor');
    if (!el) return customLinks;
    var rows = el.children;
    var result = [];
    for (var i = 0; i < rows.length; i++) {
      var inputs = rows[i].querySelectorAll('input, select');
      if (inputs.length >= 5) {
        result.push({
          icon: inputs[0].value || '📄',
          labelBn: inputs[1].value || '',
          labelEn: inputs[2].value || '',
          url: inputs[3].value || '',
          show: inputs[4].checked
        });
      }
    }
    customLinks = result;
    return result;
  }

  window.saveHeaderSettings = function() {
    var links = collectCustomLinks();
    var data = {
      header_search_placeholder_bn: document.getElementById('settingHeaderSearchBn').value.trim(),
      header_search_placeholder_en: document.getElementById('settingHeaderSearchEn').value.trim(),
      header_show_search: document.getElementById('settingHeaderShowSearch').checked ? '1' : '0',
      header_show_home: document.getElementById('settingHeaderShowHome').checked ? '1' : '0',
      header_show_products: document.getElementById('settingHeaderShowProducts').checked ? '1' : '0',
      header_show_cart: document.getElementById('settingHeaderShowCart').checked ? '1' : '0',
      header_show_orders: document.getElementById('settingHeaderShowOrders').checked ? '1' : '0',
      header_show_admin: document.getElementById('settingHeaderShowAdmin').checked ? '1' : '0',
      header_show_lang: document.getElementById('settingHeaderShowLang').checked ? '1' : '0',
      header_show_auth: document.getElementById('settingHeaderShowAuth').checked ? '1' : '0',
      header_padding: document.getElementById('settingHeaderPadding').value.trim(),
      header_custom_links: JSON.stringify(links),
      header_custom_nav_label_bn: document.getElementById('settingHeaderCustomNavLabelBn').value.trim(),
      header_custom_nav_label_en: document.getElementById('settingHeaderCustomNavLabelEn').value.trim()
    };
    apiAdmin('PUT', '/settings', data).then(function(res) {
      if (res.error) { toast(res.error, 'error'); return; }
      toast(__('admin.saved'));
    });
  };

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

  /* ---- Q&A ---- */
  window.qaAnswerId = null;

  window.loadAdminQuestions = function() {
    if (!checkLogin()) return;
    apiAdmin('GET', '/questions').then(function(res) {
      var el = document.getElementById('questionsWrap');
      if (!el) return;
      if (!res || res.error || !Array.isArray(res)) {
        el.innerHTML = '<p style="color:var(--gray);padding:40px;text-align:center;">' + __('admin.questions_empty') + '</p>';
        return;
      }
      if (res.length === 0) {
        el.innerHTML = '<p style="color:var(--gray);padding:40px;text-align:center;">' + __('admin.questions_empty') + '</p>';
        return;
      }
      var html = '<table class="data-table"><thead><tr><th>' + __('admin.id') + '</th><th>' + __('admin.questions_product') + '</th><th>' + __('admin.questions_question') + '</th><th>' + __('admin.questions_asked_by') + '</th><th>' + __('admin.date') + '</th><th>' + __('admin.status') + '</th><th class="actions-cell">' + __('admin.actions') + '</th></tr></thead><tbody>';
      res.forEach(function(q) {
        var statusHtml = q.answer ? '<span class="stock-badge" style="background:#d1fae5;color:#065f46;">' + __('admin.questions_answered') + '</span>' : '<span class="stock-badge" style="background:#fef3c7;color:#92400e;">' + __('admin.questions_pending') + '</span>';
        html += '<tr>' +
          '<td class="cell-id">' + q.id + '</td>' +
          '<td><a href="/product.html?id=' + q.product_id + '" target="_blank" style="color:var(--primary);">' + esc(q.product_name || '#' + q.product_id) + '</a></td>' +
          '<td style="max-width:300px;">' + esc(q.question) + (q.answer ? '<div style="font-size:12px;color:#065f46;margin-top:4px;background:#f0fdf4;padding:6px 10px;border-radius:6px;border-left:3px solid #22c55e;">' + esc(q.answer) + '</div>' : '') + '</td>' +
          '<td>' + esc(q.user_name || '—') + '</td>' +
          '<td style="font-size:13px;color:#6b7280;">' + timeAgo(q.created_at) + '</td>' +
          '<td>' + statusHtml + '</td>' +
          '<td class="actions-cell">' + (q.answer ? '<button class="btn-icon" onclick="showQaModal(' + q.id + ',\'' + esc(q.question).replace(/'/g, "\\'") + '\',\'' + esc(q.answer || '').replace(/'/g, "\\'") + '\')" title="' + __('admin.edit') + '">✏️</button>' : '<button class="btn-icon" onclick="showQaModal(' + q.id + ',\'' + esc(q.question).replace(/'/g, "\\'") + '\',\'' + '\')" title="' + __('admin.questions_answer_btn') + '">💬</button>') + '</td>' +
          '</tr>';
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }).catch(function() {
      var el = document.getElementById('questionsWrap');
      if (el) el.innerHTML = '<p style="color:var(--gray);padding:40px;text-align:center;">' + __('admin.questions_empty') + '</p>';
    });
  };

  window.showQaModal = function(id, question, currentAnswer) {
    window.qaAnswerId = id;
    var existing = document.getElementById('qaModalOverlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'qaModalOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
    overlay.innerHTML = '<div style="background:#fff;border-radius:16px;padding:28px;width:100%;max-width:520px;margin:20px;box-shadow:0 20px 60px rgba(0,0,0,0.15);animation:fadeIn 0.2s ease-out;">' +
      '<h3 style="margin:0 0 6px;font-size:16px;font-weight:700;">' + __('admin.questions_answer_btn') + '</h3>' +
      '<div style="background:#f9f9fb;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:14px;color:#333;border-left:3px solid #4f46e5;">' + esc(question) + '</div>' +
      '<textarea id="qaAnswerInput" rows="4" style="width:100%;padding:12px 14px;border:1.5px solid #e4e4e7;border-radius:10px;font-size:14px;font-family:inherit;box-sizing:border-box;resize:vertical;" placeholder="' + __('admin.answer_placeholder') + '">' + esc(currentAnswer || '') + '</textarea>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
      '<button onclick="document.getElementById(\'qaModalOverlay\').remove()" style="padding:10px 20px;border:1.5px solid #e4e4e7;border-radius:10px;background:#fff;font-size:14px;font-weight:600;cursor:pointer;color:#6b7280;">' + __('admin.cancel') + '</button>' +
      '<button onclick="submitQaAnswer()" style="padding:10px 20px;border:none;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(79,70,229,0.3);">' + __('admin.answer_submit') + '</button>' +
      '</div></div>';
    document.body.appendChild(overlay);
    document.getElementById('qaAnswerInput').focus();
  };

  window.submitQaAnswer = function() {
    var input = document.getElementById('qaAnswerInput');
    if (!input || !window.qaAnswerId) return;
    var answer = input.value.trim();
    if (!answer) { toast(__('admin.answer_placeholder'), 'error'); return; }
    apiAdmin('PUT', '/questions/' + window.qaAnswerId + '/answer', { answer: answer }).then(function(res) {
      if (res && res.error) { toast(res.error, 'error'); return; }
      toast(__('admin.answer_saved'));
      var overlay = document.getElementById('qaModalOverlay');
      if (overlay) overlay.remove();
      window.loadAdminQuestions();
    }).catch(function() { toast(__('admin.saved'), 'error'); });
  };

  if (document.getElementById('questionsWrap')) {
    initAdmin();
    window.loadAdminQuestions();
    return;
  }

  initAdmin();
  document.body.style.opacity = '1';
})();

window.adminLogout = function() {
  localStorage.removeItem('token');
  localStorage.removeItem('adminToken');
  window.location = '/admin/';
};
