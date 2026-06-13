/* Delete all products & re-seed 20 per category */
import db from './db.js';

const productsByCat = {
  /* 1 — ইলেকট্রনিক্স / Electronics */
  1: [
    { n: 'স্যামসাং ৪৩ ইঞ্চি স্মার্ট টিভি', en: 'Samsung 43 Inch Smart TV', p: 48000, cp: 55000 },
    { n: 'সনি ওয়াকম্যান এনডব্লিউ-ডব্লিউএম১এএম২', en: 'Sony Walkman NW-WM1AM2', p: 125000, cp: 140000 },
    { n: 'ফিলিপস ডিভিডি প্লেয়ার', en: 'Philips DVD Player', p: 3500, cp: 4200 },
    { n: 'এলজি সাউন্ডবার ২.১ চ্যানেল', en: 'LG Soundbar 2.1 Channel', p: 12500, cp: 15000 },
    { n: 'স্যামসাং হোম থিয়েটার ৫.১', en: 'Samsung Home Theater 5.1', p: 22000, cp: 26000 },
    { n: 'টিপি-লিংক রাউটার এসি১২০০', en: 'TP-Link Router AC1200', p: 2500, cp: 3000 },
    { n: 'গুগল ক্রোমকাস্ট ৪কে', en: 'Google Chromecast 4K', p: 4500, cp: 5500 },
    { n: 'এমআই স্মার্ট ব্যান্ড ৮', en: 'Mi Smart Band 8', p: 2800, cp: 3500 },
    { n: 'বস সাউন্ডলিংক মিনি ২', en: 'Bose SoundLink Mini 2', p: 18000, cp: 21000 },
    { n: 'জেবিএল চার্জ ৫ স্পিকার', en: 'JBL Charge 5 Speaker', p: 15000, cp: 18000 },
    { n: 'স্যামসাং ট্যাব এস৯ এফই', en: 'Samsung Tab S9 FE', p: 42000, cp: 48000 },
    { n: 'আইপ্যাড ১০ম জেনারেশন', en: 'iPad 10th Generation', p: 45000, cp: 52000 },
    { n: 'কিন্ডল পেপারহোয়াইট', en: 'Kindle Paperwhite', p: 14000, cp: 16500 },
    { n: 'লজিটেক ওয়েবক্যাম সি৯২০', en: 'Logitech Webcam C920', p: 6500, cp: 7800 },
    { n: 'এনভিডিয়া শিল্ড টিভি প্রো', en: 'Nvidia Shield TV Pro', p: 32000, cp: 38000 },
    { n: 'রকু স্ট্রিমিং স্টিক ৪কে', en: 'Roku Streaming Stick 4K', p: 5500, cp: 6500 },
    { n: 'অ্যাপল টিভি ৪কে', en: 'Apple TV 4K', p: 35000, cp: 40000 },
    { n: 'ফিলিপস ইয়ারবাড টিএএইচ১১০৮', en: 'Philips Ear Buds TAH1108', p: 1200, cp: 1500 },
    { n: 'স্যামসাং ওয়্যারলেস চার্জার', en: 'Samsung Wireless Charger', p: 2500, cp: 3000 },
    { n: 'বেলকিন ইউএসবি হাব ৭-ইন-১', en: 'Belkin USB Hub 7-in-1', p: 3500, cp: 4200 },
  ],

  /* 2 — ফ্যাশন / Fashion */
  2: [
    { n: 'ইকোনমি মেনস শার্ট নীল', en: 'Mens Casual Shirt Blue', p: 850, cp: 1200 },
    { n: 'উমেনস কটন ড্রেস লাল', en: 'Womens Cotton Dress Red', p: 1500, cp: 2200 },
    { n: 'মেনস ব্লেজার ব্ল্যাক', en: 'Mens Blazer Black', p: 3500, cp: 4800 },
    { n: 'কিডস ওয়েলভেট পাঞ্জাবি', en: 'Kids Velvet Panjabi', p: 1200, cp: 1600 },
    { n: 'থ্রি-পিস কটন প্রিন্ট', en: 'Three Piece Cotton Print', p: 2200, cp: 3000 },
    { n: 'জিন্স প্যান্ট স্লিম ফিট', en: 'Jeans Pant Slim Fit', p: 1400, cp: 2000 },
    { n: 'হুডি জ্যাকেট গ্রে', en: 'Hoodie Jacket Gray', p: 1800, cp: 2500 },
    { n: 'লেদার ওয়ালেট মেনস', en: 'Leather Wallet Mens', p: 650, cp: 900 },
    { n: 'সানগ্লাস অ্যাভিয়েটর', en: 'Sunglasses Aviator', p: 400, cp: 600 },
    { n: 'সিল্ক শাড়ি গ্রিন', en: 'Silk Saree Green', p: 3500, cp: 5000 },
    { n: 'কামিজ সালোয়ার সেট', en: 'Kameez Salwar Set', p: 2800, cp: 3800 },
    { n: 'হিজাব সেট জর্জেট', en: 'Hijab Set Georgette', p: 900, cp: 1300 },
    { n: 'বেল্ট ব্রাউন লেদার', en: 'Belt Brown Leather', p: 550, cp: 800 },
    { n: 'স্নিকার্স স্পোর্টস হোয়াইট', en: 'Sneakers Sports White', p: 2200, cp: 3200 },
    { n: 'ফর্মাল সু ব্ল্যাক', en: 'Formal Shoe Black', p: 3000, cp: 4200 },
    { n: 'স্যান্ডেল উমেনস ব্রাউন', en: 'Sandals Womens Brown', p: 800, cp: 1200 },
    { n: 'টাই ফর্মাল সিল্ক', en: 'Tie Formal Silk', p: 350, cp: 500 },
    { n: 'হাতব্যাগ উমেনস ব্ল্যাক', en: 'Handbag Womens Black', p: 1800, cp: 2500 },
    { n: 'ব্যাকপ্যাক ট্রাভেল ৪০এল', en: 'Backpack Travel 40L', p: 1600, cp: 2200 },
    { n: 'স্কার্ফ কাশ্মীরি উল', en: 'Scarf Cashmere Wool', p: 1200, cp: 1700 },
  ],

  /* 3 — হোম অ্যাপ্লায়েন্স / Home Appliances */
  3: [
    { n: 'স্যামসাং ফ্রিজ ২৬৫এল', en: 'Samsung Fridge 265L', p: 52000, cp: 60000 },
    { n: 'ওয়ালটন ফ্রিজ ২২০এল', en: 'Walton Fridge 220L', p: 38000, cp: 44000 },
    { n: 'এলজি ওয়াশিং মেশিন ৭কেজি', en: 'LG Washing Machine 7kg', p: 42000, cp: 49000 },
    { n: 'স্যামসাং ওয়াশিং মেশিন ৬.৫কেজি', en: 'Samsung Washing Machine 6.5kg', p: 38000, cp: 45000 },
    { n: 'পানাসনিক মাইক্রোওয়েভ ২০এল', en: 'Panasonic Microwave 20L', p: 12000, cp: 14500 },
    { n: 'ফিলিপস ব্লেন্ডার এইচআর২১১৬', en: 'Philips Blender HR2116', p: 4500, cp: 5500 },
    { n: 'রাইস কুকার ১.৮এল', en: 'Rice Cooker 1.8L', p: 2500, cp: 3200 },
    { n: 'এলজি এয়ার কন্ডিশনার ১.৫ টন', en: 'LG AC 1.5 Ton', p: 65000, cp: 75000 },
    { n: 'জেনারেল এসি ১ টন', en: 'General AC 1 Ton', p: 45000, cp: 52000 },
    { n: 'স্যামসাং ভ্যাকুয়াম ক্লিনার', en: 'Samsung Vacuum Cleaner', p: 8500, cp: 10000 },
    { n: 'কনভেকশন ওভেন ৪২এল', en: 'Convection Oven 42L', p: 8000, cp: 9500 },
    { n: 'ইলেকট্রিক কেটলি ১.৫এল', en: 'Electric Kettle 1.5L', p: 1200, cp: 1600 },
    { n: 'স্যান্ডউইচ মেকার ডাবল', en: 'Sandwich Maker Double', p: 1800, cp: 2400 },
    { n: 'জুসার এক্সট্রাক্টর', en: 'Juicer Extractor', p: 3500, cp: 4500 },
    { n: 'ফিলিপস ইলেকট্রিক আয়রন', en: 'Philips Electric Iron', p: 2200, cp: 3000 },
    { n: 'স্টিম ইরন ড্রাই ও ওয়েট', en: 'Steam Iron Dry & Wet', p: 1500, cp: 2000 },
    { n: 'টোস্টার ২ স্লাইস', en: 'Toaster 2 Slice', p: 1500, cp: 2000 },
    { n: 'এক্সহস্ট ফ্যান ১২ ইঞ্চি', en: 'Exhaust Fan 12 Inch', p: 1800, cp: 2400 },
    { n: 'সিলিং ফ্যান ডিসি মোটর', en: 'Ceiling Fan DC Motor', p: 3500, cp: 4500 },
    { n: 'ওয়াটার হিটার ইনস্ট্যান্ট', en: 'Water Heater Instant', p: 3500, cp: 4500 },
  ],

  /* 4 — মোবাইল / Mobile */
  4: [
    { n: 'আইফোন ১৫ প্রো ম্যাক্স', en: 'iPhone 15 Pro Max', p: 145000, cp: 165000 },
    { n: 'স্যামসাং গ্যালাক্সি এস২৪ আল্ট্রা', en: 'Samsung Galaxy S24 Ultra', p: 135000, cp: 155000 },
    { n: 'ওয়ানপ্লাস ১২', en: 'OnePlus 12', p: 85000, cp: 95000 },
    { n: 'শাওমি ১৪ প্রো', en: 'Xiaomi 14 Pro', p: 75000, cp: 85000 },
    { n: 'ওপো ফাইন্ড এক্স৭ আল্ট্রা', en: 'Oppo Find X7 Ultra', p: 95000, cp: 108000 },
    { n: 'ভিভো এক্স১০০ প্রো', en: 'Vivo X100 Pro', p: 82000, cp: 92000 },
    { n: 'রিয়েলমি জিটি ৬', en: 'Realme GT 6', p: 55000, cp: 62000 },
    { n: 'গুগল পিক্সেল ৮ প্রো', en: 'Google Pixel 8 Pro', p: 100000, cp: 115000 },
    { n: 'নাথিং ফোন ২', en: 'Nothing Phone 2', p: 62000, cp: 70000 },
    { n: 'স্যামসাং গ্যালাক্সি এ৫৫', en: 'Samsung Galaxy A55', p: 42000, cp: 48000 },
    { n: 'শাওমি রেডমি নোট ১৩ প্রো', en: 'Xiaomi Redmi Note 13 Pro', p: 35000, cp: 40000 },
    { n: 'ওপো এন২ ফ্লিপ', en: 'Oppo N2 Flip', p: 72000, cp: 82000 },
    { n: 'মোটোরোলা এজ ৫০ আল্ট্রা', en: 'Motorola Edge 50 Ultra', p: 78000, cp: 88000 },
    { n: 'স্যামসাং গ্যালাক্সি জেড ফোল্ড ৬', en: 'Samsung Z Fold 6', p: 195000, cp: 220000 },
    { n: 'ওয়ানপ্লাস ওপেন', en: 'OnePlus Open', p: 165000, cp: 185000 },
    { n: 'ভিভো ভি৩০ প্রো', en: 'Vivo V30 Pro', p: 45000, cp: 52000 },
    { n: 'ইনফিনিক্স জিরো ৩০', en: 'Infinix Zero 30', p: 28000, cp: 32000 },
    { n: 'টেকনো ক্যামন ২০ প্রো', en: 'Tecno Camon 20 Pro', p: 25000, cp: 30000 },
    { n: 'স্যামসাং গ্যালাক্সি এ১৫', en: 'Samsung Galaxy A15', p: 18000, cp: 22000 },
    { n: 'সিমফোনি ভি৬৫', en: 'Symphony V65', p: 8500, cp: 10000 },
  ],

  /* 5 — বই / Books */
  5: [
    { n: 'হিমু সমগ্র — হুমায়ূন আহমেদ', en: 'Himu Samagra — Humayun Ahmed', p: 650, cp: 800 },
    { n: 'বাংলা একাডেমি অভিধান', en: 'Bangla Academy Dictionary', p: 500, cp: 650 },
    { n: 'চন্দ্রলোক — জাফর ইকবাল', en: 'Chondrolok — Jafar Iqbal', p: 350, cp: 450 },
    { n: 'স্মৃতি কথা — সেলিনা হোসেন', en: 'Smriti Katha — Selina Hossain', p: 400, cp: 550 },
    { n: 'আমার দেখা রাজনীতি — শেখ মুজিব', en: 'Amar Dekha Rajniti — Sheikh Mujib', p: 450, cp: 600 },
    { n: 'রূপসী বাংলা — জীবনানন্দ দাশ', en: 'Ruposhi Bangla — Jibonanondo Das', p: 250, cp: 350 },
    { n: 'ন ন ন — মাইকেল মধুসূদন', en: 'N N N — Michael Madhusudan', p: 200, cp: 300 },
    { n: 'কৃষি অর্থনীতি — ড. ইউনূস', en: 'Krishi Arthaniti — Dr. Yunus', p: 550, cp: 700 },
    { n: 'ডিজিটাল বাংলাদেশ — সজীব ওয়াজেদ', en: 'Digital Bangladesh — Sajeeb Wazed', p: 380, cp: 500 },
    { n: 'প্রথম আলো অমর একুশে', en: 'Prothom Alo Amar Ekushey', p: 300, cp: 400 },
    { n: 'গল্প সমগ্র — রবীন্দ্রনাথ', en: 'Golpo Samagra — Rabindranath', p: 750, cp: 900 },
    { n: 'শ্রেষ্ঠ কবিতা — নজরুল', en: 'Shreshtho Kobita — Nazrul', p: 400, cp: 550 },
    { n: 'উপন্যাস সমগ্র — জহির রায়হান', en: 'Uponnash Samagra — Zahir Raihan', p: 600, cp: 750 },
    { n: 'মুক্তিযুদ্ধের ইতিহাস', en: 'Muktijuddher Itihash', p: 500, cp: 650 },
    { n: 'বিজ্ঞান ফিকশন সমগ্র - হুমায়ূন', en: 'Science Fiction Samagra — Humayun', p: 550, cp: 700 },
    { n: 'ইংলিশ গ্রামার বুক', en: 'English Grammar Book', p: 320, cp: 450 },
    { n: 'ম্যাথমেটিক্স ফর নাইন-টেন', en: 'Mathematics for Nine-Ten', p: 450, cp: 600 },
    { n: 'আইন ও সংবিধান', en: 'Ain O Shongbidhan', p: 380, cp: 500 },
    { n: 'কোরআন শরীফ (বাংলা অনুবাদ)', en: 'Holy Quran (Bangla Translation)', p: 800, cp: 1000 },
    { n: 'বাইবেল (বাংলা ভার্সন)', en: 'Holy Bible (Bangla Version)', p: 600, cp: 800 },
  ],

  /* 7 — কম্পিউটার ও এক্সেসরিজ / Computer & Accessories */
  7: [
    { n: 'ম্যাকবুক প্রো এম৩ ১৪ ইঞ্চি', en: 'MacBook Pro M3 14 Inch', p: 185000, cp: 210000 },
    { n: 'ডেল এক্সপিএস ১৫', en: 'Dell XPS 15', p: 150000, cp: 175000 },
    { n: 'লেনোভো থিংকপ্যাড এক্স১ কার্বন', en: 'Lenovo ThinkPad X1 Carbon', p: 165000, cp: 190000 },
    { n: 'এইচপি স্পেকটর এক্স৩৬০', en: 'HP Spectre x360', p: 140000, cp: 160000 },
    { n: 'এসুস জেনবুক ১৪ ওলেড', en: 'Asus Zenbook 14 OLED', p: 120000, cp: 140000 },
    { n: 'লজিটেক জি৪১২ মেকানিকাল', en: 'Logitech G412 Mechanical', p: 5500, cp: 6500 },
    { n: 'রেজার ডেথঅ্যাডার মাউস', en: 'Razer DeathAdder Mouse', p: 4500, cp: 5500 },
    { n: 'স্যামসাং ২৭ ইঞ্চি মনিটর', en: 'Samsung 27 Inch Monitor', p: 25000, cp: 30000 },
    { n: 'ডেল আল্ট্রাশার্প ২৭ ৪কে', en: 'Dell UltraSharp 27 4K', p: 55000, cp: 65000 },
    { n: 'এলজি গ্রাম ১৭ ইঞ্চি', en: 'LG Gram 17 Inch', p: 170000, cp: 195000 },
    { n: 'স্যামসাং টি৭ পোর্টেবল এসএসডি ১টিবি', en: 'Samsung T7 Portable SSD 1TB', p: 12000, cp: 14500 },
    { n: 'এক্সবক্স ওয়্যারলেস কন্ট্রোলার', en: 'Xbox Wireless Controller', p: 4500, cp: 5500 },
    { n: 'সন ওয়্যারলেস কন্ট্রোলার', en: 'Sony DualSense Wireless', p: 6500, cp: 7800 },
    { n: 'লজিটেক সি৯২২ প্র স্ট্রিম', en: 'Logitech C922 Pro Stream', p: 8500, cp: 10000 },
    { n: 'ব্লু ইয়েটি মাইক্রোফোন', en: 'Blue Yeti Microphone', p: 15000, cp: 18000 },
    { n: 'স্টিলসিরিজ গেমিং হেডসেট', en: 'SteelSeries Gaming Headset', p: 8000, cp: 9500 },
    { n: 'কিংস্টন ৩২জিবি ডিডিআর৪ র‍্যাম', en: 'Kingston 32GB DDR4 RAM', p: 7500, cp: 9000 },
    { n: 'এনভিডিয়া জিফোর্স আরটিএক্স ৪০৬০', en: 'Nvidia GeForce RTX 4060', p: 45000, cp: 52000 },
    { n: 'এসুস আরজি মাউস প্যাড লার্জ', en: 'Asus ROG Mouse Pad Large', p: 2500, cp: 3200 },
    { n: 'অ্যাপল ম্যাজিক কীবোর্ড', en: 'Apple Magic Keyboard', p: 14000, cp: 16500 },
  ],

  /* 8 — খেলাধুলা ও ফিটনেস / Sports & Fitness */
  8: [
    { n: 'এডিডাস ফুটবল ট্রেনিং ব্ল্যাক', en: 'Adidas Football Training Black', p: 2500, cp: 3500 },
    { n: 'নাইকি বাস্কেটবল অরেঞ্জ', en: 'Nike Basketball Orange', p: 3500, cp: 4500 },
    { n: 'ইয়োনেক্স ব্যাডমিন্টন র‍্যাকেট', en: 'Yonex Badminton Racket', p: 4500, cp: 5500 },
    { n: 'ইয়োনেক্স শাটলকক টিউব ১২টি', en: 'Yonex Shuttlecock Tube 12', p: 600, cp: 800 },
    { n: 'টেবিল টেনিস সেট', en: 'Table Tennis Set', p: 3800, cp: 4800 },
    { n: 'ক্রিকেট ব্যাট উইলো ৩২ ইঞ্চি', en: 'Cricket Bat Willow 32 Inch', p: 5500, cp: 7000 },
    { n: 'ক্রিকেট বল লেদার রেড', en: 'Cricket Ball Leather Red', p: 650, cp: 900 },
    { n: 'জিম স্টিল জাম্প রোপ', en: 'Gym Steel Jump Rope', p: 350, cp: 500 },
    { n: 'যোগা ম্যাট এক্সট্রা থিক', en: 'Yoga Mat Extra Thick', p: 1200, cp: 1600 },
    { n: 'ডাম্বেল সেট ২০কেজি', en: 'Dumbbell Set 20kg', p: 4500, cp: 5800 },
    { n: 'কেটলবেল ১২কেজি', en: 'Kettlebell 12kg', p: 2500, cp: 3200 },
    { n: 'ফোল্ডিং ট্রেডমিল ইলেকট্রিক', en: 'Folding Treadmill Electric', p: 55000, cp: 65000 },
    { n: 'পুশ আপ স্ট্যান্ড', en: 'Push Up Stand', p: 800, cp: 1200 },
    { n: 'রেজিস্ট্যান্স ব্যান্ড সেট', en: 'Resistance Band Set', p: 600, cp: 850 },
    { n: 'সুইমিং গগলস এন্টি ফগ', en: 'Swimming Goggles Anti Fog', p: 500, cp: 700 },
    { n: 'বক্সিং গ্লাভস ১০ আউন্স', en: 'Boxing Gloves 10 oz', p: 1800, cp: 2500 },
    { n: 'সাইকেল হেলমেট সেফটি', en: 'Cycle Helmet Safety', p: 1500, cp: 2100 },
    { n: 'ট্র্যাক সুট নাইকি গ্রে', en: 'Track Suit Nike Gray', p: 2800, cp: 3800 },
    { n: 'ফুটবল স্টাড নাইকি মেরকিউরিয়াল', en: 'Football Stud Nike Mercurial', p: 6500, cp: 8000 },
    { n: 'ব্যাডমিন্টন নেট স্ট্যান্ড সহ', en: 'Badminton Net with Stand', p: 2800, cp: 3600 },
  ],

  /* 9 — স্বাস্থ্য ও সৌন্দর্য / Health & Beauty */
  9: [
    { n: 'লাকমে ফেস ওয়াশ অ্যাকনে কন্ট্রোল', en: 'Lakme Face Wash Acne Control', p: 350, cp: 450 },
    { n: 'নিভিয়া ময়েশ্চারাইজার হোয়াইট', en: 'Nivea Moisturizer White', p: 400, cp: 550 },
    { n: 'ফেয়ার অ্যান্ড লাভলি ফেয়ারনেস', en: 'Fair & Lovely Fairness', p: 200, cp: 300 },
    { n: 'গার্নিয়ার মাইক্রোওয়াটার মাইসেলার', en: 'Garnier Micellar Water', p: 550, cp: 700 },
    { n: 'লরিয়াল শ্যাম্পু কালার প্রোটেক্ট', en: 'Loreal Shampoo Color Protect', p: 650, cp: 800 },
    { n: 'ডাভ বডি ওয়াশ ডিপ ময়েশ্চার', en: 'Dove Body Wash Deep Moisture', p: 450, cp: 600 },
    { n: 'ক্লোজ আপ টুথপেস্ট রেড', en: 'Close Up Toothpaste Red', p: 150, cp: 200 },
    { n: 'অরেঞ্জ বডি লোশন ভিটামিন সি', en: 'Orange Body Lotion Vitamin C', p: 380, cp: 500 },
    { n: 'শেভো জেল ফোম ঈগল', en: 'Shave Gel Foam Eagle', p: 280, cp: 380 },
    { n: 'মায়া সাবিনা সিরাম ভিটামিন সি', en: 'Maya Sabina Serum Vitamin C', p: 450, cp: 600 },
    { n: 'লিপ বাম ভ্যাসলিন স্টবেরি', en: 'Lip Balm Vaseline Strawberry', p: 120, cp: 180 },
    { n: 'হেয়ার অয়েল প্যারাচুট অরিজিনাল', en: 'Hair Oil Parachute Original', p: 200, cp: 280 },
    { n: 'লরিয়াল হেয়ার জেল স্ট্রং', en: 'Loreal Hair Gel Strong', p: 350, cp: 480 },
    { n: 'বায়োঅয়েল স্কিন কেয়ার', en: 'Bio-Oil Skin Care', p: 800, cp: 1000 },
    { n: 'নেল পলিশ মেহেন্দি লাল', en: 'Nail Polish Mehndi Red', p: 150, cp: 220 },
    { n: 'কলোন পন্ডস ড্রিম ফ্লাওয়ার', en: 'Cologne Ponds Dream Flower', p: 280, cp: 400 },
    { n: 'সানস্ক্রিন লোটাস ৫০ এসপিএফ', en: 'Sunscreen Lotus 50 SPF', p: 500, cp: 650 },
    { n: 'আই লাইনার মেবেলিন লিকুইড', en: 'Eye Liner Maybelline Liquid', p: 350, cp: 480 },
    { n: 'মিউর এলইডি ফেস ক্লিনিং ব্রাশ', en: 'MEUR LED Face Cleaning Brush', p: 1200, cp: 1600 },
    { n: 'মেনস বডি স্প্রে এক্স রেড', en: 'Mens Body Spray X Red', p: 350, cp: 480 },
  ],

  /* 10 — শিশু খেলনা ও গিফট / Kids Toys & Gifts */
  10: [
    { n: 'লেগো ক্লাসিক ব্রিকস বক্স', en: 'LEGO Classic Bricks Box', p: 4500, cp: 5500 },
    { n: 'অ্যাকশন ফিগার স্পাইডারম্যান', en: 'Action Figure Spiderman', p: 850, cp: 1200 },
    { n: 'বাটারস্লাইম গেম প্লে ডো', en: 'Butter Slime Game Play Doh', p: 350, cp: 500 },
    { n: 'হট হুইলস কার সেট ১০টি', en: 'Hot Wheels Car Set 10 Pcs', p: 1500, cp: 2000 },
    { n: 'টসআপ বোর্ড গেম এলএলবি', en: 'Board Game Ludo Life', p: 650, cp: 900 },
    { n: 'পাজল ছবি ১০০০ পিস', en: 'Puzzle 1000 Pcs', p: 1200, cp: 1600 },
    { n: 'রেঞ্জ রোভার রিমোট কন্ট্রোল গাড়ি', en: 'Range Rover RC Car', p: 2500, cp: 3400 },
    { n: 'নরম টেডি বিয়ার বড়', en: 'Soft Teddy Bear Large', p: 1800, cp: 2400 },
    { n: 'ড্রোন উইথ ক্যামেরা এইচডি', en: 'Drone with Camera HD', p: 5500, cp: 7000 },
    { n: 'ইলেকট্রিক ট্রেন সেট সাউন্ড', en: 'Electric Train Set Sound', p: 3800, cp: 4800 },
    { n: 'সাবান বাবল মেশিন', en: 'Soap Bubble Machine', p: 500, cp: 700 },
    { n: 'পুতুল হাউস উডেন বড়', en: 'Doll House Wooden Large', p: 4200, cp: 5500 },
    { n: 'ওয়াটার গান ইলেকট্রিক', en: 'Water Gun Electric', p: 800, cp: 1200 },
    { n: 'বাচ্চাদের টেট্রিস গেম', en: 'Kids Tetris Game', p: 450, cp: 650 },
    { n: 'মিউজিক্যাল কী বোর্ড ৩৭ কী', en: 'Musical Keyboard 37 Keys', p: 2800, cp: 3800 },
    { n: 'ফ্লাইং ডিস্ক ফ্রিসবি', en: 'Flying Disc Frisbee', p: 350, cp: 500 },
    { n: 'ক্রেয়ন ড্রইং সেট ২৪ রং', en: 'Crayon Drawing Set 24 Colors', p: 280, cp: 400 },
    { n: 'কিডস টেলিফোন বাটারফ্লাই', en: 'Kids Telephone Butterfly', p: 350, cp: 500 },
    { n: 'বেবি ওয়াকার মিউজিক সহ', en: 'Baby Walker with Music', p: 2200, cp: 3000 },
    { n: 'বাচ্চাদের তাঁবু প্লে হাউস', en: 'Kids Tent Play House', p: 2800, cp: 3800 },
  ],

  /* 11 — অটোমোবাইল / Automobile */
  11: [
    { n: 'কাস্টম কার কভার ওয়াটারপ্রুফ', en: 'Custom Car Cover Waterproof', p: 3500, cp: 4500 },
    { n: 'কার ম্যাট ভিনাইল সেট ৪ পিস', en: 'Car Mat Vinyl Set 4 Pcs', p: 2800, cp: 3600 },
    { n: 'এলইডি কার লাইট ফোগ লাইট', en: 'LED Car Light Fog Light', p: 1500, cp: 2200 },
    { n: 'কার স্টিয়ারিং কভার লেদার', en: 'Car Steering Cover Leather', p: 800, cp: 1200 },
    { n: 'এয়ার ফ্রেশনার কার জেল', en: 'Air Freshener Car Gel', p: 250, cp: 400 },
    { n: 'কার ফোন হোল্ডার ম্যাগনেটিক', en: 'Car Phone Holder Magnetic', p: 500, cp: 700 },
    { n: 'জাম্প স্টার্টার কেবল', en: 'Jump Starter Cable', p: 650, cp: 900 },
    { n: 'টায়ার ইনফ্লেটর ইলেকট্রিক', en: 'Tire Inflator Electric', p: 2800, cp: 3800 },
    { n: 'কার ওয়াশিং স্পঞ্জ সেট', en: 'Car Washing Sponge Set', p: 350, cp: 500 },
    { n: 'ড্যাশ ক্যাম ডুয়াল ক্যামেরা', en: 'Dash Cam Dual Camera', p: 4500, cp: 5800 },
    { n: 'বাইক হেলমেট ব্যাসিক ব্ল্যাক', en: 'Bike Helmet Basic Black', p: 1800, cp: 2500 },
    { n: 'বাইক সার্ভিসিং টুলস সেট', en: 'Bike Servicing Tools Set', p: 2200, cp: 3000 },
    { n: 'মোটরসাইকেল কভার ওয়াটারপ্রুফ', en: 'Motorcycle Cover Waterproof', p: 1200, cp: 1600 },
    { n: 'সিট কভার ইউনিভার্সাল', en: 'Seat Cover Universal', p: 2200, cp: 3000 },
    { n: 'কার রিয়ার ভিউ ক্যামেরা', en: 'Car Rear View Camera', p: 2500, cp: 3500 },
    { n: 'সানশেড কার ফ্রন্ট উইন্ডো', en: 'Sunshade Car Front Window', p: 500, cp: 700 },
    { n: 'কার চার্জার ইউএসবি সি', en: 'Car Charger USB C', p: 400, cp: 600 },
    { n: 'ক্রোম সাইড মিরর ক্যাপ', en: 'Chrome Side Mirror Cap', p: 1200, cp: 1700 },
    { n: 'কার ভ্যাকুয়াম ক্লিনার সেট', en: 'Car Vacuum Cleaner Set', p: 3500, cp: 4500 },
    { n: 'বাইক ক্র্যাশ গার্ড প্রোটেক্টর', en: 'Bike Crash Guard Protector', p: 1500, cp: 2200 },
  ],

  /* 12 — ক্যামেরা ও ফটোগ্রাফি / Camera & Photography */
  12: [
    { n: 'ক্যানন ইওএস আর৮', en: 'Canon EOS R8', p: 155000, cp: 175000 },
    { n: 'নিকন জেড৩০', en: 'Nikon Z30', p: 95000, cp: 110000 },
    { n: 'সনি আলফা এ৬৭০০', en: 'Sony Alpha A6700', p: 135000, cp: 155000 },
    { n: 'ফুজিফিল্ম এক্স-টি৫', en: 'Fujifilm X-T5', p: 185000, cp: 210000 },
    { n: 'গোপ্রো হিরো১২ ব্ল্যাক', en: 'GoPro Hero12 Black', p: 45000, cp: 52000 },
    { n: 'ক্যানন ইওএস আরএফ ২৪-১০৫ মিমি', en: 'Canon RF 24-105mm Lens', p: 120000, cp: 140000 },
    { n: 'নিকন ৫০ মিমি এফ/১.৮ লেন্স', en: 'Nikon 50mm f/1.8 Lens', p: 28000, cp: 34000 },
    { n: 'সনি এফই ২৪-৭০ মিমি এফ/২.৮ জিএম II', en: 'Sony FE 24-70mm f/2.8 GM II', p: 220000, cp: 250000 },
    { n: 'ম্যানফ্রোটো ট্রাইপড কমপ্যাক্ট', en: 'Manfrotto Tripod Compact', p: 8500, cp: 10000 },
    { n: 'লোয়েপ্রো ব্যাকপ্যাক ফটোগ্রাফি', en: 'Lowepro Backpack Photography', p: 12000, cp: 14500 },
    { n: 'স্যান্ডিস্ক ৬৪জিবি এসডি কার্ড', en: 'Sandisk 64GB SD Card', p: 1200, cp: 1600 },
    { n: 'সিগমা ৩০ মিমি এফ/১.৪ লেন্স', en: 'Sigma 30mm f/1.4 Lens', p: 45000, cp: 52000 },
    { n: 'ক্যানন জুম লেন্স ৭০-২০০ মিমি', en: 'Canon Zoom Lens 70-200mm', p: 195000, cp: 225000 },
    { n: 'ফিল্টার ইউভি ৭২ মিমি', en: 'Filter UV 72mm', p: 1500, cp: 2200 },
    { n: 'রিং লাইট এলইডি ডিমেবল', en: 'Ring Light LED Dimmable', p: 3500, cp: 4500 },
    { n: 'সফটবক্স স্টুডিও লাইটিং কিট', en: 'Softbox Studio Lighting Kit', p: 8500, cp: 10500 },
    { n: 'ভিডিও ট্রাইপড ফ্লুইড হেড', en: 'Video Tripod Fluid Head', p: 12000, cp: 15000 },
    { n: 'মেমোরি কার্ড কেস', en: 'Memory Card Case', p: 350, cp: 500 },
    { n: 'লেন্স ক্লিনিং কিট', en: 'Lens Cleaning Kit', p: 500, cp: 700 },
    { n: 'ক্যামেরা মনপড অ্যালুমিনিয়াম', en: 'Camera Monopod Aluminum', p: 2200, cp: 3200 },
  ],

  /* 13 — ঘড়ি ও এক্সেসরিজ / Watch & Accessories */
  13: [
    { n: 'রোলেক্স সাবমেরিনার রেপ্লিকা', en: 'Rolex Submariner Replica', p: 5500, cp: 7500 },
    { n: 'টাইটান নিও ক্লাসিক সিলভার', en: 'Titan Neo Classic Silver', p: 4500, cp: 5500 },
    { n: 'অ্যাপল ওয়াচ সিরিজ ৯', en: 'Apple Watch Series 9', p: 45000, cp: 52000 },
    { n: 'স্যামসাং ওয়াচ ৬', en: 'Samsung Watch 6', p: 32000, cp: 38000 },
    { n: 'ক্যাসিও জি-শক ব্ল্যাক', en: 'Casio G-Shock Black', p: 6500, cp: 8000 },
    { n: 'ক্যাসিও এন্ট্রি লেভেল এলইডি', en: 'Casio Entry Level LED', p: 1800, cp: 2500 },
    { n: 'হোয়াইট সিলিকন ব্যান্ড ২২ মিমি', en: 'White Silicon Band 22mm', p: 250, cp: 400 },
    { n: 'স্টেইনলেস স্টিল ব্রেসলেট ২০ মিমি', en: 'Stainless Steel Bracelet 20mm', p: 450, cp: 650 },
    { n: 'হুয়াওয়ে ওয়াচ জিটি ৪', en: 'Huawei Watch GT 4', p: 25000, cp: 30000 },
    { n: 'আমাজফিট ব্যান্ড ৭', en: 'Amazfit Band 7', p: 3500, cp: 4500 },
    { n: 'বে ১ নেটিভ স্টেইনলেস স্টিল', en: 'Bay-1 Native Stainless Steel', p: 3800, cp: 4800 },
    { n: 'নেভিফোর্স ক্রোম গ্রিন ডায়াল', en: 'Neviforce Chrome Green Dial', p: 2500, cp: 3500 },
    { n: 'ওয়াচ ওয়াইন্ডার বক্স', en: 'Watch Winder Box', p: 3500, cp: 4800 },
    { n: 'ওয়াচ স্ট্যান্ড অ্যাক্রিলিক', en: 'Watch Stand Acrylic', p: 350, cp: 500 },
    { n: 'রিস্ট ব্যান্ড ক্লিনার কিট', en: 'Wrist Band Cleaner Kit', p: 400, cp: 600 },
    { n: 'লাদা ক্লাসিক মেকানিক্যাল', en: 'Lada Classic Mechanical', p: 2200, cp: 3000 },
    { n: 'স্পোর্টস ডিজিটাল ওয়াচ এলইডি', en: 'Sports Digital Watch LED', p: 800, cp: 1200 },
    { n: 'কিডস স্মার্টওয়াচ জিপিএস', en: 'Kids Smartwatch GPS', p: 2500, cp: 3500 },
    { n: 'গ্লাস প্রটেক্টর ওয়াচ স্ক্রিন', en: 'Glass Protector Watch Screen', p: 200, cp: 300 },
    { n: 'চেইন মেটাল ওয়াচ স্ট্র্যাপ', en: 'Chain Metal Watch Strap', p: 350, cp: 500 },
  ],

  /* 14 — গৃহস্থালি পণ্য / Household Items */
  14: [
    { n: 'স্টিলের বাসন সেট ১২ পিস', en: 'Steel Dinner Set 12 Pcs', p: 3500, cp: 4500 },
    { n: 'সিরামিক প্লেট সেট ৬ পিস', en: 'Ceramic Plate Set 6 Pcs', p: 1200, cp: 1600 },
    { n: 'গ্লাস জগ ২ লিটার', en: 'Glass Jug 2 Liter', p: 350, cp: 500 },
    { n: 'প্রেসার কুকার ৫ লিটার এলুমিনিয়াম', en: 'Pressure Cooker 5L Aluminum', p: 2200, cp: 3000 },
    { n: 'টেফলন নন-স্টিক প্যান ২৪ সেমি', en: 'Teflon Non-Stick Pan 24cm', p: 900, cp: 1300 },
    { n: 'নন-স্টিক তাওয়া ২৮ সেমি', en: 'Non-Stick Tawa 28cm', p: 600, cp: 850 },
    { n: 'ছুরি সেট ৬ পিস স্টেইনলেস', en: 'Knife Set 6 Pcs Stainless', p: 800, cp: 1200 },
    { n: 'কাটিং বোর্ড উডেন লার্জ', en: 'Cutting Board Wooden Large', p: 550, cp: 800 },
    { n: 'প্লাস্টিক স্টোরেজ বক্স সেট ৪টি', en: 'Plastic Storage Box Set 4', p: 1200, cp: 1600 },
    { n: 'মাইক্রোফাইবার কাপড় ক্লিনিং', en: 'Microfiber Cloth Cleaning', p: 250, cp: 400 },
    { n: 'বালতি প্লাস্টিক ১২ লিটার', en: 'Bucket Plastic 12 Liter', p: 280, cp: 400 },
    { n: 'স্পঞ্জ স্ক্রাবার সেট ১০টি', en: 'Sponge Scrubber Set 10 Pcs', p: 200, cp: 300 },
    { n: 'স্টিল থার্মো ফ্লাস্ক ১ লিটার', en: 'Steel Thermo Flask 1L', p: 1200, cp: 1600 },
    { n: 'টিফিন বক্স স্টিল ৩ লেয়ার', en: 'Tiffin Box Steel 3 Layer', p: 850, cp: 1200 },
    { n: 'ওয়াটার পিউরিফায়ার ফল পাম্প', en: 'Water Purifier Wall Mount', p: 4500, cp: 5800 },
    { n: 'ক্লথ ড্রাইয়ার স্ট্যান্ড ফোল্ড', en: 'Cloth Dryer Stand Fold', p: 1800, cp: 2400 },
    { n: 'আয়রনিং বোর্ড ওয়াল মাউন্ট', en: 'Ironing Board Wall Mount', p: 2200, cp: 3000 },
    { n: 'কিচেন র‍্যাক স্টেইনলেস স্টিল', en: 'Kitchen Rack Stainless Steel', p: 2800, cp: 3800 },
    { n: 'ডাস্টবিন স্টেপ প্যাডেল ১০এল', en: 'Dustbin Step Pedal 10L', p: 850, cp: 1200 },
    { n: 'স্পেস সেভার হ্যাঙ্গার র‍্যাক', en: 'Space Saver Hanger Rack', p: 1200, cp: 1700 },
  ],

  /* 15 — ফুড অ্যান্ড বেভারেজ / Food & Beverage */
  15: [
    { n: 'প্রাণ ফ্রুটি জুস ম্যাঙ্গো ৫০০মিলি', en: 'Pran Fruti Juice Mango 500ml', p: 120, cp: 150 },
    { n: 'প্রাণ আতপ চাল ৫কেজি', en: 'Pran Atap Rice 5kg', p: 450, cp: 550 },
    { n: 'আকিজ মাস্টারশেফ তেল ২ লিটার', en: 'Akij Mastershef Oil 2L', p: 380, cp: 480 },
    { n: 'ড্যানিশ বিস্কুট ফ্যামিলি প্যাক', en: 'Danish Biscuit Family Pack', p: 250, cp: 350 },
    { n: 'প্রাণ চানাচুর স্পেশাল প্যাক', en: 'Pran Chanachur Special Pack', p: 120, cp: 180 },
    { n: 'সিটি গ্রিন টি লেমন ২৫ ব্যাগ', en: 'City Green Tea Lemon 25 Bags', p: 180, cp: 250 },
    { n: 'প্রাণ ইনস্ট্যান্ট নুডলস ম্যাগি', en: 'Pran Instant Noodles Magi', p: 25, cp: 35 },
    { n: 'আরিফের লাচ্ছি সেমাই প্যাক', en: 'Arifers Lacchi Semai Pack', p: 150, cp: 200 },
    { n: 'সুইটস নেড়া পায়েস ক্যান্ডি', en: 'Sweets Nera Payesh Candy', p: 200, cp: 280 },
    { n: 'কমফোর্ট ফুড সুপ মিক্স', en: 'Comfort Food Soup Mix', p: 180, cp: 250 },
    { n: 'হানি ন্যাচারাল ২৫০গ্রাম', en: 'Honey Natural 250g', p: 450, cp: 600 },
    { n: 'টাটা চা প্রিমিয়াম ২০০গ্রাম', en: 'Tata Tea Premium 200g', p: 180, cp: 250 },
    { n: 'ড্যানিশ ডেয়ারি মিল্ক ১ লিটার', en: 'Danish Dairy Milk 1L', p: 120, cp: 160 },
    { n: 'ফ্রুটিকা ফ্রুট নাট মিক্স', en: 'Frutika Fruit Nut Mix', p: 350, cp: 450 },
    { n: 'প্রাণ সুজি ময়দা ১ কেজি', en: 'Pran Suji Maida 1kg', p: 100, cp: 140 },
    { n: 'কুকি চকোলেট চিপস', en: 'Cookie Chocolate Chips', p: 180, cp: 250 },
    { n: 'মিনারেল ওয়াটার স্প্রিং ১ লিটার', en: 'Mineral Water Spring 1L', p: 25, cp: 35 },
    { n: 'কোকাকোলা ক্যান ২৫০মিলি', en: 'Coca Cola Can 250ml', p: 35, cp: 50 },
    { n: 'পেপসি ২ লিটার বোতল', en: 'Pepsi 2 Liter Bottle', p: 75, cp: 100 },
    { n: 'স্প্রাইট জিরো ৩৩০মিলি ক্যান', en: 'Sprite Zero 330ml Can', p: 40, cp: 55 },
  ],
};

const uniqueSlug = (() => {
  let counter = Date.now();
  return (base) => `${base}-${++counter}`;
})();

(async () => {
  console.log('Deleting all products...');
  await db.prepare('DELETE FROM products').run();
  await db.prepare("DELETE FROM sqlite_sequence WHERE name='products'").run();
  console.log('All products deleted.\n');

  let total = 0;
  for (const [catId, items] of Object.entries(productsByCat)) {
    for (const item of items) {
      const slug = uniqueSlug(item.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product');
      const colors = catId === '15' ? '[]' : JSON.stringify(['কালো', 'নীল', 'লাল']);
      await db.prepare(
        'INSERT INTO products (name, en_name, slug, description, price, compare_price, category_id, stock, featured, active, images, colors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(item.n, item.en, slug, item.n + ' — ' + item.en, Number(item.p), item.cp ? Number(item.cp) : null, Number(catId), 20, 0, 1, '[]', colors);
      total++;
    }
    console.log(`  Category ${catId}: ${items.length} products`);
  }
  console.log(`\nDone. Inserted ${total} products.`);
  process.exit(0);
})();
