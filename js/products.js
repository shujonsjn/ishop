(function(){
  var productId = new URLSearchParams(window.location.search).get('id');
  window.selectedColor = '';
  window.selectedSize = '';

  window.showSizeChart = function() {
    var modal = document.getElementById('sizeChartModal');
    var content = document.getElementById('sizeChartContent');
    if (!modal || !content) return;
    var p = window.currentProduct;
    modal.style.display = 'flex';
    var url = p ? (p.size_chart_image || '') : '';
    if (url) {
      content.innerHTML = '<img src="' + esc(url) + '" style="max-width:100%;border-radius:8px;">';
    } else {
      content.innerHTML = '<p style="color:#888;">' + __('detail.size_chart_no_image') + '</p>';
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    loadProductDetail();
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') window.location = '/products.html?search=' + encodeURIComponent(this.value);
      });
    }
  });

  window.switchImage = function(idx) {
    var imgs = window.pdImages || [];
    if (!imgs[idx]) return;
    document.getElementById('pdMainImg').src = imgs[idx];
    document.querySelectorAll('.pd-thumb').forEach(function(t, i) {
      t.classList.toggle('active', i === idx);
    });
  };

  window.zoomImage = function(src) {
    var overlay = document.createElement('div');
    overlay.className = 'pd-zoom-overlay';
    overlay.innerHTML = '<div class="pd-zoom-box"><img src="' + src + '"><button class="pd-zoom-close">&#10005;</button></div>';
    overlay.onclick = function(e) { if (e.target === overlay || e.target.classList.contains('pd-zoom-close')) overlay.remove(); };
    document.body.appendChild(overlay);
  };

  window.selectColor = function(color, el) {
    window.selectedColor = color;
    document.getElementById('pdColorSelected').textContent = colorDisplayName(color);
    var row = document.getElementById('pdColorRow');
    if (row) row.querySelectorAll('.pd-color-swatch').forEach(function(s) { s.classList.remove('active'); });
    el.classList.add('active');
    updateVariantStockDisplay();
    switchColorImages(color);
  };

  function switchColorImages(color) {
    var p = window.currentProduct;
    if (!p) return;
    var colorImgs = p.color_images || {};
    var imgs = (color && colorImgs[color] && colorImgs[color].length) ? colorImgs[color] : (window.allImages || []);
    if (!imgs.length) return;
    window.pdImages = imgs;
    var mainImg = document.getElementById('pdMainImg');
    if (!mainImg) {
      var noImg = document.querySelector('.pd-no-img');
      if (noImg) {
        noImg.outerHTML = '<div class="pd-img-wrap"><img id="pdMainImg" src="' + esc(imgs[0]) + '" alt="" onclick="zoomImage(this.src)"></div>';
      }
    } else {
      mainImg.src = imgs[0];
    }
    var thumbsContainer = document.getElementById('pdThumbs');
    if (thumbsContainer) {
      var thumbsHtml = '';
      imgs.forEach(function(url, idx) {
        thumbsHtml += '<div class="pd-thumb' + (idx === 0 ? ' active' : '') + '" onclick="switchImage(' + idx + ')"><img src="' + esc(url) + '" alt=""></div>';
      });
      thumbsContainer.innerHTML = thumbsHtml;
    } else {
      var galleryInner = document.querySelector('.pd-gallery-inner');
      if (galleryInner) {
        var thumbsEl = document.createElement('div');
        thumbsEl.className = 'pd-thumbnails';
        thumbsEl.id = 'pdThumbs';
        var thumbsHtml2 = '';
        imgs.forEach(function(url, idx) {
          thumbsHtml2 += '<div class="pd-thumb' + (idx === 0 ? ' active' : '') + '" onclick="switchImage(' + idx + ')"><img src="' + esc(url) + '" alt=""></div>';
        });
        thumbsEl.innerHTML = thumbsHtml2;
        galleryInner.appendChild(thumbsEl);
      }
    }
  }

  window.selectSize = function(size, el) {
    window.selectedSize = size;
    var row = document.getElementById('pdSizeRow');
    if (row) row.querySelectorAll('.pd-size-btn').forEach(function(s) { s.classList.remove('active'); });
    el.classList.add('active');
    updateVariantStockDisplay();
  };

  window.changeQty = function(d) {
    var inp = document.getElementById('detailQty');
    var p = window.currentProduct;
    var maxStock = getVariantStock();
    var v = Math.max(1, Math.min(maxStock, parseInt(inp.value) + d));
    inp.value = v;
  };

  function getVariantStock() {
    var p = window.currentProduct;
    if (!p) return 9999;
    var c = window.selectedColor || '';
    var s = window.selectedSize || '';
    var variants = window.variantStocks || {};
    var key = c + '||' + s;
    if (variants[key] !== undefined) return variants[key];
    var fallbackKey = '||';
    if (variants[fallbackKey] !== undefined) return variants[fallbackKey];
    return p.stock || 9999;
  }

  function updateVariantStockDisplay() {
    var stock = getVariantStock();
    var badge = document.querySelector('.pd-stock-badge');
    var actionArea = document.getElementById('pdActionArea');
    if (badge) {
      badge.className = 'pd-stock-badge ' + (stock > 0 ? 'in-stock' : 'out-stock');
      badge.innerHTML = stock > 0 ? '&#9989; ' + (__('detail.in_stock', {count: stock}) || 'Stock: ' + stock) : '&#10060; ' + __('detail.out_of_stock');
    }
    if (actionArea) {
      if (stock > 0) {
        actionArea.innerHTML = '<button class="pd-btn-order" onclick="addToCart(' + (window.currentProduct || {}).id + ')">&#128722; ' + (__('detail.add_to_cart') || 'কার্টে যোগ করুন') + '</button>';
      } else {
        actionArea.innerHTML = '<button class="pd-btn-order pd-btn-disabled" disabled>&#10060; ' + (__('detail.stock_out_btn') || 'Out of Stock') + '</button>';
      }
    }
    /* Also update the inline order button in qty row */
    var qtyOrderBtn = document.querySelector('.pd-qty-order-btn');
    if (qtyOrderBtn) {
      if (stock > 0) {
        qtyOrderBtn.disabled = false;
        qtyOrderBtn.className = 'pd-qty-order-btn';
        qtyOrderBtn.onclick = function() { buyNow((window.currentProduct || {}).id); };
      } else {
        qtyOrderBtn.disabled = true;
        qtyOrderBtn.className = 'pd-qty-order-btn pd-btn-disabled';
        qtyOrderBtn.onclick = null;
      }
    }
    var qtyInp = document.getElementById('detailQty');
    if (qtyInp && stock > 0 && parseInt(qtyInp.value) > stock) qtyInp.value = stock;
  }

  window.switchPdTab = function(tab) {
    window.pdActiveTab = tab;
    document.querySelectorAll('.pd-tab-btn').forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-tab') === tab); });
    document.querySelectorAll('.pd-tab-content').forEach(function(c) { c.classList.toggle('active', c.id === 'pdTab-' + tab); });
    if (tab === 'qa' && window.currentProduct) loadQuestions(window.currentProduct.id);
  };

  function showSelectPopup(msg) {
    var existing = document.getElementById('selectPopup');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'selectPopup';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = '<div style="background:#fff;border-radius:16px;padding:32px;max-width:360px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:fadeIn 0.2s;">' +
      '<div style="font-size:48px;margin-bottom:12px;">&#9888;&#65039;</div>' +
      '<p style="font-size:16px;font-weight:600;color:#1f2937;margin:0 0 20px;">' + esc(msg) + '</p>' +
      '<button onclick="document.getElementById(\'selectPopup\').remove()" style="padding:10px 32px;border:none;border-radius:8px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:14px;font-weight:600;cursor:pointer;">' + (window.__ ? __('detail.ok') : 'OK') + '</button>' +
      '</div>';
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  window.addToCart = function(pid) {
    var p = window.currentProduct;
    if (!p) return;
    if (p.colors && p.colors.length && !window.selectedColor) { showSelectPopup(__('toast.select_color')); return; }
    if (p.has_sizes && p.sizes && p.sizes.length && !window.selectedSize) { showSelectPopup(__('toast.select_size')); return; }
    var qty = parseInt(document.getElementById('detailQty').value) || 1;
    var vs = getVariantStock();
    if (qty > vs) { showSelectPopup(__('toast.stock_limit', { count: vs })); return; }
    api('POST', '/cart', { product_id: pid, quantity: qty, color: window.selectedColor || '', size: window.selectedSize || '' }).then(function(r) {
      if (r.error) { toast(r.error, 'error'); return; }
      toast(__('toast.added_to_cart'), 'success');
      updateCartCount();
    }).catch(function() { toast(__('toast.server_error'), 'error'); });
  };

  window.buyNow = function(pid) {
    var p = window.currentProduct;
    if (!p) return;
    if (p.colors && p.colors.length && !window.selectedColor) { showSelectPopup(__('toast.select_color')); return; }
    if (p.has_sizes && p.sizes && p.sizes.length && !window.selectedSize) { showSelectPopup(__('toast.select_size')); return; }
    var qty = parseInt(document.getElementById('detailQty').value) || 1;
    var vs = getVariantStock();
    if (qty > vs) { showSelectPopup(__('toast.stock_limit', { count: vs })); return; }
    api('POST', '/cart', { product_id: pid, quantity: qty, color: window.selectedColor || '', size: window.selectedSize || '' }).then(function(r) {
      if (r.error) { toast(r.error, 'error'); return; }
      window.location = '/checkout.html';
    }).catch(function() { toast(__('toast.server_error'), 'error'); });
  };

  function formatDesc(d) {
    if (!d) return '';
    return d.replace(/\n/g, '<br>');
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    var diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return __('timeago.just_now');
    if (diff < 3600) return __('timeago.minutes', {n: Math.floor(diff/60)});
    if (diff < 86400) return __('timeago.hours', {n: Math.floor(diff/3600)});
    if (diff < 2592000) return __('timeago.days', {n: Math.floor(diff/86400)});
    var lang = localStorage.getItem('lang') || 'bn';
    return new Date(dateStr).toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD');
  }

  window.submitReview = function(pid) {
    var rating = parseInt(document.getElementById('reviewRating').value);
    var comment = document.getElementById('reviewComment').value.trim();
    if (!comment) { toast(__('detail.write_comment'), 'error'); return; }
    api('POST', '/products/' + pid + '/review', { rating: rating, comment: comment }).then(function(r) {
      if (r.error) { toast(r.error === 'review.only_purchased' ? __('detail.review_purchase_hint') : r.error, 'error'); return; }
      toast(__('toast.review_submitted'), 'success');
      document.getElementById('reviewComment').value = '';
      loadProductDetail();
    }).catch(function() { toast(__('toast.server_error'), 'error'); });
  };

  window.editReview = function(pid, ri) {
    var r = window._pdReviews[ri];
    if (!r) return;
    var card = document.getElementById('reviewCard_' + r.id);
    if (!card) return;
    var stars = '';
    for (var i = 1; i <= 5; i++) stars += '<span class="pd-star' + (i <= r.rating ? ' active' : '') + '" data-val="' + i + '" onclick="setEditStars(' + r.id + ',' + i + ')">&#9733;</span>';
    card.innerHTML = '<input type="hidden" id="editRating_' + r.id + '" value="' + r.rating + '">' +
      '<textarea id="editComment_' + r.id + '" class="pd-review-textarea" rows="3">' + esc(r.comment || '') + '</textarea>' +
      '<div class="pd-review-stars" id="editStars_' + r.id + '">' + stars + '</div>' +
      '<div class="pd-review-actions"><button class="btn btn-primary pd-review-submit" onclick="saveReview(' + pid + ',' + r.id + ')">💾 ' + __('detail.review_save') + '</button>' +
      '<button class="pd-review-edit-btn" onclick="loadProductDetail()">✖ ' + __('detail.review_cancel') + '</button></div>';
  };

  window.setEditStars = function(rid, val) {
    var input = document.getElementById('editRating_' + rid);
    if (input) input.value = val;
    var stars = document.querySelectorAll('#editStars_' + rid + ' .pd-star');
    stars.forEach(function(s) { s.classList.toggle('active', parseInt(s.getAttribute('data-val')) <= val); });
  };

  window.saveReview = function(pid, rid) {
    var rating = parseInt(document.getElementById('editRating_' + rid).value);
    var comment = document.getElementById('editComment_' + rid).value.trim();
    if (!comment) { toast(__('detail.write_comment'), 'error'); return; }
    api('PUT', '/products/' + pid + '/reviews/' + rid, { rating: rating, comment: comment }).then(function(r) {
      if (r.error) { toast(r.error, 'error'); return; }
      toast(__('toast.review_updated'), 'success');
      loadProductDetail();
    }).catch(function() { toast(__('toast.server_error'), 'error'); });
  };

  window.deleteReview = function(pid, rid) {
    if (!confirm(__('detail.review_delete_confirm'))) return;
    api('DELETE', '/products/' + pid + '/reviews/' + rid).then(function(r) {
      if (r.error) { toast(r.error, 'error'); return; }
      toast(__('toast.review_deleted'), 'success');
      loadProductDetail();
    }).catch(function() { toast(__('toast.server_error'), 'error'); });
  };

  window.submitQuestion = function(pid) {
    var q = document.getElementById('qaQuestion').value.trim();
    if (!q) { toast(__('detail.write_question'), 'error'); return; }
    api('POST', '/products/' + pid + '/questions', { question: q }).then(function(r) {
      if (r.error) { toast(r.error, 'error'); return; }
      toast(__('detail.question_submitted'), 'success');
      document.getElementById('qaQuestion').value = '';
      loadQuestions(pid);
    }).catch(function() { toast(__('toast.server_error'), 'error'); });
  };

  window.updateCartCount = function() {
    var token = localStorage.getItem('token');
    if (!token) return;
    api('GET', '/cart').then(function(data) {
      var el = document.getElementById('cartCount');
      var floatingEl = document.getElementById('floatingCartCount');
      var count = (data.items || []).reduce(function(s, i) { return s + i.quantity; }, 0);
      if (el) { el.textContent = count; el.style.display = count > 0 ? 'inline' : 'none'; }
      if (floatingEl) { floatingEl.textContent = count; }
    });
  };

  function loadProductDetail() {
    if (!productId) {
      document.getElementById('productDetail').innerHTML = '<div class="empty-state"><h3>' + __('detail.not_found') + '</h3></div>';
      return;
    }
    Promise.all([
      api('GET', '/products/' + productId),
      api('GET', '/admin/settings').catch(function() { return {}; })
    ]).then(function(results) {
      var p = results[0];
      var s = results[1] || {};
      if (!p || p.error) {
        document.getElementById('productDetail').innerHTML = '<div class="empty-state"><h3>' + (p ? esc(p.error) : __('detail.not_found')) + '</h3></div>';
        return;
      }
      window.currentProduct = p;
      window.variantStocks = {};
      var isEn = (document.documentElement.getAttribute('lang') === 'en');
      var trustBadges = [];
      if (s.trust_badges) {
        try { trustBadges = JSON.parse(s.trust_badges).map(function(b) { return b[isEn ? 'en' : 'bn'] || b.bn || ''; }); } catch(e) {}
      }
      if (!trustBadges.length) {
        var trustDefaults = [
          { bn: 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন', en: 'Pay on Delivery' },
          { bn: '৭ দিনের রিটার্ন পলিসি', en: '7 Day Return Policy' },
          { bn: 'ঘটত সময়ের মধ্যে সারা বাংলাদেশে "হোম ডেলিভারি"', en: 'Fast Home Delivery Across Bangladesh' },
          { bn: '২৪/৭ কাস্টমার সাপোর্ট: অর্ডার ট্র্যাকিং', en: '24/7 Customer Support: Order Tracking' },
          { bn: 'ট্রায়াল দিতে সরাসরি অফলাইনে ভিজিট করুন', en: 'Visit offline for trial' }
        ];
        trustDefaults.forEach(function(d) { trustBadges.push(d[isEn ? 'en' : 'bn']); });
      }
      window.trustBadges = trustBadges;
      api('GET', '/products/' + p.id + '/variants').then(function(variants) {
        if (variants && variants.length) {
          variants.forEach(function(v) { window.variantStocks[(v.color || '') + '||' + (v.size || '')] = v.stock; });
        }
        updateVariantStockDisplay();
      }).catch(function() {});

      var imgs = (p.images && p.images.length) ? p.images : [];
      var ciForMain = p.color_images || {};
      if (!imgs.length) {
        var allColorImgs = [];
        (p.colors || []).forEach(function(c) {
          if (ciForMain[c]) allColorImgs = allColorImgs.concat(ciForMain[c]);
        });
        if (allColorImgs.length) imgs = allColorImgs;
      }
      window.allImages = imgs;
      var mainImg = imgs.length ? imgs[0] : '';
      var rating = Math.round(p.avg_rating || 0);
      var stars = '';
      for (var i = 1; i <= 5; i++) stars += '<span class="' + (i <= rating ? '' : 'empty') + '">&#9733;</span>';

      var thumbsHtml = '';
      imgs.forEach(function(url, idx) {
        thumbsHtml += '<div class="pd-thumb' + (idx === 0 ? ' active' : '') + '" onclick="switchImage(' + idx + ')"><img src="' + esc(url) + '" alt=""></div>';
      });

      var savePercent = '';
      if (p.compare_price && Number(p.compare_price) > Number(p.price)) {
        var saved = Math.round((1 - Number(p.price) / Number(p.compare_price)) * 100);
        savePercent = '<span class="pd-discount-tag">-' + saved + '%</span>';
      }

      var catName = p.category_name || '';

      var reviewStars = '';
      for (var ri = 1; ri <= 5; ri++) reviewStars += '<span class="' + (ri <= rating ? '' : 'empty') + '">&#9733;</span>';

      var reviewsContent = '';
      if (p.reviews && p.reviews.length) {
        window._pdReviews = p.reviews;
        reviewsContent += '<div class="pd-review-list">';
        reviewsContent += p.reviews.map(function(r, ri) {
          var s = '';
          for (var j = 1; j <= 5; j++) s += '<span class="' + (j <= r.rating ? '' : 'empty') + '">&#9733;</span>';
          var token = localStorage.getItem('token');
          var userId = null;
          if (token) { try { userId = JSON.parse(atob(token.split('.')[1])).id; } catch(e){} }
          var isOwn = userId && r.user_id === userId;
          var actions = isOwn ? '<div class="pd-review-actions"><button class="pd-review-edit-btn" onclick="editReview(' + p.id + ',' + ri + ')">✏️ ' + __('detail.review_edit') + '</button><button class="pd-review-delete-btn" onclick="deleteReview(' + p.id + ',' + r.id + ')">🗑️ ' + __('detail.review_delete') + '</button></div>' : '';
          return '<div class="pd-review-card" id="reviewCard_' + r.id + '">' +
            '<div class="pd-review-header"><span class="stars">' + s + '</span><span class="pd-review-name">' + esc(r.user_name || '') + '</span></div>' +
            '<span class="pd-review-date">' + timeAgo(r.created_at) + '</span>' +
            (r.comment ? '<div class="pd-review-comment">' + esc(r.comment) + '</div>' : '') +
            actions +
            '</div>';
        }).join('');
        reviewsContent += '</div>';
      } else {
        reviewsContent += '<div class="pd-no-reviews"><span>&#128172;</span><p>' + __('detail.no_reviews') + '</p></div>';
      }

      reviewsContent += '<div id="reviewFormArea"></div>';

      var specsRows = '';
      specsRows += '<tr><td>' + __('detail.spec_code') + '</td><td>' + esc(p.sku || p.id) + '</td></tr>';
      specsRows += '<tr><td>' + __('detail.spec_brand') + '</td><td>' + esc(p.brand || __('detail.brand_default')) + '</td></tr>';
      specsRows += '<tr><td>' + __('detail.spec_category') + '</td><td>' + esc(catName || '-') + '</td></tr>';
      specsRows += '<tr><td>' + __('detail.spec_stock') + '</td><td>' + (p.stock > 0 ? '&#9989; ' + (__('detail.in_stock', {count: p.stock}) || 'In Stock (' + p.stock + ')') : '&#10060; ' + __('detail.out_of_stock')) + '</td></tr>';
      if (p.has_sizes && p.sizes && p.sizes.length) specsRows += '<tr><td>' + __('detail.spec_sizes') + '</td><td>' + esc(p.sizes.join(', ')) + '</td></tr>';

      /* ======== BUILD HTML ======== */
      var html = '';

      /* Main Layout: image on top + details below */
      html += '<div class="pd-layout">';

      /* Breadcrumb */
      html += '<div class="pd-breadcrumb" style="grid-column:1/-1;"><a href="/">' + __('nav.home') + '</a><span class="pd-bc-sep"> › </span><a href="/products.html">' + __('nav.products') + '</a>' + (catName ? '<span class="pd-bc-sep"> › </span><a href="/products.html?category=' + esc(p.category_slug || '') + '">' + esc(catName) + '</a>' : '') + '<span class="pd-bc-sep"> › </span><span>' + esc(window.productName(p)) + '</span></div>';

      /* === Gallery === */
      html += '<div class="pd-gallery">';
      html += '<div class="pd-gallery-inner">';
      html += '<div class="pd-main-image">';
      if (mainImg) {
        html += '<div class="pd-img-wrap"><img id="pdMainImg" src="' + esc(mainImg) + '" alt="' + esc(window.productName(p)) + '" onclick="zoomImage(this.src)"></div>';
      } else {
        html += '<div class="pd-no-img"><span>&#128247;</span><p>' + __('products.no_image') + '</p></div>';
      }
      html += '</div>'; /* end pd-main-image */
      if (thumbsHtml) html += '<div class="pd-thumbnails" id="pdThumbs">' + thumbsHtml + '</div>';
      html += '</div>'; /* end pd-gallery-inner */
      html += '</div>'; /* end pd-gallery */

      /* === Info Column (direct child of pd-layout) === */
      html += '<div class="pd-info">';

      /* Title */
      html += '<h1 class="pd-title">' + esc(window.productName(p)) + '</h1>';

      /* SKU */
      html += '<div class="pd-sku">' + __('detail.spec_code') + ' : ' + esc(p.sku || p.id) + '</div>';

      /* Price */
      html += '<div class="pd-price-row">';
      html += '<span class="pd-current-price">' + taka(p.price) + '</span>';
      if (p.compare_price && Number(p.compare_price) > Number(p.price)) {
        html += '<span class="pd-old-price">' + taka(p.compare_price) + '</span>';
      }
      html += '</div>';

      /* Colors - Image Swatches */
      if (p.colors && p.colors.length) {
        html += '<div class="pd-option-section">';
        html += '<div class="pd-option-label">' + (__('detail.color') || 'Color') + ' : <strong id="pdColorSelected"></strong> <span class="pd-dropdown-arrow">&#9660;</span></div>';
        html += '<div class="pd-color-row" id="pdColorRow">';
        var ci = p.color_images || {};
        p.colors.forEach(function(c) {
          var colorImg = (ci[c] && ci[c].length) ? ci[c][0] : ((p.images && p.images.length) ? p.images[0] : '');
          var displayName = colorDisplayName(c);
          var cssColor = c.indexOf('|') !== -1 ? c.split('|')[1] || c.split('|')[0] : c;
          html += '<div class="pd-color-swatch" onclick="selectColor(\'' + esc(c) + '\', this)" title="' + esc(displayName) + '">';
          if (colorImg) {
            html += '<img src="' + esc(colorImg) + '" alt="' + esc(displayName) + '">';
          } else {
            html += '<div class="pd-color-placeholder" style="background:' + esc(cssColor) + ';"></div>';
          }
          html += '</div>';
        });
        html += '</div></div>';
      }

      /* Sizes */
      if (p.has_sizes && p.sizes && p.sizes.length) {
        html += '<div class="pd-option-section">';
        html += '<div class="pd-option-header"><span class="pd-option-label">' + (__('detail.select_size') || 'Select Size') + ' :</span> <button class="pd-size-chart-btn" onclick="showSizeChart()">' + (__('detail.size_chart') || 'Size Chart') + '</button></div>';
        html += '<div class="pd-size-row" id="pdSizeRow">';
        p.sizes.forEach(function(s) {
          html += '<button class="pd-size-btn" onclick="selectSize(\'' + esc(s) + '\', this)">' + esc(s) + '</button>';
        });
        html += '</div></div>';
      }

      /* Quantity + Order button on same line */
      html += '<div class="pd-qty-section">';
      html += '<span class="pd-qty-label">' + (__('detail.select_qty') || 'Select Quantity') + ' :</span>';
      html += '<div class="pd-qty-row">';
      html += '<div class="pd-qty-controls">';
      html += '<button class="pd-qty-btn" onclick="changeQty(-1)">&#8722;</button>';
      html += '<input class="pd-qty-input" type="text" id="detailQty" value="1" readonly>';
      html += '<button class="pd-qty-btn" onclick="changeQty(1)">+</button>';
      html += '</div>';
      if (p.stock > 0) {
        html += '<button class="pd-qty-order-btn" onclick="buyNow(' + p.id + ')">&#128722; ' + (__('detail.buy_now') || 'অর্ডার করুন') + '</button>';
      }
      html += '</div>';
      html += '</div>';

      /* Stock badge */
      html += '<span class="pd-stock-badge ' + (p.stock > 0 ? 'in-stock' : 'out-stock') + '">' + (p.stock > 0 ? '&#9989; ' + (__('detail.in_stock', {count: p.stock}) || 'In Stock (' + p.stock + ')') : '&#10060; ' + __('detail.out_of_stock')) + '</span>';

      /* Action buttons - Find in Store + Add to Cart */
      html += '<div id="pdActionArea">';
      if (p.stock > 0) {
        html += '<button class="pd-btn-order" onclick="addToCart(' + p.id + ')">&#128722; ' + (__('detail.add_to_cart') || 'কার্টে যোগ করুন') + '</button>';
      } else {
        html += '<button class="pd-btn-order pd-btn-disabled" disabled>&#10060; ' + (__('detail.stock_out_btn') || 'Out of Stock') + '</button>';
      }
      html += '</div>';

      /* Social Share */
      html += '<div class="pd-social-share">';
      html += '<a href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href) + '" target="_blank" rel="noopener" class="pd-social-icon pd-social-fb"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>';
      html += '<a href="https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent(window.productName(p)) + '" target="_blank" rel="noopener" class="pd-social-icon pd-social-tw"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>';
      html += '<a href="https://www.instagram.com/" target="_blank" rel="noopener" class="pd-social-icon pd-social-ig"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/></svg></a>';
      html += '</div>';

      html += '</div>'; /* end pd-info */

      /* === Trust Badges Right Column (direct child of pd-layout) === */
      html += '<div class="pd-trust-col">';
      html += '<div class="pd-trust-box">';
      var tb = window.trustBadges || [];
      tb.forEach(function(text) {
        if (text) html += '<div class="pd-trust-item"><span class="pd-trust-check">&#10003;</span><span>' + esc(text) + '</span></div>';
      });
      html += '</div>'; /* end pd-trust-box */
      html += '</div>'; /* end pd-trust-col */

      html += '</div>'; /* end pd-layout */

      /* ======== Tabs ======== */
      html += '<div class="pd-tabs-wrap">';
      html += '<div class="pd-tabs-nav" id="pdTabsNav">';
      html += '<button class="pd-tab-btn active" data-tab="desc" onclick="switchPdTab(\'desc\')">' + (__('detail.tab_desc') || 'DESCRIPTION') + '</button>';
      html += '<button class="pd-tab-btn" data-tab="reviews" onclick="switchPdTab(\'reviews\')">' + (__('detail.tab_reviews') || 'REVIEW') + ' (' + (p.review_count || 0) + ')</button>';
      html += '<button class="pd-tab-btn" data-tab="specs" onclick="switchPdTab(\'specs\')">&#128203; ' + (__('detail.tab_specs') || 'Specifications') + '</button>';
      html += '<button class="pd-tab-btn" data-tab="qa" onclick="switchPdTab(\'qa\')">&#10067; ' + (__('detail.tab_qa') || 'Q&A') + '</button>';
      html += '</div>';

      html += '<div class="pd-tab-content active" id="pdTab-desc"><div class="pd-section-inner"><div class="pd-desc">' + formatDesc(p.description) + '</div></div></div>';
      html += '<div class="pd-tab-content" id="pdTab-reviews"><div class="pd-section-inner">' + reviewsContent + '</div></div>';
      html += '<div class="pd-tab-content" id="pdTab-specs"><div class="pd-section-inner"><table class="pd-spec-table"><tbody>' + specsRows + '</tbody></table></div></div>';
      html += '<div class="pd-tab-content" id="pdTab-qa"><div class="pd-section-inner">';
      html += '<div class="pd-qa-form"><textarea id="qaQuestion" class="pd-qa-textarea" placeholder="' + __('detail.qa_placeholder') + '" rows="2"></textarea><button class="pd-qa-submit" onclick="submitQuestion(' + p.id + ')">&#128228; ' + __('detail.qa_submit') + '</button></div>';
      html += '<div class="pd-qa-list" id="pdQaList"><div class="pd-no-qa">&#128172; ' + __('detail.qa_no_questions') + '</div></div>';
      html += '</div></div>';
      html += '</div>';

      /* Related */
      html += '<div class="pd-related" id="aiRecs" style="margin-top:32px;">';
      html += '<h3 class="pd-section-title">' + __('detail.related_products') + '</h3>';
      html += '<div class="pd-related-grid" id="aiRecsRow"></div>';
      html += '</div>';

      document.getElementById('productDetail').innerHTML = html;
      window.pdImages = imgs;
      window.pdActiveTab = 'desc';
      loadAiRecs();
      loadReviewForm(p.id);

      if (location.hash === '#reviews') {
        setTimeout(function() { switchPdTab('reviews'); }, 100);
      }

      /* Auto-select first color if product has color_images */
      if (p.colors && p.colors.length && p.color_images) {
        var firstColorWithImages = p.colors.find(function(c) { return p.color_images[c] && p.color_images[c].length; });
        if (firstColorWithImages) {
          var firstSwatch = document.querySelector('.pd-color-swatch');
          if (firstSwatch) selectColor(firstColorWithImages, firstSwatch);
        }
      }
    });
  }

  function loadReviewForm(pid) {
    var area = document.getElementById('reviewFormArea');
    if (!area) return;
    var token = localStorage.getItem('token');
    if (!token) {
      area.innerHTML = '<div class="pd-review-login-hint"><p>&#128274; ' + __('detail.review_login_hint') + ' <a href="/auth.html">' + __('nav.login') + '</a></p></div>';
      return;
    }
    api('GET', '/products/' + pid + '/review-status').then(function(st) {
      if (st.hasReviewed) {
        area.innerHTML = '<div class="pd-review-done"><p>&#9989; ' + __('detail.review_already') + '</p></div>';
      } else if (!st.hasPurchased) {
        area.innerHTML = '<div class="pd-review-login-hint"><p>&#128722; ' + __('detail.review_purchase_hint') + '</p></div>';
      } else {
        area.innerHTML = '<div class="pd-review-form">' +
          '<h4>&#9997; ' + __('detail.review_title') + '</h4>' +
          '<div class="pd-review-stars" id="reviewStars">' +
          [1,2,3,4,5].map(function(i){ return '<span class="pd-star" data-val="' + i + '" onclick="setReviewStars(' + i + ')">&#9733;</span>'; }).join('') +
          '</div><input type="hidden" id="reviewRating" value="5">' +
          '<textarea id="reviewComment" class="pd-review-textarea" placeholder="' + __('detail.review_placeholder') + '" rows="3"></textarea>' +
          '<button class="btn btn-primary pd-review-submit" onclick="submitReview(' + pid + ')">&#128228; ' + __('detail.review_submit') + '</button>' +
          '</div>';
        setReviewStars(5);
      }
    }).catch(function() {
      area.innerHTML = '';
    });
  }

  window.setReviewStars = function(val) {
    var input = document.getElementById('reviewRating');
    if (input) input.value = val;
    var stars = document.querySelectorAll('#reviewStars .pd-star');
    stars.forEach(function(s) {
      s.classList.toggle('active', parseInt(s.getAttribute('data-val')) <= val);
    });
  };

  function loadQuestions(pid) {
    var list = document.getElementById('pdQaList');
    if (!list) return;
    api('GET', '/products/' + pid + '/questions').then(function(data) {
      if (!data || !data.length) {
        list.innerHTML = '<div class="pd-no-qa">&#128172; ' + __('detail.qa_no_questions') + '</div>';
        return;
      }
      list.innerHTML = data.map(function(q) {
        var dateStr = timeAgo(q.created_at);
        var answerHtml = q.answer ? '<div class="pd-qa-answer"><span class="pd-qa-answer-label">A:</span> ' + esc(q.answer) + '</div>' : '';
        return '<div class="pd-qa-item"><div class="pd-qa-question"><span class="pd-qa-q-label">Q:</span> ' + esc(q.question) + '</div>' + answerHtml + '<div class="pd-qa-date">' + dateStr + '</div></div>';
      }).join('');
    }).catch(function() {
      list.innerHTML = '<div class="pd-no-qa">&#128172; ' + __('detail.qa_no_questions') + '</div>';
    });
  }

  function loadAiRecs() {
    var el = document.getElementById('aiRecsRow');
    if (!el) return;
    var p = window.currentProduct;
    if (!p || !p.category_id) return;
    api('GET', '/products?category=' + p.category_id + '&limit=6').then(function(data) {
      var products = (data.products || []).filter(function(x) { return x.id !== p.id; }).slice(0, 4);
      if (!products.length) { document.getElementById('aiRecs').style.display = 'none'; return; }
      el.innerHTML = products.map(function(item) {
        var img = (item.images && item.images.length) ? item.images[0] : '';
        return '<a href="/product.html?id=' + item.id + '" class="pd-rec-card">' +
          (img ? '<img src="' + esc(img) + '" alt="' + esc(item.name) + '">' : '<div class="pd-rec-noimg">&#128247;</div>') +
          '<div class="pd-rec-name">' + esc(window.productName(item)) + '</div>' +
          '<div class="pd-rec-price">' + taka(item.price) + '</div>' +
          '</a>';
      }).join('');
    }).catch(function() {});
  }

})();
