/* ==========================================================
   API.JS — fetch wrapper with JWT handling
   ========================================================== */
(function(){
  window.api = function(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) headers['X-Session-Id'] = sessionId;
    const opts = { method, headers };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);
    return fetch('/api' + path, opts).then(r => r.json());
  };

  window.apiForm = function(method, path, formData) {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const opts = { method, headers, body: formData };
    return fetch('/api' + path, opts).then(r => r.json());
  };

  window.esc = function(s) {
    return String(s == null ? '' : s).replace(/[&<>\"']/g, function(c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  };

  window.timeAgo = function(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(window.getLang && window.getLang() === 'en' ? 'en-US' : 'bn-BD', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(window.getLang && window.getLang() === 'en' ? 'en-US' : 'bn-BD', { hour: '2-digit', minute: '2-digit' });
  };

  window.taka = function(amount) {
    try {
      return '৳' + Number(amount || 0).toLocaleString('en-US');
    } catch (e) {
      return '৳' + Number(amount || 0).toLocaleString();
    }
  };

  window.productImage = function(p) {
    if (p.images && p.images.length) return p.images[0];
    var ci = p.color_images || {};
    if (typeof ci === 'string') { try { ci = JSON.parse(ci); } catch(e) { ci = {}; } }
    var colors = Object.keys(ci);
    for (var i = 0; i < colors.length; i++) {
      if (ci[colors[i]] && ci[colors[i]].length) return ci[colors[i]][0];
    }
    return '';
  };

  window.toast = function(msg, type) {
    type = type || 'success';
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function() { el.remove(); }, 3000);
  };

  /* ---- Site settings (public) ---- */
  window.updateSiteHeader = function(settings) {
    var el = document.getElementById('siteLogo') || document.querySelector('.logo');
    if (!el) return;
    var name = settings.site_name || '';
    if (settings.logo_url) {
      el.innerHTML = '<img src="' + esc(settings.logo_url) + '" alt="' + esc(name) + '" style="height:48px;width:auto;" onerror="this.onerror=null;this.style.display=\'none\'">' +
        '<span class="site-name">' + esc(name) + '</span>';
    } else {
      if (/^[^\w]/.test(name) || name.length <= 1) {
        el.textContent = name;
      } else {
        el.innerHTML = name.charAt(0) + '<span>' + esc(name.slice(1)) + '</span>';
      }
    }
  };

  window.applySiteTheme = function(s) {
    if (!s) return;
    var root = document.documentElement;
    var pairs = [
      ['header_bg', '--header-bg'],
      ['header_text_color', '--header-text'],
      ['body_bg', '--body-bg'],
      ['primary_color', '--primary'],
      ['footer_bg', '--footer-bg'],
      ['footer_text_color', '--footer-text']
    ];
    pairs.forEach(function(p) {
      if (s[p[0]]) root.style.setProperty(p[1], s[p[0]]);
    });
    var cr = document.querySelector('.dz-footer-bottom');
    if (cr && s.footer_copyright) cr.textContent = s.footer_copyright;
  };

  var _pendingReveals = 2;
  function _checkReveal() {
    _pendingReveals--;
    if (_pendingReveals <= 0) {
      document.body.style.opacity = '1';
    }
  }

  window.loadSiteSettings = function() {
    fetch('/api/admin/settings?_=' + Date.now()).then(function(r) { return r.json(); }).then(function(s) {
      if (s && !s.error && s.site_name !== undefined) {
        try { localStorage.setItem('siteSettings', JSON.stringify(s)); } catch(e) {}
        if (typeof applySiteTheme === 'function') applySiteTheme(s);
        if (typeof updateSiteHeader === 'function') updateSiteHeader(s);
        if (typeof applyHeaderSettings === 'function') applyHeaderSettings(s);
      }
      _checkReveal();
    }).catch(function(){ _checkReveal(); });
  };

  window.applyHeaderSettings = function(s) {
    if (!s) return;
    var searchBox = document.getElementById('searchBox');
    if (searchBox) searchBox.style.display = s.header_show_search === '0' ? 'none' : '';
    var navHome = document.getElementById('navHome');
    if (navHome) navHome.style.display = s.header_show_home === '0' ? 'none' : '';
    var navProducts = document.getElementById('navProducts');
    if (navProducts) navProducts.style.display = s.header_show_products === '0' ? 'none' : '';
    var navCart = document.getElementById('navCart');
    if (navCart) navCart.style.display = s.header_show_cart === '0' ? 'none' : '';
    var navOrders = document.getElementById('navOrders');
    if (navOrders) navOrders.style.display = s.header_show_orders === '0' ? 'none' : '';
    var navAdmin = document.getElementById('navAdmin');
    if (navAdmin) navAdmin.style.display = s.header_show_admin === '0' ? 'none' : '';
    var langToggle = document.getElementById('langToggle');
    if (langToggle) langToggle.style.display = s.header_show_lang === '0' ? 'none' : '';
    var authLink = document.getElementById('authLink');
    var hasProfileDropdown = document.getElementById('headerProfileDropdown');
    if (authLink) {
      if (s.header_show_auth === '0' || hasProfileDropdown) {
        authLink.style.display = 'none';
      } else {
        authLink.style.display = '';
      }
    }
    var searchInput = document.getElementById('searchInput');
    if (searchInput && s.header_search_placeholder_bn) {
      var lang = localStorage.getItem('lang') || 'bn';
      searchInput.placeholder = lang === 'en' && s.header_search_placeholder_en ? s.header_search_placeholder_en : s.header_search_placeholder_bn;
    }
    var header = document.querySelector('header') || document.querySelector('.header');
    if (header && s.header_padding) header.style.padding = s.header_padding;

    // Custom navigation links dropdown
    var existing = document.querySelector('.custom-nav-dropdown');
    if (existing) existing.remove();
    var customLinks = [];
    try { customLinks = s.header_custom_links ? JSON.parse(s.header_custom_links) : []; } catch(e) { customLinks = []; }
    var visibleLinks = customLinks.filter(function(l) { return l.show !== false && l.url && (l.labelBn || l.labelEn); });
    if (visibleLinks.length > 0) {
      var nav = document.querySelector('header nav');
      if (nav) {
        var lang2 = localStorage.getItem('lang') || 'bn';
        var btnLabel = lang2 === 'en' ? (s.header_custom_nav_label_en || '📄 Pages ▾') : (s.header_custom_nav_label_bn || '📄 পেজ ▾');
        var dropdown = document.createElement('div');
        dropdown.className = 'custom-nav-dropdown';
        dropdown.innerHTML = '<button class="custom-nav-dropdown-btn">' + btnLabel + '</button>' +
          '<div class="custom-nav-dropdown-menu">' +
          visibleLinks.map(function(l) {
            var label = lang2 === 'en' ? (l.labelEn || l.labelBn) : (l.labelBn || l.labelEn);
            return '<a class="custom-nav-dropdown-item" href="' + esc(l.url) + '"><span class="dropdown-icon">' + esc(l.icon || '📄') + '</span>' + esc(label) + '</a>';
          }).join('') +
          '</div>';
        var ordersLink = document.getElementById('navOrders');
        if (ordersLink && ordersLink.nextSibling) {
          nav.insertBefore(dropdown, ordersLink.nextSibling);
        } else {
          nav.appendChild(dropdown);
        }
      }
    }
  };

  window.loadCartCount = function() {
    api('GET', '/cart').then(function(data) {
      var el = document.getElementById('cartCount');
      if (el) {
        el.textContent = data.count || 0;
        el.style.display = data.count > 0 ? 'flex' : 'none';
      }
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
      }
    }).catch(function(){});
  };

  /* ---- Inactivity logout (30 min) ---- */
  var SESSION_TIMEOUT = 30 * 60 * 1000;
  function touchActivity() {
    localStorage.setItem('lastActivity', Date.now());
  }
  function checkActivity() {
    var token = localStorage.getItem('token');
    if (!token) return;
    var last = localStorage.getItem('lastActivity');
    if (last && (Date.now() - Number(last) > SESSION_TIMEOUT)) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivity');
      if (window.location.pathname.indexOf('/admin/') !== -1) {
        window.location = '/admin/';
      } else {
        window.location = '/auth.html';
      }
    }
  }
  document.addEventListener('click', touchActivity);
  document.addEventListener('keydown', touchActivity);
  document.addEventListener('scroll', touchActivity);
  touchActivity();
  checkActivity();
  setInterval(checkActivity, 30000);
  /* ---- Auth link update (runs on every page) ---- */
  (function() {
    var t = localStorage.getItem('token');
    var el = document.getElementById('authLink');
    if (el && t) {
      el.textContent = (window.__ && __('nav.profile')) || 'Profile';
      el.href = '#';
      el.onclick = function(e) {
        e.preventDefault();
        if (typeof showProfileModal === 'function') showProfileModal(this);
        else window.location = '/profile.html';
      };
    }
  })();

  /* ---- Search Autocomplete ---- */
  var searchTimer = null;
  function initSearchAutocomplete() {
    var input = document.getElementById('searchInput');
    if (!input) return;
    var wrap = document.getElementById('searchSuggestions');
    if (!wrap) return;
    input.addEventListener('input', function() {
      clearTimeout(searchTimer);
      var q = input.value.trim();
      if (q.length < 2) { wrap.classList.remove('active'); wrap.innerHTML = ''; return; }
      searchTimer = setTimeout(function() {
        api('GET', '/products?search=' + encodeURIComponent(q) + '&limit=6').then(function(data) {
          if (!data || !data.products) { wrap.classList.remove('active'); wrap.innerHTML = ''; return; }
          if (input.value.trim() === '') { wrap.classList.remove('active'); wrap.innerHTML = ''; return; }
          var html = '';
          data.products.forEach(function(p) {
            var img = p.image && p.image !== '' ? p.image : 'https://picsum.photos/seed/default/200/200';
            var nm = window.productName ? window.productName(p) : (p.name || '');
            html += '<div class="ss-item" onclick="window.location=\'/product.html?id=' + p.id + '\'">' +
              '<img src="' + img + '" alt="" loading="lazy">' +
              '<div class="ss-info"><div class="ss-name">' + esc(nm) + '</div><div class="ss-price">' + taka(p.price) + '</div></div></div>';
          });
          if (!html) {
            html = '<div class="ss-empty">' + (window.__ ? __('search.no_results') : 'No results') + '</div>';
          }
          wrap.innerHTML = html;
          wrap.classList.add('active');
        });
      }, 300);
    });
    input.addEventListener('blur', function() {
      setTimeout(function() { wrap.classList.remove('active'); }, 200);
    });
    input.addEventListener('focus', function() {
      if (input.value.trim().length >= 2 && wrap.children.length > 0) {
        wrap.classList.add('active');
      }
    });
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initSearchAutocomplete();
    loadSiteSettings();
    hideAdminLinkForNonAdmins();
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      initSearchAutocomplete();
      loadSiteSettings();
      hideAdminLinkForNonAdmins();
    });
  }

  function hideAdminLinkForNonAdmins() {
    var adminLink = document.getElementById('adminLink');
    if (!adminLink) { _checkReveal(); return; }
    var token = localStorage.getItem('token');
    if (!token) {
      adminLink.style.display = 'none';
      _checkReveal();
      return;
    }
    try {
      var u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.role === 'admin') {
        adminLink.style.display = '';
        _checkReveal();
        return;
      }
    } catch(e) {}
    api('GET', '/users/me').then(function(user) {
      if (user && !user.error && user.role === 'admin') {
        adminLink.style.display = '';
      } else {
        adminLink.style.display = 'none';
      }
    }).catch(function() {
      adminLink.style.display = 'none';
    }).finally(function() {
      _checkReveal();
    });
  }

})();
