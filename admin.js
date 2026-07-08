/* ============================================================
   LUXESTORE - Admin Panel JavaScript (admin.js)
   ============================================================ */

/* ===================== AUTH GATE ===================== */
(function() {
  if (localStorage.getItem('luxe_admin_auth') !== 'true') {
    window.location.href = 'login.html';
  }
})();

/* ===================== NAVIGATION ===================== */
function switchAdminPage(pageId, btn) {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + pageId)?.classList.add('active');
  document.querySelectorAll('.sidebar-nav button').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');

  // Lazy load data for specific page
  const loaders = {
    dashboard: loadDashboard,
    products: loadProductsTable,
    categories: loadCategoriesTable,
    slider: loadSliderTable,
    testimonials: loadTestimonialsTable,
    faq: loadFAQTable,
    orders: loadOrdersTable,
    settings: loadSettings
  };
  if (loaders[pageId]) loaders[pageId]();
}

function logoutAdmin() {
  localStorage.removeItem('luxe_admin_auth');
  window.location.href = 'login.html';
}

/* ===================== MODAL HELPERS ===================== */
function openModal(id) {
  document.getElementById(id)?.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('visible');
  document.body.style.overflow = '';
}

// Close on backdrop click
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
});

/* ===================== IMAGE BASE64 UPLOAD ===================== */
function previewImageUpload(input, previewId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const b64 = e.target.result;
    const hiddenId = input.id.replace('-file', '-base64');
    const hiddenInput = document.getElementById(hiddenId);
    if (hiddenInput) hiddenInput.value = b64;
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.src = b64;
      preview.classList.add('show');
    }
  };
  reader.readAsDataURL(file);
}

/* ===================== DASHBOARD ===================== */
function loadDashboard() {
  const orders = DB.getData(DB.KEYS.ORDERS);
  const products = DB.getData(DB.KEYS.PRODUCTS);
  const stats = DB.getData(DB.KEYS.STATS);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  animateCount('stat-orders', orders.length, '', 0);
  animateCount('stat-revenue', totalRevenue, '$', 2);
  animateCount('stat-visitors', stats.visitors || 0, '', 0);
  animateCount('stat-products', products.length, '', 0);

  // Top Products by name frequency in orders
  const productCounts = {};
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
    });
  });

  const sorted = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const container = document.getElementById('dashboard-top-products');
  if (container) {
    if (sorted.length === 0) {
      container.innerHTML = '<p class="text-muted">No product sales data yet.</p>';
    } else {
      container.innerHTML = sorted.map(([name, qty], i) => `
        <div class="top-product-item">
          <div class="top-product-rank">${i + 1}</div>
          <div class="top-product-name">${name}</div>
          <div class="top-product-sales">${qty} sold</div>
        </div>
      `).join('');
    }
  }
}

function animateCount(id, target, prefix, decimals) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = 0;
  const duration = 1000;
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = start + (target - start) * easeOut(progress);
    el.textContent = prefix + (decimals > 0 ? current.toFixed(decimals) : Math.round(current));
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

