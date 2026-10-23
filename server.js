'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const UPLOAD_DIR = path.join(PUBLIC, 'uploads');

loadEnv(path.join(ROOT, '.env'));
const PORT = Number(process.env.PORT || 8090);
const IS_PROD = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(48).toString('hex');

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index < 1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}

function defaultStore() {
  return {
    schemaVersion: 1,
    users: [],
    products: [],
    orders: [],
    settings: {
      storeName: 'Next Shop',
      tagline: 'Temukan yang kamu suka.',
      description: 'Pilihan produk terbaik, pengalaman belanja yang lebih nyaman.',
      heroEyebrow: 'YOUR NEXT FAVORITE THING',
      heroTitle: 'Belanja lebih mudah.\nTemukan lebih banyak.',
      heroText: 'Jelajahi koleksi pilihan dan temukan produk yang cocok buat kamu.',
      heroCta: 'Jelajahi koleksi',
      heroImage: '',
      logoImage: '',
      promoEnabled: false,
      promoLabel: 'SPECIAL DROP',
      promoTitle: 'Temukan pilihan spesial minggu ini',
      promoText: 'Atur pesan promosi dari dashboard admin.',
      whatsapp: '',
      email: '',
      address: '',
      instagram: '',
      tiktok: '',
      shippingInfo: 'Informasi pengiriman dikonfirmasi oleh admin setelah pesanan diterima.',
      paymentInfo: 'Metode pembayaran dikonfirmasi oleh admin. Website ini belum memproses pembayaran otomatis.',
      aboutTitle: 'Belanja dengan cara yang lebih baik',
      aboutText: 'Next Shop hadir untuk membuat pengalaman menemukan dan memesan produk menjadi lebih jelas, nyaman, dan mudah.',
      vision: 'Menghadirkan pengalaman belanja online yang sederhana, aman, dan menyenangkan.',
      mission: 'Memberikan informasi produk yang jelas, layanan yang responsif, dan proses pemesanan yang transparan.',
      developer: '',
      categories: ['Elektronik', 'Fashion', 'Aksesori', 'Rumah & Gaya Hidup']
    }
  };
}

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) writeStore(defaultStore());
}
function readStore() {
  ensureData();
  try {
    const value = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    return { ...defaultStore(), ...value, settings: { ...defaultStore().settings, ...(value.settings || {}) } };
  } catch (err) {
    console.error('Database JSON tidak dapat dibaca:', err.message);
    throw new Error('Data toko tidak dapat dibaca. Pulihkan data/store.json dari backup.');
  }
}
function writeStore(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temp = `${DB_FILE}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(temp, DB_FILE);
}
ensureData();

function bootstrapAdminFromEnvironment() {
  const email = cleanText(process.env.ADMIN_EMAIL, 190).toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!email && !password) return;
  if (!email || !password) {
    console.error('ADMIN_EMAIL dan ADMIN_PASSWORD harus diatur bersama-sama.');
    process.exit(1);
  }
  if (!isEmail(email) || password.length < 12 || password.length > 200) {
    console.error('Kredensial bootstrap admin tidak valid: email harus benar dan password 12–200 karakter.');
    process.exit(1);
  }
  const store = readStore();
  if (store.users.some(user => user.role === 'admin')) return;
  if (store.users.some(user => user.email === email)) {
    console.error('Email bootstrap sudah digunakan oleh akun lain. Pilih email admin yang berbeda.');
    process.exit(1);
  }
  const secret = hashPassword(password);
  store.users.push({ id: crypto.randomUUID(), name: 'Administrator', email, role: 'admin', passwordSalt: secret.salt, passwordHash: secret.hash, createdAt: new Date().toISOString() });
  writeStore(store);
  console.log(`✅ Akun admin awal dibuat untuk ${email} dari variabel lingkungan.`);
  console.log('🔐 Hapus ADMIN_EMAIL dan ADMIN_PASSWORD dari environment setelah inisialisasi berhasil.');
}
bootstrapAdminFromEnvironment();

const sessions = new Map();
const rateMap = new Map();
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json; charset=utf-8'
};
const STATUS_OPTIONS = ['Menunggu konfirmasi', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cache-Control': 'no-store', ...headers
  });
  res.end(payload);
}
function ok(res, data = {}, headers = {}) { send(res, 200, { ok: true, ...data }, headers); }
function fail(res, status, message) { send(res, status, { ok: false, error: message }); }
function cookies(req) {
  const result = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) result[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return result;
}
function signSession(token) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(token).digest('hex');
}
function makeSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 });
  const value = `${token}.${signSession(token)}`;
  return `ns_session=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${IS_PROD ? '; Secure' : ''}`;
}
function getSession(req, store) {
  const raw = cookies(req).ns_session;
  if (!raw || !raw.includes('.')) return null;
  const [token, signature] = raw.split('.');
  const expected = signSession(token);
  const a = Buffer.from(signature || ''); const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) { sessions.delete(token); return null; }
  const user = store.users.find((u) => u.id === session.userId);
  if (!user) return null;
  return { token, user };
}
function publicUser(user) { return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }; }
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}
function verifyPassword(password, user) {
  const result = crypto.scryptSync(password, user.passwordSalt, 64);
  const saved = Buffer.from(user.passwordHash, 'hex');
  return saved.length === result.length && crypto.timingSafeEqual(saved, result);
}
function randomToken(bytes = 24) { return crypto.randomBytes(bytes).toString('hex'); }
function cleanText(value, max = 500) { return String(value == null ? '' : value).trim().slice(0, max); }
function isEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 190; }
function validPrice(value) { const n = Number(value); return Number.isSafeInteger(n) && n >= 0 && n <= 1_000_000_000_000; }
function slugOrId(value) { return String(value || '').trim(); }
function safeUserProduct(p) {
  return { id: p.id, name: p.name, price: p.price, category: p.category, description: p.description, image: p.image,
    stock: p.stock, featured: !!p.featured, active: p.active !== false, createdAt: p.createdAt, updatedAt: p.updatedAt };
}
function safeSettings(settings) { return { ...settings }; }
function publicOrder(order) {
  return { id: order.id, number: order.number, items: order.items, total: order.total, status: order.status, createdAt: order.createdAt,
    customerName: order.customerName, shippingAddress: order.shippingAddress, note: order.note, paymentInfo: order.paymentInfo };
}
async function bodyJson(req, limit = 3 * 1024 * 1024) {
  const chunks = []; let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > limit) throw Object.assign(new Error('Data terlalu besar.'), { status: 413 });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Format JSON tidak valid.'), { status: 400 }); }
}
function rateLimited(req, key, max = 12, windowMs = 10 * 60 * 1000) {
  const ip = req.socket.remoteAddress || 'unknown';
  const mapKey = `${key}:${ip}`; const now = Date.now();
  const saved = rateMap.get(mapKey);
  if (!saved || saved.until < now) { rateMap.set(mapKey, { count: 1, until: now + windowMs }); return false; }
  saved.count += 1;
  return saved.count > max;
}
function requireUser(req, store) {
  const session = getSession(req, store);
  return session ? session.user : null;
}
function requireAdmin(req, store) {
  const user = requireUser(req, store);
  return user && user.role === 'admin' ? user : null;
}
function safeRelativeStatic(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath); } catch { return null; }
  if (decoded.includes('\0') || decoded.includes('\\')) return null;
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const resolved = path.resolve(PUBLIC, relative);
  if (resolved !== PUBLIC && !resolved.startsWith(PUBLIC + path.sep)) return null;
  return resolved;
}
function imageUrlAllowed(value) {
  if (!value) return true;
  if (/^\/uploads\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp|gif)$/i.test(value)) return true;
  return /^https:\/\//i.test(value);
}
function makeOrderNumber() {
  const date = new Date();
  const stamp = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('');
  return `NS-${stamp}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}
