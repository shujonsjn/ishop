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
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    var now = new Date();
    var diffSec = Math.floor((now - d) / 1000);
    if (diffSec < 0) diffSec = 0;
    if (diffSec < 60) return __('timeago.seconds', {n: diffSec});
    var diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return __('timeago.minutes', {n: diffMin});
    var diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return __('timeago.hours', {n: diffHour});
    var diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return __('timeago.days', {n: diffDay});
    return d.toLocaleDateString(window.getLang && window.getLang() === 'en' ? 'en-US' : 'bn-BD');
  };

  window.taka = function(amount) {
    try {
      return '৳' + Number(amount || 0).toLocaleString('bn-BD');
    } catch (e) {
      return '৳' + Number(amount || 0).toLocaleString();
    }
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
    var name = settings.site_name || 'iShop';
    if (settings.logo_url) {
      el.innerHTML = '<img src="' + esc(settings.logo_url) + '" alt="' + esc(name) + '" style="height:36px;width:auto;" onerror="this.onerror=null;this.style.display=\'none\'">' +
        '<span class="site-name">' + esc(name) + '</span>';
    } else {
      if (/^[^\w]/.test(name) || name.length <= 1) {
        el.textContent = name;
      } else {
        el.innerHTML = name.charAt(0) + '<span>' + esc(name.slice(1)) + '</span>';
      }
    }
  };

  window.loadSiteSettings = function() {
    fetch('/api/admin/settings?_=' + Date.now()).then(function(r) { return r.json(); }).then(function(s) {
      if (s && !s.error && s.site_name) {
        window.updateSiteHeader(s);
        localStorage.setItem('siteSettings', JSON.stringify(s));
      }
    }).catch(function(){});
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
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      initSearchAutocomplete();
      loadSiteSettings();
    });
  }
})();