/* ===================== PRODUCTS TABLE ===================== */
function loadProductsTable() {
  const products = DB.getData(DB.KEYS.PRODUCTS);
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:32px;">No products yet. Click "Add New Product" to start.</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => {
    const badges = [
      p.isFeatured ? '<span class="status-badge confirmed">Featured</span>' : '',
      p.isBestSeller ? '<span class="status-badge delivered">Best Seller</span>' : '',
      p.isNewArrival ? '<span class="status-badge pending">New</span>' : '',
      p.isFlashSale ? '<span class="status-badge cancelled">Sale</span>' : ''
    ].filter(Boolean).join(' ') || '<span style="color: var(--text-muted); font-size: 0.8rem;">None</span>';

    return `
      <tr>
        <td><img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/40'"></td>
        <td><strong>${p.name}</strong></td>
        <td>${p.category}</td>
        <td>
          <strong>$${p.price.toFixed(2)}</strong>
          ${p.originalPrice > p.price ? `<br><span class="text-muted" style="text-decoration:line-through; font-size:0.8rem;">$${p.originalPrice.toFixed(2)}</span>` : ''}
        </td>
        <td>${badges}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-ghost btn-sm" onclick="editProduct('${p.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddProductModal() {
  document.getElementById('product-modal-title').textContent = 'Add New Product';
  document.getElementById('product-form').reset();
  document.getElementById('prod-form-id').value = '';
  document.getElementById('prod-image-preview').classList.remove('show');
  document.getElementById('prod-form-image-base64').value = '';

  // Populate category select
  populateCategorySelect('prod-form-category');
  openModal('modal-product');
}

function editProduct(id) {
  const products = DB.getData(DB.KEYS.PRODUCTS);
  const p = products.find(prod => prod.id === id);
  if (!p) return;

  document.getElementById('product-modal-title').textContent = 'Edit Product';
  document.getElementById('prod-form-id').value = p.id;
  document.getElementById('prod-form-name').value = p.name;
  document.getElementById('prod-form-price').value = p.price;
  document.getElementById('prod-form-original-price').value = p.originalPrice || '';
  document.getElementById('prod-form-rating').value = p.rating;
  document.getElementById('prod-form-desc').value = p.description || '';
  document.getElementById('prod-form-featured').checked = !!p.isFeatured;
  document.getElementById('prod-form-bestseller').checked = !!p.isBestSeller;
  document.getElementById('prod-form-newarrival').checked = !!p.isNewArrival;
  document.getElementById('prod-form-flashsale').checked = !!p.isFlashSale;
  document.getElementById('prod-form-image-base64').value = p.image;

  const preview = document.getElementById('prod-image-preview');
  preview.src = p.image;
  preview.classList.add('show');

  populateCategorySelect('prod-form-category', p.category);
  openModal('modal-product');
}

function populateCategorySelect(selectId, selected = '') {
  const categories = DB.getData(DB.KEYS.CATEGORIES);
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = categories.map(c => `<option value="${c.name}" ${c.name === selected ? 'selected' : ''}>${c.name}</option>`).join('');
}

function saveProduct(e) {
  e.preventDefault();
  const products = DB.getData(DB.KEYS.PRODUCTS);
  const id = document.getElementById('prod-form-id').value || ('prod-' + Date.now());
  const imageBase64 = document.getElementById('prod-form-image-base64').value;

  const productData = {
    id,
    name: document.getElementById('prod-form-name').value.trim(),
    category: document.getElementById('prod-form-category').value,
    price: parseFloat(document.getElementById('prod-form-price').value),
    originalPrice: parseFloat(document.getElementById('prod-form-original-price').value) || 0,
    rating: parseFloat(document.getElementById('prod-form-rating').value) || 5,
    ratingCount: 0,
    description: document.getElementById('prod-form-desc').value.trim(),
    image: imageBase64 || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    isFeatured: document.getElementById('prod-form-featured').checked,
    isBestSeller: document.getElementById('prod-form-bestseller').checked,
    isNewArrival: document.getElementById('prod-form-newarrival').checked,
    isFlashSale: document.getElementById('prod-form-flashsale').checked
  };

  const idx = products.findIndex(p => p.id === id);
  if (idx > -1) products[idx] = { ...products[idx], ...productData };
  else products.push(productData);

  DB.setData(DB.KEYS.PRODUCTS, products);
  closeModal('modal-product');
  loadProductsTable();
  showToast(idx > -1 ? 'Product updated successfully.' : 'Product created and listed.', 'success');
}

function deleteProduct(id) {
  if (!confirm('Permanently delete this product? This action cannot be undone.')) return;
  const products = DB.getData(DB.KEYS.PRODUCTS).filter(p => p.id !== id);
  DB.setData(DB.KEYS.PRODUCTS, products);
  loadProductsTable();
  showToast('Product removed from catalog.', 'info');
}

/* ===================== CATEGORIES TABLE ===================== */
function loadCategoriesTable() {
  const categories = DB.getData(DB.KEYS.CATEGORIES);
  const products = DB.getData(DB.KEYS.PRODUCTS);
  const tbody = document.getElementById('categories-table-body');
  if (!tbody) return;

  if (categories.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding:32px;">No categories found.</td></tr>';
    return;
  }

  tbody.innerHTML = categories.map(cat => {
    const count = products.filter(p => p.category === cat.name).length;
    return `
      <tr>
        <td><i class="${cat.icon}" style="font-size: 1.3rem; color: var(--primary-light);"></i></td>
        <td><strong>${cat.name}</strong></td>
        <td><span class="status-badge confirmed">${count} Products</span></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-ghost btn-sm" onclick="editCategory('${cat.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn btn-danger btn-sm" onclick="deleteCategory('${cat.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddCategoryModal() {
  document.getElementById('category-modal-title').textContent = 'Add New Category';
  document.getElementById('category-form').reset();
  document.getElementById('cat-form-id').value = '';
  openModal('modal-category');
}

function editCategory(id) {
  const categories = DB.getData(DB.KEYS.CATEGORIES);
  const cat = categories.find(c => c.id === id);
  if (!cat) return;
  document.getElementById('category-modal-title').textContent = 'Edit Category';
  document.getElementById('cat-form-id').value = cat.id;
  document.getElementById('cat-form-name').value = cat.name;
  document.getElementById('cat-form-icon').value = cat.icon;
  openModal('modal-category');
}

function saveCategory(e) {
  e.preventDefault();
  const categories = DB.getData(DB.KEYS.CATEGORIES);
  const id = document.getElementById('cat-form-id').value || ('cat-' + Date.now());
  const data = {
    id,
    name: document.getElementById('cat-form-name').value.trim(),
    icon: document.getElementById('cat-form-icon').value.trim()
  };
  const idx = categories.findIndex(c => c.id === id);
  if (idx > -1) categories[idx] = data;
  else categories.push(data);
  DB.setData(DB.KEYS.CATEGORIES, categories);
  closeModal('modal-category');
  loadCategoriesTable();
  showToast(idx > -1 ? 'Category updated.' : 'Category added.', 'success');
}

function deleteCategory(id) {
  if (!confirm('Remove this category?')) return;
  const categories = DB.getData(DB.KEYS.CATEGORIES).filter(c => c.id !== id);
  DB.setData(DB.KEYS.CATEGORIES, categories);
  loadCategoriesTable();
  showToast('Category removed.', 'info');
}

/* ===================== SLIDER TABLE ===================== */
function loadSliderTable() {
  const slides = DB.getData(DB.KEYS.HERO_SLIDER);
  const tbody = document.getElementById('slider-table-body');
  if (!tbody) return;
  if (slides.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:32px;">No slides yet.</td></tr>';
    return;
  }
  tbody.innerHTML = slides.map(s => `
    <tr>
      <td><img src="${s.image}" alt="${s.title}" style="width:80px;height:40px;object-fit:cover;border-radius:6px;"></td>
      <td><strong>${s.title}</strong></td>
      <td class="text-muted">${s.subtitle.substring(0, 40)}...</td>
      <td><span class="status-badge pending">${s.badge}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn btn-ghost btn-sm" onclick="editSlide('${s.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteSlide('${s.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddSlideModal() {
  document.getElementById('slide-modal-title').textContent = 'Add New Slide';
  document.getElementById('slide-form').reset();
  document.getElementById('slide-form-id').value = '';
  document.getElementById('slide-image-preview').classList.remove('show');
  document.getElementById('slide-form-image-base64').value = '';
  openModal('modal-slide');
}

function editSlide(id) {
  const slides = DB.getData(DB.KEYS.HERO_SLIDER);
  const s = slides.find(sl => sl.id === id);
  if (!s) return;
  document.getElementById('slide-modal-title').textContent = 'Edit Slide';
  document.getElementById('slide-form-id').value = s.id;
  document.getElementById('slide-form-title').value = s.title;
  document.getElementById('slide-form-subtitle').value = s.subtitle;
  document.getElementById('slide-form-badge').value = s.badge;
  document.getElementById('slide-form-link').value = s.actionLink;
  document.getElementById('slide-form-image-base64').value = s.image;
  const preview = document.getElementById('slide-image-preview');
  preview.src = s.image;
  preview.classList.add('show');
  openModal('modal-slide');
}

function saveSlide(e) {
  e.preventDefault();
  const slides = DB.getData(DB.KEYS.HERO_SLIDER);
  const id = document.getElementById('slide-form-id').value || ('slide-' + Date.now());
  const imageBase64 = document.getElementById('slide-form-image-base64').value;
  const data = {
    id,
    title: document.getElementById('slide-form-title').value.trim(),
    subtitle: document.getElementById('slide-form-subtitle').value.trim(),
    badge: document.getElementById('slide-form-badge').value.trim(),
    image: imageBase64 || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1920&q=80',
    actionLink: document.getElementById('slide-form-link').value.trim()
  };
  const idx = slides.findIndex(s => s.id === id);
  if (idx > -1) slides[idx] = data;
  else slides.push(data);
  DB.setData(DB.KEYS.HERO_SLIDER, slides);
  closeModal('modal-slide');
  loadSliderTable();
  showToast(idx > -1 ? 'Slide updated.' : 'Slide added.', 'success');
}

function deleteSlide(id) {
  if (!confirm('Remove this slide?')) return;
  const slides = DB.getData(DB.KEYS.HERO_SLIDER).filter(s => s.id !== id);
  DB.setData(DB.KEYS.HERO_SLIDER, slides);
  loadSliderTable();
  showToast('Slide removed.', 'info');
}

/* ===================== TESTIMONIALS TABLE ===================== */
function loadTestimonialsTable() {
  const testimonials = DB.getData(DB.KEYS.TESTIMONIALS);
  const tbody = document.getElementById('testimonials-table-body');
  if (!tbody) return;
  if (testimonials.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:32px;">No testimonials yet.</td></tr>';
    return;
  }
  tbody.innerHTML = testimonials.map(t => `
    <tr>
      <td><strong>${t.name}</strong></td>
      <td class="text-muted">${t.role}</td>
      <td><span style="color: var(--accent);">${'★'.repeat(t.stars || 5)}</span></td>
      <td class="text-muted" style="max-width:220px;">${t.text.substring(0, 60)}...</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-ghost btn-sm" onclick="editTestimonial('${t.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteTestimonial('${t.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddTestimonialModal() {
  document.getElementById('testimonial-modal-title').textContent = 'Add New Testimonial';
  document.getElementById('testimonial-form').reset();
  document.getElementById('test-form-id').value = '';
  openModal('modal-testimonial');
}

function editTestimonial(id) {
  const testimonials = DB.getData(DB.KEYS.TESTIMONIALS);
  const t = testimonials.find(x => x.id === id);
  if (!t) return;
  document.getElementById('testimonial-modal-title').textContent = 'Edit Testimonial';
  document.getElementById('test-form-id').value = t.id;
  document.getElementById('test-form-name').value = t.name;
  document.getElementById('test-form-role').value = t.role;
  document.getElementById('test-form-stars').value = t.stars || 5;
  document.getElementById('test-form-text').value = t.text;
  openModal('modal-testimonial');
}

function saveTestimonial(e) {
  e.preventDefault();
  const testimonials = DB.getData(DB.KEYS.TESTIMONIALS);
  const id = document.getElementById('test-form-id').value || ('test-' + Date.now());
  const data = {
    id,
    name: document.getElementById('test-form-name').value.trim(),
    role: document.getElementById('test-form-role').value.trim(),
    stars: parseInt(document.getElementById('test-form-stars').value) || 5,
    text: document.getElementById('test-form-text').value.trim()
  };
  const idx = testimonials.findIndex(t => t.id === id);
  if (idx > -1) testimonials[idx] = data;
  else testimonials.push(data);
  DB.setData(DB.KEYS.TESTIMONIALS, testimonials);
  closeModal('modal-testimonial');
  loadTestimonialsTable();
  showToast(idx > -1 ? 'Testimonial updated.' : 'Testimonial added.', 'success');
}

function deleteTestimonial(id) {
  if (!confirm('Remove this testimonial?')) return;
  const testimonials = DB.getData(DB.KEYS.TESTIMONIALS).filter(t => t.id !== id);
  DB.setData(DB.KEYS.TESTIMONIALS, testimonials);
  loadTestimonialsTable();
  showToast('Testimonial removed.', 'info');
}

/* ===================== FAQ TABLE ===================== */
function loadFAQTable() {
  const faqs = DB.getData(DB.KEYS.FAQ);
  const tbody = document.getElementById('faq-table-body');
  if (!tbody) return;
  if (faqs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted" style="padding:32px;">No FAQ entries yet.</td></tr>';
    return;
  }
  tbody.innerHTML = faqs.map(f => `
    <tr>
      <td><strong>${f.question}</strong></td>
      <td class="text-muted" style="max-width:260px;">${f.answer.substring(0, 80)}...</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-ghost btn-sm" onclick="editFAQ('${f.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteFAQ('${f.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddFAQModal() {
  document.getElementById('faq-modal-title').textContent = 'Add New FAQ Entry';
  document.getElementById('faq-form').reset();
  document.getElementById('faq-form-id').value = '';
  openModal('modal-faq');
}

function editFAQ(id) {
  const faqs = DB.getData(DB.KEYS.FAQ);
  const f = faqs.find(x => x.id === id);
  if (!f) return;
  document.getElementById('faq-modal-title').textContent = 'Edit FAQ Entry';
  document.getElementById('faq-form-id').value = f.id;
  document.getElementById('faq-form-question').value = f.question;
  document.getElementById('faq-form-answer').value = f.answer;
  openModal('modal-faq');
}

function saveFAQ(e) {
  e.preventDefault();
  const faqs = DB.getData(DB.KEYS.FAQ);
  const id = document.getElementById('faq-form-id').value || ('faq-' + Date.now());
  const data = {
    id,
    question: document.getElementById('faq-form-question').value.trim(),
    answer: document.getElementById('faq-form-answer').value.trim()
  };
  const idx = faqs.findIndex(f => f.id === id);
  if (idx > -1) faqs[idx] = data;
  else faqs.push(data);
  DB.setData(DB.KEYS.FAQ, faqs);
  closeModal('modal-faq');
  loadFAQTable();
  showToast(idx > -1 ? 'FAQ updated.' : 'FAQ entry added.', 'success');
}

function deleteFAQ(id) {
  if (!confirm('Remove this FAQ entry?')) return;
  const faqs = DB.getData(DB.KEYS.FAQ).filter(f => f.id !== id);
  DB.setData(DB.KEYS.FAQ, faqs);
  loadFAQTable();
  showToast('FAQ removed.', 'info');
}

/* ===================== ORDERS TABLE ===================== */
let currentOrderStatusFilter = 'all';

function loadOrdersTable(statusFilter = currentOrderStatusFilter, searchQuery = '') {
  let orders = DB.getData(DB.KEYS.ORDERS);
  
  if (statusFilter !== 'all') {
    orders = orders.filter(o => o.status === statusFilter);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    orders = orders.filter(o =>
      (o.id || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.city || '').toLowerCase().includes(q) ||
      (o.email || '').toLowerCase().includes(q)
    );
  }

  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:32px;">No orders matching filter: <strong>${statusFilter}</strong></td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const date = new Date(o.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const itemCount = (o.items || []).reduce((s, i) => s + i.quantity, 0);
    return `
      <tr>
        <td><strong class="text-primary">${o.id}</strong></td>
        <td>${date}</td>
        <td>
          <strong>${o.customerName}</strong>
          <br><span class="text-muted" style="font-size:0.78rem;">${o.city || ''}</span>
        </td>
        <td class="text-muted">${itemCount} item(s)</td>
        <td><strong>$${o.total.toFixed(2)}</strong></td>
        <td><span class="status-badge ${o.status}">${o.status}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-ghost btn-sm" onclick="viewOrderDetails('${o.id}')"><i class="fa-solid fa-eye"></i></button>
            <select class="btn btn-ghost btn-sm" style="height:30px;" onchange="updateOrderStatus('${o.id}', this.value); this.value='${o.status}'">
              <option value="${o.status}" selected>${o.status}</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterOrdersByStatus(status, btn) {
  currentOrderStatusFilter = status;
  document.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
  btn?.classList.add('active');
  loadOrdersTable(status, document.getElementById('order-search-input')?.value || '');
}

function filterOrders() {
  const q = document.getElementById('order-search-input')?.value || '';
  loadOrdersTable(currentOrderStatusFilter, q);
}

function updateOrderStatus(orderId, newStatus) {
  const orders = DB.getData(DB.KEYS.ORDERS);
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.status = newStatus;
  DB.setData(DB.KEYS.ORDERS, orders);
  loadOrdersTable(currentOrderStatusFilter, document.getElementById('order-search-input')?.value || '');
  showToast(`Order ${orderId} status updated to <strong>${newStatus}</strong>.`, 'success');
}

function viewOrderDetails(orderId) {
  const orders = DB.getData(DB.KEYS.ORDERS);
  const o = orders.find(x => x.id === orderId);
  if (!o) return;

  const date = new Date(o.date).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
  const itemsList = (o.items || []).map(i =>
    `<div class="order-detail-row">
      <span>${i.name} × ${i.quantity}</span>
      <span>$${(i.price * i.quantity).toFixed(2)}</span>
    </div>`
  ).join('');

  document.getElementById('order-modal-details').innerHTML = `
    <div class="order-details-card glass-panel" style="margin-bottom:16px; padding: 0;">
      <div class="order-detail-row"><span>Order ID:</span><strong class="text-primary">${o.id}</strong></div>
      <div class="order-detail-row"><span>Date / Time:</span><span>${date}</span></div>
      <div class="order-detail-row"><span>Status:</span><span class="status-badge ${o.status}">${o.status}</span></div>
    </div>
    <div class="glass-panel" style="margin-bottom:16px; padding: 16px;">
      <h4 style="margin-bottom:12px;">Customer Information</h4>
      <p style="font-size:0.88rem; color:var(--text-muted);">
        <strong>${o.customerName}</strong><br>
        <i class="fa-solid fa-envelope"></i> ${o.email}<br>
        <i class="fa-solid fa-phone"></i> ${o.phone}<br>
        <i class="fa-solid fa-location-dot"></i> ${o.address}, ${o.city}, ${o.zip}
      </p>
    </div>
    <div class="glass-panel" style="padding: 0;">
      <h4 style="padding: 16px 16px 0; margin-bottom:8px;">Ordered Items</h4>
      ${itemsList}
      <div class="order-detail-row" style="border-top: 1px solid var(--border);">
        <span>Subtotal:</span><span>$${o.subtotal.toFixed(2)}</span>
      </div>
      <div class="order-detail-row">
        <span>Delivery:</span><span>$${o.delivery.toFixed(2)}</span>
      </div>
      ${o.discount > 0 ? `<div class="order-detail-row text-success"><span>Discount:</span><span>-$${o.discount.toFixed(2)}</span></div>` : ''}
      <div class="order-detail-row" style="font-weight:800; font-size:1rem; padding-bottom:16px;">
        <span>Grand Total:</span><strong>$${o.total.toFixed(2)}</strong>
      </div>
    </div>
  `;
  openModal('modal-order-view');
}

function exportOrdersJSON() {
  const orders = DB.getData(DB.KEYS.ORDERS);
  const blob = new Blob([JSON.stringify(orders, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `luxestore_orders_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Orders exported as JSON file.', 'success');
}

/* ===================== SETTINGS ===================== */
function loadSettings() {
  const s = DB.getData(DB.KEYS.SETTINGS);
  if (Array.isArray(s)) return;

  document.getElementById('set-site-name').value = s.siteName || '';
  document.getElementById('set-theme-color').value = s.themeColor || '#7c3aed';
  document.getElementById('set-theme-color-hex').value = s.themeColor || '#7c3aed';
  document.getElementById('set-phone').value = s.phone || '';
  document.getElementById('set-whatsapp').value = s.whatsapp || '';
  document.getElementById('set-facebook').value = s.facebook || '';
  document.getElementById('set-instagram').value = s.instagram || '';
  document.getElementById('set-messenger').value = s.messenger || '';
  document.getElementById('set-youtube').value = s.youtube || '';
  document.getElementById('set-tiktok').value = s.tiktok || '';
  document.getElementById('set-delivery').value = s.deliveryCharge || 15;
  document.getElementById('set-coupon').value = s.coupon || '';
  document.getElementById('set-coupon-discount').value = s.couponDiscount || 10;
  document.getElementById('set-announcement').value = s.announcementText || '';
  document.getElementById('set-popup-enabled').value = s.popupEnabled !== false ? 'true' : 'false';
  document.getElementById('set-popup-title').value = s.popupTitle || '';
  document.getElementById('set-popup-code').value = s.popupCode || '';
  document.getElementById('set-popup-desc').value = s.popupDesc || '';

  // Sync color input
  document.getElementById('set-theme-color')?.addEventListener('input', function() {
    document.getElementById('set-theme-color-hex').value = this.value;
  });
}

function saveWebSettings(e) {
  e.preventDefault();
  const settings = {
    siteName: document.getElementById('set-site-name').value.trim(),
    themeColor: document.getElementById('set-theme-color').value,
    phone: document.getElementById('set-phone').value.trim(),
    whatsapp: document.getElementById('set-whatsapp').value.trim(),
    facebook: document.getElementById('set-facebook').value.trim(),
    instagram: document.getElementById('set-instagram').value.trim(),
    messenger: document.getElementById('set-messenger').value.trim(),
    youtube: document.getElementById('set-youtube').value.trim(),
    tiktok: document.getElementById('set-tiktok').value.trim(),
    deliveryCharge: parseFloat(document.getElementById('set-delivery').value) || 15,
    coupon: document.getElementById('set-coupon').value.trim().toUpperCase(),
    couponDiscount: parseInt(document.getElementById('set-coupon-discount').value) || 10,
    announcementText: document.getElementById('set-announcement').value.trim(),
    popupEnabled: document.getElementById('set-popup-enabled').value === 'true',
    popupTitle: document.getElementById('set-popup-title').value.trim(),
    popupCode: document.getElementById('set-popup-code').value.trim().toUpperCase(),
    popupDesc: document.getElementById('set-popup-desc').value.trim(),
    logo: 'fa-solid fa-gem'
  };

  DB.setData(DB.KEYS.SETTINGS, settings);
  showToast('All website settings have been saved successfully!', 'success');

  // Apply theme color live
  if (settings.themeColor) {
    document.documentElement.style.setProperty('--primary', settings.themeColor);
  }
}

/* ===================== ADMIN INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();

  // Sidebar mobile toggle
  const headerBtn = document.createElement('button');
  headerBtn.className = 'nav-btn';
  headerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
  headerBtn.addEventListener('click', () => {
    document.getElementById('admin-sidebar')?.classList.toggle('open');
  });
  document.querySelector('.admin-header')?.insertBefore(headerBtn, document.querySelector('.admin-header').firstChild);
});
