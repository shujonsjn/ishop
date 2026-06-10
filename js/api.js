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
    if (diffSec < 60) return diffSec + ' সেকেন্ড আগে';
    var diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return diffMin + ' মিনিট আগে';
    var diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return diffHour + ' ঘন্টা আগে';
    var diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return diffDay + ' দিন আগে';
    return d.toLocaleDateString('bn-BD');
  };

  window.taka = function(amount) {
    return '৳' + Number(amount || 0).toLocaleString('bn-BD');
  };

  window.toast = function(msg, type) {
    type = type || 'success';
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function() { el.remove(); }, 3000);
  };

  window.loadCartCount = function() {
    api('GET', '/cart').then(function(data) {
      var el = document.getElementById('cartCount');
      if (el) {
        el.textContent = data.count || 0;
        el.style.display = data.count > 0 ? 'flex' : 'none';
      }
      if (data.sessionId && !localStorage.getItem('sessionId')) {
        localStorage.setItem('sessionId', data.sessionId);
      }
    }).catch(function(){});
  };
})();
