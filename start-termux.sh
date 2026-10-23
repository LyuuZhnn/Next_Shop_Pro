#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js belum terpasang. Jalankan: pkg install nodejs -y"
  exit 1
fi
NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Next Shop memerlukan Node.js 18 atau lebih baru."
  echo "Perbarui dengan: pkg update && pkg upgrade && pkg install nodejs -y"
  exit 1
fi
mkdir -p data public/uploads
if [ ! -f .env ]; then
  SECRET="$(node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('hex'))")"
  printf 'NODE_ENV=development\nPORT=8090\nSESSION_SECRET=%s\n' "$SECRET" > .env
  chmod 600 .env
  echo "File .env dibuat dengan session secret acak. Jangan bagikan atau unggah file ini."
fi
if [ ! -f data/store.json ]; then
  echo "Data toko belum dibuat. Server akan membuat data/store.json secara otomatis."
fi
echo ""
echo "Next Shop akan berjalan. Jangan tutup Termux selama website digunakan."
echo "Toko : http://127.0.0.1:8090"
echo "Admin: http://127.0.0.1:8090/admin"
echo "Untuk menghentikan server, tekan Ctrl+C."
node server.js
