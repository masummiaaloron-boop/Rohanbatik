/* ============================================================
   LUXESTORE - Main JavaScript (main.js)
   ============================================================ */

/* ===================== THEME ===================== */
function initTheme() {
  const saved = localStorage.getItem('luxe_theme') || 'light';
  document.body.className = saved + '-mode';
  updateThemeBtn(saved);
}

function updateThemeBtn(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.innerHTML = theme === 'dark'
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark-mode');
  const next = isDark ? 'light' : 'dark';
  document.body.className = next + '-mode';
  localStorage.setItem('luxe_theme', next);
  updateThemeBtn(next);
});

/* ===================== SETTINGS APPLY ===================== */
function applySettings() {
  const s = DB.getData(DB.KEYS.SETTINGS);
  const settings = Array.isArray(s) ? {} : s;

  // Site name
  document.querySelectorAll('.site-name-span').forEach(el => el.textContent = settings.siteName || 'LuxeStore');
  const siteNameEl = document.getElementById('site-name-text');
  if (siteNameEl) siteNameEl.textContent = settings.siteName || 'LuxeStore';

  // Announcement
  const bar = document.getElementById('announcement-text');
  if (bar && settings.announcementText) bar.textContent = settings.announcementText;

  // Phone
  const phone = document.getElementById('contact-phone');
  if (phone && settings.phone) phone.textContent = settings.phone;

  // Social links
  const socialContainer = document.getElementById('social-links');
  if (socialContainer) {
    socialContainer.innerHTML = '';
    const socials = [
      { key: 'whatsapp', icon: 'fa-brands fa-whatsapp', label: 'WhatsApp' },
      { key: 'facebook', icon: 'fa-brands fa-facebook-f', label: 'Facebook' },
      { key: 'instagram', icon: 'fa-brands fa-instagram', label: 'Instagram' },
      { key: 'messenger', icon: 'fa-brands fa-facebook-messenger', label: 'Messenger' },
      { key: 'youtube', icon: 'fa-brands fa-youtube', label: 'YouTube' },
      { key: 'tiktok', icon: 'fa-brands fa-tiktok', label: 'TikTok' }
    ];
    socials.forEach(s => {
      if (settings[s.key]) {
        socialContainer.innerHTML += `
          <a href="${settings[s.key]}" target="_blank" class="social-link" title="${s.label}">
            <i class="${s.icon}"></i>
          </a>`;
      }
    });
  }

  // Theme color
  if (settings.themeColor) {
    document.documentElement.style.setProperty('--primary', settings.themeColor);
    // Generate lighter / darker variants
    document.documentElement.style.setProperty('--primary-light', hexToRgba(settings.themeColor, 1, 40));
    document.documentElement.style.setProperty('--primary-dark', hexToRgba(settings.themeColor, 1, -40));
  }

  // Marketing popup
  if (settings.popupEnabled !== false) {
    const popup = document.getElementById('marketing-popup');
    if (popup) {
      const shown = sessionStorage.getItem('popup_shown');
      if (!shown) {
        setTimeout(() => {
          popup.classList.add('visible');
          sessionStorage.setItem('popup_shown', '1');
        }, 3000);
      }
      document.getElementById('popup-title').textContent = settings.popupTitle || 'Exclusive Offer!';
      document.getElementById('popup-desc').textContent = settings.popupDesc || 'Use the coupon code below!';
      document.getElementById('popup-coupon-code').textContent = settings.popupCode || 'SAVE10';
    }
  }
}

function hexToRgba(hex, alpha, lightAdj) {
  hex = hex.replace('#', '');
  let r = parseInt(hex.substring(0,2), 16);
  let g = parseInt(hex.substring(2,4), 16);
  let b = parseInt(hex.substring(4,6), 16);
  r = Math.min(255, Math.max(0, r + lightAdj));
  g = Math.min(255, Math.max(0, g + lightAdj));
  b = Math.min(255, Math.max(0, b + lightAdj));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

/* ===================== TOAST ===================== */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    info: 'fa-circle-info',
    warning: 'fa-triangle-exclamation'
  };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type]} toast-icon"></i>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    <div class="toast-progress"></div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ===================== HERO SLIDER ===================== */
