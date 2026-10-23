'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const readline = require('node:readline');
const file = path.join(__dirname, 'data', 'store.json');
function ask(question, hidden = false) {
  return new Promise(resolve => {
    if (!hidden || !process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
      return;
    }
    process.stdout.write(question);
    const input = process.stdin; let answer = ''; const previousRaw = input.isRaw;
    input.setRawMode(true); input.resume();
    const onData = chunk => {
      const value = chunk.toString('utf8');
      const enterAt = value.search(/[\r\n]/);
      const usable = enterAt >= 0 ? value.slice(0, enterAt) : value;
      for (const char of usable) {
        if (char === '\u0003') process.exit(130);
        if (char === '\u007f' || char === '\b') answer = answer.slice(0, -1);
        else if (char >= ' ') answer += char;
      }
      if (enterAt >= 0) {
        input.setRawMode(previousRaw || false); input.pause(); input.removeListener('data', onData); process.stdout.write('\n'); resolve(answer);
      }
    };
    input.on('data', onData);
  });
}
(async () => {
  if (!fs.existsSync(file)) throw new Error('Database belum ada. Jalankan setup admin terlebih dahulu.');
  const store = JSON.parse(fs.readFileSync(file, 'utf8'));
  const admins = store.users.filter(user => user.role === 'admin');
  if (!admins.length) throw new Error('Belum ada akun admin. Gunakan node setup-admin.js.');
  console.log('\n=== Reset password admin Next Shop ===');
  console.log('Pastikan server dihentikan (Ctrl+C) sebelum melanjutkan.\n');
  const email = (await ask('Email admin yang akan direset: ')).toLowerCase();
  const admin = admins.find(user => user.email === email);
  if (!admin) throw new Error('Email tersebut bukan akun admin.');
  const password = await ask('Password baru (minimal 12 karakter): ', true);
  const confirm = await ask('Ulangi password baru: ', true);
  if (password.length < 12 || password.length > 200) throw new Error('Password harus 12–200 karakter.');
  if (password !== confirm) throw new Error('Password tidak sama.');
  const salt = crypto.randomBytes(16).toString('hex');
  admin.passwordSalt = salt; admin.passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(store, null, 2), { mode: 0o600 }); fs.renameSync(temp, file);
  console.log('\n✅ Password admin berhasil direset. Rahasia tidak dicetak.');
  console.log('Jalankan lagi server lalu login dengan password baru.');
})().catch(error => { console.error('\n❌ ' + error.message); process.exitCode = 1; });
