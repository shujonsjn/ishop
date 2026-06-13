/* ==========================================================
   AUTH.JS — Login, Register, Profile
   ========================================================== */
(function(){
  window._token = localStorage.getItem('token');
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
    var identifier = document.getElementById('loginEmail').value.trim();
    var pass = document.getElementById('loginPassword').value;
    if (!identifier || !pass) { toast(__('toast.enter_email_password'), 'error'); return; }
    var body = { password: pass };
    if (identifier.indexOf('@') !== -1) {
      body.email = identifier;
    } else {
      body.phone = identifier;
    }
    api('POST', '/users/login', body).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast(__('toast.login_success'));
      api('POST', '/cart/merge').then(function() {
        var redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
        window.location = redirect;
      });
    });
  };

  window.sendOtp = function() {
    var name = document.getElementById('regName').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var phone = document.getElementById('regPhone').value.trim();
    var pass = document.getElementById('regPassword').value;
    if (!name || !pass) { toast(__('toast.enter_name_email_password'), 'error'); return; }
    if (pass.length < 4) { toast(__('toast.password_short'), 'error'); return; }
    if (!email && !phone) { toast(__('toast.enter_email_or_phone'), 'error'); return; }
    var body = { name: name, password: pass };
    if (email) body.email = email;
    if (phone) body.phone = phone;
    api('POST', '/users/send-otp', body).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      document.getElementById('sendOtpBtn').style.display = 'none';
      document.getElementById('otpSection').style.display = 'block';
      toast(__('toast.otp_sent'));
      var btn = document.getElementById('resendOtpBtn');
      btn.disabled = true;
      var count = 30;
      var timer = setInterval(function() {
        btn.textContent = (window.__ ? __('auth.resend_otp') : 'পুনরায় পাঠান') + ' (' + count + 's)';
        if (--count < 0) { clearInterval(timer); btn.disabled = false; btn.textContent = window.__ ? __('auth.resend_otp') : 'পুনরায় পাঠান'; }
      }, 1000);
    });
  };

  window.doRegister = function() {
    var name = document.getElementById('regName').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var phone = document.getElementById('regPhone').value.trim();
    var pass = document.getElementById('regPassword').value;
    var otp = document.getElementById('regOtp').value.trim();
    if (!name || !pass) { toast(__('toast.enter_name_email_password'), 'error'); return; }
    if (pass.length < 4) { toast(__('toast.password_short'), 'error'); return; }
    if (!otp) { toast(__('toast.register_otp_first'), 'error'); return; }
    var body = { name: name, password: pass, otp: otp };
    if (email) body.email = email;
    if (phone) body.phone = phone;
    api('POST', '/users/register', body).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast(__('toast.register_success'));
      api('POST', '/cart/merge').then(function() {
        var redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
        window.location = redirect;
      });
    });
  };

  /* ---- Profile Modal ---- */
  var _pmInjected = false;
  window.showProfileModal = function(anchor) {
    if (!_pmInjected) {
      var html = '<div class="profile-modal" id="profileModal"><div class="pm-overlay" onclick="closeProfileModal()"></div><div class="pm-content" id="pmContent"><div class="pm-header"><h3>' + (__('profile.heading')||'My Profile') + '</h3><button class="pm-close" onclick="closeProfileModal()">&times;</button></div><div class="pm-field"><label>' + (__('profile.name')||'Name') + '</label><input type="text" id="pmName"></div><div class="pm-field"><label>' + (__('profile.email')||'Email') + '</label><input type="email" id="pmEmail" readonly></div><div class="pm-field"><label>' + (__('profile.phone')||'Phone') + '</label><input type="text" id="pmPhone"></div><div class="pm-field"><label>' + (__('profile.address')||'Address') + '</label><textarea id="pmAddress" rows="3"></textarea></div><div class="pm-actions"><button class="btn btn-primary" onclick="updateProfileModal()">' + (__('profile.update')||'Update') + '</button><button class="btn btn-outline" onclick="togglePmPassword()">' + (__('profile.change_password')||'Change Password') + '</button></div><div id="pmPasswordSection" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid #eee;"><div class="pm-field"><label>' + (__('profile.current_password')||'Current Password') + '</label><input type="password" id="pmCurPass"></div><div class="pm-field"><label>' + (__('profile.new_password')||'New Password') + '</label><input type="password" id="pmNewPass"></div><button class="btn btn-primary btn-block pm-pw-btn" onclick="changePmPassword()">' + (__('profile.change_btn')||'Change') + '</button></div><div style="margin-top:10px;padding-top:10px;border-top:1px solid #eee;text-align:center;"><a href="#" onclick="doLogout();return false" style="color:#e11d48;font-size:13px;text-decoration:none;">' + (__('nav.logout')||'Logout') + '</a></div></div></div>';
      document.body.insertAdjacentHTML('beforeend', html);
      _pmInjected = true;
    }
    if (!anchor) anchor = document.getElementById('authLink');
    if (anchor) {
      var rect = anchor.getBoundingClientRect();
      var c = document.getElementById('pmContent');
      c.style.top = (rect.bottom + 8) + 'px';
      c.style.left = Math.max(8, rect.right - 320) + 'px';
    }
    document.getElementById('profileModal').classList.add('active');
    api('GET', '/users/me').then(function(user) {
      if (!user || user.error) { toast('Login required', 'error'); closeProfileModal(); return; }
      document.getElementById('pmName').value = user.name || '';
      document.getElementById('pmEmail').value = user.email || '';
      document.getElementById('pmPhone').value = user.phone || '';
      document.getElementById('pmAddress').value = user.address || '';
    });
  };
  window.closeProfileModal = function() {
    var el = document.getElementById('profileModal');
    if (el) el.classList.remove('active');
  };
  window.updateProfileModal = function() {
    var name = document.getElementById('pmName').value.trim();
    var phone = document.getElementById('pmPhone').value.trim();
    var address = document.getElementById('pmAddress').value.trim();
    api('PUT', '/users/me', { name: name, phone: phone, address: address }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      toast(__('toast.profile_updated'));
    });
  };
  window.togglePmPassword = function() {
    var el = document.getElementById('pmPasswordSection');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  };
  window.changePmPassword = function() {
    var cur = document.getElementById('pmCurPass').value;
    var nw = document.getElementById('pmNewPass').value;
    if (!cur || !nw) { toast('Fill both fields', 'error'); return; }
    if (nw.length < 4) { toast('Password must be at least 4 characters', 'error'); return; }
    api('PUT', '/users/me/password', { current_password: cur, new_password: nw }).then(function(data) {
      if (data.error) { toast(data.error, 'error'); return; }
      toast('Password changed successfully');
      document.getElementById('pmCurPass').value = '';
      document.getElementById('pmNewPass').value = '';
      document.getElementById('pmPasswordSection').style.display = 'none';
    });
  };

  window.doLogout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location = '/';
  };
})();
