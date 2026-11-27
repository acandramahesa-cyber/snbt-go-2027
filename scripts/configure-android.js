/* scripts/configure-android.js — Atur tema merah GO & ikon APK Android tanpa Android Studio */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const RES_DIR = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');

if (!fs.existsSync(RES_DIR)) {
  console.log('[SKIP] Folder android/ belum ada, lewati konfigurasi resource Android.');
  process.exit(0);
}

// 1. Set statusBar & primary colors to GO Red (#DC2626)
const valuesDir = path.join(RES_DIR, 'values');
fs.mkdirSync(valuesDir, { recursive: true });
const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#DC2626</color>
    <color name="colorPrimaryDark">#B91C1C</color>
    <color name="colorAccent">#FACC15</color>
    <color name="ic_launcher_background">#DC2626</color>
</resources>
`;
fs.writeFileSync(path.join(valuesDir, 'colors.xml'), colorsXml, 'utf8');

const stylesPath = path.join(valuesDir, 'styles.xml');
if (fs.existsSync(stylesPath)) {
  let stylesXml = fs.readFileSync(stylesPath, 'utf8');
  if (!stylesXml.includes('android:statusBarColor')) {
    stylesXml = stylesXml.replace(
      '<item name="android:background">@null</item>',
      '<item name="android:background">@null</item>\n        <item name="android:statusBarColor">@color/colorPrimary</item>'
    );
    fs.writeFileSync(stylesPath, stylesXml, 'utf8');
  }
}

// 2. Generate crisp GO Expert PNG launcher icons across Android densities
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c;
}
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}
function makeGoIconPng(size, roundOnly) {
  const raw = Buffer.alloc(size * (1 + size * 4));
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.48;
  const rInner = size * 0.34;
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0;
    const t = y / size;
    const bgR = Math.round(t < 0.5 ? 220 + (249 - 220) * (t * 2) : 249 + (250 - 249) * ((t - 0.5) * 2));
    const bgG = Math.round(t < 0.5 ? 38 + (115 - 38) * (t * 2) : 115 + (204 - 115) * ((t - 0.5) * 2));
    const bgB = Math.round(t < 0.5 ? 38 + (22 - 38) * (t * 2) : 22 + (21 - 22) * ((t - 0.5) * 2));
    for (let x = 0; x < size; x++) {
      const idx = rowStart + 1 + x * 4;
      const dist = Math.hypot(x - cx, y - cy);
      if (roundOnly && dist > rOuter) {
        raw[idx] = 0; raw[idx + 1] = 0; raw[idx + 2] = 0; raw[idx + 3] = 0;
        continue;
      }
      let r = bgR, g = bgG, b = bgB;
      if (dist <= rInner) {
        r = 255; g = 255; b = 255;
        const nx = (x - cx) / rInner;
        const ny = (y - cy) / rInner;
        if (Math.abs(nx + ny * 0.35) < 0.16 && Math.abs(ny) < 0.52) {
          r = 220; g = 38; b = 38;
        }
      }
      raw[idx] = r; raw[idx + 1] = g; raw[idx + 2] = b; raw[idx + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const densities = [
  ['mipmap-mdpi', 48],
  ['mipmap-hdpi', 72],
  ['mipmap-xhdpi', 96],
  ['mipmap-xxhdpi', 144],
  ['mipmap-xxxhdpi', 192]
];

for (const [folder, px] of densities) {
  const dir = path.join(RES_DIR, folder);
  if (fs.existsSync(dir)) {
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), makeGoIconPng(px, false));
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), makeGoIconPng(px, true));
    fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), makeGoIconPng(px, true));
  }
}

console.log('[OK] Warna status bar (#DC2626) & ikon launcher Android selesai dikonfigurasi.');
