/* Pre-render: apply custom nav dropdown from localStorage */
(function(){
  try {
    var s = JSON.parse(localStorage.getItem('siteSettings'));
    if (!s) return;
    var customLinks = [];
    try { customLinks = s.header_custom_links ? JSON.parse(s.header_custom_links) : []; } catch(e) { customLinks = []; }
    var visibleLinks = customLinks.filter(function(l) { return l.show !== false && l.url && (l.labelBn || l.labelEn); });
    if (!visibleLinks.length) return;
    var nav = document.querySelector('header nav');
    if (!nav) return;
    var lang = localStorage.getItem('lang') || 'bn';
    var btnLabel = lang === 'en' ? (s.header_custom_nav_label_en || 'Pages ▾') : (s.header_custom_nav_label_bn || 'পেজ ▾');
    var dropdown = document.createElement('div');
    dropdown.className = 'custom-nav-dropdown';
    dropdown.innerHTML = '<button class="custom-nav-dropdown-btn">' + btnLabel + '</button>' +
      '<div class="custom-nav-dropdown-menu">' +
      visibleLinks.map(function(l) {
        var label = lang === 'en' ? (l.labelEn || l.labelBn) : (l.labelBn || l.labelEn);
        return '<a class="custom-nav-dropdown-item" href="' + l.url + '"><span class="dropdown-icon">' + (l.icon || '📄') + '</span>' + label + '</a>';
      }).join('') +
      '</div>';
    var firstLink = nav.querySelector('a');
    if (firstLink) {
      nav.insertBefore(dropdown, firstLink);
    } else {
      nav.appendChild(dropdown);
    }
  } catch(e) {}
})();
