# Next Shop — Full-Stack E-commerce Starter

Next Shop adalah proyek baru toko online responsif dengan antarmuka berwarna navy, royal blue, indigo, cyan, turquoise, dan aksen amber. Frontend menggunakan HTML/CSS/JavaScript; backend memakai Node.js built-in modules agar mudah dijalankan di Termux tanpa `npm install`. Data katalog, akun, pengaturan, stok, dan pesanan disimpan dalam `data/store.json`.

## Fitur yang dibuat

- Beranda dengan banner ilustratif, kategori yang dihitung dari data, bagian produk unggulan, produk terbaru, dan panel promosi opsional.
- Katalog dengan pencarian, kategori, urut harga, filter stok dan unggulan, detail produk, validasi ketersediaan.
- Keranjang yang tersimpan di browser, penyesuaian jumlah, dan checkout tamu atau pelanggan.
- Checkout memeriksa ulang produk, harga, dan stok di backend; pesanan disimpan dengan nomor unik serta status `Menunggu konfirmasi`.
- Link konfirmasi WhatsApp dibentuk jika admin mengatur nomor WhatsApp. Membuka WhatsApp bukan bukti pembayaran atau bahwa admin telah menerima konfirmasi.
- Halaman Pesanan untuk pelanggan yang login dan pelacakan tamu memakai nomor pesanan + kode akses yang harus disimpan pelanggan.
- Registrasi publik selalu membuat akun pelanggan (`user`), bukan admin. Admin dibuat lewat perintah lokal setup.
- Dashboard Admin terpisah `/admin` dengan statistik dari data nyata, CRUD produk, foto produk (maksimal 2 MB), status pesanan, pengaturan toko, dan ganti password.
- Password menggunakan `scrypt` + salt; cookie sesi `HttpOnly` dan `SameSite=Lax`; login punya pembatasan percobaan sederhana.
- Layout responsif dengan menu mobile, transisi halus, dan dukungan `prefers-reduced-motion`.

## Menjalankan di Termux (Android)

1. Salin `Next_Shop.zip` ke folder Download Android.
2. Di Termux, jalankan:

   ```bash
   termux-setup-storage
   pkg update
   pkg install nodejs unzip -y
   unzip -o ~/storage/downloads/Next_Shop.zip -d ~
   cd ~/Next_Shop
   chmod +x start-termux.sh
   ```

   Jika diekstrak ke direktori lain, sesuaikan `cd`.

3. Buat akun admin pertama secara lokal:

   ```bash
   node setup-admin.js
   ```

   Isi nama, email, dan password unik minimal 12 karakter. Script menyimpan hash password, bukan teks password. Jalankan sekali untuk database baru. Jangan menjalankan setup bersamaan dengan server.

4. Jalankan server:

   ```bash
   ./start-termux.sh
   ```

5. Buka Chrome pada HP yang sama:
   - Toko: `http://127.0.0.1:8090`
   - Admin: `http://127.0.0.1:8090/admin`

6. Login admin, buka `Pengaturan toko` untuk mengisi identitas, banner, WhatsApp, kontak, informasi pengiriman, pembayaran, dan Tentang Kami. Buka menu `Produk` untuk menambahkan katalog nyata.

Untuk menghentikan server, kembali ke Termux dan tekan `Ctrl+C`. Agar bisa digunakan lagi, buka folder proyek dan jalankan `./start-termux.sh`. Sesi aktif berakhir ketika server dimulai ulang; login kembali jika diperlukan.

## Menjalankan di komputer

Gunakan Node.js 18 atau baru. Buat admin dengan `node setup-admin.js`, lalu jalankan `npm start`. Jika lupa password, hentikan server dan gunakan `node reset-admin.js` di mesin yang sama. Dependensi npm tidak diperlukan. Pemeriksaan sintaks kode:

```bash
npm run check
```

## Struktur proyek

```text
Next_Shop/
├── server.js              # API, sesi, autentikasi, otorisasi, stok, checkout
├── setup-admin.js         # Setup admin awal melalui terminal
├── reset-admin.js         # Reset password admin dari terminal lokal
├── package.json
├── .env.example
├── .gitignore
├── start-termux.sh
├── data/
│   └── store.json         # Data nyata (tidak di-commit ke Git)
└── public/
    ├── index.html         # Website pelanggan
    ├── admin.html         # Dashboard admin
    ├── css/styles.css
    ├── css/admin.css
    ├── js/app.js
    ├── js/admin.js
    ├── assets/next-shop-mark.svg
    └── uploads/            # Upload gambar dari panel admin
```

## Keamanan dan deployment publik

- Jangan pernah mengunggah `.env`, `data/store.json`, password, token akses pesanan tamu, atau data pelanggan ke repositori publik.
- Pada hosting, atur `NODE_ENV=production`, `PORT` sesuai variabel yang disediakan host, serta `SESSION_SECRET` acak minimal 32 karakter di pengaturan environment. Gunakan HTTPS agar cookie `Secure` aktif.
- Pembuatan admin pertama di hosting dapat dilakukan melalui variabel lingkungan `ADMIN_EMAIL` dan `ADMIN_PASSWORD` jika database belum memiliki admin. Password harus minimal 12 karakter. Setelah server berhasil membuat admin, hapus kedua variabel bootstrap dari konfigurasi host. Alternatifnya, jalankan `node setup-admin.js` melalui shell server yang memiliki akses lokal.
- `data/store.json` dan `public/uploads` perlu penyimpanan persisten dan backup. Filesystem ephemeral pada hosting gratis dapat menghapus data setelah redeploy/restart. Pastikan paket host mendukung persistent disk, atau migrasikan data ke database terkelola (mis. PostgreSQL) dan object storage untuk unggahan sebelum menerima pesanan sungguhan.
- Untuk akses publik berkelanjutan dari satu HP, Termux harus tetap berjalan dan perangkat harus online. Hosting Node.js lebih sesuai untuk situs publik.
- Checkout saat ini mencatat pesanan dan mengarahkan pelanggan untuk konfirmasi manual melalui WhatsApp. Tidak ada payment gateway, pemeriksaan transfer otomatis, perhitungan ongkir final, email transaksional, atau integrasi kurir otomatis.
- Ini adalah fondasi full-stack yang dapat dikembangkan, bukan sertifikasi keamanan atau jaminan kesiapan produksi skala besar. Sebelum transaksi publik, uji backup/restore, perpindahan status pesanan, konfigurasi HTTPS, persistent storage, log, dan kebijakan privasi.
