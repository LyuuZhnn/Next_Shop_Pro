'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const readline = require('node:readline');
const base = __dirname;
const dataDir = path.join(base, 'data');
const file = path.join(dataDir, 'store.json');
const defaultSettings = {
  storeName: 'Next Shop', tagline: 'Temukan yang kamu suka.', description: 'Pilihan produk terbaik, pengalaman belanja yang lebih nyaman.',
  heroEyebrow: 'YOUR NEXT FAVORITE THING', heroTitle: 'Belanja lebih mudah.\nTemukan lebih banyak.',
  heroText: 'Jelajahi koleksi pilihan dan temukan produk yang cocok buat kamu.', heroCta: 'Jelajahi koleksi', heroImage: '', logoImage: '',
  promoEnabled: false, promoLabel: 'SPECIAL DROP', promoTitle: 'Temukan pilihan spesial minggu ini', promoText: 'Atur pesan promosi dari dashboard admin.',
  whatsapp: '', email: '', address: '', instagram: '', tiktok: '', shippingInfo: 'Informasi pengiriman dikonfirmasi oleh admin setelah pesanan diterima.',
  paymentInfo: 'Metode pembayaran dikonfirmasi oleh admin. Website ini belum memproses pembayaran otomatis.',
  aboutTitle: 'Belanja dengan cara yang lebih baik', aboutText: 'Next Shop hadir untuk membuat pengalaman menemukan dan memesan produk menjadi lebih jelas, nyaman, dan mudah.',
  vision: 'Menghadirkan pengalaman belanja online yang sederhana, aman, dan menyenangkan.',
  mission: 'Memberikan informasi produk yang jelas, layanan yang responsif, dan proses pemesanan yang transparan.', developer: '',
  categories: ['Elektronik', 'Fashion', 'Aksesori', 'Rumah & Gaya Hidup']
};
function ask(question, hidden = false) {
  return new Promise(resolve => {
    if (!hidden || process.platform === 'win32') {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
      return;
    }
    process.stdout.write(question);
    const stdin = process.stdin; let answer = '';
    const wasRaw = stdin.isRaw;
    if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
      const rl = readline.createInterface({ input: stdin, output: process.stdout });
      rl.question(question, value => { rl.close(); resolve(value); });
      return;
    }
    stdin.setRawMode(true); stdin.resume();
    const onData = chunk => {
      const str = chunk.toString('utf8');
      const enterAt = str.search(/[\r\n]/);
      const usable = enterAt >= 0 ? str.slice(0, enterAt) : str;
      for (const char of usable) {
        if (char === '\u0003') process.exit(130);
        else if (char === '\u007f' || char === '\b') answer = answer.slice(0, -1);
        else if (char >= ' ') answer += char;
      }
      if (enterAt >= 0) {
        stdin.setRawMode(wasRaw || false); stdin.pause(); stdin.removeListener('data', onData); process.stdout.write('\n'); resolve(answer);
      }
    };
    stdin.on('data', onData);
  });
}
function main() {
  fs.mkdirSync(dataDir, { recursive: true });
  let store;
  if (fs.existsSync(file)) store = JSON.parse(fs.readFileSync(file, 'utf8'));
  else store = { schemaVersion: 1, users: [], products: [], orders: [], settings: defaultSettings };
  store.users ||= []; store.products ||= []; store.orders ||= []; store.settings = { ...defaultSettings, ...(store.settings || {}) };
  if (store.users.some(user => user.role === 'admin')) {
    console.error('Akun admin sudah ada. Demi keamanan, setup-admin.js tidak membuat akun admin kedua.');
    console.error('Login lewat /admin. Jika lupa password, pulihkan melalui prosedur reset yang aman atau backup server.');
    process.exitCode = 1; return;
  }
  console.log('\n=== Setup akun admin Next Shop ===');
  console.log('Buat password unik minimal 12 karakter. Jangan gunakan password akun lain.\n');
  (async () => {
    const name = (await ask('Nama admin: ')).slice(0, 80) || 'Administrator';
    const email = (await ask('Email admin: ')).trim().toLowerCase();
    const password = await ask('Password admin (input tersembunyi bila terminal mendukung): ', true);
    const confirm = await ask('Ulangi password: ', true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Format email tidak valid.');
    if (password.length < 12 || password.length > 200) throw new Error('Password harus 12–200 karakter.');
    if (password !== confirm) throw new Error('Password tidak sama.');
    if (store.users.some(user => user.email === email)) throw new Error('Email sudah digunakan akun lain.');
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
    store.users.push({ id: crypto.randomUUID(), name, email, role: 'admin', passwordSalt: salt, passwordHash, createdAt: new Date().toISOString() });
    const temp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(store, null, 2), { mode: 0o600 });
    fs.renameSync(temp, file);
    console.log('\n✅ Akun admin berhasil dibuat.');
    console.log(`Email: ${email}`);
    console.log('Password tidak ditampilkan atau disimpan dalam bentuk teks biasa. Simpan password di tempat aman.');
    console.log('Jalankan server dengan: npm start\n');
  })().catch(err => { console.error('\n❌ ' + err.message); process.exitCode = 1; });
}
main();
