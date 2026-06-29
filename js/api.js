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

  window.colorDisplayName = function(color) {
    if (!color) return '';
    if (color.indexOf('|') === -1) return color;
    var lang = localStorage.getItem('lang') || 'bn';
    var parts = color.split('|');
    return lang === 'en' ? (parts[1] || parts[0]) : parts[0];
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

/* ── Facebook Messenger Chat Widget ── */
(function() {
  function createFbWidget() {
    var s = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    var pageId = s.fb_page_id || '';
    var autoReply = s.fb_auto_reply;
    if (!pageId) return;

    var widget = document.createElement('div');
    widget.id = 'fbMessengerWidget';
    widget.innerHTML =
      '<style>' +
        '#fbMessengerBtn{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;background:#0084ff;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,132,255,0.4);z-index:9998;display:flex;align-items:center;justify-content:center;transition:transform 0.2s;}' +
        '#fbMessengerBtn:hover{transform:scale(1.1);}' +
        '#fbMessengerBtn svg{width:30px;height:30px;fill:#fff;}' +
        '#fbMessengerPopup{position:fixed;bottom:96px;right:24px;width:320px;max-height:420px;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.2);z-index:9999;display:none;flex-direction:column;font-family:inherit;}' +
        '#fbMessengerPopup.open{display:flex;}' +
        '#fbMsgHeader{background:#0084ff;color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;}' +
        '#fbMsgHeader h3{margin:0;font-size:15px;font-weight:600;}' +
        '#fbMsgHeader button{margin-left:auto;background:none;border:none;color:#fff;font-size:18px;cursor:pointer;padding:0 4px;}' +
        '#fbMsgBody{flex:1;background:#f0f2f5;padding:12px;overflow-y:auto;min-height:200px;max-height:280px;}' +
        '#fbMsgInput{display:flex;gap:8px;padding:10px 12px;background:#fff;border-top:1px solid #e5e7eb;}' +
        '#fbMsgInput input{flex:1;padding:10px 14px;border:1px solid #ddd;border-radius:20px;font-size:14px;outline:none;}' +
        '#fbMsgInput input:focus{border-color:#0084ff;}' +
        '#fbMsgInput button{background:#0084ff;color:#fff;border:none;border-radius:50%;width:38px;height:38px;cursor:pointer;font-size:16px;}' +
        '.fb-msg-bubble{max-width:85%;padding:10px 14px;border-radius:18px;margin-bottom:8px;font-size:14px;line-height:1.4;word-wrap:break-word;}' +
        '.fb-msg-user{background:#0084ff;color:#fff;margin-left:auto;border-bottom-right-radius:4px;}' +
        '.fb-msg-bot{background:#e4e6eb;color:#111;border-bottom-left-radius:4px;}' +
        '.fb-msg-hint{font-size:11px;color:#65676b;text-align:center;padding:8px;}' +
      '</style>' +
      '<button id="fbMessengerBtn" title="Messenger এ চ্যাট করুন">' +
        '<svg viewBox="0 0 24 24"><path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.15 7.1V22l3.04-1.67c.81.22 1.68.34 2.56.34h.25c5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1 12.5l-2.5-2.7L5.5 14.5l5.5-5.8 2.5 2.7 4.5-2.7-5.5 5.8z"/></svg>' +
      '</button>' +
      '<div id="fbMessengerPopup">' +
        '<div id="fbMsgHeader">' +
          '<div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:18px;">💬</div>' +
          '<div><h3 id="fbMsgTitle">Messenger চ্যাট</h3><div style="font-size:11px;opacity:0.8;">সাধারণত দ্রুত উত্তর দেওয়া হয়</div></div>' +
          '<button onclick="document.getElementById(\'fbMessengerPopup\').classList.remove(\'open\')">✕</button>' +
        '</div>' +
        '<div id="fbMsgBody">' +
          '<div class="fb-msg-hint">আমাদের Messenger এ মেসেজ করুন অথবা নিচে লিখুন</div>' +
        '</div>' +
        '<div id="fbMsgInput">' +
          '<input type="text" id="fbMsgText" placeholder="মেসেজ লিখুন..." onkeydown="if(event.key===\'Enter\')document.getElementById(\'fbMsgSend\').click()">' +
          '<button id="fbMsgSend">➤</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(widget);

    var btn = document.getElementById('fbMessengerBtn');
    var popup = document.getElementById('fbMessengerPopup');
    var msgBody = document.getElementById('fbMsgBody');
    var msgInput = document.getElementById('fbMsgText');
    var sendBtn = document.getElementById('fbMsgSend');

    btn.addEventListener('click', function() {
      popup.classList.toggle('open');
      if (popup.classList.contains('open')) msgInput.focus();
    });

    function addMsg(text, type) {
      var div = document.createElement('div');
      div.className = 'fb-msg-bubble fb-msg-' + type;
      div.textContent = text;
      msgBody.appendChild(div);
      msgBody.scrollTop = msgBody.scrollHeight;
    }

    sendBtn.addEventListener('click', function() {
      var text = msgInput.value.trim();
      if (!text) return;
      msgInput.value = '';
      addMsg(text, 'user');

      fetch('/api/facebook/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object: 'page',
          entry: [{ messaging: [{ sender: { id: 'web_chat_' + Date.now() }, message: { text: text } }] }]
        })
      }).then(function() {
        return fetch('/api/facebook/messages');
      }).then(function(r) { return r.json(); }).then(function(msgs) {
        var outgoing = msgs.filter(function(m) { return m.direction === 'outgoing'; });
        if (outgoing.length) {
          setTimeout(function() { addMsg(outgoing[0].message_text, 'bot'); }, 500);
        } else {
          var s = JSON.parse(localStorage.getItem('siteSettings') || '{}');
          var welcome = s.fb_welcome_msg || 'ধন্যবাদ! শীঘ্রই আমাদের টিম আপনাকে রিপ্লাই দেবে।';
          setTimeout(function() { addMsg(welcome, 'bot'); }, 500);
        }
      }).catch(function() {
        addMsg('দুঃখিত, এখন সংযোগ হচ্ছে না। পরে আবার চেষ্টা করুন।', 'bot');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFbWidget);
  } else {
    createFbWidget();
  }

  /* Category Mega Menu — 3-column CartUp pink style */
  var _megaTree = [];
  var _megaLoaded = false;
  function loadMegaCategories() {
    if (_megaLoaded) return Promise.resolve();
    return api('GET', '/categories/tree').then(function(tree) {
      _megaTree = tree || [];
      _megaLoaded = true;
    }).catch(function() {
      return api('GET', '/categories').then(function(cats) {
        _megaTree = (cats || []).map(function(c) { c.children = []; return c; });
        _megaLoaded = true;
      });
    });
  }
  function renderMegaMain() {
    var col = document.getElementById('megaColMain');
    var panel = document.querySelector('.mega-cat-panel');
    if (!col) return;
    if (panel) { panel.classList.remove('has-sub', 'has-sub2'); }
    var lang = localStorage.getItem('lang') || 'bn';
    var html = '';
    _megaTree.forEach(function(cat) {
      var name = lang === 'en' && cat.en_name ? cat.en_name : cat.name;
      var hasSub = cat.children && cat.children.length > 0;
      html += '<div class="mega-main-item" data-cat-id="' + cat.id + '" data-cat-slug="' + esc(cat.slug) + '">';
      html += '<span>' + esc(name) + '</span>';
      if (hasSub) html += '<span class="mega-main-arrow">\u203A</span>';
      html += '</div>';
    });
    col.innerHTML = html;
    col.querySelectorAll('.mega-main-item').forEach(function(item) {
      item.addEventListener('mouseenter', function() {
        col.querySelectorAll('.mega-main-item').forEach(function(i) { i.classList.remove('active'); });
        item.classList.add('active');
        var catId = item.getAttribute('data-cat-id');
        renderMegaSub(catId);
      });
      item.addEventListener('click', function() {
        var slug = item.getAttribute('data-cat-slug');
        window.location.href = '/products.html?category=' + slug;
      });
    });
  }
  function renderMegaSub(catId) {
    var col = document.getElementById('megaColSub');
    var col2 = document.getElementById('megaColSub2');
    var panel = document.querySelector('.mega-cat-panel');
    if (!col) return;
    if (panel) panel.classList.remove('has-sub2');
    col2.innerHTML = '';
    var lang = localStorage.getItem('lang') || 'bn';
    var cat = _megaTree.find(function(c) { return c.id == catId; });
    if (!cat || !cat.children || cat.children.length === 0) {
      if (panel) panel.classList.remove('has-sub');
      col.innerHTML = '<a href="/products.html?category=' + cat.slug + '" class="mega-link-item">' + esc(lang === 'en' && cat.en_name ? cat.en_name : cat.name) + '</a>';
      return;
    }
    if (panel) panel.classList.add('has-sub');
    var html = '';
    cat.children.forEach(function(sub) {
      var sname = lang === 'en' && sub.en_name ? sub.en_name : sub.name;
      var hasSub2 = sub.children && sub.children.length > 0;
      html += '<div class="mega-sub-item" data-sub-id="' + sub.id + '" data-sub-slug="' + esc(sub.slug) + '">';
      html += '<span>' + esc(sname) + '</span>';
      if (hasSub2) html += '<span class="mega-sub-arrow">\u203A</span>';
      html += '</div>';
    });
    col.innerHTML = html;
    col.querySelectorAll('.mega-sub-item').forEach(function(item) {
      item.addEventListener('mouseenter', function() {
        col.querySelectorAll('.mega-sub-item').forEach(function(i) { i.classList.remove('active'); });
        item.classList.add('active');
        var subId = item.getAttribute('data-sub-id');
        renderMegaSub2(catId, subId);
      });
      item.addEventListener('click', function() {
        var slug = item.getAttribute('data-sub-slug');
        window.location.href = '/products.html?category=' + slug;
      });
    });
  }
  function renderMegaSub2(catId, subId) {
    var col = document.getElementById('megaColSub2');
    var panel = document.querySelector('.mega-cat-panel');
    if (!col) return;
    var lang = localStorage.getItem('lang') || 'bn';
    var cat = _megaTree.find(function(c) { return c.id == catId; });
    if (!cat) return;
    var sub = (cat.children || []).find(function(s) { return s.id == subId; });
    if (!sub || !sub.children || sub.children.length === 0) {
      if (panel) panel.classList.remove('has-sub2');
      col.innerHTML = '<a href="/products.html?category=' + sub.slug + '" class="mega-link-item">' + esc(lang === 'en' && sub.en_name ? sub.en_name : sub.name) + '</a>';
      return;
    }
    if (panel) panel.classList.add('has-sub2');
    var html = '';
    sub.children.forEach(function(sub2) {
      var sname = lang === 'en' && sub2.en_name ? sub2.en_name : sub2.name;
      html += '<a href="/products.html?category=' + sub2.slug + '" class="mega-link-item">' + esc(sname) + '</a>';
    });
    col.innerHTML = html;
  }
  function initMegaMenuEvents() {
    var trigger = document.getElementById('megaCatTrigger');
    if (!trigger) return;
    trigger.addEventListener('mouseenter', function() {
      loadMegaCategories().then(function() { renderMegaMain(); });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMegaMenuEvents);
  } else {
    initMegaMenuEvents();
  }
})();
