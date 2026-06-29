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
    'header.manage_account': { bn: 'প্রোফাইল পরিচালনা', en: 'Manage My Account' },
    'header.my_orders': { bn: 'আমার অর্ডার', en: 'My Orders' },
    'nav.orders': { bn: 'অর্ডার', en: 'Orders' },
    'nav.select_category': { bn: 'ক্যাটাগরি সিলেক্ট করুন', en: 'Select a category' },
    'nav.categories': { bn: 'ক্যাটাগরি', en: 'Categories' },
    'nav.gosite': { bn: 'সাইটে যান', en: 'Go to Site' },
    'nav.search_placeholder': { bn: 'পণ্য খুঁজুন...', en: 'Search products...' },
    'nav.search_btn': { bn: 'খুঁজুন', en: 'Search' },

    /* ----- brand ----- */
    'brand.name': { bn: 'ইশপ', en: 'iShop' },
    'brand.title': { bn: 'ই — শপ', en: 'iShop' },
    'brand.admin': { bn: 'ইশপ অ্যাডমিন', en: 'iShop Admin' },
    'brand.tagline': { bn: 'ইশপ — আপনার পছন্দের পণ্য কিনুন সেরা দামে। ইলেকট্রনিক্স, ফ্যাশন, হোম অ্যাপ্লায়েন্স আরও অনেক কিছু।', en: 'iShop — Buy your favorite products at the best price. Electronics, fashion, home appliances and much more.' },

    /* ----- index page ----- */
    'index.title': { bn: 'ইশপ v2.0 — অনলাইন শপিং', en: 'iShop v2.0 — Online Shopping' },
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
    'products.title': { bn: 'পণ্য — ইশপ v2.0', en: 'Products — iShop v2.0' },
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
    'products.items_found': { bn: 'টি পণ্য পাওয়া গেছে', en: 'items found' },
    'products.filter': { bn: 'ফিল্টার', en: 'Filter' },
    'products.price_filter': { bn: 'দাম', en: 'Price' },
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
    'products.show_more': { bn: 'আরও দেখুন', en: 'Show More' },
    'products.no_image': { bn: 'ছবি নেই', en: 'No Image' },
    'products.ai_recs_title': { bn: '🤖 AI রেকমেন্ডেশন', en: '🤖 AI Recommendation' },

    /* ----- product detail ----- */
    'detail.title': { bn: 'পণ্য — ইশপ v2.0', en: 'Product — iShop v2.0' },
    'detail.reviews': { bn: '{count} রিভিউ', en: '{count} reviews' },
    'detail.no_reviews': { bn: 'কোনো রিভিউ নেই', en: 'No reviews' },
    'detail.brand': { bn: 'ব্র্যান্ড:', en: 'Brand:' },
    'detail.brand_default': { bn: 'ইশপ', en: 'iShop' },
    'detail.color': { bn: 'রং:', en: 'Color:' },
    'detail.size': { bn: 'সাইজ:', en: 'Size:' },
    'detail.select_size': { bn: 'সাইজ নির্বাচন', en: 'Select Size' },
    'detail.size_chart': { bn: 'সাইজ চার্ট', en: 'Size Chart' },
    'detail.select_qty': { bn: 'পরিমাণ নির্বাচন', en: 'Select Quantity' },
    'detail.qty_label': { bn: 'পরিমাণ', en: 'Quantity' },
    'detail.in_stock': { bn: 'স্টকে {count} টি', en: '{count} in stock' },
    'detail.out_of_stock': { bn: 'স্টকে নেই', en: 'Out of stock' },
    'detail.buy_now': { bn: 'এখনই কিনুন', en: 'Buy Now' },
    'detail.add_to_cart': { bn: 'কার্টে যোগ করুন', en: 'Add to Cart' },
    'detail.stock_out_btn': { bn: 'স্টক আউট', en: 'Stock Out' },
    'detail.find_in_store': { bn: 'স্টোরে খুঁজুন', en: 'Find in Store' },
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
    'detail.section_specs': { bn: 'স্পেসিফিকেশন', en: 'Specifications' },
    'detail.section_vendor': { bn: 'বিক্রেতার তথ্য', en: 'Vendor Info' },
    'detail.section_qa': { bn: 'প্রশ্ন ও উত্তর', en: 'Q&A' },
    'detail.section_policy': { bn: 'ডেলিভারি ও রিটার্ন', en: 'Delivery & Returns' },
    'detail.spec_code': { bn: 'প্রোডাক্ট কোড', en: 'Product Code' },
    'detail.spec_brand': { bn: 'ব্র্যান্ড', en: 'Brand' },
    'detail.spec_category': { bn: 'ক্যাটাগরি', en: 'Category' },
    'detail.spec_stock': { bn: 'স্টক', en: 'Stock' },
    'detail.spec_sizes': { bn: 'সাইজ', en: 'Available Sizes' },
    'detail.qa_title': { bn: 'প্রশ্ন করুন', en: 'Ask a Question' },
    'detail.qa_placeholder': { bn: 'আপনার প্রশ্ন লিখুন...', en: 'Write your question...' },
    'detail.qa_submit': { bn: 'প্রশ্ন পাঠান', en: 'Submit Question' },
    'detail.qa_no_questions': { bn: 'এখনো কোনো প্রশ্ন নেই', en: 'No questions yet' },
    'detail.qa_login_hint': { bn: 'প্রশ্ন করতে লগইন করুন', en: 'Login to ask a question' },
    'detail.policy_return': { bn: '৭ দিনের মধ্যে রিটার্ন করা যাবে', en: 'Return within 7 days' },
    'detail.policy_cod': { bn: 'ক্যাশ অন ডেলিভারি উপলব্ধ', en: 'Cash on Delivery available' },
    'detail.policy_shipping': { bn: 'সারা বাংলাদেশে ডেলিভারি', en: 'Delivery across Bangladesh' },
    'detail.trust_cod': { bn: 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন', en: 'Pay on Delivery' },
    'detail.trust_return': { bn: '৭ দিনের রিটার্ন পলিসি', en: '7 Day Return Policy' },
    'detail.trust_delivery': { bn: 'দ্রুত সময়ের মধ্যে সারা বাংলাদেশে "হোম ডেলিভারি"', en: 'Fast Home Delivery Across Bangladesh' },
    'detail.trust_support': { bn: '২৪/৭ কাস্টমার সাপোর্ট: অর্ডার ট্র্যাকিং', en: '24/7 Customer Support: Order Tracking' },
    'detail.order_tracking': { bn: 'অর্ডার ট্র্যাকিং', en: 'Order Tracking' },
    'detail.trust_genuine': { bn: 'ট্রায়াল দিতে সরাসরি অফলাইনে ভিজিট করুন', en: 'Visit offline for trial' },
    'detail.tab_desc': { bn: 'বিবরণ', en: 'Description' },
    'detail.tab_specs': { bn: 'স্পেসিফিকেশন', en: 'Specifications' },
    'detail.tab_reviews': { bn: 'রিভিউ', en: 'Reviews' },
    'detail.tab_qa': { bn: 'প্রশ্ন ও উত্তর', en: 'Q&A' },
    'detail.related_products': { bn: 'সম্পর্কিত পণ্য', en: 'Related Products' },
    'detail.share': { bn: 'শেয়ার করুন', en: 'Share' },

    /* ----- cart ----- */
    'cart.title': { bn: 'শপিং কার্ট — ইশপ v2.0', en: 'Shopping Cart — iShop v2.0' },
    'cart.heading': { bn: 'শপিং কার্ট', en: 'Shopping Cart' },
    'cart.empty': { bn: 'আপনার কার্ট খালি', en: 'Your cart is empty' },
    'cart.see_products': { bn: 'পণ্য দেখতে', en: 'See products' },
    'cart.product_list': { bn: 'পণ্যের তালিকা', en: 'Product list' },
    'cart.color': { bn: 'রং:', en: 'Color:' },
    'cart.size': { bn: 'সাইজ:', en: 'Size:' },
    'cart.remove': { bn: 'সরান', en: 'Remove' },
    'cart.total': { bn: 'মোট:', en: 'Total:' },
    'cart.checkout': { bn: 'অর্ডার করুন', en: 'Place Order' },
    'cart.items': { bn: 'টি পণ্য', en: 'items' },
    'cart.order_summary': { bn: 'অর্ডার সারসংক্ষেপ', en: 'Order Summary' },
    'cart.delivery': { bn: 'ডেলিভারি', en: 'Delivery' },
    'cart.calculated_at_checkout': { bn: 'চেকআউটে হিসাব হবে', en: 'Calculated at checkout' },
    'cart.secure_checkout': { bn: 'নিরাপদ চেকআউট', en: 'Secure checkout' },

    /* ----- checkout ----- */
    'checkout.title': { bn: 'চেকআউট — ইশপ v2.0', en: 'Checkout — iShop v2.0' },
    'checkout.heading': { bn: 'চেকআউট', en: 'Checkout' },
    'checkout.desc': { bn: 'অর্ডারটি কনফার্ম করতে আপনার নাম, ঠিকানা, মোবাইল নাম্বার লিখে অর্ডার কনফার্ম করুন বাটনে ক্লিক করুন', en: 'Enter your name, address, phone number and click Order Confirm to place your order' },
    'checkout.name_label': { bn: 'নাম *', en: 'Name *' },
    'checkout.name_placeholder': { bn: 'আপনার নাম', en: 'Your name' },
    'checkout.phone_label': { bn: 'মোবাইল নাম্বার *', en: 'Mobile Number *' },
    'checkout.phone_placeholder': { bn: '০১XXXXXXXXX', en: '01XXXXXXXXX' },
    'checkout.address_label': { bn: 'ঠিকানা *', en: 'Address *' },
    'checkout.address_placeholder': { bn: 'আপনার পূর্ণ ঠিকানা', en: 'Your full address' },
    'checkout.district_label': { bn: 'জেলা', en: 'District' },
    'checkout.district_select': { bn: '-- জেলা নির্বাচন করুন --', en: '-- Select District --' },
    'checkout.upazila_label': { bn: 'উপজেলা', en: 'Upazila' },
    'checkout.upazila_select': { bn: '-- উপজেলা নির্বাচন করুন --', en: '-- Select Upazila --' },
    'checkout.area_label': { bn: 'এলাকা', en: 'Area' },
    'checkout.area_select': { bn: '-- এলাকা নির্বাচন করুন --', en: '-- Select Area --' },
    'checkout.area_inside': { bn: 'ঢাকার ভিতরে', en: 'Inside Dhaka' },
    'checkout.area_outside': { bn: 'ঢাকার বাইরে', en: 'Outside Dhaka' },
    'checkout.payment_label': { bn: 'পেমেন্ট টাইপ', en: 'Payment Type' },
    'checkout.payment_cod': { bn: 'ক্যাশ অন ডেলিভারি (COD)', en: 'Cash on Delivery (COD)' },
    'checkout.payment_ssl': { bn: 'SSLCommerz (কার্ড/মোবাইল ব্যাংকিং)', en: 'SSLCommerz (Card/Mobile Banking)' },
    'checkout.terms_text': { bn: 'আমি শর্তাবলী, প্রাইভেসি পলিসি এবং রিফান্ড ও রিটার্ন পলিসি পড়েছি এবং সম্মতি দিচ্ছি', en: 'I have read and agree to the Terms & Conditions, Privacy Policy and Refund & Return Policy' },
    'checkout.confirm_btn': { bn: 'অর্ডার কনফার্ম করুন', en: 'Order Confirm' },
    'checkout.order_processing': { bn: 'প্রসেসিং...', en: 'Processing...' },
    'checkout.summary': { bn: 'অর্ডার সারাংশ', en: 'Order Summary' },
    'checkout.cart_empty': { bn: 'কার্ট খালি', en: 'Cart is empty' },
    'checkout.total': { bn: 'মোট', en: 'Total' },
    'checkout.delivery_charge': { bn: 'ডেলিভারি চার্জ', en: 'Delivery Charge' },
    'checkout.select_area': { bn: 'এলাকা নির্বাচন করুন', en: 'Select area' },
    'checkout.phone_invalid': { bn: 'সঠিক ১১ ডিজিটের বাংলাদেশ ফোন নম্বর দিন', en: 'Enter a valid 11-digit Bangladesh phone number' },
    'checkout.area_required': { bn: 'ডেলিভারি এলাকা নির্বাচন করুন', en: 'Select delivery area' },
    'checkout.phone_start': { bn: '০১৩-০১৯ দিয়ে শুরু হতে হবে', en: 'Must start with 013-019' },
    'checkout.phone_length': { bn: '১১ ডিজিট লাগবে ({n}/১১)', en: 'Need 11 digits ({n}/11)' },
    'checkout.phone_max': { bn: 'সর্বোচ্চ ১১ ডিজিট', en: 'Max 11 digits' },
    'checkout.login_required': { bn: 'অর্ডার করতে হলে আপনাকে লগইন করতে হবে', en: 'Please login to place your order' },

    /* ----- auth ----- */
    'auth.title': { bn: 'লগইন / রেজিস্টার — ইশপ v2.0', en: 'Login / Register — iShop v2.0' },
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
    'profile.title': { bn: 'প্রোফাইল — ইশপ v2.0', en: 'Profile — iShop v2.0' },
    'profile.heading': { bn: 'আমার প্রোফাইল', en: 'My Profile' },
    'profile.name': { bn: 'নাম', en: 'Name' },
    'profile.email': { bn: 'ইমেইল', en: 'Email' },
    'profile.phone': { bn: 'ফোন', en: 'Phone' },
    'profile.address': { bn: 'ঠিকানা', en: 'Address' },
    'profile.update': { bn: 'আপডেট করুন', en: 'Update' },
    'orders.title': { bn: 'আমার অর্ডার — ইশপ v2.0', en: 'My Orders — iShop v2.0' },
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
    'orders.status_cancelled': { bn: 'বাতিল', en: 'Cancelled' },
    'orders.status_cancel_requested': { bn: 'বাতিল অনুরোধ', en: 'Cancel Requested' },
    'orders.cancel_btn': { bn: 'অর্ডার বাতিল করুন', en: 'Cancel Order' },
    'orders.reorder': { bn: 'পুনরায় অর্ডার', en: 'Reorder' },
    'orders.reorder_success': { bn: 'সব আইটেম কার্টে যোগ হয়েছে!', en: 'All items added to cart!' },
    'orders.cancel_confirm': { bn: 'আপনি কি নিশ্চিত এই অর্ডারটি বাতিল করতে চান? অ্যাডমিন কনফার্ম করার পর স্টক ফিরে আসবে।', en: 'Are you sure you want to cancel? Stock will restore after admin confirms.' },
    'orders.cancel_success': { bn: 'বাতিল অনুরোধ পাঠানো হয়েছে, অ্যাডমিন কনফার্ম করার পর বাতিল হবে', en: 'Cancel request sent, will be cancelled after admin confirms' },
    'orders.payment_success': { bn: 'পেমেন্ট সফল হয়েছে!', en: 'Payment successful!' },
    'orders.payment_failed': { bn: 'পেমেন্ট ব্যর্থ হয়েছে। অর্ডার বাতিল করা হয়েছে।', en: 'Payment failed. Order has been cancelled.' },
    'orders.payment_cancelled': { bn: 'পেমেন্ট বাতিল করা হয়েছে। অর্ডার বাতিল করা হয়েছে।', en: 'Payment cancelled. Order has been cancelled.' },
    'orders.item_count': { bn: '{count} টি আইটেম', en: '{count} items' },
    'orders.tab_all': { bn: 'সব অর্ডার', en: 'All Orders' },
    'orders.tab_pending': { bn: 'পেন্ডিং', en: 'Pending' },
    'orders.tab_paid': { bn: 'পেইড', en: 'Paid' },
    'orders.tab_processing': { bn: 'প্রসেসিং', en: 'Processing' },
    'orders.tab_shipped': { bn: 'পাঠানো হয়েছে', en: 'Shipped' },
    'orders.tab_delivered': { bn: 'ডেলিভারি', en: 'Delivered' },
    'orders.tab_cancelled': { bn: 'বাতিল', en: 'Cancelled' },
    'orders.search_placeholder': { bn: 'অর্ডার ID বা পণ্যের নাম দিয়ে খুঁজুন...', en: 'Search by Order ID or product name...' },
    'orders.order_id': { bn: 'অর্ডার', en: 'Order' },

    /* ----- admin ----- */
    'admin.dashboard': { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
    'admin.basic_info': { bn: 'মৌলিক তথ্য', en: 'Basic Information' },
    'admin.products': { bn: 'পণ্য', en: 'Products' },
    'admin.categories': { bn: 'ক্যাটাগরি', en: 'Categories' },
    'admin.orders': { bn: 'অর্ডার', en: 'Orders' },
    'admin.variant': { bn: 'ভ্যারিয়েন্ট', en: 'Variant' },
    'admin.items_label': { bn: 'পণ্য', en: 'Items' },
    'admin.product_label': { bn: 'পণ্য', en: 'Product' },
    'admin.qty': { bn: 'পরিমাণ', en: 'Qty' },
    'admin.price_label': { bn: 'দাম', en: 'Price' },
    'admin.total_label': { bn: 'মোট', en: 'Total' },
    'admin.grand_total': { bn: 'সর্বমোট', en: 'Grand Total' },
    'admin.note_label': { bn: 'নোট', en: 'Note' },
    'admin.checkout': { bn: 'চেকআউট', en: 'Checkout' },
    'admin.title_checkout': { bn: 'চেকআউট — অ্যাডমিন', en: 'Checkout — Admin' },
    'admin.checkout_add_product': { bn: 'পণ্য যোগ করুন', en: 'Add Product' },
    'admin.checkout_search_ph': { bn: 'পণ্য খুঁজুন...', en: 'Search products...' },
    'admin.checkout_search': { bn: 'খুঁজুন', en: 'Search' },
    'admin.checkout_cart': { bn: 'কার্ট', en: 'Cart' },
    'admin.checkout_cart_empty': { bn: 'কার্টে কোনো পণ্য নেই', en: 'Cart is empty' },
    'admin.checkout_customer_info': { bn: 'গ্রাহকের তথ্য', en: 'Customer Info' },
    'admin.checkout_name': { bn: 'নাম *', en: 'Name *' },
    'admin.checkout_phone': { bn: 'মোবাইল নাম্বার *', en: 'Mobile Number *' },
    'admin.checkout_address': { bn: 'ঠিকানা *', en: 'Address *' },
    'admin.checkout_area': { bn: 'এলাকা', en: 'Area' },
    'admin.checkout_district': { bn: 'জেলা', en: 'District' },
    'admin.checkout_upazila': { bn: 'উপজেলা', en: 'Upazila' },
    'admin.checkout_payment': { bn: 'পেমেন্ট টাইপ', en: 'Payment Type' },
    'admin.checkout_note': { bn: 'নোট (ঐচ্ছিক)', en: 'Note (optional)' },
    'admin.checkout_confirm': { bn: 'অর্ডার কনফার্ম করুন', en: 'Confirm Order' },
    'admin.users': { bn: 'ব্যবহারকারী', en: 'Users' },
    'admin.revenue': { bn: 'রেভিনিউ', en: 'Revenue' },
    'admin.pending_orders': { bn: 'Pending অর্ডার', en: 'Pending Orders' },
    'admin.all_orders': { bn: 'সব অর্ডার', en: 'All Orders' },
    'admin.new_product': { bn: 'নতুন পণ্য', en: 'New Product' },
    'admin.new_product_title': { bn: 'নতুন পণ্য — ইশপ v2.0', en: 'New Product — iShop v2.0' },
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
    'admin.colors': { bn: 'রং (দুটি ভাষায় যোগ করুন)', en: 'Colors (add in both languages)' },
    'admin.color_header': { bn: 'রং', en: 'Color' },
    'admin.colors_placeholder_bn': { bn: 'রং (বাংলা)', en: 'Color (Bangla)' },
    'admin.colors_placeholder_en': { bn: 'রং (English)', en: 'Color (English)' },
    'admin.colors_add': { bn: '+ যোগ করুন', en: '+ Add' },
    'admin.size_header': { bn: 'সাইজ', en: 'Size' },
    'admin.has_sizes': { bn: 'সাইজ আছে?', en: 'Has sizes?' },
    'admin.variant_stock_title': { bn: '📦 ভ্যারিয়েন্ট অনুযায়ী স্টক', en: '📦 Stock by Variant' },
    'admin.variant_stock_hint': { bn: 'প্রতিটি রং ও সাইজ অনুযায়ী স্টক পরিমাণ দিন। শুধু রং বা শুধু সাইজ হলেও কাজ করবে।', en: 'Set stock for each color and size combination. Works with color-only or size-only too.' },
    'admin.total_stock': { bn: 'মোট স্টক:', en: 'Total Stock:' },
    'admin.date_from': { bn: 'তারিখ থেকে:', en: 'Date From:' },
    'admin.date_to': { bn: 'তারিখ পর্যন্ত:', en: 'Date To:' },
    'admin.filter': { bn: 'ফিল্টার', en: 'Filter' },
    'admin.reset': { bn: 'রিসেট', en: 'Reset' },
    'admin.cal_today': { bn: 'আজ', en: 'Today' },
    'admin.cal_yesterday': { bn: 'গতকাল', en: 'Yesterday' },
    'admin.cal_week': { bn: 'এই সপ্তাহ', en: 'This Week' },
    'admin.cal_month': { bn: 'এই মাস', en: 'This Month' },
    'admin.cal_pick': { bn: 'তারিখ বাছাই', en: 'Pick Date' },
    'admin.cal_from': { bn: 'শুরু', en: 'From' },
    'admin.cal_to': { bn: 'শেষ', en: 'To' },
    'admin.cal_cancel': { bn: 'বাতিল', en: 'Cancel' },
    'admin.cal_apply': { bn: 'প্রয়োগ করুন', en: 'Apply' },
    'admin.chart_revenue': { bn: 'রেভিনিউ ও অর্ডার', en: 'Revenue & Orders' },
    'admin.chart_status': { bn: 'অর্ডার স্ট্যাটাস', en: 'Order Status' },
    'admin.chart_top': { bn: 'সর্বাধিক বিক্রি', en: 'Top Selling Products' },
    'admin.stock_auto_hint': { bn: '↑ ভ্যারিয়েন্ট থেকে অটো আপডেট হবে', en: '↑ Auto-updated from variants' },
    'admin.sizes': { bn: 'সাইজ (কমা দিয়ে আলাদা করুন)', en: 'Sizes (comma separated)' },
    'admin.sizes_placeholder': { bn: 'যেমন: S, M, L, XL', en: 'e.g. S, M, L, XL' },
    'admin.featured': { bn: 'ফিচার্ড', en: 'Featured' },
    'admin.drag_hint': { bn: 'ক্যাটাগরি পুনর্বিন্যাস করতে টেনে আনুন', en: 'Drag to reorder categories' },
    'admin.description': { bn: 'বিবরণ', en: 'Description' },
    'admin.parent_category': { bn: 'প্যারেন্ট ক্যাটাগরি', en: 'Parent Category' },
    'admin.cat_icon': { bn: 'আইকন (Emoji)', en: 'Icon (Emoji)' },
    'admin.images': { bn: 'ছবি', en: 'Images' },
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
    'admin.download_excel': { bn: '📥 Excel ডাউনলোড', en: '📥 Download Excel' },
    'admin.download_success': { bn: 'ডাউনলোড শুরু হয়েছে', en: 'Download started' },
    'admin.id': { bn: 'ID', en: 'ID' },
    'admin.brand_admin': { bn: 'অ্যাডমিন', en: 'Admin' },
    'admin.title_dashboard': { bn: 'অ্যাডমিন ড্যাশবোর্ড — ইশপ v2.0', en: 'Admin Dashboard — iShop v2.0' },
    'admin.title_products': { bn: 'পণ্য — ইশপ v2.0', en: 'Products — iShop v2.0' },
    'admin.title_categories': { bn: 'ক্যাটাগরি — ইশপ v2.0', en: 'Categories — iShop v2.0' },
    'admin.title_orders': { bn: 'অর্ডার — ইশপ v2.0', en: 'Orders — iShop v2.0' },
    'admin.title_users': { bn: 'ব্যবহারকারী — ইশপ v2.0', en: 'Users — iShop v2.0' },
    'admin.name_bn': { bn: 'নাম (বাংলা)', en: 'Name (Bengali)' },
    'admin.name_en': { bn: 'Name (English)', en: 'Name (English)' },
    'admin.en_name': { bn: 'EN Name', en: 'EN Name' },
    'admin.filter_all': { bn: 'সব অর্ডার', en: 'All Orders' },
    'admin.all_payments': { bn: 'সব পেমেন্ট', en: 'All Payments' },
    'admin.login_email': { bn: 'ইমেইল', en: 'Email' },
    'admin.login_pass': { bn: 'পাসওয়ার্ড', en: 'Password' },
    'admin.login_title': { bn: 'অ্যাডমিন লগইন', en: 'Admin Login' },
    'admin.login_sub': { bn: 'আপনার স্টোর পরিচালনা করতে সাইন ইন করুন', en: 'Sign in to manage your store' },
    'admin.login_footer': { bn: 'ইশপ v2.0 — অ্যাডমিন প্যানেল', en: 'iShop v2.0 — Admin Panel' },
    'admin.login_email_ph': { bn: 'admin@email.com', en: 'admin@email.com' },
    'admin.login_pass_ph': { bn: 'পাসওয়ার্ড', en: 'Password' },
    'admin.brand': { bn: 'ব্র্যান্ড', en: 'Brand' },
    'admin.image': { bn: 'ছবি', en: 'Image' },
    'admin.slug': { bn: 'Slug', en: 'Slug' },
    'admin.customer': { bn: 'গ্রাহক', en: 'Customer' },
    'admin.items': { bn: 'আইটেম', en: 'Items' },
    'admin.status': { bn: 'স্ট্যাটাস', en: 'Status' },
    'admin.payment': { bn: 'পেমেন্ট', en: 'Payment' },
    'admin.date': { bn: 'তারিখ', en: 'Date' },
    'admin.update': { bn: 'আপডেট', en: 'Update' },
    'admin.memo': { bn: 'মেমো', en: 'Memo' },
    'admin.out_of_stock': { bn: 'স্টক শেষ', en: 'Out of stock' },
    'admin.actions': { bn: 'অ্যাকশন', en: 'Actions' },
    'admin.questions': { bn: 'প্রশ্ন ও উত্তর', en: 'Q&A' },
    'admin.title_questions': { bn: 'প্রশ্ন ও উত্তর — ইশপ', en: 'Q&A — iShop' },
    'admin.questions_empty': { bn: 'কোনো প্রশ্ন নেই', en: 'No questions' },
    'admin.questions_product': { bn: 'পণ্য', en: 'Product' },
    'admin.questions_question': { bn: 'প্রশ্ন', en: 'Question' },
    'admin.questions_asked_by': { bn: 'জিজ্ঞেস করেছেন', en: 'Asked by' },
    'admin.questions_answer_btn': { bn: 'উত্তর দিন', en: 'Answer' },
    'admin.questions_answered': { bn: 'উত্তর দেওয়া হয়েছে', en: 'Answered' },
    'admin.questions_pending': { bn: 'উত্তর pending', en: 'Pending' },
    'admin.answer_placeholder': { bn: 'আপনার উত্তর লিখুন...', en: 'Write your answer...' },
    'admin.answer_submit': { bn: 'উত্তর পাঠান', en: 'Submit Answer' },
    'admin.answer_saved': { bn: 'উত্তর সংরক্ষিত!', en: 'Answer saved!' },
    'admin.sku': { bn: 'SKU (প্রোডাক্ট কোড)', en: 'SKU (Product Code)' },
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
    'profile.confirm_password': { bn: 'নতুন পাসওয়ার্ড নিশ্চিত করুন', en: 'Confirm New Password' },
    'profile.change_btn': { bn: 'পাসওয়ার্ড পরিবর্তন', en: 'Change Password' },
    'profile.name_ph': { bn: 'আপনার নাম', en: 'Your name' },
    'profile.upload_photo': { bn: 'ছবি আপলোড', en: 'Upload Photo' },
    'profile.wishlist': { bn: 'উইশলিস্ট', en: 'Wishlist' },
    'profile.coupons': { bn: 'কুপন', en: 'Coupons' },
    'profile.points': { bn: 'পয়েন্ট', en: 'Points' },
    'profile.review': { bn: 'রিভিউ', en: 'Review' },
    'profile.reorder': { bn: 'পুনরায়', en: 'Reorder' },
    'profile.browsing_history': { bn: 'ব্রাউজিং', en: 'Browsing' },
    'profile.services': { bn: 'সেবাসমূহ', en: 'Services' },
    'profile.account_settings': { bn: 'অ্যাকাউন্ট সেটিংস', en: 'Account Settings' },
    'profile.address_book': { bn: 'ঠিকানা বই', en: 'Address Book' },
    'profile.language': { bn: 'ভাষা', en: 'Language' },
    'profile.settings': { bn: 'সেটিংস', en: 'Settings' },
    'orders.view_all': { bn: 'সব দেখুন', en: 'View All' },
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
    'toast.select_size': { bn: 'সাইজ নির্বাচন করুন', en: 'Please select a size' },
    'toast.select_color': { bn: 'রং নির্বাচন করুন', en: 'Please select a color' },
    'toast.stock_limit': { bn: 'স্টকে {count} টি আছে, এর বেশি অর্ডার করা যাবে না', en: 'Only {count} in stock, cannot order more' },
    'toast.agree_terms': { bn: 'শর্তাবলীতে সম্মতি দিন', en: 'Please agree to the terms' },
    'toast.enter_phone': { bn: 'ফোন নম্বর দিন', en: 'Enter phone number' },
    'toast.order_success': { bn: 'অর্ডার সফল হয়েছে!', en: 'Order successful!' },
    'toast.server_error': { bn: 'সার্ভার সমস্যা', en: 'Server problem' },
    'toast.payment_error': { bn: 'পেমেন্ট initiation এ সমস্যা', en: 'Payment initiation problem' },
    'toast.order_updated': { bn: 'অর্ডার #{id} → {status}', en: 'Order #{id} → {status}' },
    'toast.lang_switched': { bn: 'ভাষা পরিবর্তন করা হয়েছে: English', en: 'Language switched: বাংলা' },

    /* ----- timeago ----- */
    'timeago.seconds': { bn: '{n} সেকেন্ড আগে', en: '{n} seconds ago' },
    'timeago.just_now': { bn: 'এইমাত্র', en: 'Just now' },
    'timeago.minutes': { bn: '{n} মিনিট আগে', en: '{n} minutes ago' },
    'timeago.hours': { bn: '{n} ঘন্টা আগে', en: '{n} hours ago' },
    'timeago.days': { bn: '{n} দিন আগে', en: '{n} days ago' },
    'detail.size_chart_no_image': { bn: 'সাইজ চার্ট ছবি এখনো যোগ করা হয়নি।', en: 'Size chart image not added yet.' },
    'detail.write_comment': { bn: 'মন্তব্য লিখুন', en: 'Write a comment' },
    'detail.write_question': { bn: 'প্রশ্ন লিখুন', en: 'Write a question' },
    'detail.question_submitted': { bn: 'প্রশ্ন জমা হয়েছে!', en: 'Question submitted!' },

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
    'settings.title': { bn: 'সেটিংস — ইশপ v2.0', en: 'Settings — iShop v2.0' },
    'settings.heading': { bn: 'সাইট সেটিংস', en: 'Site Settings' },
    'settings.tab_site': { bn: 'সাইট নাম', en: 'Site Name' },
    'settings.tab_banners': { bn: 'হিরো ব্যানার', en: 'Hero Banners' },
    'settings.tab_flash': { bn: 'ফ্ল্যাশ সেল', en: 'Flash Sale' },
    'settings.tab_texts': { bn: 'কাস্টম টেক্সট', en: 'Custom Text' },
    'settings.tab_theme': { bn: 'থিম কাস্টমাইজ', en: 'Theme Customize' },
    'settings.tab_footer': { bn: 'ফুটার এডিটর', en: 'Footer Editor' },
    'settings.tab_payment': { bn: 'SSL Commerz', en: 'SSL Commerz' },
    'settings.tab_delivery': { bn: 'ডেলিভারি চার্জ', en: 'Delivery Charge' },
    'settings.delivery_charge_title': { bn: '🚚 ডেলিভারি চার্জ', en: '🚚 Delivery Charge' },
    'settings.inside_dhaka': { bn: 'ঢাকার ভিতরে', en: 'Inside Dhaka' },
    'settings.outside_dhaka': { bn: 'ঢাকার বাইরে', en: 'Outside Dhaka' },
    'settings.save_delivery': { bn: 'ডেলিভারি চার্জ সংরক্ষণ', en: 'Save Delivery Charge' },
    'settings.tab_trust': { bn: 'ট্রাস্ট ব্যাজ', en: 'Trust Badges' },
    'settings.trust_heading': { bn: '🛡️ ট্রাস্ট ব্যাজ — পণ্য পেজে দেখানো হয়', en: '🛡️ Trust Badges — Shown on product page' },
    'settings.trust_info': { bn: 'পণ্যের বিবরণ পেজের ডান পাশে লাল বর্ডারের বক্সে যে ৫টি বিশ্বাসযোগ্যতা ব্যাজ দেখানো হয়, সেগুলো এখানে এডিট করুন।', en: 'Edit the 5 trust badges shown in the red-bordered box on the right side of the product detail page.' },
    'settings.trust_badge_1': { bn: 'ব্যাজ ১ (COD)', en: 'Badge 1 (COD)' },
    'settings.trust_badge_2': { bn: 'ব্যাজ ২ (রিটার্ন)', en: 'Badge 2 (Return)' },
    'settings.trust_badge_3': { bn: 'ব্যাজ ৩ (ডেলিভারি)', en: 'Badge 3 (Delivery)' },
    'settings.trust_badge_4': { bn: 'ব্যাজ ৪ (সাপোর্ট)', en: 'Badge 4 (Support)' },
    'settings.trust_badge_5': { bn: 'ব্যাজ ৫ (জেনুইন)', en: 'Badge 5 (Genuine)' },
    'settings.save_trust': { bn: 'ট্রাস্ট ব্যাজ সংরক্ষণ', en: 'Save Trust Badges' },
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
    'settings.save_flash': { bn: 'ফ্ল্যাশ সেল সংরক্ষণ', en: 'Save Flash Sale' },
    'settings.theme_heading': { bn: 'থিম কাস্টমাইজ', en: 'Theme Customize' },
    'settings.header_bg': { bn: 'হেডার ব্যাকগ্রাউন্ড', en: 'Header Background' },
    'settings.header_text_color': { bn: 'হেডার টেক্সটের রং', en: 'Header Text Color' },
    'settings.body_bg': { bn: 'পেজ ব্যাকগ্রাউন্ড', en: 'Page Background' },
    'settings.primary_color': { bn: 'প্রাইমারি রং', en: 'Primary Color' },
    'settings.footer_bg': { bn: 'ফুটার ব্যাকগ্রাউন্ড', en: 'Footer Background' },
    'settings.footer_text_color': { bn: 'ফুটার টেক্সটের রং', en: 'Footer Text Color' },
    'settings.footer_copyright': { bn: 'কপিরাইট টেক্সট', en: 'Copyright Text' },
    'settings.save_theme': { bn: 'থিম সংরক্ষণ', en: 'Save Theme' },
    'settings.text_heading': { bn: 'কাস্টম টেক্সট', en: 'Custom Text' },
    'settings.text_flash_title': { bn: 'ফ্ল্যাশ সেল শিরোনাম (বাংলা)', en: 'Flash Sale Title (Bengali)' },
    'settings.text_flash_title_en': { bn: 'Flash Sale Title (English)', en: 'Flash Sale Title (English)' },
    'settings.text_flash_all': { bn: 'ফ্ল্যাশ সেল "সব পণ্য" লিংক (বাংলা)', en: 'Flash Sale All Link (Bengali)' },
    'settings.text_flash_all_en': { bn: 'Flash Sale All Link (English)', en: 'Flash Sale All Link (English)' },
    'settings.text_flash_all_link': { bn: 'ফ্ল্যাশ সেল "সব পণ্য" লিংক URL', en: 'Flash Sale All Link URL' },
    'settings.text_categories_title': { bn: 'বিভাগ সেকশন শিরোনাম (বাংলা)', en: 'Categories Title (Bengali)' },
    'settings.text_categories_title_en': { bn: 'Categories Title (English)', en: 'Categories Title (English)' },
    'settings.text_jfy_title': { bn: '"শুধুমাত্র আপনার জন্য" শিরোনাম (বাংলা)', en: 'Just for You Title (Bengali)' },
    'settings.text_jfy_title_en': { bn: 'Just for You Title (English)', en: 'Just for You Title (English)' },
    'settings.save_texts': { bn: 'টেক্সট সংরক্ষণ', en: 'Save Texts' },
    'settings.footer_heading': { bn: 'ফুটার এডিটর', en: 'Footer Editor' },
    'settings.add_col': { bn: '+ কলাম যোগ করুন', en: '+ Add Column' },
    'settings.save_footer': { bn: 'ফুটার সংরক্ষণ', en: 'Save Footer' },
    'settings.col_title_bn': { bn: 'কলাম শিরোনাম (বাংলা)', en: 'Column Title (Bengali)' },
    'settings.col_title_en': { bn: 'Column Title (English)', en: 'Column Title (English)' },
    'settings.links': { bn: 'লিংক সমূহ', en: 'Links' },
    'settings.add_link': { bn: '+ লিংক যোগ করুন', en: '+ Add Link' },
    'settings.link_text_bn_plh': { bn: 'লিংক টেক্সট (বাংলা)', en: 'Link text (Bengali)' },
    'settings.link_text_en_plh': { bn: 'Link text (English)', en: 'Link text (English)' },
    'settings.link_url_plh': { bn: 'URL', en: 'URL' },
    'settings.remove_col': { bn: 'সরান', en: 'Remove' },
    'settings.select_time': { bn: 'সময় নির্বাচন করুন', en: 'Select a time' },
    'settings.invalid_time': { bn: 'অবৈধ সময়', en: 'Invalid time' },

    /* ----- SSL Commerz settings ----- */
    'settings.ssl_heading': { bn: 'SSL Commerz — পেমেন্ট গেটওয়ে', en: 'SSL Commerz — Payment Gateway' },
    'settings.ssl_store_id': { bn: 'স্টোর আইডি', en: 'Store ID' },
    'settings.ssl_store_pass': { bn: 'স্টোর পাসওয়ার্ড', en: 'Store Password' },
    'settings.ssl_mode': { bn: 'মোড', en: 'Mode' },
    'settings.ssl_sandbox': { bn: '🧪 Sandbox (পরীক্ষামূলক)', en: '🧪 Sandbox (Test)' },
    'settings.ssl_live': { bn: '🔴 Live (প্রোডাকশন)', en: '🔴 Live (Production)' },
    'settings.ssl_base_url': { bn: 'Base URL — callback URLs এর জন্য', en: 'Base URL — for callback URLs' },
    'settings.ssl_sandbox_info_title': { bn: 'ℹ️ Sandbox তথ্য:', en: 'ℹ️ Sandbox Info:' },
    'settings.ssl_sandbox_info': { bn: 'Sandbox mode এ testbox / qwerty ব্যবহার করুন। Sandbox এ আসল টাকা কাটবে না।', en: 'Use testbox / qwerty in Sandbox mode. No real money charged in Sandbox.' },
    'settings.ssl_callback_title': { bn: '📌 Callback URLs:', en: '📌 Callback URLs:' },
    'settings.ssl_success': { bn: 'সফল', en: 'Success' },
    'settings.ssl_fail': { bn: 'ব্যর্থ', en: 'Fail' },
    'settings.ssl_cancel': { bn: 'বাতিল', en: 'Cancel' },
    'settings.save_payment': { bn: 'পেমেন্ট সেটিংস সংরক্ষণ', en: 'Save Payment Settings' },

    /* ----- admin team ----- */
    'admin.team_heading': { bn: '🛡️ অ্যাডমিন টিম', en: '🛡️ Admin Team' },
    'admin.team_sidebar': { bn: 'অ্যাডমিন টিম', en: 'Admin Team' },
    'admin.customers_sidebar': { bn: 'গ্রাহক', en: 'Customers' },
    'admin.customers_heading': { bn: 'গ্রাহক ব্যবস্থাপনা', en: 'Customer Management' },
    'admin.create_admin': { bn: '➕ নতুন অ্যাডমিন যোগ করুন', en: '+ Add New Admin' },
    'admin.create_admin_title': { bn: 'নতুন অ্যাডমিন তৈরি করুন', en: 'Create New Admin' },
    'admin.admin_count': { bn: '{count} জন অ্যাডমিন', en: '{count} admins' },
    'admin.no_admins': { bn: 'কোনো অ্যাডমিন নেই', en: 'No admins' },
    'admin.demote': { bn: 'ইউজার করুন', en: 'Make User' },
    'admin.promote': { bn: 'অ্যাডমিন করুন', en: 'Make Admin' },
    'admin.you': { bn: 'আপনি', en: 'You' },
    'admin.join_date': { bn: 'যোগদান', en: 'Joined' },
    'admin.create': { bn: 'তৈরি করুন', en: 'Create' },

    /* ----- profile orders tab ----- */
    'profile.orders_tab': { bn: 'আমার অর্ডার', en: 'My Orders' },
    'profile.profile_tab': { bn: 'প্রোফাইল', en: 'Profile' },
    'profile.cart_tab': { bn: 'কার্ট', en: 'Cart' },
    'profile.info_subtitle': { bn: 'আপনার ব্যক্তিগত তথ্য আপডেট করুন', en: 'Update your personal information' },
    'profile.password_subtitle': { bn: 'নিরাপত্তার জন্য নিয়মিত পাসওয়ার্ড পরিবর্তন করুন', en: 'Change your password regularly for security' },
    'profile.orders_heading': { bn: '📦 আমার অর্ডার', en: '📦 My Orders' },
    'profile.orders_loading': { bn: 'লোড হচ্ছে...', en: 'Loading...' },
    'profile.orders_empty': { bn: 'এখনো কোনো অর্ডার নেই', en: 'No orders yet' },
    'profile.orders_see_products': { bn: 'পণ্য দেখুন', en: 'See Products' },
    'profile.orders_load_error': { bn: 'লোড করা যায়নি', en: 'Failed to load' },
    'profile.orders_items': { bn: 'আইটেম', en: 'items' },

    /* ----- toasts for admin user management ----- */
    'toast.admin_created': { bn: 'অ্যাডমিন তৈরি হয়েছে', en: 'Admin created' },
    'toast.role_updated': { bn: 'রোল আপডেট হয়েছে', en: 'Role updated' },
    'toast.admin_demoted': { bn: 'অ্যাডমিন সাধারণ ইউজার হয়েছে', en: 'Admin demoted to user' },
    'toast.user_deleted': { bn: 'ব্যবহারকারী মুছে ফেলা হয়েছে', en: 'User deleted' },
    'toast.name_email_password_required': { bn: 'নাম, ইমেইল এবং পাসওয়ার্ড দিন', en: 'Name, email and password required' },
    'toast.password_min_4': { bn: 'পাসওয়ার্ড কমপক্ষে ৪ ক্যারেক্টার হতে হবে', en: 'Password must be at least 4 characters' },
    'confirm.demote_admin': { bn: 'এই অ্যাডমিনকে সাধারণ ব্যবহারকারী করতে চান?', en: 'Demote this admin to regular user?' },
    'confirm.make_admin': { bn: 'অ্যাডমিন করতে চান?', en: 'Make admin?' },
    'confirm.make_user': { bn: 'সাধারণ ব্যবহারকারী করতে চান?', en: 'Make regular user?' },
    'confirm.delete_user': { bn: 'এই ব্যবহারকারীকে মুছে ফেলতে চান?', en: 'Delete this user?' },

    /* ----- orders.js ----- */
    'orders.loading': { bn: 'লোড হচ্ছে...', en: 'Loading...' },
    'orders.district': { bn: 'জেলা:', en: 'District:' },
    'orders.upazila': { bn: 'উপজেলা:', en: 'Upazila:' },
    'orders.area': { bn: 'এলাকা:', en: 'Area:' },
    'orders.confirm_cancel': { bn: 'আপনি কি নিশ্চিত এই অর্ডারটি বাতিল করতে চান?', en: 'Are you sure you want to cancel this order?' },
    'orders.cancelled': { bn: 'বাতিল', en: 'Cancelled' },

    /* ----- checkout.js ----- */
    'checkout.processing': { bn: 'অর্ডার প্রক্রিয়া হচ্ছে...', en: 'Processing order...' },
    'checkout.payment_failed': { bn: 'পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', en: 'Payment failed. Try again.' },
    'checkout.payment_cancelled': { bn: 'পেমেন্ট বাতিল করা হয়েছে।', en: 'Payment cancelled.' },
    'checkout.select_payment': { bn: 'পেমেন্ট মেথড নির্বাচন করুন', en: 'Select payment method' },
    'checkout.accept_terms': { bn: 'শর্তাবলী মেনে নিন', en: 'Accept terms' },
    'checkout.payment_error': { bn: 'পেমেন্ট ত্রুটি', en: 'Payment error' },
    'checkout.gateway_error': { bn: 'পেমেন্ট গেটওয়ে ত্রুটি:', en: 'Payment gateway error:' },
    'checkout.order_success': { bn: 'অর্ডার সফল!', en: 'Order successful!' },
    'checkout.server_error': { bn: 'সার্ভার ত্রুটি', en: 'Server error' },
    'checkout.select_method': { bn: '-- পেমেন্ট মেথড নির্বাচন করুন --', en: '-- Select payment method --' },
    'checkout.area_inside': { bn: 'ঢাকার ভিতরে', en: 'Inside Dhaka' },
    'checkout.area_outside': { bn: 'ঢাকার বাইরে', en: 'Outside Dhaka' },
    'checkout.default_name': { bn: 'নাম', en: 'Name' },
    'checkout.default_phone': { bn: 'মোবাইল নাম্বার', en: 'Mobile Number' },
    'checkout.default_address': { bn: 'ঠিকানা', en: 'Address' },
    'checkout.default_address_ph': { bn: 'আপনার পূর্ণ ঠিকানা', en: 'Your full address' },
    'checkout.default_area': { bn: 'এলাকা', en: 'Area' },
    'checkout.default_district': { bn: 'জেলা', en: 'District' },
    'checkout.default_upazila': { bn: 'থানা', en: 'Thana' },
    'checkout.default_payment': { bn: 'পেমেন্ট টাইপ', en: 'Payment Type' },
    'checkout.default_cod': { bn: 'ক্যাশ অন ডেলিভারি (COD)', en: 'Cash on Delivery (COD)' },
    'checkout.default_select': { bn: '-- নির্বাচন --', en: '-- Select --' },
    'checkout.default_district_ph': { bn: '-- জেলা নির্বাচন করুন --', en: '-- Select District --' },
    'checkout.default_upazila_ph': { bn: '-- থানা নির্বাচন করুন --', en: '-- Select Thana --' },
  };

  function getSiteName() {
    try { var s = JSON.parse(localStorage.getItem('siteSettings')); return s && s.site_name !== undefined ? s.site_name : ''; } catch(e) { return ''; }
  }

  window.__ = function (key, vars) {
    var s = strings[key];
    if (!s) return key;
    var t = s[lang] || s.bn || key;
    var sn = getSiteName();
    t = t.replace(/ইশপ/g, sn).replace(/iShop/g, sn);
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
        var t = __(key);
        if (t !== key) el.textContent = t;
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
        if (!document.getElementById('headerProfileDropdown')) {
          var wrap = document.createElement('div');
          wrap.className = 'header-profile-wrap';
          wrap.id = 'headerProfileDropdown';
          wrap.innerHTML = '<a href="javascript:void(0)" class="header-profile-trigger">' +
            '<span>' + __('nav.profile') + '</span> <span class="header-profile-arrow">▾</span></a>' +
            '<div class="header-profile-menu">' +
            '<a href="/profile.html" class="hpm-item" data-pf-tab="profile"><span class="hpm-icon">👤</span> <span>' + __('header.manage_account') + '</span></a>' +
            '<a href="/profile.html#orders" class="hpm-item"><span class="hpm-icon">📦</span> <span>' + __('header.my_orders') + '</span></a>' +
            '<div class="hpm-divider"></div>' +
            '<a href="javascript:void(0)" class="hpm-item hpm-logout" id="hpmLogout"><span class="hpm-icon">🚪</span> <span>' + __('nav.logout') + '</span></a>' +
            '</div>';
          authLink.parentNode.insertBefore(wrap, authLink);
          authLink.style.display = 'none';

          wrap.querySelector('.header-profile-trigger').addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            wrap.classList.toggle('open');
          });
          var logoutBtn = document.getElementById('hpmLogout');
          if (logoutBtn) logoutBtn.addEventListener('click', function(e) { e.preventDefault(); doLogout(); });
        }
      } else {
        authLink.textContent = __('nav.login');
        authLink.href = '/auth.html';
        authLink.onclick = null;
        authLink.style.display = '';
        var dd = document.getElementById('headerProfileDropdown');
        if (dd) dd.remove();
      }
    }
    document.addEventListener('click', function(e) {
      var wrap = document.getElementById('headerProfileDropdown');
      if (wrap && !wrap.contains(e.target)) wrap.classList.remove('open');
    });
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