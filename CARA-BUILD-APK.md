# Cara Membuat & Memasang File `.apk` untuk Realme C30 (Tanpa Android Studio)

Karena **Realme C30 (Android Go Edition)** membatasi pemasangan WebAPK/PWA dari alamat IP lokal, proyek ini sudah disiapkan agar bisa dikompilasi menjadi file **`.apk` 100% offline** secara gratis di cloud menggunakan **GitHub Actions** — **ThinkPad X260 kamu tidak perlu menginstall Android Studio atau Android SDK sama sekali.**

---

## Langkah 1: Upload Proyek ke GitHub (Bisa tanpa Git!)

1. Buka [github.com](https://github.com) di browser laptop, login/daftar akun gratis, lalu klik **New repository** (beri nama mis. `snbt-go-2027`, pilih *Public* atau *Private*, klik **Create repository**).
2. Klik **uploading an existing file** di halaman repository baru tersebut.
3. Buka folder `C:\Users\valo\.gemini\antigravity\scratch\snbt-hud`, lalu seret (*drag & drop*) isi foldernya ke browser GitHub:
   - `index.html`, `manifest.json`, `sw.js`, `package.json`, `capacitor.config.json`, `serve.js`, `start-hud.bat`
   - Folder `css/`, `js/`, `assets/`, `scripts/`, dan `.github/`
   *(Tips: jika mengupload lewat browser, pastikan folder tersembunyi `.github` ikut terupload, atau gunakan GitHub Desktop / Git CLI).*
4. Klik tombol hijau **Commit changes**.

> **Alternatif jika pakai Git CLI:**
> ```bash
> git init
> git add .
> git commit -m "Initial SNBT GO 2027"
> git branch -M main
> git remote add origin https://github.com/<username>/snbt-go-2027.git
> git push -u origin main
> ```

---

## Langkah 2: Download File `.apk` dari GitHub Actions

1. Di halaman repository GitHub kamu, klik tab **Actions**.
2. Klik workflow **Build Android APK (SNBT GO 2027)** yang sedang berjalan (tunggu ~2–3 menit sampai ikon berubah menjadi centang hijau `✓`).
3. Klik workflow yang sudah hijau tersebut, gulir ke bagian **Artifacts** di bawah.
4. Klik **`SNBT-GO-2027-APK`** untuk mengunduh file `.zip`, lalu ekstrak isinya untuk mendapatkan **`SNBT-GO-2027-RealmeC30.apk`**.

---

## Langkah 3: Install di Realme C30

1. Kirim file `SNBT-GO-2027-RealmeC30.apk` ke HP Realme C30 (via kabel USB / Bluetooth / WhatsApp / Google Drive).
2. Ketuk file `.apk` tersebut di File Manager HP. Jika muncul peringatan izin *"Sumber tidak dikenal / Unknown apps"*, pilih **Izinkan / Allow** lalu **Instal**.
3. Selesai! Aplikasi **SNBT GO 2027** sekarang berjalan **100% offline** di Realme C30 tanpa butuh browser, Wi-Fi, atau menyalakan laptop.

---

## Tips Sinkronisasi Data Laptop ↔ Realme C30

Untuk memindahkan catatan **Error Log**, **Statistik Soal**, dan **Jadwal Belajar** antara versi browser Laptop dan aplikasi `.apk` di Realme C30:
- Buka ikon **Pengaturan (gerigi)** → klik **Salin Teks Backup** → kirim teks JSON ke perangkat satunya (mis. via WhatsApp ke diri sendiri) → tempel di kotak **Backup / Restore via Teks** → klik **Pulihkan dari Teks JSON**.