let currentSlide = 0;
let sliderInterval;
let slides = [];

function initSlider() {
  slides = DB.getData(DB.KEYS.HERO_SLIDER);
  if (!slides || slides.length === 0) return;
  const wrapper = document.getElementById('slider-wrapper');
  const dots = document.getElementById('slider-dots');
  if (!wrapper || !dots) return;

  wrapper.innerHTML = slides.map((slide, i) => `
    <div class="slide ${i === 0 ? 'active' : ''}">
      <div class="slide-bg" style="background-image: url('${slide.image}')"></div>
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <span class="slide-badge">${slide.badge}</span>
        <h1>${slide.title}</h1>
        <p>${slide.subtitle}</p>
        <div class="slide-actions">
          <a href="${slide.actionLink || '#featured'}" class="btn btn-primary btn-large">
            <i class="fa-solid fa-bag-shopping"></i> Shop Now
          </a>
          <a href="#categories" class="btn btn-outline btn-large">Explore</a>
        </div>
      </div>
    </div>
  `).join('');

  dots.innerHTML = slides.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></div>`).join('');
  dots.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.idx)));
  });

  sliderInterval = setInterval(() => goToSlide((currentSlide + 1) % slides.length), 5000);
}

function goToSlide(idx) {
  const wrapper = document.getElementById('slider-wrapper');
  if (!wrapper) return;
  wrapper.style.transform = `translateX(-${idx * 100}%)`;
  wrapper.querySelectorAll('.slide').forEach((s, i) => s.classList.toggle('active', i === idx));
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  currentSlide = idx;
}

document.getElementById('slider-prev')?.addEventListener('click', () => {
  clearInterval(sliderInterval);
  goToSlide((currentSlide - 1 + slides.length) % slides.length);
  sliderInterval = setInterval(() => goToSlide((currentSlide + 1) % slides.length), 5000);
});

document.getElementById('slider-next')?.addEventListener('click', () => {
  clearInterval(sliderInterval);
  goToSlide((currentSlide + 1) % slides.length);
  sliderInterval = setInterval(() => goToSlide((currentSlide + 1) % slides.length), 5000);
});

/* ===================== CATEGORIES ===================== */
function renderCategories() {
  const categories = DB.getData(DB.KEYS.CATEGORIES);
  const grid = document.getElementById('categories-grid');
  if (!grid) return;
  const products = DB.getData(DB.KEYS.PRODUCTS);
  grid.innerHTML = categories.map(cat => {
    const count = products.filter(p => p.category === cat.name).length;
    return `
      <div class="category-card scroll-anim" onclick="filterByCategory('${cat.name}')">
        <span class="category-icon"><i class="${cat.icon}"></i></span>
        <div class="category-name">${cat.name}</div>
        <div class="category-count">${count} items</div>
      </div>
    `;
  }).join('');
  initScrollAnim();
}

function filterByCategory(name) {
  document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
  renderProducts('all', name);
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn[data-filter="all"]')?.classList.add('active');
}

/* ===================== PRODUCTS ===================== */
function renderProducts(filter = 'all', catFilter = null) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  let products = DB.getData(DB.KEYS.PRODUCTS);
  if (catFilter) products = products.filter(p => p.category === catFilter);
  if (filter === 'featured') products = products.filter(p => p.isFeatured);
  if (filter === 'best') products = products.filter(p => p.isBestSeller);
  if (filter === 'new') products = products.filter(p => p.isNewArrival);

  const wishlist = DB.getData(DB.KEYS.WISHLIST);
  const wishlistIds = wishlist.map(w => w.id);

  if (products.length === 0) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1">
      <i class="fa-solid fa-box-open"></i>
      <p>No products found.</p>
    </div>`;
    return;
  }

  grid.innerHTML = products.map(p => {
    const discount = p.originalPrice > p.price
      ? Math.round((1 - p.price / p.originalPrice) * 100)
      : 0;
    const badges = [];
    if (p.isFlashSale) badges.push('<span class="badge-tag sale">SALE</span>');
    if (p.isNewArrival) badges.push('<span class="badge-tag new">NEW</span>');
    if (p.isBestSeller) badges.push('<span class="badge-tag hot">HOT</span>');
    if (p.isFeatured) badges.push('<span class="badge-tag featured">Featured</span>');
    const wishlisted = wishlistIds.includes(p.id);
    const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
    return `
      <div class="product-card scroll-anim" data-id="${p.id}">
        <div class="product-image-wrapper" onclick="openProduct('${p.id}')">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <div class="product-badges">${badges.join('')}</div>
          <div class="product-actions">
            <button class="product-action-btn ${wishlisted ? 'active' : ''}" title="Wishlist"
              onclick="event.stopPropagation(); toggleWishlist('${p.id}', this)">
              <i class="fa-${wishlisted ? 'solid' : 'regular'} fa-heart"></i>
            </button>
            <button class="product-action-btn" title="Quick View"
              onclick="event.stopPropagation(); openProduct('${p.id}')">
              <i class="fa-regular fa-eye"></i>
            </button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-category">${p.category}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-rating">
            <span class="stars">${stars}</span>
            <span class="rating-count">(${p.ratingCount})</span>
          </div>
          <div class="product-price-row">
            <span class="product-price">$${p.price.toFixed(2)}</span>
            <div style="display:flex;gap:6px;align-items:center">
              ${p.originalPrice > p.price ? `<span class="product-original-price">$${p.originalPrice.toFixed(2)}</span>` : ''}
              ${discount > 0 ? `<span class="product-discount">-${discount}%</span>` : ''}
            </div>
          </div>
          <button class="add-to-cart-btn" onclick="addToCart('${p.id}')">
            <i class="fa-solid fa-bag-shopping"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
  }).join('');
  initScrollAnim();
}

function openProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

/* ===================== PRODUCT FILTER BUTTONS ===================== */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(btn.dataset.filter);
  });
});

/* ===================== CART ===================== */
function getCart() { return DB.getData(DB.KEYS.CART); }
function saveCart(cart) { DB.setData(DB.KEYS.CART, cart); updateCartUI(); }

function addToCart(productId, qty = 1) {
  const products = DB.getData(DB.KEYS.PRODUCTS);
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...product, quantity: qty });
  }
  saveCart(cart);
  showToast(`<b>${product.name}</b> added to cart!`, 'success');
}

function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
  renderCartItems();
  showToast('Item removed from cart.', 'info');
}

function updateCartQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);
  renderCartItems();
}

function updateCartUI() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  document.querySelectorAll('#cart-count').forEach(el => el.textContent = total);
}

function renderCartItems() {
  const cart = getCart();
  const container = document.getElementById('cart-items');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart">
      <i class="fa-solid fa-bag-shopping"></i>
      <p>Your cart is empty.</p>
    </div>`;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
          <div class="qty-selector">
            <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">
              <i class="fa-solid fa-minus"></i>
            </button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join('');
  }

  const settings = DB.getData(DB.KEYS.SETTINGS);
  const deliveryCharge = settings.deliveryCharge || 15;
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + (subtotal > 0 ? deliveryCharge : 0);

  const subtotalEl = document.getElementById('cart-subtotal');
  const deliveryEl = document.getElementById('cart-delivery');
  const totalEl = document.getElementById('cart-total');
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (deliveryEl) deliveryEl.textContent = subtotal > 0 ? `$${deliveryCharge.toFixed(2)}` : '$0.00';
  if (totalEl) totalEl.textContent = `$${(subtotal > 0 ? total : 0).toFixed(2)}`;
}