function cleanSettings(body, previous) {
  const fields = ['storeName','tagline','description','heroEyebrow','heroTitle','heroText','heroCta','heroImage','logoImage','promoLabel','promoTitle','promoText','whatsapp','email','address','instagram','tiktok','shippingInfo','paymentInfo','aboutTitle','aboutText','vision','mission','developer'];
  const longFields = new Set(['description','heroText','promoText','address','shippingInfo','paymentInfo','aboutText','vision','mission']);
  const out = { ...previous };
  for (const field of fields) if (field in body) out[field] = cleanText(body[field], longFields.has(field) ? 2000 : 260);
  if ('promoEnabled' in body) out.promoEnabled = Boolean(body.promoEnabled);
  if ('categories' in body && Array.isArray(body.categories)) out.categories = [...new Set(body.categories.map(v => cleanText(v, 50)).filter(Boolean))].slice(0, 40);
  if ('heroImage' in body && !imageUrlAllowed(out.heroImage)) throw Object.assign(new Error('Gambar banner harus berupa URL HTTPS atau file unggahan /uploads yang valid.'), { status: 400 });
  if ('logoImage' in body && !imageUrlAllowed(out.logoImage)) throw Object.assign(new Error('Logo harus berupa URL HTTPS atau file unggahan /uploads yang valid.'), { status: 400 });
  if (out.whatsapp && !/^[+\d][\d\s()-]{7,24}$/.test(out.whatsapp)) throw Object.assign(new Error('Nomor WhatsApp tidak valid.'), { status: 400 });
  if (out.email && !isEmail(out.email)) throw Object.assign(new Error('Email toko tidak valid.'), { status: 400 });
  return out;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;
    const method = req.method || 'GET';
    if (pathname.startsWith('/api/')) {
      let store = readStore();

      if (method === 'GET' && pathname === '/api/health') return ok(res, { status: 'up', app: 'Next Shop', time: new Date().toISOString() });
      if (method === 'GET' && pathname === '/api/bootstrap') {
        const products = store.products.filter(p => p.active !== false).map(safeUserProduct);
        return ok(res, { settings: safeSettings(store.settings), products, categories: [...new Set([...store.settings.categories, ...products.map(p => p.category)].filter(Boolean))] });
      }
      if (method === 'GET' && pathname === '/api/auth/me') {
        const user = requireUser(req, store);
        return ok(res, { user: user ? publicUser(user) : null });
      }
      if (method === 'POST' && pathname === '/api/auth/register') {
        if (rateLimited(req, 'register', 6)) return fail(res, 429, 'Terlalu banyak percobaan. Coba lagi nanti.');
        const body = await bodyJson(req, 16 * 1024);
        store = readStore();
        const name = cleanText(body.name, 80); const email = cleanText(body.email, 190).toLowerCase(); const password = String(body.password || '');
        if (name.length < 2) return fail(res, 400, 'Nama minimal 2 karakter.');
        if (!isEmail(email)) return fail(res, 400, 'Format email belum benar.');
        if (password.length < 10 || password.length > 200) return fail(res, 400, 'Password harus berisi 10–200 karakter.');
        if (store.users.some(u => u.email === email)) return fail(res, 409, 'Email sudah terdaftar. Silakan login.');
        const secret = hashPassword(password);
        const user = { id: crypto.randomUUID(), name, email, role: 'user', ...{ passwordSalt: secret.salt, passwordHash: secret.hash }, createdAt: new Date().toISOString() };
        store.users.push(user); writeStore(store);
        return ok(res, { user: publicUser(user) }, { 'Set-Cookie': makeSession(user) });
      }
      if (method === 'POST' && pathname === '/api/auth/login') {
        if (rateLimited(req, 'login', 12)) return fail(res, 429, 'Terlalu banyak percobaan login. Coba lagi nanti.');
        const body = await bodyJson(req, 16 * 1024);
        store = readStore();
        const email = cleanText(body.email, 190).toLowerCase(); const password = String(body.password || '');
        const user = store.users.find(u => u.email === email);
        if (!user || !verifyPassword(password, user)) return fail(res, 401, 'Email atau password tidak cocok.');
        return ok(res, { user: publicUser(user) }, { 'Set-Cookie': makeSession(user) });
      }
      if (method === 'POST' && pathname === '/api/auth/logout') {
        const raw = cookies(req).ns_session;
        if (raw && raw.includes('.')) sessions.delete(raw.split('.')[0]);
        return ok(res, {}, { 'Set-Cookie': `ns_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${IS_PROD ? '; Secure' : ''}` });
      }

      if (method === 'GET' && pathname === '/api/orders') {
        const user = requireUser(req, store);
        if (!user) return fail(res, 401, 'Login dibutuhkan untuk melihat riwayat akun. Pesanan tamu bisa dilacak dengan kode akses.');
        const orders = store.orders.filter(o => o.userId === user.id).sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(publicOrder);
        return ok(res, { orders });
      }
      if (method === 'POST' && pathname === '/api/orders/lookup') {
        const body = await bodyJson(req, 16 * 1024);
        store = readStore();
        const number = cleanText(body.number, 80).toUpperCase(); const accessToken = cleanText(body.accessToken, 120);
        const order = store.orders.find(o => {
          if (o.number !== number || !o.guestToken) return false;
          const a = Buffer.from(o.guestToken); const b = Buffer.from(accessToken);
          return a.length === b.length && crypto.timingSafeEqual(a, b);
        });
        if (!order) return fail(res, 404, 'Pesanan tidak ditemukan. Periksa nomor pesanan dan kode akses.');
        return ok(res, { order: publicOrder(order) });
      }
      if (method === 'POST' && pathname === '/api/orders') {
        if (rateLimited(req, 'checkout', 30, 60 * 60 * 1000)) return fail(res, 429, 'Terlalu banyak pesanan dari perangkat ini.');
        const body = await bodyJson(req, 64 * 1024);
        store = readStore();
        const customerName = cleanText(body.name, 100); const phone = cleanText(body.phone, 35); const address = cleanText(body.address, 600); const note = cleanText(body.note, 500);
        if (customerName.length < 2) return fail(res, 400, 'Nama penerima wajib diisi.');
        if (!/^[+\d][\d\s().-]{7,30}$/.test(phone)) return fail(res, 400, 'Nomor WhatsApp tidak valid.');
        if (address.length < 8) return fail(res, 400, 'Alamat pengiriman perlu diisi dengan lengkap.');
        if (!Array.isArray(body.items) || !body.items.length || body.items.length > 40) return fail(res, 400, 'Keranjang kosong atau jumlah jenis barang terlalu banyak.');
        const combined = new Map();
        for (const input of body.items) {
          const id = String(input.id || ''); const quantity = Number(input.quantity);
          if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return fail(res, 400, 'Jumlah barang tidak valid.');
          combined.set(id, (combined.get(id) || 0) + quantity);
        }
        if ([...combined.values()].some(q => q > 99)) return fail(res, 400, 'Jumlah barang per produk maksimal 99.');
        const cartItems = [];
        let total = 0;
        for (const [id, quantity] of combined.entries()) {
          const product = store.products.find(p => p.id === id && p.active !== false);
          if (!product) return fail(res, 400, 'Ada produk yang sudah tidak tersedia. Periksa keranjang kamu.');
          if (product.stock < quantity) return fail(res, 409, `Stok ${product.name} tidak mencukupi. Stok saat ini: ${product.stock}.`);
          const lineTotal = product.price * quantity;
          total += lineTotal;
          cartItems.push({ productId: product.id, name: product.name, image: product.image || '', price: product.price, quantity, subtotal: lineTotal });
        }
        const sessionUser = requireUser(req, store);
        for (const item of cartItems) {
          const product = store.products.find(p => p.id === item.productId);
          product.stock -= item.quantity; product.updatedAt = new Date().toISOString();
        }
        const guestToken = sessionUser ? '' : randomToken(24);
        const order = {
          id: crypto.randomUUID(), number: makeOrderNumber(), userId: sessionUser ? sessionUser.id : null,
          guestToken, customerName, phone, shippingAddress: address, note, items: cartItems, total,
          status: 'Menunggu konfirmasi', paymentInfo: store.settings.paymentInfo,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        store.orders.push(order); writeStore(store);
        const waNumber = String(store.settings.whatsapp || '').replace(/\D/g, '');
        const whatsappText = `Halo ${store.settings.storeName || 'Next Shop'}, saya ingin mengonfirmasi pesanan ${order.number}.\n\n${cartItems.map(i => `• ${i.name} × ${i.quantity} — Rp${i.subtotal.toLocaleString('id-ID')}`).join('\n')}\n\nTotal: Rp${total.toLocaleString('id-ID')}\nNama: ${customerName}\nAlamat: ${address}\nCatatan: ${note || '-'}\n\nMohon konfirmasi ketersediaan dan pembayaran.`;
        return ok(res, { order: { ...publicOrder(order), guestToken: guestToken || undefined }, guestToken: guestToken || undefined,
          whatsappUrl: waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(whatsappText)}` : '', message: 'Pesanan tersimpan. Status menunggu konfirmasi admin.' });
      }

      if (pathname.startsWith('/api/admin/')) {
        const admin = requireAdmin(req, store);
        if (!admin) return fail(res, 403, 'Akses admin diperlukan. Silakan login menggunakan akun admin.');
      }
      if (method === 'GET' && pathname === '/api/admin/stats') {
        const completed = store.orders.filter(o => o.status === 'Selesai');
        return ok(res, { stats: { products: store.products.length, activeProducts: store.products.filter(p => p.active !== false).length,
          orders: store.orders.length, pending: store.orders.filter(o => ['Menunggu konfirmasi','Diproses'].includes(o.status)).length,
          revenue: completed.reduce((s, o) => s + o.total, 0) }, settings: safeSettings(store.settings) });
      }
      if (method === 'GET' && pathname === '/api/admin/products') return ok(res, { products: store.products.map(safeUserProduct) });
      if (method === 'POST' && pathname === '/api/admin/products') {
        const body = await bodyJson(req, 32 * 1024);
        store = readStore();
        const name = cleanText(body.name, 140); const category = cleanText(body.category, 70);
        const price = Number(body.price); const stock = Number(body.stock);
        if (name.length < 2) return fail(res, 400, 'Nama produk minimal 2 karakter.');
        if (!category) return fail(res, 400, 'Kategori wajib diisi.');
        if (!validPrice(price)) return fail(res, 400, 'Harga produk tidak valid.');
        if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) return fail(res, 400, 'Stok harus berupa bilangan bulat 0 atau lebih.');
        const image = cleanText(body.image, 600);
        if (!imageUrlAllowed(image)) return fail(res, 400, 'Foto harus menggunakan URL HTTPS atau file unggahan yang valid.');
        const now = new Date().toISOString();
        const product = { id: crypto.randomUUID(), name, category, price, stock, description: cleanText(body.description, 3000), image,
          featured: !!body.featured, active: body.active !== false, createdAt: now, updatedAt: now };
        store.products.unshift(product);
        if (!store.settings.categories.includes(category)) store.settings.categories.push(category);
        writeStore(store);
        return ok(res, { product: safeUserProduct(product) });
      }
      const productMatch = pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
      if (productMatch && method === 'PATCH') {
        const id = decodeURIComponent(productMatch[1]);
        const body = await bodyJson(req, 32 * 1024);
        store = readStore();
        const product = store.products.find(p => p.id === id);
        if (!product) return fail(res, 404, 'Produk tidak ditemukan.');
        if ('name' in body) { const v = cleanText(body.name, 140); if (v.length < 2) return fail(res, 400, 'Nama produk minimal 2 karakter.'); product.name = v; }
        if ('category' in body) { const v = cleanText(body.category, 70); if (!v) return fail(res, 400, 'Kategori wajib diisi.'); product.category = v; if (!store.settings.categories.includes(v)) store.settings.categories.push(v); }
        if ('price' in body) { if (!validPrice(body.price)) return fail(res, 400, 'Harga produk tidak valid.'); product.price = Number(body.price); }
        if ('stock' in body) { const v = Number(body.stock); if (!Number.isInteger(v) || v < 0 || v > 1_000_000) return fail(res, 400, 'Stok tidak valid.'); product.stock = v; }
        if ('description' in body) product.description = cleanText(body.description, 3000);
        if ('image' in body) { const v = cleanText(body.image, 600); if (!imageUrlAllowed(v)) return fail(res, 400, 'Foto harus menggunakan URL HTTPS atau file unggahan yang valid.'); product.image = v; }
        if ('featured' in body) product.featured = !!body.featured;
        if ('active' in body) product.active = !!body.active;
        product.updatedAt = new Date().toISOString(); writeStore(store);
        return ok(res, { product: safeUserProduct(product) });
      }
      if (productMatch && method === 'DELETE') {
        const id = decodeURIComponent(productMatch[1]); const product = store.products.find(p => p.id === id);
        if (!product) return fail(res, 404, 'Produk tidak ditemukan.');
        if (store.orders.some(o => o.items.some(i => i.productId === id))) { product.active = false; product.updatedAt = new Date().toISOString(); }
        else store.products = store.products.filter(p => p.id !== id);
        writeStore(store); return ok(res, { message: product.active === false ? 'Produk dinonaktifkan karena sudah terkait dengan pesanan.' : 'Produk dihapus.' });
      }
      if (method === 'GET' && pathname === '/api/admin/orders') return ok(res, { orders: store.orders.slice().sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(o => ({ ...publicOrder(o), phone: o.phone, email: store.users.find(u => u.id === o.userId)?.email || '', hasAccount: !!o.userId })) });
      const orderMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
      if (orderMatch && method === 'PATCH') {
        const id = decodeURIComponent(orderMatch[1]);
        const body = await bodyJson(req, 16 * 1024); const status = cleanText(body.status, 50);
        store = readStore();
        const order = store.orders.find(o => o.id === id);
        if (!order) return fail(res, 404, 'Pesanan tidak ditemukan.');
        if (!STATUS_OPTIONS.includes(status)) return fail(res, 400, 'Status pesanan tidak dikenali.');
        if (order.status === 'Selesai' || order.status === 'Dibatalkan') return fail(res, 409, 'Pesanan final tidak dapat diubah lagi dari panel ini.');
        if (status === 'Dibatalkan' && order.status === 'Dikirim') return fail(res, 409, 'Pesanan yang sudah dikirim tidak dapat dibatalkan dari panel ini.');
        if (status === 'Dibatalkan') {
          for (const item of order.items) { const p = store.products.find(x => x.id === item.productId); if (p) p.stock += item.quantity; }
        }
        order.status = status; order.updatedAt = new Date().toISOString(); writeStore(store);
        return ok(res, { order: publicOrder(order) });
      }
      if (method === 'GET' && pathname === '/api/admin/settings') return ok(res, { settings: safeSettings(store.settings) });
      if (method === 'PUT' && pathname === '/api/admin/settings') {
        const body = await bodyJson(req, 64 * 1024);
        store = readStore();
        try { store.settings = cleanSettings(body, store.settings); }
        catch (err) { return fail(res, err.status || 400, err.message); }
        writeStore(store); return ok(res, { settings: safeSettings(store.settings) });
      }
      if (method === 'POST' && pathname === '/api/admin/upload') {
        const body = await bodyJson(req, 3 * 1024 * 1024);
        store = readStore();
        const dataUrl = String(body.dataUrl || '');
        const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=]+)$/);
        if (!match) return fail(res, 400, 'File harus berupa JPG, PNG, WEBP, atau GIF.');
        const buffer = Buffer.from(match[2], 'base64');
        if (!buffer.length || buffer.length > 2 * 1024 * 1024) return fail(res, 413, 'Ukuran gambar maksimal 2 MB.');
        const format = match[1] === 'jpeg' ? 'jpg' : match[1];
        const isPng = format === 'png' && buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
        const isJpg = format === 'jpg' && buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
        const isGif = format === 'gif' && buffer.length >= 6 && ['GIF87a','GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'));
        const isWebp = format === 'webp' && buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
        if (!(isPng || isJpg || isGif || isWebp)) return fail(res, 400, 'Isi file tidak sesuai dengan format gambar yang diizinkan.');
        const ext = format;
        const name = `${Date.now()}-${randomToken(8)}.${ext}`;
        fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer, { flag: 'wx', mode: 0o644 });
        return ok(res, { url: `/uploads/${name}` });
      }
      if (method === 'POST' && pathname === '/api/admin/change-password') {
        const body = await bodyJson(req, 16 * 1024);
        store = readStore();
        const admin = requireAdmin(req, store);
        if (!admin) return fail(res, 403, 'Sesi admin berakhir. Silakan login ulang.');
        const current = String(body.currentPassword || ''); const next = String(body.newPassword || '');
        if (!verifyPassword(current, admin)) return fail(res, 401, 'Password saat ini tidak cocok.');
        if (next.length < 12 || next.length > 200) return fail(res, 400, 'Password baru harus 12–200 karakter.');
        const secret = hashPassword(next); admin.passwordSalt = secret.salt; admin.passwordHash = secret.hash;
        writeStore(store);
        for (const [token, session] of sessions.entries()) if (session.userId === admin.id) sessions.delete(token);
        return ok(res, { message: 'Password berhasil diubah. Silakan login kembali.' }, { 'Set-Cookie': `ns_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${IS_PROD ? '; Secure' : ''}` });
      }
      return fail(res, 404, 'Endpoint tidak ditemukan.');
    }

    if (method !== 'GET' && method !== 'HEAD') return fail(res, 405, 'Metode tidak diizinkan.');
    const staticPath = pathname === '/admin' ? '/admin.html' : pathname;
    const file = safeRelativeStatic(staticPath);
    if (!file) return fail(res, 400, 'Path tidak valid.');
    let stat;
    try { stat = fs.statSync(file); } catch { return fail(res, 404, 'Halaman atau file tidak ditemukan.'); }
    if (!stat.isFile()) return fail(res, 404, 'Halaman atau file tidak ditemukan.');
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Cache-Control': ['.html','.css','.js'].includes(ext) ? 'no-cache' : 'public, max-age=3600',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' https://wa.me"
    });
    if (method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) fail(res, err.status || 500, err.status && err.status < 500 ? err.message : 'Terjadi kesalahan server. Coba lagi.');
    else res.destroy();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✨ ${readStore().settings.storeName || 'Next Shop'} aktif di http://127.0.0.1:${PORT}`);
  console.log(`🛍️  Toko : http://127.0.0.1:${PORT}/`);
  console.log(`🛡️  Admin: http://127.0.0.1:${PORT}/admin`);
  const store = readStore();
  if (!store.users.some(u => u.role === 'admin')) console.log('ℹ️  Belum ada admin. Hentikan server setelah ini lalu jalankan: node setup-admin.js');
  if (IS_PROD && !process.env.SESSION_SECRET) console.warn('⚠️ SESSION_SECRET belum diatur di environment produksi. Atur rahasia yang panjang sebelum digunakan publik.');
});
