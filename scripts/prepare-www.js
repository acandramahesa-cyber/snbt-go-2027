/* scripts/prepare-www.js — Salin file web aplikasi ke folder www/ untuk Capacitor */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WWW_DIR = path.join(ROOT, 'www');

const FILES = ['index.html', 'manifest.json', 'sw.js'];
const DIRS = ['css', 'js', 'assets'];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

fs.rmSync(WWW_DIR, { recursive: true, force: true });
fs.mkdirSync(WWW_DIR, { recursive: true });

for (const file of FILES) {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(WWW_DIR, file));
  }
}

for (const dir of DIRS) {
  const src = path.join(ROOT, dir);
  if (fs.existsSync(src)) {
    copyRecursive(src, path.join(WWW_DIR, dir));
  }
}

console.log('[OK] Folder www/ siap dibungkus oleh Capacitor.');
