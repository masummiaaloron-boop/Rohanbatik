/* ============================================================
   LUXESTORE - LocalStorage & Demo Data Handler (db.js)
   ============================================================ */

const DB = {
  // Key Names
  KEYS: {
    PRODUCTS: 'luxe_products',
    CATEGORIES: 'luxe_categories',
    HERO_SLIDER: 'luxe_slider',
    TESTIMONIALS: 'luxe_testimonials',
    FAQ: 'luxe_faq',
    SETTINGS: 'luxe_settings',
    ORDERS: 'luxe_orders',
    WISHLIST: 'luxe_wishlist',
    CART: 'luxe_cart',
    STATS: 'luxe_stats'
  },

  // Initialize DB with Demo Data
  init() {
    if (!localStorage.getItem(this.KEYS.CATEGORIES)) {
      localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(this.getDemoCategories()));
    }
    if (!localStorage.getItem(this.KEYS.PRODUCTS)) {
      localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(this.getDemoProducts()));
    }
    if (!localStorage.getItem(this.KEYS.HERO_SLIDER)) {
      localStorage.setItem(this.KEYS.HERO_SLIDER, JSON.stringify(this.getDemoSlider()));
    }
    if (!localStorage.getItem(this.KEYS.TESTIMONIALS)) {
      localStorage.setItem(this.KEYS.TESTIMONIALS, JSON.stringify(this.getDemoTestimonials()));
    }
    if (!localStorage.getItem(this.KEYS.FAQ)) {
      localStorage.setItem(this.KEYS.FAQ, JSON.stringify(this.getDemoFAQ()));
    }
    if (!localStorage.getItem(this.KEYS.SETTINGS)) {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(this.getDemoSettings()));
    }
    if (!localStorage.getItem(this.KEYS.ORDERS)) {
      localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(this.getDemoOrders()));
    }
    if (!localStorage.getItem(this.KEYS.WISHLIST)) {
      localStorage.setItem(this.KEYS.WISHLIST, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.CART)) {
      localStorage.setItem(this.KEYS.CART, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.STATS)) {
      localStorage.setItem(this.KEYS.STATS, JSON.stringify({ visitors: 1420 }));
    } else {
      // Increment visitor count by 1 on init
      const stats = JSON.parse(localStorage.getItem(this.KEYS.STATS));
      stats.visitors = (stats.visitors || 0) + 1;
      localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
    }
  },

  getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  },

  setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // ---------- DEMO DATA INJECTORS ----------
  getDemoCategories() {
    return [
      { id: 'cat-1', name: 'Smart Watches', icon: 'fa-solid fa-stopwatch' },
      { id: 'cat-2', name: 'Audio Premium', icon: 'fa-solid fa-headphones' },
      { id: 'cat-3', name: 'Smartphones', icon: 'fa-solid fa-mobile-screen-button' },
      { id: 'cat-4', name: 'Accessories', icon: 'fa-solid fa-plug' }
    ];
  },

  getDemoProducts() {
    return [
      {
        id: 'prod-1',
        name: 'Chrono Lux Smartwatch v2',
        category: 'Smart Watches',
        price: 249.00,
        originalPrice: 399.00,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        ratingCount: 124,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        isFlashSale: true,
        description: 'Elevate your daily standard with Chrono Lux Smartwatch. Features pristine glass styling, responsive notification handling, continuous health diagnostics, and a solid titanium bezel.'
      },
      {
        id: 'prod-2',
        name: 'Acoustic Aura ANC Headphones',
        category: 'Audio Premium',
        price: 189.00,
        originalPrice: 299.00,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        rating: 4.9,
        ratingCount: 88,
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        isFlashSale: false,
        description: 'Immerse your auditory senses with elite level active noise cancelling technology. Custom tuned acoustic chambers deliver spatial audio high-fidelity performance.'
      },
      {
        id: 'prod-3',
        name: 'Titanium Edge X Smartphone',
        category: 'Smartphones',
        price: 999.00,
        originalPrice: 1199.00,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
        rating: 5.0,
        ratingCount: 45,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        isFlashSale: false,
        description: 'Featuring the next-gen 3nm architectural processor and custom liquid titanium cooling. Complete with modular custom lens cameras.'
      },
      {
        id: 'prod-4',
        name: 'Sleek Magnetic Power Capsule',
        category: 'Accessories',
        price: 49.00,
        originalPrice: 79.00,
        image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
        rating: 4.5,
        ratingCount: 230,
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        isFlashSale: true,
        description: 'An ultra-compact 15W high-speed wireless magnetic battery hub. Encased in clear premium acrylic to observe internal custom charging chips.'
      }
    ];
  },

  getDemoSlider() {
    return [
      {
        id: 'slide-1',
        title: 'Prism Glass Elite Series',
        subtitle: 'Experience Luxury Tech Like Never Before',
        badge: 'Limited Arrival',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1920&q=80',
        actionLink: '#featured'
      },
      {
        id: 'slide-2',
        title: 'Intelligent Titanium Gear',
        subtitle: 'Smart Tracking Calibrated to Your Standard',
        badge: 'New Trend',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=80',
        actionLink: '#featured'
      }
    ];
  },

  getDemoTestimonials() {
    return [
      {
        id: 'test-1',
        name: 'Alexander Sterling',
        role: 'Creative Director',
        text: 'The Chrono Lux Smartwatch completely changed how I interact with my daily itinerary. It acts as functional jewelry of the highest caliber.',
        stars: 5
      },
      {
        id: 'test-2',
        name: 'Elena Rostova',
        role: 'Music Producer',
        text: 'The Acoustic Aura soundstage is perfectly balanced. Highs are sparkling and clear while lows are deep but never boomy.',
        stars: 5
      }
    ];
  },

  getDemoFAQ() {
    return [
      {
        id: 'faq-1',
        question: 'What is your delivery timeframe?',
        answer: 'We deliver globally. Expedited luxury courier shipping takes 2-4 business days. Standard premium delivery is usually completed within 5-7 business days.'
      },
      {
        id: 'faq-2',
        question: 'How does Cash on Delivery (COD) work?',
        answer: 'For COD, our delivery partner collects payment in cash upon presenting the package. Please ensure exact change is prepared to facilitate swift processing.'
      },
      {
        id: 'faq-3',
        question: 'Do you offer product warranty?',
        answer: 'Absolutely. Every premium device purchased from our official storefront is backed by our comprehensive 2-year luxury global warranty covering hardware defects.'
      }
    ];
  },

  getDemoSettings() {
    return {
      logo: 'fa-solid fa-gem',
      siteName: 'LuxeStore',
      phone: '+1 (234) 567-890',
      whatsapp: 'https://wa.me/1234567890',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      messenger: 'https://m.me',
      youtube: 'https://youtube.com',
      tiktok: 'https://tiktok.com',
      themeColor: '#7c3aed',
      deliveryCharge: 15.00,
      coupon: 'LUXESUMMER',
      couponDiscount: 15, // 15%
      popupTitle: 'Premium Club Invite',
      popupDesc: 'Receive a special 15% discount code instantly. Apply this at your elite cart checkout.',
      popupCode: 'LUXESUMMER',
      popupEnabled: true,
      announcementText: '✨ Special Summer Event! Enjoy Free Shipping + 15% off using code: LUXESUMMER ✨'
    };
  },

  getDemoOrders() {
    return [
      {
        id: 'ORD-84920',
        customerName: 'Marcus Aurelius',
        email: 'marcus@philosophy.co',
        phone: '+1 (415) 888-2921',
        address: '10 Rome Colosseum Way, Suite IV',
        city: 'Rome',
        zip: '00100',
        paymentMethod: 'COD',
        items: [
          { id: 'prod-1', name: 'Chrono Lux Smartwatch v2', price: 249.00, quantity: 1 }
        ],
        subtotal: 249.00,
        delivery: 15.00,
        discount: 0,
        total: 264.00,
        status: 'pending',
        date: '2026-07-08T14:32:00.000Z'
      },
      {
        id: 'ORD-72019',
        customerName: 'Amara Vance',
        email: 'amara@designstudio.io',
        phone: '+1 (212) 555-0199',
        address: '742 Broadway Loft 4B',
        city: 'New York',
        zip: '10003',
        paymentMethod: 'COD',
        items: [
          { id: 'prod-2', name: 'Acoustic Aura ANC Headphones', price: 189.00, quantity: 1 },
          { id: 'prod-4', name: 'Sleek Magnetic Power Capsule', price: 49.00, quantity: 2 }
        ],
        subtotal: 287.00,
        delivery: 15.00,
        discount: 43.05, // 15% coupon applied
        total: 258.95,
        status: 'confirmed',
        date: '2026-07-09T09:15:00.000Z'
      }
    ];
  }
};

DB.init();
