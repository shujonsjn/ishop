/* ==========================================================
   AUTH.JS — Login, Register, Profile
   ========================================================== */
(function(){
  var token = localStorage.getItem('token');
  var authLink = document.getElementById('authLink');
  if (authLink) {
    if (token) {
      authLink.textContent = 'প্রোফাইল';
      authLink.href = '/profile.html';
    }
  }

  /* ---- Auth page ---- */
  window.switchTab = function(tab) {
    var l = document.getElementById('loginForm');
    var r = document.getElementById('registerForm');
    var tabs = document.querySelectorAll('.auth-tab');
    if (tab === 'login') {
      l.style.display = 'block'; r.style.display = 'none';
      tabs[0].className = 'auth-tab active'; tabs[1].className = 'auth-tab';
    } else {
      l.style.display = 'none'; r.style.display = 'block';
      tabs[0].className = 'auth-tab'; tabs[1].className = 'auth-tab active';
    }
  };

  window.doLogin = function() {
    var email = document.getElementById('loginEmail').value.trim();
    var pass = document.getElementById('loginPassword').value;
    if (!email || !pass) { toast('ইমেইল ও পাসওয়ার্ড দিন', 'error'); return; }
    api('POST', '/users/login', { email: email, password: pass }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast('লগইন সফল!');
      api('POST', '/cart/merge').then(function() {
        var redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
        window.location = redirect;
      });
    });
  };

  window.doRegister = function() {
    var name = document.getElementById('regName').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var phone = document.getElementById('regPhone').value.trim();
    var pass = document.getElementById('regPassword').value;
    if (!name || !email || !pass) { toast('নাম, ইমেইল ও পাসওয়ার্ড দিন', 'error'); return; }
    if (pass.length < 4) { toast('পাসওয়ার্ড কমপক্ষে ৪ অক্ষর', 'error'); return; }
    api('POST', '/users/register', { name: name, email: email, phone: phone, password: pass }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast('রেজিস্টার সফল!');
      api('POST', '/cart/merge').then(function() {
        var redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
        window.location = redirect;
      });
    });
  };

  /* ---- Profile page ---- */
  if (document.getElementById('profileName')) {
    if (!token) { window.location = '/auth.html'; return; }
    api('GET', '/users/me').then(function(user) {
      if (user.error) { toast(user.error, 'error'); return; }
      document.getElementById('profileName').value = user.name || '';
      document.getElementById('profileEmail').value = user.email || '';
      document.getElementById('profilePhone').value = user.phone || '';
      document.getElementById('profileAddress').value = user.address || '';
    });
  }

  window.updateProfile = function() {
    var name = document.getElementById('profileName').value.trim();
    var phone = document.getElementById('profilePhone').value.trim();
    var address = document.getElementById('profileAddress').value.trim();
    api('PUT', '/users/me', { name: name, phone: phone, address: address }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      toast('প্রোফাইল আপডেট হয়েছে!');
    });
  };

  window.doLogout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location = '/';
  };
})();
