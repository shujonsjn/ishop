/* ==========================================================
   I18N.JS — Bengali / English site-wide localization
   ========================================================== */
(function () {
  var lang = localStorage.getItem('lang') || 'bn';
  document.documentElement.lang = lang;

  var strings = {
    /* ----- nav ----- */
    'nav.home': { bn: 'হোম', en: 'Home' },
    'nav.products': { bn: 'পণ্য', en: 'Products' },
    'nav.cart': { bn: 'কার্ট', en: 'Cart' },
    'nav.admin': { bn: 'অ্যাডমিন', en: 'Admin' },
    'nav.login': { bn: 'লগইন', en: 'Login' },
    'nav.logout': { bn: 'লগআউট', en: 'Logout' },
    'nav.profile': { bn: 'প্রোফাইল', en: 'Profile' },
    'nav.orders': { bn: 'অর্ডার', en: 'Orders' },
    'nav.gosite': { bn: 'সাইটে যান', en: 'Go to Site' },
    'nav.search_placeholder': { bn: 'পণ্য খুঁজুন...', en: 'Search products...' },
    'nav.search_btn': { bn: 'খুঁজুন', en: 'Search' },

    /* ----- brand ----- */
    'brand.name': { bn: 'ইশপ', en: 'iShop' },
    'brand.title': { bn: 'ই — শপ', en: 'iShop' },
    'brand.admin': { bn: 'ইশপ অ্যাডমিন', en: 'iShop Admin' },
    'brand.tagline': { bn: 'ইশপ — আপনার পছন্দের পণ্য কিনুন সেরা দামে। ইলেকট্রনিক্স, ফ্যাশন, হোম অ্যাপ্লায়েন্স আরও অনেক কিছু।', en: 'iShop — Buy your favorite products at the best price. Electronics, fashion, home appliances and much more.' },

    /* ----- index page ----- */
    'index.title': { bn: 'ইশপ — অনলাইন শপিং', en: 'iShop — Online Shopping' },
    'banner.slide1.title': { bn: 'বিশেষ গ্রীষ্মকালীন সেল', en: 'Special Summer Sale' },
    'banner.slide1.desc': { bn: 'সেরা ব্র্যান্ডের পণ্য সেরা দামে, ডেলিভারি সারা বাংলাদেশ', en: 'Best brand products at best prices, delivery across Bangladesh' },
    'banner.slide1.btn': { bn: 'এখনই কেনাকাটা করুন', en: 'Shop Now' },
    'banner.slide2.title': { bn: 'ফ্ল্যাশ সেল — ৭০% পর্যন্ত ছাড়', en: 'Flash Sale — Up to 70% off' },
    'banner.slide2.desc': { bn: 'সীমিত সময়ের অফার, দেরি করবেন না!', en: 'Limited time offer, don\'t delay!' },
    'banner.slide2.btn': { bn: 'সেল দেখুন', en: 'See Sale' },
    'banner.slide3.title': { bn: 'ফ্রি ডেলিভারি', en: 'Free Delivery' },
    'banner.slide3.desc': { bn: '৫০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি', en: 'Free delivery on orders above 500 Taka' },
    'banner.slide3.btn': { bn: 'পণ্য দেখুন', en: 'See Products' },
    'flash.title': { bn: '⚡ ফ্ল্যাশ সেল', en: '⚡ Flash Sale' },
    'flash.timer': { bn: 'শেষ হবে {time}', en: 'Ends in {time}' },
    'flash.ended': { bn: 'অফার শেষ!', en: 'Offer ended!' },
    'flash.sold': { bn: 'ইতিমধ্যে {count} টি বিক্রি হয়েছে', en: 'Already {count} sold' },
    'flash.all': { bn: 'সব পণ্য কিনুন', en: 'Buy All Products' },
    'categories.title': { bn: 'বিভাগসমূহ', en: 'Categories' },
    'justforyou.title': { bn: 'শুধুমাত্র আপনার জন্য', en: 'Just for You' },
    'justforyou.seeall': { bn: 'সব দেখুন', en: 'See All' },
    'more.show': { bn: 'আরও দেখুন', en: 'Show More' },
    'more.loading': { bn: 'লোড হচ্ছে...', en: 'Loading...' },
    'more.all_shown': { bn: 'সব দেখানো হয়েছে', en: 'All Shown' },

    /* ----- products listing ----- */
    'products.title': { bn: 'পণ্য — ইশপ', en: 'Products — iShop' },
    'products.heading': { bn: 'সব পণ্য', en: 'All Products' },
    'products.sort_label': { bn: 'সাজান:', en: 'Sort:' },
    'products.sort_ai': { bn: 'AI রেকমেন্ডেড', en: 'AI Recommended' },
    'products.sort_newest': { bn: 'নতুন', en: 'Newest' },
    'products.sort_bestselling': { bn: 'বেস্ট সেলিং', en: 'Best Selling' },
    'products.sort_price_asc': { bn: 'দাম (কম)', en: 'Price (Low)' },
    'products.sort_price_desc': { bn: 'দাম (বেশি)', en: 'Price (High)' },
    'products.sidebar_title': { bn: 'বিভাগ', en: 'Categories' },
    'products.sidebar_all': { bn: 'সব পণ্য', en: 'All Products' },
    'products.count': { bn: '{count} টি পণ্য', en: '{count} products' },
    'products.results': { bn: '{count} টি ফলাফল', en: '{count} results' },
    'products.search_title': { bn: 'অনুসন্ধান: "{query}"', en: 'Search: "{query}"' },
    'products.search_page_title': { bn: 'অনুসন্ধান', en: 'Search' },
    'products.empty': { bn: 'কোনো পণ্য পাওয়া যায়নি', en: 'No products found' },
    'products.empty_hint': { bn: 'অন্য কীওয়ার্ড দিয়ে খুঁজুন', en: 'Search with another keyword' },
    'products.breadcrumb_home': { bn: 'হোম', en: 'Home' },
    'products.breadcrumb_products': { bn: 'পণ্য', en: 'Products' },
    'products.breadcrumb_search': { bn: 'অনুসন্ধান', en: 'Search' },
    'products.paging_prev': { bn: '‹ পিছনে', en: '‹ Prev' },
    'products.paging_next': { bn: 'পরবর্তী ›', en: 'Next ›' },
    'products.no_image': { bn: 'ছবি নেই', en: 'No Image' },
    'products.ai_recs_title': { bn: '🤖 AI রেকমেন্ডেশন', en: '🤖 AI Recommendation' },

    /* ----- product detail ----- */
    'detail.title': { bn: 'পণ্য — ইশপ', en: 'Product — iShop' },
    'detail.reviews': { bn: '{count} রিভিউ', en: '{count} reviews' },
    'detail.no_reviews': { bn: 'কোনো রিভিউ নেই', en: 'No reviews' },
    'detail.brand': { bn: 'ব্র্যান্ড:', en: 'Brand:' },
    'detail.brand_default': { bn: 'ইশপ', en: 'iShop' },
    'detail.color': { bn: 'রং:', en: 'Color:' },
    'detail.qty_label': { bn: 'পরিমাণ', en: 'Quantity' },
    'detail.in_stock': { bn: 'স্টকে {count} টি', en: '{count} in stock' },
    'detail.out_of_stock': { bn: 'স্টকে নেই', en: 'Out of stock' },
    'detail.buy_now': { bn: 'এখনই কিনুন', en: 'Buy Now' },
    'detail.add_to_cart': { bn: 'কার্টে যোগ করুন', en: 'Add to Cart' },
    'detail.stock_out_btn': { bn: 'স্টক আউট', en: 'Stock Out' },
    'detail.section_desc': { bn: 'বিবরণ', en: 'Description' },
    'detail.section_reviews': { bn: 'রিভিউ ({count})', en: 'Reviews ({count})' },
    'detail.no_desc': { bn: 'কোনো বিবরণ নেই', en: 'No description' },
    'detail.review_title': { bn: 'রিভিউ দিন', en: 'Give a Review' },
    'detail.review_placeholder': { bn: 'আপনার মন্তব্য...', en: 'Your comment...' },
    'detail.review_submit': { bn: 'রিভিউ পাঠান', en: 'Send Review' },
    'detail.review_rating_5': { bn: '৫ ★', en: '5 ★' },
    'detail.review_rating_4': { bn: '৪ ★', en: '4 ★' },
    'detail.review_rating_3': { bn: '৩ ★', en: '3 ★' },
    'detail.review_rating_2': { bn: '২ ★', en: '2 ★' },
    'detail.review_rating_1': { bn: '১ ★', en: '1 ★' },
    'detail.not_found': { bn: 'পণ্য পাওয়া যায়নি', en: 'Product not found' },

    /* ----- cart ----- */
    'cart.title': { bn: 'শপিং কার্ট — ইশপ', en: 'Shopping Cart — iShop' },
    'cart.heading': { bn: 'শপিং কার্ট', en: 'Shopping Cart' },
    'cart.empty': { bn: 'আপনার কার্ট খালি', en: 'Your cart is empty' },
    'cart.see_products': { bn: 'পণ্য দেখতে', en: 'See products' },
    'cart.product_list': { bn: 'পণ্যের তালিকা', en: 'Product list' },
    'cart.color': { bn: 'রং:', en: 'Color:' },
    'cart.remove': { bn: 'সরান', en: 'Remove' },
    'cart.total': { bn: 'মোট:', en: 'Total:' },
    'cart.checkout': { bn: 'অর্ডার করুন', en: 'Place Order' },

    /* ----- checkout ----- */
    'checkout.title': { bn: 'চেকআউট — ইশপ', en: 'Checkout — iShop' },
    'checkout.heading': { bn: 'চেকআউট', en: 'Checkout' },
    'checkout.address_label': { bn: 'ঠিকানা *', en: 'Address *' },
    'checkout.address_placeholder': { bn: 'আপনার পূর্ণ ঠিকানা', en: 'Your full address' },
    'checkout.phone_label': { bn: 'ফোন *', en: 'Phone *' },
    'checkout.phone_placeholder': { bn: '০১XXXXXXXXX', en: '01XXXXXXXXX' },
    'checkout.note_label': { bn: 'নোট (ঐচ্ছিক)', en: 'Note (optional)' },
    'checkout.payment_label': { bn: 'পেমেন্ট মেথড', en: 'Payment Method' },
    'checkout.payment_cod': { bn: 'ক্যাশ অন ডেলিভারি (COD)', en: 'Cash on Delivery (COD)' },
    'checkout.payment_ssl': { bn: 'SSLCommerz (কার্ড/মোবাইল ব্যাংকিং)', en: 'SSLCommerz (Card/Mobile Banking)' },
    'checkout.order_btn': { bn: 'অর্ডার করুন', en: 'Place Order' },
    'checkout.order_processing': { bn: 'প্রক্রিয়াকরণ...', en: 'Processing...' },
    'checkout.summary': { bn: 'অর্ডার সারাংশ', en: 'Order Summary' },
    'checkout.cart_empty': { bn: 'কার্ট খালি', en: 'Cart is empty' },
    'checkout.total': { bn: 'মোট', en: 'Total' },

    /* ----- auth ----- */
    'auth.title': { bn: 'লগইন / রেজিস্টার — ইশপ', en: 'Login / Register — iShop' },
    'auth.welcome': { bn: 'স্বাগতম', en: 'Welcome' },
    'auth.login_tab': { bn: 'লগইন', en: 'Login' },
    'auth.register_tab': { bn: 'রেজিস্টার', en: 'Register' },
    'auth.email': { bn: 'ইমেইল', en: 'Email' },
    'auth.password': { bn: 'পাসওয়ার্ড', en: 'Password' },
    'auth.login_btn': { bn: 'লগইন করুন', en: 'Login' },
    'auth.name': { bn: 'নাম', en: 'Name' },
    'auth.name_placeholder': { bn: 'আপনার নাম', en: 'Your name' },
    'auth.phone': { bn: 'ফোন', en: 'Phone' },
    'auth.phone_placeholder': { bn: '০১XXXXXXXXX', en: '01XXXXXXXXX' },
    'auth.register_btn': { bn: 'রেজিস্টার করুন', en: 'Register' },
    'auth.send_otp': { bn: 'ওটিপি পাঠান', en: 'Send OTP' },
    'auth.otp': { bn: 'ওটিপি', en: 'OTP' },
    'auth.otp_placeholder': { bn: '৬ ডিজিটের কোড', en: '6-digit code' },
    'auth.resend_otp': { bn: 'পুনরায় পাঠান', en: 'Resend' },
    'auth.email_or_phone': { bn: 'ইমেইল / ফোন', en: 'Email / Phone' },
    'auth.login_phone_hint': { bn: 'ইমেইল বা ফোন নম্বর', en: 'Email or phone number' },
    'toast.otp_sent': { bn: 'ওটিপি পাঠানো হয়েছে!', en: 'OTP sent!' },
    'toast.otp_sent_dev': { bn: 'ওটিপি: {code}', en: 'OTP: {code}' },
    'toast.register_otp_first': { bn: 'প্রথমে ওটিপি নিন', en: 'Get OTP first' },
    'toast.enter_email_or_phone': { bn: 'ইমেইল বা ফোন দিন', en: 'Enter email or phone' },

    /* ----- profile / orders ----- */
    'profile.title': { bn: 'প্রোফাইল — ইশপ', en: 'Profile — iShop' },
    'profile.heading': { bn: 'আমার প্রোফাইল', en: 'My Profile' },
    'profile.name': { bn: 'নাম', en: 'Name' },
    'profile.email': { bn: 'ইমেইল', en: 'Email' },
    'profile.phone': { bn: 'ফোন', en: 'Phone' },
    'profile.address': { bn: 'ঠিকানা', en: 'Address' },
    'profile.update': { bn: 'আপডেট করুন', en: 'Update' },
    'orders.title': { bn: 'আমার অর্ডার — ইশপ', en: 'My Orders — iShop' },
    'orders.heading': { bn: 'আমার অর্ডার', en: 'My Orders' },
    'orders.empty': { bn: 'কোনো অর্ডার নেই', en: 'No orders' },
    'orders.see_products': { bn: 'পণ্য দেখুন', en: 'See products' },
    'orders.login_prompt': { bn: 'লগইন করুন', en: 'Login' },
    'orders.login_link': { bn: 'লগইন পেজ', en: 'Login page' },
    'orders.not_found': { bn: 'অর্ডার পাওয়া যায়নি', en: 'Order not found' },
    'orders.back': { bn: '← আমার অর্ডার', en: '← My Orders' },
    'orders.items': { bn: 'আইটেম', en: 'Items' },
    'orders.total': { bn: 'মোট', en: 'Total' },
    'orders.shipping': { bn: 'শিপিং তথ্য', en: 'Shipping Info' },
    'orders.address': { bn: 'ঠিকানা:', en: 'Address:' },
    'orders.phone': { bn: 'ফোন:', en: 'Phone:' },
    'orders.note': { bn: 'নোট:', en: 'Note:' },
    'orders.payment': { bn: 'পেমেন্ট:', en: 'Payment:' },
    'orders.status_pending': { bn: 'পেন্ডিং', en: 'Pending' },
    'orders.status_paid': { bn: 'পেইড', en: 'Paid' },
    'orders.status_processing': { bn: 'প্রসেসিং', en: 'Processing' },
    'orders.status_shipped': { bn: 'শিপড', en: 'Shipped' },
    'orders.status_delivered': { bn: 'ডেলিভারড', en: 'Delivered' },
    'orders.item_count': { bn: '{count} টি আইটেম', en: '{count} items' },

    /* ----- admin ----- */
    'admin.dashboard': { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
    'admin.products': { bn: 'পণ্য', en: 'Products' },
    'admin.categories': { bn: 'ক্যাটাগরি', en: 'Categories' },
    'admin.orders': { bn: 'অর্ডার', en: 'Orders' },
    'admin.users': { bn: 'ব্যবহারকারী', en: 'Users' },
    'admin.revenue': { bn: 'রেভিনিউ', en: 'Revenue' },
    'admin.pending_orders': { bn: 'Pending অর্ডার', en: 'Pending Orders' },
    'admin.all_orders': { bn: 'সব অর্ডার', en: 'All Orders' },
    'admin.new_product': { bn: '+ নতুন পণ্য', en: '+ New Product' },
    'admin.new_category': { bn: '+ নতুন', en: '+ New' },
    'admin.login_prompt': { bn: 'অ্যাডমিন লগইন করুন', en: 'Admin Login' },
    'admin.login_btn': { bn: 'লগইন', en: 'Login' },
    'admin.name': { bn: 'নাম', en: 'Name' },
    'admin.category': { bn: 'ক্যাটাগরি', en: 'Category' },
    'admin.select_category': { bn: 'ক্যাটাগরি নির্বাচন করুন', en: 'Select Category' },
    'admin.price': { bn: 'দাম (৳)', en: 'Price (৳)' },
    'admin.purchase_price': { bn: 'ক্রয় মূল্য (৳)', en: 'Purchase Price (৳)' },
    'admin.compare_price': { bn: 'ছাড় মূল্য (ঐচ্ছিক)', en: 'Discount Price (optional)' },
    'admin.stock': { bn: 'স্টক', en: 'Stock' },
    'admin.colors': { bn: 'রং (কমা দিয়ে আলাদা করুন)', en: 'Colors (comma separated)' },
    'admin.colors_placeholder': { bn: 'যেমন: লাল, নীল, কালো', en: 'e.g. Red, Blue, Black' },
    'admin.featured': { bn: 'ফিচার্ড', en: 'Featured' },
    'admin.description': { bn: 'বিবরণ', en: 'Description' },
    'admin.image_upload': { bn: 'ছবি আপলোড', en: 'Image Upload' },
    'admin.image_url': { bn: 'ছবির URL (JSON array)', en: 'Image URL (JSON array)' },
    'admin.save': { bn: 'সংরক্ষণ', en: 'Save' },
    'admin.cancel': { bn: 'বাতিল', en: 'Cancel' },
    'admin.edit': { bn: 'সম্পাদনা', en: 'Edit' },
    'admin.preview': { bn: 'প্রিভিউ', en: 'Preview' },
    'admin.delete': { bn: 'মুছুন', en: 'Delete' },
    'admin.confirm': { bn: 'নিশ্চিত?', en: 'Confirm?' },
    'admin.deleted': { bn: 'মুছে ফেলা হয়েছে', en: 'Deleted' },
    'admin.saved': { bn: 'সংরক্ষিত!', en: 'Saved!' },
    'admin.uploading': { bn: 'আপলোড হচ্ছে...', en: 'Uploading...' },
    'admin.upload_ok': { bn: 'আপলোড সফল!', en: 'Upload successful!' },
    'admin.upload_error': { bn: 'ত্রুটি: {msg}', en: 'Error: {msg}' },
    'search.no_results': { bn: 'কোন পণ্য পাওয়া যায়নি', en: 'No products found' },
    'admin.no_products': { bn: 'কোনো পণ্য নেই', en: 'No products' },
    'admin.no_categories': { bn: 'কোনো ক্যাটাগরি নেই', en: 'No categories' },
    'admin.no_users': { bn: 'কোনো ব্যবহারকারী নেই', en: 'No users' },
    'admin.role': { bn: 'রোল', en: 'Role' },
    'admin.no_orders': { bn: 'কোনো অর্ডার নেই', en: 'No orders' },
    'admin.id': { bn: 'ID', en: 'ID' },
    'admin.brand_admin': { bn: 'অ্যাডমিন', en: 'Admin' },
    'admin.title_dashboard': { bn: 'অ্যাডমিন ড্যাশবোর্ড — ইশপ', en: 'Admin Dashboard — iShop' },
    'admin.title_products': { bn: 'পণ্য — ইশপ', en: 'Products — iShop' },
    'admin.title_categories': { bn: 'ক্যাটাগরি — ইশপ', en: 'Categories — iShop' },
    'admin.title_orders': { bn: 'অর্ডার — ইশপ', en: 'Orders — iShop' },
    'admin.title_users': { bn: 'ব্যবহারকারী — ইশপ', en: 'Users — iShop' },
    'admin.name_bn': { bn: 'নাম (বাংলা)', en: 'Name (Bengali)' },
    'admin.name_en': { bn: 'Name (English)', en: 'Name (English)' },
    'admin.en_name': { bn: 'EN Name', en: 'EN Name' },
    'admin.filter_all': { bn: 'সব অর্ডার', en: 'All Orders' },
    'admin.login_email': { bn: 'ইমেইল', en: 'Email' },
    'admin.login_pass': { bn: 'পাসওয়ার্ড', en: 'Password' },
    'admin.login_email_ph': { bn: 'admin@email.com', en: 'admin@email.com' },
    'admin.login_pass_ph': { bn: 'পাসওয়ার্ড', en: 'Password' },
    'admin.image': { bn: 'ছবি', en: 'Image' },
    'admin.slug': { bn: 'Slug', en: 'Slug' },
    'admin.customer': { bn: 'গ্রাহক', en: 'Customer' },
    'admin.items': { bn: 'আইটেম', en: 'Items' },
    'admin.status': { bn: 'স্ট্যাটাস', en: 'Status' },
    'admin.payment': { bn: 'পেমেন্ট', en: 'Payment' },
    'admin.date': { bn: 'তারিখ', en: 'Date' },
    'admin.update': { bn: 'আপডেট', en: 'Update' },
    'admin.out_of_stock': { bn: 'স্টক শেষ', en: 'Out of stock' },
    'nav.logout': { bn: 'লগআউট', en: 'Logout' },

    /* ----- toast / messages ----- */
    'toast.added_to_cart': { bn: 'কার্টে যোগ করা হয়েছে!', en: 'Added to cart!' },
    'toast.please_login': { bn: 'দয়া করে লগইন করুন', en: 'Please login' },
    'toast.review_submitted': { bn: 'রিভিউ দেওয়া হয়েছে!', en: 'Review submitted!' },
    'toast.enter_passwords': { bn: 'পাসওয়ার্ড দিন', en: 'Enter passwords' },
    'toast.password_changed': { bn: 'পাসওয়ার্ড পরিবর্তন হয়েছে!', en: 'Password changed!' },
    'profile.change_password': { bn: 'পাসওয়ার্ড পরিবর্তন', en: 'Change Password' },
    'profile.current_password': { bn: 'বর্তমান পাসওয়ার্ড', en: 'Current Password' },
    'profile.new_password': { bn: 'নতুন পাসওয়ার্ড', en: 'New Password' },
    'profile.change_btn': { bn: 'পাসওয়ার্ড পরিবর্তন', en: 'Change Password' },
    'profile.upload_photo': { bn: 'ছবি আপলোড', en: 'Upload Photo' },
    'toast.photo_updated': { bn: 'ছবি আপডেট হয়েছে!', en: 'Photo updated!' },
    'toast.login_success': { bn: 'লগইন সফল!', en: 'Login successful!' },
    'toast.register_success': { bn: 'রেজিস্টার সফল!', en: 'Registration successful!' },
    'toast.profile_updated': { bn: 'প্রোফাইল আপডেট হয়েছে!', en: 'Profile updated!' },
    'toast.enter_email_password': { bn: 'ইমেইল/ফোন ও পাসওয়ার্ড দিন', en: 'Enter email/phone and password' },
    'toast.enter_name_email_password': { bn: 'নাম, ইমেইল ও পাসওয়ার্ড দিন', en: 'Enter name, email and password' },
    'toast.password_short': { bn: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষর', en: 'Password at least 4 characters' },
    'toast.enter_name': { bn: 'নাম দিন', en: 'Enter name' },
    'toast.enter_price': { bn: 'দাম দিন', en: 'Enter price' },
    'toast.enter_address': { bn: 'ঠিকানা দিন', en: 'Enter address' },
    'toast.enter_phone': { bn: 'ফোন নম্বর দিন', en: 'Enter phone number' },
    'toast.order_success': { bn: 'অর্ডার সফল হয়েছে!', en: 'Order successful!' },
    'toast.server_error': { bn: 'সার্ভার সমস্যা', en: 'Server problem' },
    'toast.payment_error': { bn: 'পেমেন্ট initiation এ সমস্যা', en: 'Payment initiation problem' },
    'toast.order_updated': { bn: 'অর্ডার #{id} → {status}', en: 'Order #{id} → {status}' },
    'toast.lang_switched': { bn: 'ভাষা পরিবর্তন করা হয়েছে: English', en: 'Language switched: বাংলা' },

    /* ----- timeago ----- */
    'timeago.seconds': { bn: '{n} সেকেন্ড আগে', en: '{n} seconds ago' },
    'timeago.minutes': { bn: '{n} মিনিট আগে', en: '{n} minutes ago' },
    'timeago.hours': { bn: '{n} ঘন্টা আগে', en: '{n} hours ago' },
    'timeago.days': { bn: '{n} দিন আগে', en: '{n} days ago' },

    /* ----- footer ----- */
    'footer.customer_service': { bn: 'গ্রাহক সেবা', en: 'Customer Service' },
    'footer.help_center': { bn: 'সাহায্য কেন্দ্র', en: 'Help Center' },
    'footer.how_to_buy': { bn: 'কিভাবে কিনবেন', en: 'How to Buy' },
    'footer.returns': { bn: 'রিটার্ন ও রিফান্ড', en: 'Returns & Refund' },
    'footer.contact': { bn: 'যোগাযোগ', en: 'Contact' },
    'footer.terms': { bn: 'শর্তাবলী', en: 'Terms & Conditions' },
    'footer.about': { bn: 'আমাদের সম্পর্কে', en: 'About Us' },
    'footer.blog': { bn: 'ব্লগ', en: 'Blog' },
    'footer.privacy': { bn: 'গোপনীয়তা নীতি', en: 'Privacy Policy' },
    'footer.app': { bn: 'ইশপ অ্যাপ', en: 'iShop App' },
    'footer.seller': { bn: 'সেলার হন', en: 'Become a Seller' },
    'footer.payment_methods': { bn: 'পেমেন্ট মেথড', en: 'Payment Methods' },
    'footer.copyright': { bn: '© 2026 ইশপ — সকল অধিকার সংরক্ষিত', en: '© 2026 iShop — All rights reserved' },

    /* ----- settings ----- */
    'settings.title': { bn: 'সেটিংস — ইশপ', en: 'Settings — iShop' },
    'settings.heading': { bn: 'সাইট সেটিংস', en: 'Site Settings' },
    'settings.site_name': { bn: 'সাইটের নাম', en: 'Site Name' },
    'settings.logo': { bn: 'লোগো', en: 'Logo' },
    'settings.upload_logo': { bn: 'লোগো আপলোড', en: 'Upload Logo' },
    'settings.remove_logo': { bn: 'লোগো সরান', en: 'Remove Logo' },
    'settings.logo_url': { bn: 'লোগো URL', en: 'Logo URL' },
    'settings.save': { bn: 'সেটিংস সংরক্ষণ', en: 'Save Settings' },
    'admin.settings': { bn: 'সেটিংস', en: 'Settings' },
    'admin.title_settings': { bn: 'সেটিংস — ইশপ', en: 'Settings — iShop' },
    'toast.enter_site_name': { bn: 'সাইটের নাম দিন', en: 'Enter site name' },
    'toast.logo_uploaded': { bn: 'লোগো আপলোড হয়েছে!', en: 'Logo uploaded!' },
    'toast.image_uploaded': { bn: 'ছবি আপলোড হয়েছে!', en: 'Image uploaded!' },

    /* ----- banner settings ----- */
    'settings.banners_heading': { bn: 'হিরো ব্যানার', en: 'Hero Banners' },
    'settings.add_slide': { bn: '+ স্লাইড যোগ করুন', en: '+ Add Slide' },
    'settings.save_banners': { bn: 'ব্যানার সংরক্ষণ', en: 'Save Banners' },
    'settings.up': { bn: 'উপরে', en: 'Up' },
    'settings.down': { bn: 'নিচে', en: 'Down' },
    'settings.remove_slide': { bn: 'সরান', en: 'Remove' },
    'settings.background': { bn: 'পেছনের ছবি', en: 'Background Image' },
    'settings.bg_color': { bn: 'গ্রেডিয়েন্ট / রং', en: 'Gradient / Color' },
    'settings.bg_upload': { bn: 'ছবি আপলোড করুন', en: 'Upload Image' },
    'settings.has_image': { bn: 'ছবি আপলোড করা হয়েছে', en: 'Image uploaded' },
    'settings.change_image': { bn: 'পরিবর্তন', en: 'Change' },
    'settings.remove_image': { bn: 'সরান', en: 'Remove' },
    'settings.title_bn': { bn: 'শিরোনাম (বাংলা)', en: 'Title (Bengali)' },
    'settings.title_en': { bn: 'Title (English)', en: 'Title (English)' },
    'settings.desc_bn': { bn: 'বিবরণ (বাংলা)', en: 'Description (Bengali)' },
    'settings.desc_en': { bn: 'Description (English)', en: 'Description (English)' },
    'settings.btn_bn': { bn: 'বাটন (বাংলা)', en: 'Button (Bengali)' },
    'settings.btn_en': { bn: 'Button (English)', en: 'Button (English)' },
    'settings.btn_link': { bn: 'বাটন লিংক', en: 'Button Link' },
    'settings.btn_color': { bn: 'বাটন কালার', en: 'Button Color' },
    'settings.flash_heading': { bn: 'ফ্ল্যাশ সেল', en: 'Flash Sale' },
    'settings.flash_end_time': { bn: 'শেষ হওয়ার সময়', en: 'End Time' },
    'settings.flash_font_color': { bn: 'ফন্টের রং', en: 'Font Color' },
    'settings.save_flash': { bn: 'ফ্ল্যাশ সেল সংরক্ষণ', en: 'Save Flash Sale' },
  };

  window.__ = function (key, vars) {
    var s = strings[key];
    if (!s) return key;
    var t = s[lang] || s.bn || key;
    if (vars) {
      for (var k in vars) {
        if (vars.hasOwnProperty(k)) {
          t = t.replace('{' + k + '}', vars[k]);
        }
      }
    }
    return t;
  };

  window.getLang = function () { return lang; };
  window.setLang = function (l) {
    if (l !== 'bn' && l !== 'en') return;
    lang = l;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    applyTranslations();
    if (typeof loadCartCount === 'function') loadCartCount();
  };

  window.toggleLang = function () {
    var newLang = lang === 'bn' ? 'en' : 'bn';
    localStorage.setItem('lang', newLang);
    window.location.reload();
  };

  /* Apply data-i18n to static HTML elements */
  function applyTranslations() {
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var key = el.getAttribute('data-i18n');
      var attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, __(key));
      } else {
        el.textContent = __(key);
      }
    }
    /* Also update placeholder */
    var phs = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < phs.length; j++) {
      phs[j].setAttribute('placeholder', __(phs[j].getAttribute('data-i18n-placeholder')));
    }
    /* Update language toggle button text */
    var toggles = document.querySelectorAll('.lang-toggle');
    for (var k = 0; k < toggles.length; k++) {
      toggles[k].textContent = lang === 'bn' ? 'EN' : 'বাংলা';
    }
    /* Update auth link */
    var authLink = document.getElementById('authLink');
    if (authLink) {
      var token = localStorage.getItem('token');
      if (token) {
        authLink.textContent = __('nav.profile');
        authLink.href = '#';
        authLink.onclick = function(e) {
          e.preventDefault();
          if (typeof showProfileModal === 'function') showProfileModal(this);
          else window.location = '/profile.html';
        };
      } else {
        authLink.textContent = __('nav.login');
        authLink.href = '/auth.html';
        authLink.onclick = null;
      }
    }
    var logoutLink = document.getElementById('logoutLink');
    if (logoutLink) logoutLink.textContent = __('nav.logout');
  }

  window.applyTranslations = applyTranslations;

  /* Helper: get category name in current language */
  window.catName = function(cat) {
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    return lang === 'en' ? (cat.en_name || cat.name || '') : (cat.name || '');
  };
  window.catNameStr = function(bnName, enName) {
    return lang === 'en' ? (enName || bnName || '') : (bnName || '');
  };
  window.productName = function(p) {
    if (!p) return '';
    return lang === 'en' ? (p.en_name || p.name || '') : (p.name || '');
  };

  /* Run on DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
})();