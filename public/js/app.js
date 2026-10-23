'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { settings: {}, products: [], user: null, page: 'home', query: '', category: 'Semua kategori', sort: 'newest', stockOnly: false, featuredOnly: false, cart: [], selectedProduct: null, detailQuantity: 1 };
  const categoryStyles = [
    { icon: 'laptop', color: '#365fe8', wash: 'linear-gradient(140deg,#dbe6ff,#d2f9fa)' },
    { icon: 'shirt', color: '#c57a2f', wash: 'linear-gradient(140deg,#ffe8c8,#fff1df)' },
    { icon: 'watch', color: '#7b58dc', wash: 'linear-gradient(140deg,#e9dfff,#e3e8ff)' },
    { icon: 'lamp', color: '#0a9c91', wash: 'linear-gradient(140deg,#cff9ef,#d8faff)' },
    { icon: 'headphones', color: '#e77e42', wash: 'linear-gradient(140deg,#ffe0d7,#fff4de)' },
    { icon: 'camera', color: '#3561d8', wash: 'linear-gradient(140deg,#dceaff,#d8f8ff)' },
    { icon: 'package', color: '#7154d8', wash: 'linear-gradient(140deg,#e8ddff,#dce7ff)' },
    { icon: 'coffee', color: '#b8792d', wash: 'linear-gradient(140deg,#ffe9c8,#fff1e2)' }
  ];
  const iconPaths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>', grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>', bag: '<path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>', receipt: '<path d="M5 3h14v18l-3-2-4 2-4-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h4"/>', spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>', login: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>', search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>', 'arrow-up-right': '<path d="M7 17 17 7M7 7h10v10"/>', 'arrow-right': '<path d="M4 12h15M13 6l6 6-6 6"/>', 'chevron-down': '<path d="m6 9 6 6 6-6"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', check: '<path d="m5 12 4 4L19 6"/>', heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>', box: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/>', 'shield-check': '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>', 'message-circle': '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 4a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>', smartphone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 16h4"/>', 'rotate-ccw': '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>', compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>', layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>', 'heart-handshake': '<path d="M8 12 5 9.5a3.5 3.5 0 0 1 5-5L12 6l2-1.5a3.5 3.5 0 1 1 5 5L16 12"/><path d="m3 13 4-2 5 3 5-2 4 3-7 5-7-4-4 1z"/>', laptop: '<rect x="4" y="4" width="16" height="12" rx="2"/><path d="M2 20h20l-2-4H4z"/>', shirt: '<path d="m8 4 4 2 4-2 5 4-3 4-2-1v9H8v-9l-2 1-3-4z"/>', watch: '<rect x="7" y="7" width="10" height="10" rx="3"/><path d="m9 7 1-4h4l1 4M9 17l1 4h4l1-4"/>', lamp: '<path d="m9 3-5 10h16L15 3z"/><path d="M12 13v5M8 21h8M10 18h4"/>', headphones: '<path d="M3 13v-2a9 9 0 0 1 18 0v2"/><rect x="3" y="12" width="5" height="8" rx="2"/><rect x="16" y="12" width="5" height="8" rx="2"/>', camera: '<path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/>', package: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/>', coffee: '<path d="M5 8h12v8a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2M16 3v2"/>', x: '<path d="m6 6 12 12M18 6 6 18"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>', phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 11.2 19a19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.7a2 2 0 0 1-.6 1.9L7.7 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.9-.6l2.7.5a2 2 0 0 1 1.7 2.7Z"/>'
  };
  function icon(name, cls = '') { return `<svg class="${cls}" aria-hidden="true" viewBox="0 0 24 24">${iconPaths[name] || iconPaths.spark || ''}</svg>`; }
  function renderIcons(root = document) { $$('[data-icon]', root).forEach(el => { const name = el.dataset.icon; el.innerHTML = icon(name); }); }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
  function safeUrl(value) { const v = String(value || '').trim(); if (v.startsWith('/uploads/')) return v; if (/^https:\/\//i.test(v)) return v; return ''; }
  function fmtPrice(value) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0).replace(/\u00a0/g, ' '); }
  function fmtDate(value) { try { return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); } catch { return value || '-'; } }
  function compactDate(value) { try { return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)); } catch { return '-'; } }
  function toast(title, message = '', type = 'success') {
    const stack = $('#toastStack'); if (!stack) return;
    const node = document.createElement('div'); node.className = 'toast';
    const symbol = type === 'error' ? 'x' : type === 'info' ? 'info' : 'check';
    node.innerHTML = `<span class="toast-icon ${type}">${icon(symbol)}</span><div class="toast-copy"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p></div><button class="toast-x" type="button" aria-label="Tutup">×</button>`;
    stack.append(node);
    const timer = setTimeout(() => node.remove(), 4300);
    $('.toast-x', node).addEventListener('click', () => { clearTimeout(timer); node.remove(); });
  }
  async function api(path, options = {}) {
    const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
    let response;
    try { response = await fetch(path, { credentials: 'same-origin', ...options, headers }); }
    catch { throw new Error('Tidak dapat terhubung ke server. Pastikan website masih berjalan.'); }
    let data;
    try { data = await response.json(); } catch { throw new Error('Server mengirim respons yang tidak dikenali.'); }
    if (!response.ok || data.ok === false) throw Object.assign(new Error(data.error || 'Permintaan gagal.'), { status: response.status });
    return data;
  }
  function loadCart() { try { const cart = JSON.parse(localStorage.getItem('nextshop.cart') || '[]'); return Array.isArray(cart) ? cart.filter(i => i && typeof i.id === 'string' && Number.isInteger(i.quantity) && i.quantity > 0).slice(0,100) : []; } catch { return []; } }
  function saveCart() { localStorage.setItem('nextshop.cart', JSON.stringify(state.cart)); updateCartCount(); }
  function saveGuestOrder(order, token) {
    try { const items = JSON.parse(localStorage.getItem('nextshop.guestOrders') || '[]'); items.unshift({ number: order.number, accessToken: token, createdAt: order.createdAt }); localStorage.setItem('nextshop.guestOrders', JSON.stringify(items.slice(0,30))); } catch {}
  }
  function updateCartCount() {
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    $('#sidebarCartCount').textContent = count > 99 ? '99+' : count;
    $('#topCartCount').textContent = count > 99 ? '99+' : count;
    $('#topCartButton').setAttribute('aria-label', `Keranjang, ${count} barang`);
  }
  function updateAccountUI() {
    const user = state.user;
    $('#accountNavText').textContent = user ? (user.role === 'admin' ? 'Akun Admin' : 'Akun Saya') : 'Masuk / Daftar';
    $('#profileName').textContent = user ? user.name : 'Hai, teman!';
    $('#profileSub').textContent = user ? user.email : 'Selamat datang di Next Shop';
    $('#profileAvatar').textContent = (user?.name || 'N').trim().slice(0,1).toUpperCase();
    $('#topAvatar').textContent = (user?.name || 'N').trim().slice(0,1).toUpperCase();
    $('#topAccountName').textContent = user ? user.name : 'Hai, teman!';
    $('#topAccountSub').textContent = user ? (user.role === 'admin' ? 'Administrator' : 'Akun pelanggan') : 'Akun kamu';
    $('#profileAction').setAttribute('aria-label', user ? 'Keluar' : 'Masuk');
    $('#profileAction').innerHTML = icon(user ? 'logout' : 'user');
    renderIcons($('#sidebarProfile'));
  }
  function allCategories() {
    const values = [...(Array.isArray(state.settings.categories) ? state.settings.categories : []), ...state.products.map(p => p.category)];
    return [...new Set(values.map(v => String(v || '').trim()).filter(Boolean))];
  }
  function categoryFor(index) { return categoryStyles[index % categoryStyles.length]; }
  function renderCategories() {
    const categories = allCategories();
    const root = $('#homeCategoryGrid');
    if (!categories.length) { root.innerHTML = emptyBlock('package', 'Kategori belum tersedia', 'Kategori akan muncul setelah admin menyiapkan katalog produk.', false); return; }
    root.innerHTML = categories.slice(0, 8).map((name, i) => {
      const style = categoryFor(i); const count = state.products.filter(p => p.category === name && p.active !== false).length;
      return `<button type="button" class="category-card" data-category="${escapeHtml(name)}" style="--cat-color:${style.color};--cat-wash:${style.wash}"><span class="category-symbol">${icon(style.icon)}</span><span><h3>${escapeHtml(name)}</h3><p>${count} produk tersedia</p></span><span class="category-go">${icon('arrow-up-right')}</span></button>`;
    }).join('');
    $('#categoryFilterList').innerHTML = `<button type="button" class="category-filter ${state.category === 'Semua kategori' ? 'active' : ''}" data-category="Semua kategori"><span>Semua kategori</span><small>${state.products.filter(p=>p.active!==false).length}</small></button>` + categories.map(name => `<button type="button" class="category-filter ${state.category === name ? 'active' : ''}" data-category="${escapeHtml(name)}"><span>${escapeHtml(name)}</span><small>${state.products.filter(p=>p.category === name && p.active !== false).length}</small></button>`).join('');
    renderIcons(root); renderIcons($('#categoryFilterList'));
  }
  function emptyBlock(iconName, title, description, showButton = true, buttonText = 'Jelajahi katalog') {
    return `<div class="empty-products"><span class="empty-art">${icon(iconName)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p>${showButton ? '<a class="btn btn-primary" href="#shop">' + escapeHtml(buttonText) + ' ' + icon('arrow-up-right') + '</a>' : ''}</div>`;
  }
  function productCard(product) {
    const img = safeUrl(product.image);
    const stockClass = product.stock < 1 ? 'empty' : product.stock <= 4 ? 'low' : '';
    const stockText = product.stock < 1 ? 'Stok habis' : product.stock <= 4 ? `Sisa ${product.stock}` : 'Tersedia';
    const badges = `${product.featured ? '<span class="badge badge-featured">✦ Unggulan</span>' : ''}${product.stock < 1 ? '<span class="badge badge-out">Habis</span>' : product.createdAt && Date.now() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 14 ? '<span class="badge badge-new">NEW</span>' : ''}`;
    return `<article class="product-card" data-product-card="${escapeHtml(product.id)}"><div class="product-media ${img ? '' : 'no-image'}">${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(product.name)}" loading="lazy">` : `<span class="product-placeholder-mark">${icon('package')}</span>`}<div class="product-badges">${badges}</div><button class="favorite-btn" type="button" data-action="save-favorite" data-id="${escapeHtml(product.id)}" aria-label="Tandai produk"><span data-icon="heart"></span></button><button class="product-quick-view" type="button" data-action="detail" data-id="${escapeHtml(product.id)}">Lihat detail <span>↗</span></button></div><div class="product-card-info"><div class="product-card-meta"><span class="product-category">${escapeHtml(product.category || 'Koleksi')}</span><span class="product-stock ${stockClass}">${stockText}</span></div><h3 class="product-name" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h3><p class="product-description">${escapeHtml(product.description || 'Informasi produk lebih lengkap tersedia pada detail produk.')}</p><div class="product-card-bottom"><div><small>HARGA</small><strong class="product-price">${fmtPrice(product.price)}</strong></div><button class="add-cart-btn" type="button" data-action="add-cart" data-id="${escapeHtml(product.id)}" aria-label="Tambah ${escapeHtml(product.name)} ke keranjang" ${product.stock < 1 ? 'disabled' : ''}>${icon('plus')}</button></div></div></article>`;
  }
  function renderGrid(selector, products, emptyTitle = 'Belum ada produk', emptyText = 'Produk akan tampil di sini setelah admin menambahkan katalog.') {
    const root = $(selector); if (!root) return;
    root.innerHTML = products.length ? products.map(productCard).join('') : emptyBlock('package', emptyTitle, emptyText, selector !== '#featuredGrid' && selector !== '#latestGrid');
  }
  function filteredProducts() {
    let list = state.products.filter(p => p.active !== false);
    if (state.query) { const q = state.query.toLowerCase(); list = list.filter(p => `${p.name} ${p.category} ${p.description || ''}`.toLowerCase().includes(q)); }
    if (state.category !== 'Semua kategori') list = list.filter(p => p.category === state.category);
    if (state.stockOnly) list = list.filter(p => p.stock > 0);
    if (state.featuredOnly) list = list.filter(p => p.featured);
    if (state.sort === 'price-low') list.sort((a,b) => a.price - b.price);
    else if (state.sort === 'price-high') list.sort((a,b) => b.price - a.price);
    else if (state.sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name, 'id'));
    else list.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }
  function renderShop() {
    const list = filteredProducts();
    $('#catalogTitle').textContent = state.category === 'Semua kategori' ? 'Semua produk' : state.category;
    $('#catalogCount').textContent = `${list.length} produk ditemukan`;
    renderGrid('#shopGrid', list, state.query ? 'Produk tidak ditemukan' : 'Katalog sedang disiapkan', state.query ? 'Coba kata kunci lain atau hapus filter yang aktif.' : 'Belum ada produk yang dipublikasikan. Produk akan muncul setelah admin menambahkannya.');
    const chips = [];
    if (state.query) chips.push(`<span class="active-filter-chip">Pencarian: ${escapeHtml(state.query)} <button type="button" data-clear="query" aria-label="Hapus pencarian">×</button></span>`);
    if (state.category !== 'Semua kategori') chips.push(`<span class="active-filter-chip">${escapeHtml(state.category)} <button type="button" data-clear="category" aria-label="Hapus kategori">×</button></span>`);
    if (state.stockOnly) chips.push('<span class="active-filter-chip">Stok tersedia <button type="button" data-clear="stock">×</button></span>');
    if (state.featuredOnly) chips.push('<span class="active-filter-chip">Unggulan <button type="button" data-clear="featured">×</button></span>');
    $('#activeFilters').innerHTML = chips.join('');
    $('#shopSearch').value = state.query; $('#sortSelect').value = state.sort; $('#inStockOnly').checked = state.stockOnly; $('#featuredOnly').checked = state.featuredOnly;
    $$('.category-filter', $('#categoryFilterList')).forEach(el => el.classList.toggle('active', el.dataset.category === state.category));
    $('#catalogBottom').textContent = list.length ? `Menampilkan ${list.length} produk` : '';
    renderIcons($('#shopGrid'));
  }
  function renderHome() {
    const settings = state.settings;
    $('#brandName').textContent = settings.storeName || 'Next Shop';
    const brandTagline = $('.brand-text small'); if (brandTagline) brandTagline.textContent = settings.tagline || 'YOUR DAILY DISCOVERY';
    $('#heroEyebrow').textContent = settings.heroEyebrow || 'YOUR NEXT FAVORITE THING';
    $('#heroTitle').innerHTML = escapeHtml(settings.heroTitle || 'Belanja lebih mudah.\nTemukan lebih banyak.').replace(/\n/g, '<br>').replace(/(Temukan lebih banyak\.|yang lebih baik\.|lebih nyaman\.)/i, '<em>$1</em>');
    $('#heroText').textContent = settings.heroText || settings.description || 'Jelajahi koleksi pilihan dan temukan produk yang cocok buat kamu.';
    $('#heroCta').innerHTML = `${escapeHtml(settings.heroCta || 'Jelajahi koleksi')} ${icon('arrow-up-right')}`;
    const hero = $('.hero-shell');
    const heroImage = safeUrl(settings.heroImage);
    hero.style.backgroundImage = heroImage ? `linear-gradient(90deg,#10264eeF 0%,#183d8cc9 47%,#1d66a399 100%),url("${heroImage.replace(/"/g,'%22')}")` : '';
    hero.style.backgroundSize = heroImage ? 'cover' : '';
    hero.style.backgroundPosition = 'center';
    if (settings.logoImage && safeUrl(settings.logoImage)) $('#brandSymbol').innerHTML = `<img src="${escapeHtml(safeUrl(settings.logoImage))}" alt="">`;
    else $('#brandSymbol').innerHTML = '<img src="/assets/next-shop-mark.svg" alt="">';
    $('#promoBand').hidden = !settings.promoEnabled;
    $('#promoLabel').textContent = settings.promoLabel || 'SPECIAL DROP'; $('#promoTitle').textContent = settings.promoTitle || ''; $('#promoText').textContent = settings.promoText || '';
    $('#aboutTitle').innerHTML = escapeHtml(settings.aboutTitle || 'Belanja dengan cara yang lebih baik').replace(/\n/g, '<br>').replace(/(yang lebih baik\.?)/i, '<em>$1</em>');
    $('#aboutText').textContent = settings.aboutText || settings.description || '';
    $('#aboutVision').textContent = settings.vision || '';
    $('#aboutMission').textContent = settings.mission || '';
    $('#developerNote').hidden = !settings.developer; $('#developerName').textContent = settings.developer || '';
    $('#footerAddress').textContent = settings.address || 'Dibuat untuk pengalaman belanja yang lebih nyaman.';
    ['yearSide','yearFooter','yearMain'].forEach(id => { const el = $('#' + id); if (el) el.textContent = new Date().getFullYear(); });
    $('#footerName').textContent = settings.storeName || 'Next Shop'; $('#footerStoreName').textContent = settings.storeName || 'Next Shop';
    const featured = state.products.filter(p => p.active !== false && p.featured).slice(0,4);
    const latest = state.products.filter(p => p.active !== false).slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,4);
    renderGrid('#featuredGrid', featured, 'Belum ada produk unggulan', 'Produk akan tampil di sini saat admin menandai produk sebagai unggulan.', false);
    renderGrid('#latestGrid', latest, 'Rak masih kosong', 'Produk terbaru akan muncul di sini setelah ditambahkan oleh admin.', false);
    renderCategories(); renderIcons();
  }
  function cartDetails() {
    return state.cart.map(item => {
      const p = state.products.find(x => x.id === item.id);
      return p ? { ...p, quantity: Math.min(item.quantity, Math.max(p.stock, 0)), requestedQuantity: item.quantity } : null;
    }).filter(Boolean);
  }
  function renderCart() {
    const root = $('#cartRoot'); const items = cartDetails();
    if (!items.length) { root.innerHTML = `<div class="surface-card cart-empty"><span class="empty-art">${icon('bag')}</span><h2>Keranjangmu masih kosong</h2><p>Jelajahi katalog, lalu tambahkan produk yang ingin kamu pesan.</p><a class="btn btn-primary" href="#shop">Jelajahi produk ${icon('arrow-up-right')}</a></div>`; return; }
    const totalQty = state.cart.reduce((n,i)=>n+i.quantity,0); const subtotal = items.reduce((n,i)=>n+i.price*i.quantity,0);
    root.innerHTML = `<div class="cart-layout"><section class="surface-card"><div class="surface-head"><h2>Isi keranjang</h2><small>${totalQty} barang dipilih</small></div><div class="cart-items">${items.map(p=>`<article class="cart-item" data-cart-id="${escapeHtml(p.id)}"><div class="cart-item-img">${safeUrl(p.image)?`<img src="${escapeHtml(safeUrl(p.image))}" alt="${escapeHtml(p.name)}">`:icon('package')}</div><div class="cart-item-info"><small>${escapeHtml(p.category)}</small><strong>${escapeHtml(p.name)}</strong><span class="cart-price">${fmtPrice(p.price)}</span><div class="qty-control"><button type="button" data-cart-action="minus" data-id="${escapeHtml(p.id)}" aria-label="Kurangi">−</button><span>${p.requestedQuantity}</span><button type="button" data-cart-action="plus" data-id="${escapeHtml(p.id)}" aria-label="Tambah" ${p.requestedQuantity>=p.stock?'disabled':''}>+</button></div>${p.requestedQuantity>p.stock?`<small class="field-error">Stok tinggal ${p.stock}. Kurangi jumlah sebelum checkout.</small>`:''}</div><div class="cart-item-end"><strong>${fmtPrice(p.price*p.requestedQuantity)}</strong><button type="button" class="remove-item" data-cart-action="remove" data-id="${escapeHtml(p.id)}">Hapus</button></div></article>`).join('')}</div></section><aside class="surface-card cart-summary"><h2>Ringkasan belanja</h2><div class="summary-line"><span>Subtotal (${totalQty} barang)</span><strong>${fmtPrice(subtotal)}</strong></div><div class="summary-line"><span>Pengiriman</span><strong>Dikonfirmasi admin</strong></div><div class="summary-line total"><span>Total produk</span><strong>${fmtPrice(subtotal)}</strong></div><p class="summary-note">Total belum termasuk biaya pengiriman. Detail akhir akan dikonfirmasi admin sebelum pembayaran.</p><button class="btn btn-primary" type="button" data-action="checkout" ${items.some(i=>i.requestedQuantity>i.stock||i.stock<1)?'disabled':''}>Lanjut ke checkout ${icon('arrow-up-right')}</button><a class="btn btn-outline" href="#shop">Tambah produk lain</a><div class="summary-security">${icon('shield-check')} Data pesanan diverifikasi di server</div></aside></div>`;
    renderIcons(root);
  }
  function renderOrders() {
    const root = $('#ordersRoot');
    const knownGuest = (() => { try { return JSON.parse(localStorage.getItem('nextshop.guestOrders') || '[]'); } catch { return []; } })();
    const guestLookup = `<div class="lookup-layout"><div class="lookup-info"><span class="value-icon value-cyan">${icon('receipt')}</span><span class="value-caption">GUEST ORDER TRACKING</span><h2>Pesan sebagai tamu?</h2><p>Kamu bisa melacak pesanan tanpa membuat akun. Masukkan nomor pesanan dan kode akses yang diberikan setelah checkout.</p></div><form class="lookup-form" id="lookupOrderForm"><h3>Lacak pesanan</h3><div class="field"><label for="lookupNumber">Nomor pesanan</label><input id="lookupNumber" name="number" required placeholder="Contoh: NS-20261022-ABC123"></div><div class="field" style="margin-top:12px"><label for="lookupToken">Kode akses pesanan</label><input id="lookupToken" name="accessToken" required autocomplete="off" placeholder="Tempel kode akses pesanan"></div><button class="btn btn-primary" type="submit">Lacak status ${icon('arrow-up-right')}</button>${knownGuest.length ? `<div class="saved-guest-list"><p>Riwayat di perangkat ini</p>${knownGuest.slice(0,5).map(item=>`<button type="button" class="saved-guest" data-lookup-number="${escapeHtml(item.number)}" data-lookup-token="${escapeHtml(item.accessToken)}"><span>${escapeHtml(item.number)}</span><small>${compactDate(item.createdAt)}</small></button>`).join('')}</div>` : ''}</form></div><div id="orderLookupResult" style="margin-top:18px"></div>`;
    if (!state.user) { root.innerHTML = guestLookup; return; }
    root.innerHTML = `<div class="orders-toolbar"><div><strong>Riwayat akun</strong><p>Pesanan yang terhubung dengan ${escapeHtml(state.user.email)}.</p></div><button class="btn btn-outline" type="button" data-action="refresh-orders">${icon('rotate-ccw')} Muat ulang</button></div><div class="order-list" id="accountOrderList"><div class="skeleton-card" style="height:140px"></div></div><div class="guest-tracking-lower">${guestLookup}</div>`;
    api('/api/orders').then(data => renderOrderList(data.orders, $('#accountOrderList'))).catch(err => { $('#accountOrderList').innerHTML = emptyBlock('receipt','Riwayat belum bisa dimuat',err.message,false); });
  }
  function renderOrderList(orders, target) {
    if (!target) return;
    if (!orders.length) { target.innerHTML = emptyBlock('receipt','Belum ada pesanan', 'Pesanan yang berhasil dibuat melalui akun ini akan tampil di sini.', true, 'Mulai belanja'); return; }
    target.innerHTML = orders.map(orderCard).join('');
  }
  function orderCard(order) {
    const statusKey = String(order.status).toLowerCase().replace(/[^a-z]+/g,'');
    return `<article class="order-card"><div class="order-card-head"><div><strong>${escapeHtml(order.number)}</strong><small>${fmtDate(order.createdAt)}</small></div><span class="status-pill status-${statusKey}">${escapeHtml(order.status)}</span></div><div class="order-card-body"><div class="order-item-list">${order.items.map(item=>`<div class="order-line-item"><div class="mini-thumb">${safeUrl(item.image)?`<img src="${escapeHtml(safeUrl(item.image))}" alt="">`:icon('package')}</div><div><strong>${escapeHtml(item.name)}</strong><small>${item.quantity} × ${fmtPrice(item.price)}</small></div><b>${fmtPrice(item.subtotal)}</b></div>`).join('')}</div><div class="order-card-footer"><small>${escapeHtml(order.items.length)} jenis barang · status diperbarui admin</small><strong>${fmtPrice(order.total)}</strong></div></div></article>`;
  }
  function renderContactLinks() {
    const settings = state.settings; const links = [];
    if (settings.whatsapp) links.push(`<a class="contact-link" href="https://wa.me/${String(settings.whatsapp).replace(/\D/g,'')}" target="_blank" rel="noopener">${icon('message-circle')} WhatsApp toko</a>`);
    if (settings.email) links.push(`<a class="contact-link" href="mailto:${escapeHtml(settings.email)}">${icon('mail')} ${escapeHtml(settings.email)}</a>`);
    if (settings.instagram && /^https:\/\//.test(settings.instagram)) links.push(`<a class="contact-link" href="${escapeHtml(settings.instagram)}" target="_blank" rel="noopener">${icon('instagram')} Instagram</a>`);
    if (settings.tiktok && /^https:\/\//.test(settings.tiktok)) links.push(`<a class="contact-link" href="${escapeHtml(settings.tiktok)}" target="_blank" rel="noopener">${icon('smartphone')} TikTok</a>`);
    $('#contactLinks').innerHTML = links.length ? links.join('') : '<span class="contact-link">Kontak toko belum diatur admin</span>';
    renderIcons($('#contactLinks'));
  }
  function showPage(page) {
    const valid = ['home','shop','cart','orders','about']; if (!valid.includes(page)) page = 'home';
    state.page = page;
    $$('.page-section').forEach(section => { section.hidden = section.id !== `page-${page}`; });
    $$('.nav-link[data-page]').forEach(link => link.classList.toggle('active', link.dataset.page === page));
    const label = {home:'Beranda',shop:'Jelajahi Shop',cart:'Keranjang',orders:'Pesanan Saya',about:'Tentang Kami'}[page];
    $('#breadcrumbPage').textContent = label;
    closeSidebar();
    if (page === 'shop') renderShop(); if (page === 'cart') renderCart(); if (page === 'orders') renderOrders(); if (page === 'about') renderContactLinks();
    $('#pageRoot').focus({ preventScroll: true });
  }
  function addToCart(id, quantity = 1) {
    const p = state.products.find(item => item.id === id);
    if (!p || p.active === false) return toast('Produk tidak tersedia', 'Produk mungkin sudah dinonaktifkan oleh admin.', 'error');
    if (p.stock < 1) return toast('Stok habis', 'Produk ini tidak bisa ditambahkan sekarang.', 'error');
    if (!Number.isInteger(quantity) || quantity < 1) return toast('Jumlah tidak valid', 'Pilih jumlah barang minimal 1.', 'error');
    const existing = state.cart.find(item => item.id === id);
    const current = existing ? existing.quantity : 0;
    if (current + quantity > p.stock) return toast('Stok maksimum', `Stok ${p.name} tersedia ${p.stock} unit; saat ini ${current} unit di keranjang.`, 'info');
    if (existing) existing.quantity += quantity; else state.cart.push({ id, quantity });
    saveCart(); toast('Masuk ke keranjang', `${quantity} × ${p.name} berhasil ditambahkan.`);
    if (state.page === 'cart') renderCart();
  }
  function cartAction(action, id) {
    const item = state.cart.find(i => i.id === id); const p = state.products.find(i => i.id === id);
    if (!item) return;
    if (action === 'remove') { state.cart = state.cart.filter(i=>i.id!==id); toast('Produk dihapus','Produk telah dikeluarkan dari keranjang.','info'); }
    if (action === 'plus') { if (!p || item.quantity >= p.stock) return toast('Stok maksimum','Jumlah tidak dapat melebihi stok tersedia.','info'); item.quantity += 1; }
    if (action === 'minus') { item.quantity -= 1; if (item.quantity < 1) state.cart = state.cart.filter(i=>i.id!==id); }
    saveCart(); renderCart();
  }
  function openModal(content, wide = false) {
    const root = $('#modalRoot'); root.innerHTML = `<div class="modal-backdrop" data-modal-backdrop><section class="modal-panel ${wide?'modal-wide':''}" role="dialog" aria-modal="true">${content}</section></div>`;
    document.body.style.overflow = 'hidden'; renderIcons(root);
    root.addEventListener('click', modalClick);
    const focusable = $('input,button,a,select,textarea', root); focusable?.focus();
  }
  function modalClick(event) { if (event.target.closest('[data-modal-close]') || event.target.matches('[data-modal-backdrop]')) closeModal(); }
  function closeModal() { const root = $('#modalRoot'); root.removeEventListener('click', modalClick); root.innerHTML = ''; document.body.style.overflow = ''; }
  function showAuth(mode = 'login') {
    const register = mode === 'register';
    const content = `<div class="auth-modal-layout"><div class="auth-side-art"><img src="/assets/next-shop-mark.svg" alt=""><span class="section-kicker">WELCOME TO NEXT SHOP</span><h3>Belanja pilihanmu.<br><span style="color:#8ef0eb">Dengan cara kamu.</span></h3><p>Masuk untuk melihat riwayat pesanan yang terhubung dengan akun. Mau checkout sebagai tamu? Kamu tetap bisa belanja tanpa login.</p><div class="auth-side-note">Your next good find is just around the corner.</div></div><div class="auth-form-area"><button class="icon-btn" data-modal-close type="button" aria-label="Tutup" style="float:right;width:31px;height:31px">${icon('x')}</button><h2>${register?'Buat akun baru':'Selamat datang kembali'}</h2><p>${register?'Daftar untuk menghubungkan pesanan dengan akunmu.':'Masuk ke akun pelanggan untuk melihat riwayat pesanan.'}</p><form id="authForm" data-mode="${register?'register':'login'}">${register?'<div class="field"><label for="authName">Nama lengkap</label><input id="authName" name="name" autocomplete="name" required minlength="2" maxlength="80" placeholder="Nama kamu"></div>':''}<div class="field"><label for="authEmail">Email</label><input id="authEmail" name="email" type="email" autocomplete="email" required maxlength="190" placeholder="nama@email.com"></div><div class="field"><label for="authPassword">Password</label><input id="authPassword" name="password" type="password" autocomplete="${register?'new-password':'current-password'}" required minlength="${register?'10':'1'}" maxlength="200" placeholder="${register?'Minimal 10 karakter':'Masukkan password'}"></div><button class="btn btn-primary" type="submit">${register?'Buat akun':'Login'} ${icon('arrow-up-right')}</button><div class="auth-switch"><span>${register?'Sudah punya akun?':'Belum punya akun?'}</span><button class="text-button" type="button" data-auth-switch="${register?'login':'register'}">${register?'Login':'Daftar sekarang'}</button></div></form><div style="margin-top:16px;text-align:center"><button class="text-button" type="button" data-modal-close>Lanjut sebagai tamu</button></div></div></div>`;
    openModal(content, true);
  }
  function showProductDetail(id) {
    const p = state.products.find(x=>x.id===id); if (!p) return;
    state.selectedProduct = id; state.detailQuantity = 1;
    const img = safeUrl(p.image);
    const content = `<div class="modal-head"><div><h2>Detail produk</h2><p>Informasi sesuai katalog Next Shop</p></div><button class="icon-btn" type="button" data-modal-close aria-label="Tutup">${icon('x')}</button></div><div class="modal-body"><div class="product-detail-layout"><div class="detail-image">${img?`<img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}">`:`<span class="empty-art">${icon('package')}</span>`}</div><div class="detail-copy"><span class="detail-category">${escapeHtml(p.category)}</span><h2>${escapeHtml(p.name)}</h2><div class="detail-price">${fmtPrice(p.price)}</div><p class="detail-description">${escapeHtml(p.description || 'Belum ada deskripsi tambahan untuk produk ini.')}</p><span class="detail-stock ${p.stock<1?'out':''}">${p.stock<1?'Stok habis':`${p.stock} unit tersedia`}</span><div class="detail-quantity-row"><span>Jumlah</span><div class="detail-qty-control"><button type="button" data-detail-qty="minus" ${p.stock<1?'disabled':''} aria-label="Kurangi jumlah">−</button><input id="detailQuantity" type="number" min="1" max="${Math.max(1,p.stock)}" value="1" aria-label="Jumlah produk" ${p.stock<1?'disabled':''}><button type="button" data-detail-qty="plus" ${p.stock<1?'disabled':''} aria-label="Tambah jumlah">+</button></div><small>Stok: ${p.stock}</small></div><div class="detail-actions"><button class="btn btn-primary" data-action="add-cart-close" data-id="${escapeHtml(p.id)}" ${p.stock<1?'disabled':''}>${icon('bag')} Tambah ke keranjang</button></div><div class="detail-trust"><span>${icon('shield-check')} Stok diverifikasi</span><span>${icon('message-circle')} Konfirmasi admin</span></div></div></div></div>`;
    openModal(content, true);
  }
  function showCheckout() {
    const items = cartDetails();
    if (!items.length) return toast('Keranjang kosong','Tambahkan produk yang masih tersedia terlebih dahulu.','info');
    if (items.some(i => i.requestedQuantity > i.stock || i.stock < 1)) return toast('Periksa jumlah produk','Jumlah salah satu produk sudah melebihi stok.','error');
    const subtotal = items.reduce((n,i)=>n+i.price*i.requestedQuantity,0);
    const prefillName = state.user?.name || ''; const prefillPhone = '';
    const content = `<div class="modal-head"><div><h2>Checkout pesanan</h2><p>Lengkapi informasi untuk konfirmasi pesanan.</p></div><button class="icon-btn" data-modal-close type="button" aria-label="Tutup">${icon('x')}</button></div><div class="modal-body"><div class="checkout-layout"><form class="form-card" id="checkoutForm"><h2>Informasi penerima</h2><p class="form-subtitle">${state.user?'Pesanan akan terhubung ke akun kamu.':'Checkout tetap bisa dilakukan tanpa akun.'}</p><div class="form-grid"><div class="field span-2"><label for="checkoutName">Nama penerima *</label><input id="checkoutName" name="name" required minlength="2" maxlength="100" autocomplete="name" value="${escapeHtml(prefillName)}" placeholder="Nama lengkap"></div><div class="field span-2"><label for="checkoutPhone">Nomor WhatsApp *</label><input id="checkoutPhone" name="phone" required minlength="8" maxlength="35" autocomplete="tel" value="${escapeHtml(prefillPhone)}" placeholder="Contoh: 081234567890"><small>Nomor ini digunakan admin untuk menghubungi kamu terkait pesanan.</small></div><div class="field span-2"><label for="checkoutAddress">Alamat pengiriman *</label><textarea id="checkoutAddress" name="address" required minlength="8" maxlength="600" autocomplete="street-address" placeholder="Jalan, nomor rumah, kelurahan, kecamatan, kota, kode pos"></textarea></div><div class="field span-2"><label for="checkoutNote">Catatan pesanan (opsional)</label><textarea id="checkoutNote" name="note" maxlength="500" placeholder="Warna/varian atau catatan pengiriman"></textarea></div></div><div class="checkout-disclaimer">${icon('info')} Pesanan akan disimpan dengan status menunggu konfirmasi. Pembayaran dan ongkir belum diproses otomatis.</div><div class="checkout-info-note"><strong>Informasi pengiriman</strong><p>${escapeHtml(state.settings.shippingInfo || 'Detail pengiriman akan dikonfirmasi admin.')}</p><strong>Informasi pembayaran</strong><p>${escapeHtml(state.settings.paymentInfo || 'Metode pembayaran dikonfirmasi admin.')}</p></div><button class="btn btn-primary" type="submit" style="width:100%;margin-top:14px">Buat pesanan ${icon('arrow-up-right')}</button></form><aside class="checkout-review"><h3>Ringkasan pesanan</h3>${items.map(i=>`<div class="checkout-mini-item"><div class="checkout-mini-img">${safeUrl(i.image)?`<img src="${escapeHtml(safeUrl(i.image))}" alt="">`:icon('package')}</div><div class="checkout-mini-copy"><strong>${escapeHtml(i.name)}</strong><small>${i.requestedQuantity} × ${fmtPrice(i.price)}</small></div><strong>${fmtPrice(i.price*i.requestedQuantity)}</strong></div>`).join('')}<div class="summary-line"><span>Subtotal</span><strong>${fmtPrice(subtotal)}</strong></div><div class="summary-line"><span>Pengiriman</span><strong>Konfirmasi admin</strong></div><div class="summary-line total"><span>Total produk</span><strong>${fmtPrice(subtotal)}</strong></div></aside></div></div>`;
    openModal(content, true);
  }
  function renderCheckoutSuccess(result) {
    closeModal();
    const order = result.order; const token = result.guestToken || '';
    if (token) saveGuestOrder(order, token);
    state.cart = []; saveCart();
    const root = $('#cartRoot');
    if (state.page !== 'cart') { showPage('cart'); }
    root.innerHTML = `<div class="success-panel"><span class="success-check">${icon('check')}</span><span class="section-kicker">ORDER CREATED SUCCESSFULLY</span><h2>Pesanan kamu tersimpan.</h2><p>${escapeHtml(result.message || 'Pesanan berhasil disimpan dan menunggu konfirmasi admin.')}</p><div class="order-code">${escapeHtml(order.number)} <button class="text-button" type="button" data-action="copy" data-copy="${escapeHtml(order.number)}">Salin</button></div>${token?`<div class="token-note"><strong>Simpan kode akses ini.</strong><br>Kode ini dibutuhkan untuk melacak pesanan tamu. Simpan di perangkat yang aman: <br><button class="text-button" type="button" data-action="copy" data-copy="${escapeHtml(token)}">Salin kode akses</button><code class="token-preview">${escapeHtml(token)}</code></div>`:''}<div class="success-actions">${result.whatsappUrl?`<a class="btn btn-primary" href="${escapeHtml(result.whatsappUrl)}" target="_blank" rel="noopener">Lanjut konfirmasi WhatsApp ${icon('arrow-up-right')}</a>`:''}<a class="btn btn-outline" href="#orders">Lihat pesanan</a><a class="btn btn-outline" href="#shop">Kembali belanja</a></div><p style="margin-top:17px;font-size:9px">Status pembayaran tidak otomatis berubah saat WhatsApp dibuka. Tunggu konfirmasi dari admin.</p></div>`;
    toast('Pesanan berhasil disimpan', order.number);
  }
  async function submitCheckout(form) {
    const formData = new FormData(form); const button = $('button[type="submit"]', form); const previous = button.innerHTML;
    button.disabled = true; button.textContent = 'Menyimpan pesanan…';
    try {
      const data = await api('/api/orders', { method: 'POST', body: JSON.stringify({ name: formData.get('name'), phone: formData.get('phone'), address: formData.get('address'), note: formData.get('note'), items: state.cart }) });
      renderCheckoutSuccess(data);
    } catch (err) { toast('Checkout belum berhasil', err.message, 'error'); button.disabled = false; button.innerHTML = previous; }
  }
  function clearSidebar() { $('#sidebar').classList.remove('open'); $('#mobileScrim').classList.remove('show'); document.body.style.overflow = ''; }
  function closeSidebar() { clearSidebar(); }
  function openSidebar() { $('#sidebar').classList.add('open'); $('#mobileScrim').classList.add('show'); document.body.style.overflow = 'hidden'; }
  async function lookupOrder(number, accessToken) {
    const target = $('#orderLookupResult'); if (target) target.innerHTML = '<div class="skeleton-card" style="height:120px"></div>';
    try { const result = await api('/api/orders/lookup', { method: 'POST', body: JSON.stringify({ number, accessToken }) }); if (target) target.innerHTML = orderCard(result.order); }
    catch (err) { if (target) target.innerHTML = emptyBlock('info','Pesanan belum ditemukan',err.message,false); }
  }
  function navigateToShop(query = '', category = '') {
    state.query = query;
    if (category) state.category = category; else state.category = 'Semua kategori';
    window.location.hash = 'shop';
    showPage('shop'); renderShop();
  }
  document.addEventListener('click', async event => {
    const link = event.target.closest('a[href^="#"]');
    if (link) {
      const hash = link.getAttribute('href').slice(1);
      if (['home','shop','cart','orders','about'].includes(hash)) { event.preventDefault(); if (window.location.hash !== `#${hash}`) history.replaceState(null,'',`#${hash}`); showPage(hash); return; }
    }
    const category = event.target.closest('[data-category]');
    if (category) { state.category = category.dataset.category; navigateToShop('', state.category === 'Semua kategori' ? '' : state.category); return; }
    const productCardEl = event.target.closest('[data-product-card]');
    const actionEl = event.target.closest('[data-action]');
    if (actionEl) {
      const { action, id } = actionEl.dataset;
      if (action === 'add-cart') { addToCart(id); return; }
      if (action === 'add-cart-close') { const input=$('#detailQuantity'); const qty=input?Number(input.value):1; closeModal(); addToCart(id, qty); return; }
      if (action === 'detail') { showProductDetail(id); return; }
      if (action === 'save-favorite') { toast('Disimpan di daftar pilihan', 'Fitur daftar favorit akan tersambung ke akun pada pengembangan berikutnya.', 'info'); return; }
      if (action === 'checkout') { showCheckout(); return; }
      if (action === 'refresh-orders') { renderOrders(); return; }
      if (action === 'copy') { try { await navigator.clipboard.writeText(actionEl.dataset.copy || ''); toast('Tersalin','Nilai telah disalin ke clipboard.'); } catch { toast('Tidak bisa menyalin','Salin teks secara manual.','info'); } return; }
    }
    const detailQtyButton = event.target.closest('[data-detail-qty]');
    if (detailQtyButton) {
      const input = $('#detailQuantity'); const product = state.products.find(p => p.id === state.selectedProduct);
      if (!input || !product || product.stock < 1) return;
      let qty = Number(input.value) || 1; qty += detailQtyButton.dataset.detailQty === 'plus' ? 1 : -1;
      qty = Math.max(1, Math.min(product.stock, qty)); input.value = String(qty);
      return;
    }
    const cartActionEl = event.target.closest('[data-cart-action]');
    if (cartActionEl) { cartAction(cartActionEl.dataset.cartAction, cartActionEl.dataset.id); return; }
    const authSwitch = event.target.closest('[data-auth-switch]'); if (authSwitch) { showAuth(authSwitch.dataset.authSwitch); return; }
    const savedGuest = event.target.closest('[data-lookup-number]'); if (savedGuest) { $('#lookupNumber').value = savedGuest.dataset.lookupNumber; $('#lookupToken').value = savedGuest.dataset.lookupToken; lookupOrder(savedGuest.dataset.lookupNumber, savedGuest.dataset.lookupToken); return; }
    const clearChip = event.target.closest('[data-clear]'); if (clearChip) { const key = clearChip.dataset.clear; if (key==='query') state.query=''; if (key==='category') state.category='Semua kategori'; if (key==='stock') state.stockOnly=false; if (key==='featured') state.featuredOnly=false; renderShop(); return; }
  });
  $('#mainNav').addEventListener('click', event => { const link = event.target.closest('[data-page]'); if (!link) return; event.preventDefault(); const page=link.dataset.page; if (window.location.hash!==`#${page}`) history.replaceState(null,'',`#${page}`); showPage(page); });
  $('#globalSearchForm').addEventListener('submit', event => { event.preventDefault(); navigateToShop($('#globalSearch').value.trim()); });
  $('#globalSearch').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); navigateToShop(event.target.value.trim()); } });
  $('#shopSearch').addEventListener('input', event => { state.query = event.target.value.trim(); renderShop(); });
  $('#sortSelect').addEventListener('change', event => { state.sort = event.target.value; renderShop(); });
  $('#inStockOnly').addEventListener('change', event => { state.stockOnly = event.target.checked; renderShop(); });
  $('#featuredOnly').addEventListener('change', event => { state.featuredOnly = event.target.checked; renderShop(); });
  $('#clearFilters').addEventListener('click', () => { state.query=''; state.category='Semua kategori'; state.sort='newest'; state.stockOnly=false; state.featuredOnly=false; renderShop(); });
  $('#mobileFilterButton').addEventListener('click', () => { const filter = $('.filter-panel'); filter.classList.toggle('mobile-open'); toast(filter.classList.contains('mobile-open')?'Filter dibuka':'Filter ditutup','Atur pilihan katalog di panel filter.','info'); });
  $('#mobileMenu').addEventListener('click', openSidebar); $('#mobileScrim').addEventListener('click', closeSidebar);
  $('#topCartButton').addEventListener('click', () => { history.replaceState(null,'','#cart'); showPage('cart'); });
  $('#accountNav').addEventListener('click', () => state.user ? (state.user.role === 'admin' ? window.location.assign('/admin') : toast('Akun pelanggan',`Login sebagai ${state.user.email}. Riwayat bisa dilihat di menu Pesanan Saya.`,'info')) : showAuth('login'));
  $('#topAccountButton').addEventListener('click', () => state.user ? (state.user.role==='admin' ? window.location.assign('/admin') : toast('Kamu sudah login',state.user.email,'info')) : showAuth('login'));
  $('#profileAction').addEventListener('click', async () => {
    if (!state.user) return showAuth('login');
    try { await api('/api/auth/logout',{method:'POST'}); state.user=null; updateAccountUI(); if (state.page === 'orders') renderOrders(); toast('Berhasil keluar','Sesi akun sudah berakhir.'); }
    catch(err){toast('Gagal keluar',err.message,'error');}
  });
  $('#pageRoot').addEventListener('submit', event => {
    if (event.target.id === 'lookupOrderForm') {
      event.preventDefault(); const data = new FormData(event.target);
      lookupOrder(String(data.get('number') || '').trim().toUpperCase(), String(data.get('accessToken') || '').trim());
    }
  });
  $('#modalRoot').addEventListener('submit', async event => {
    if (event.target.id === 'authForm') {
      event.preventDefault(); const form=event.target; const data=new FormData(form); const mode=form.dataset.mode;
      const button=$('button[type="submit"]',form); const old=button.innerHTML; button.disabled=true; button.textContent='Memproses…';
      try { const result=await api(mode==='register'?'/api/auth/register':'/api/auth/login',{method:'POST',body:JSON.stringify({name:data.get('name'),email:data.get('email'),password:data.get('password')})}); state.user=result.user; updateAccountUI(); closeModal(); toast(mode==='register'?'Akun berhasil dibuat':'Login berhasil',`Halo, ${result.user.name}.`); if(state.page==='orders')renderOrders(); }
      catch(err){toast('Belum berhasil',err.message,'error');button.disabled=false;button.innerHTML=old;}
    }
    if (event.target.id === 'checkoutForm') { event.preventDefault(); if (event.target.reportValidity()) await submitCheckout(event.target); }
    if (event.target.id === 'lookupOrderForm') { event.preventDefault(); const data=new FormData(event.target); lookupOrder(String(data.get('number')||'').trim().toUpperCase(),String(data.get('accessToken')||'').trim()); }
  });
  $('#modalRoot').addEventListener('click', event => { if (event.target.closest('[data-modal-close]')) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key==='Escape') { closeModal(); closeSidebar(); } });
  window.addEventListener('hashchange', () => showPage((location.hash || '#home').slice(1)));
  async function boot() {
    state.cart=loadCart(); updateCartCount(); renderIcons();
    try {
      const [bootstrap, me] = await Promise.all([api('/api/bootstrap'), api('/api/auth/me')]);
      state.settings=bootstrap.settings||{}; state.products=bootstrap.products||[]; state.user=me.user||null;
      renderHome(); updateAccountUI(); renderShop(); renderContactLinks();
    } catch (err) {
      $('#featuredGrid').innerHTML = emptyBlock('info','Toko belum terhubung',err.message,false);
      $('#latestGrid').innerHTML = emptyBlock('info','Data belum bisa dimuat','Periksa apakah backend Next Shop sudah dijalankan.',false);
      toast('Server belum tersambung',err.message,'error');
    }
    showPage((location.hash || '#home').slice(1));
  }
  boot();
})();