/* Cart Drawer Toggle */
const cartDrawer = document.getElementById('cart-drawer');
const wishlistDrawer = document.getElementById('wishlist-drawer');
const overlay = createOverlay();

function createOverlay() {
  const el = document.createElement('div');
  el.className = 'drawer-overlay';
  el.addEventListener('click', closeAllDrawers);
  document.body.appendChild(el);
  return el;
}

function openCartDrawer() {
  renderCartItems();
  cartDrawer?.classList.add('open');
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function openWishlistDrawer() {
  renderWishlistItems();
  wishlistDrawer?.classList.add('open');
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeAllDrawers() {
  cartDrawer?.classList.remove('open');
  wishlistDrawer?.classList.remove('open');
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
}

document.getElementById('cart-toggle')?.addEventListener('click', openCartDrawer);
document.getElementById('cart-close')?.addEventListener('click', closeAllDrawers);
document.getElementById('wishlist-toggle')?.addEventListener('click', openWishlistDrawer);
document.getElementById('wishlist-close')?.addEventListener('click', closeAllDrawers);

/* ===================== WISHLIST ===================== */
function getWishlist() { return DB.getData(DB.KEYS.WISHLIST); }
function saveWishlist(list) { DB.setData(DB.KEYS.WISHLIST, list); updateWishlistUI(); }

function toggleWishlist(productId, btn) {
  const wishlist = getWishlist();
  const products = DB.getData(DB.KEYS.PRODUCTS);
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const idx = wishlist.findIndex(w => w.id === productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showToast('Removed from wishlist.', 'info');
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
  } else {
    wishlist.push(product);
    showToast(`<b>${product.name}</b> added to wishlist!`, 'success');
    if (btn) {
      btn.classList.add('active');
      btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
    }
  }
  saveWishlist(wishlist);
}

function updateWishlistUI() {
  const wishlist = getWishlist();
  document.querySelectorAll('#wishlist-count').forEach(el => el.textContent = wishlist.length);
}

function renderWishlistItems() {
  const wishlist = getWishlist();
  const container = document.getElementById('wishlist-items');
  if (!container) return;
  if (wishlist.length === 0) {
    container.innerHTML = `<div class="empty-cart">
      <i class="fa-solid fa-heart"></i>
      <p>Your wishlist is empty.</p>
    </div>`;
    return;
  }
  container.innerHTML = wishlist.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        <button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="addToCart('${item.id}');showToast('Added to cart!','success')">
          <i class="fa-solid fa-bag-shopping"></i> Add to Cart
        </button>
      </div>
      <button class="cart-item-remove" onclick="toggleWishlist('${item.id}')">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join('');
}

/* ===================== SEARCH ===================== */
function initSearch() {
  const input = document.getElementById('search-input');
  const btn = document.getElementById('search-btn');
  if (!input) return;
  const doSearch = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { renderProducts(); return; }
    const products = DB.getData(DB.KEYS.PRODUCTS);
    const results = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
    const grid = document.getElementById('products-grid');
    if (grid) {
      if (results.length === 0) {
        grid.innerHTML = `<div class="no-results" style="grid-column:1/-1">
          <i class="fa-solid fa-magnifying-glass"></i>
          <p>No products found for "<b>${input.value}</b>"</p>
        </div>`;
      } else {
        const wishlist = DB.getData(DB.KEYS.WISHLIST);
        const wishlistIds = wishlist.map(w => w.id);
        grid.innerHTML = results.map(p => {
          const discount = p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
          const wishlisted = wishlistIds.includes(p.id);
          const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
          return `
            <div class="product-card scroll-anim" data-id="${p.id}">
              <div class="product-image-wrapper" onclick="openProduct('${p.id}')">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
                <div class="product-actions">
                  <button class="product-action-btn ${wishlisted ? 'active' : ''}" title="Wishlist"
                    onclick="event.stopPropagation(); toggleWishlist('${p.id}', this)">
                    <i class="fa-${wishlisted ? 'solid' : 'regular'} fa-heart"></i>
                  </button>
                </div>
              </div>
              <div class="product-info">
                <div class="product-category">${p.category}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-rating">
                  <span class="stars">${stars}</span>
                  <span class="rating-count">(${p.ratingCount})</span>
                </div>
                <div class="product-price-row">
                  <span class="product-price">$${p.price.toFixed(2)}</span>
                  ${discount > 0 ? `<span class="product-discount">-${discount}%</span>` : ''}
                </div>
                <button class="add-to-cart-btn" onclick="addToCart('${p.id}')">
                  <i class="fa-solid fa-bag-shopping"></i> Add to Cart
                </button>
              </div>
            </div>`;
        }).join('');
        document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
        initScrollAnim();
      }
    }
  };
  btn?.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

/* ===================== FAQ ===================== */
function renderFAQ() {
  const faqs = DB.getData(DB.KEYS.FAQ);
  const container = document.getElementById('faq-container');
  if (!container) return;
  container.innerHTML = faqs.map((faq, i) => `
    <div class="faq-item scroll-anim" data-id="${faq.id}">
      <div class="faq-question" onclick="toggleFAQ(this)">
        <span>${faq.question}</span>
        <i class="fa-solid fa-chevron-down"></i>
      </div>
      <div class="faq-answer">${faq.answer}</div>
    </div>
  `).join('');
  initScrollAnim();
}

function toggleFAQ(el) {
  const item = el.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ===================== TESTIMONIALS ===================== */
function renderTestimonials() {
  const testimonials = DB.getData(DB.KEYS.TESTIMONIALS);
  const container = document.getElementById('testimonials-container');
  if (!container) return;
  container.innerHTML = testimonials.map(t => {
    const stars = '★'.repeat(t.stars || 5);
    const initials = t.name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `
      <div class="testimonial-card scroll-anim">
        <div class="testimonial-stars">${stars}</div>
        <div class="testimonial-text">"${t.text}"</div>
        <div class="testimonial-author">
          <div class="author-avatar">${initials}</div>
          <div class="author-info">
            <strong>${t.name}</strong>
            <span>${t.role}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  initScrollAnim();
}

/* ===================== COUNTDOWN TIMER ===================== */
function initCountdown() {
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  if (!hoursEl) return;

  const key = 'luxe_countdown_end';
  let endTime = parseInt(localStorage.getItem(key) || '0');
  if (!endTime || endTime < Date.now()) {
    endTime = Date.now() + 12 * 60 * 60 * 1000;
    localStorage.setItem(key, endTime.toString());
  }

  function tick() {
    const diff = endTime - Date.now();
    if (diff <= 0) {
      endTime = Date.now() + 12 * 60 * 60 * 1000;
      localStorage.setItem(key, endTime.toString());
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    hoursEl.textContent = String(h).padStart(2, '0');
    minutesEl.textContent = String(m).padStart(2, '0');
    secondsEl.textContent = String(s).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
}

/* ===================== POPUP ===================== */
document.getElementById('close-popup')?.addEventListener('click', () => {
  document.getElementById('marketing-popup')?.classList.remove('visible');
});

document.getElementById('popup-action-btn')?.addEventListener('click', () => {
  document.getElementById('marketing-popup')?.classList.remove('visible');
  document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('marketing-popup')?.addEventListener('click', e => {
  if (e.target === document.getElementById('marketing-popup')) {
    document.getElementById('marketing-popup').classList.remove('visible');
  }
});

/* ===================== CONTACT FORM ===================== */
document.getElementById('contact-form')?.addEventListener('submit', e => {
  e.preventDefault();
  showToast('Message sent! We will get back to you shortly.', 'success');
  e.target.reset();
});

/* ===================== SCROLL ANIMATIONS ===================== */
function initScrollAnim() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.scroll-anim:not(.animated)').forEach(el => observer.observe(el));
}

/* ===================== LOADING ===================== */
function hideLoading() {
  setTimeout(() => {
    document.getElementById('loading')?.classList.add('hidden');
  }, 800);
}

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  applySettings();
  initSlider();
  renderCategories();
  renderProducts();
  renderFAQ();
  renderTestimonials();
  initSearch();
  initCountdown();
  updateCartUI();
  updateWishlistUI();
  hideLoading();
  setTimeout(initScrollAnim, 100);
});
