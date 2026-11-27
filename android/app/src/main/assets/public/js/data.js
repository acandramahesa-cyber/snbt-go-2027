/* ==========================================================================
   data.js — Subtes Metadata (with GO Expert colors), 16 Formula Cards, & 70 Quiz Items
   Every quiz item carries `firstStepTip` + structured `exp` for GOSpeak.
   ========================================================================== */

(function (global) {
  'use strict';

  const SUBTESTS = {
    PU:  { code: 'PU',  name: 'Penalaran Umum', load: 'heavy', paceSec: 60, color: '#8B5CF6', bg: '#F3E8FF' },
    PPU: { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', load: 'light', paceSec: 45, color: '#0D9488', bg: '#CCFBF1' },
    PBM: { code: 'PBM', name: 'Pemahaman Bacaan & Menulis', load: 'light', paceSec: 60, color: '#2563EB', bg: '#DBEAFE' },
    PK:  { code: 'PK',  name: 'Pengetahuan Kuantitatif', load: 'heavy', paceSec: 75, color: '#DC2626', bg: '#FEE2E2' },
    LBI: { code: 'LBI', name: 'Literasi Bahasa Indonesia', load: 'light', paceSec: 75, color: '#EA580C', bg: '#FFEDD5' },
    LBE: { code: 'LBE', name: 'Literasi Bahasa Inggris', load: 'light', paceSec: 90, color: '#D97706', bg: '#FEF3C7' },
    PM:  { code: 'PM',  name: 'Penalaran Matematika', load: 'heavy', paceSec: 90, color: '#059669', bg: '#D1FAE5' }
  };

  const SUBTEST_ORDER = ['PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM'];

  const FORMULAS = [
    // 1. PERSAMAAN KUADRAT & LINEAR
    {
      id: 'k1',
      cat: 'kuadrat',
      catLabel: 'Kuadrat & Linear',
      title: 'Akar Persamaan Kuadrat & Diskriminan',
      equations: [
        { label: 'Bentuk Umum & Rumus ABC', html: 'ax<sup>2</sup> + bx + c = 0 &nbsp;|&nbsp; x<sub>1,2</sub> = (&minus;b &plusmn; &radic;D) / 2a' },
        { label: 'Diskriminan (D)', html: 'D = b<sup>2</sup> &minus; 4ac' },
        { label: 'Jenis Akar', html: 'D &gt; 0: 2 akar real beda &bull; D = 0: akar kembar &bull; D &lt; 0: imajiner' }
      ],
      tip: 'Jika soal menyebut "kurva menyinggung sumbu-x" atau "memiliki tepat 1 solusi", langsung pasang D = 0!'
    },
    {
      id: 'k2',
      cat: 'kuadrat',
      catLabel: 'Kuadrat & Linear',
      title: 'Teorema Vieta & Identitas Cepat Akar',
      equations: [
        { label: 'Jumlah & Hasil Kali Akar', html: 'x<sub>1</sub> + x<sub>2</sub> = &minus;b/a &nbsp;&nbsp;|&nbsp;&nbsp; x<sub>1</sub> &middot; x<sub>2</sub> = c/a' },
        { label: 'Jumlah Kuadrat Akar', html: 'x<sub>1</sub><sup>2</sup> + x<sub>2</sub><sup>2</sup> = (x<sub>1</sub> + x<sub>2</sub>)<sup>2</sup> &minus; 2x<sub>1</sub>x<sub>2</sub>' },
        { label: 'Selisih Akar Mutlak', html: '|x<sub>1</sub> &minus; x<sub>2</sub>| = &radic;D / |a|' }
      ],
      tip: 'Jangan pernah mencari nilai x₁ dan x₂ satu per satu jika yang ditanya simetris (x₁² + x₂² atau 1/x₁ + 1/x₂). Pakai Vieta!'
    },
    {
      id: 'k3',
      cat: 'kuadrat',
      catLabel: 'Kuadrat & Linear',
      title: 'Gradien & Persamaan Garis Linear',
      equations: [
        { label: 'Gradien dari 2 Titik / Bentuk ax + by + c = 0', html: 'm = (y<sub>2</sub> &minus; y<sub>1</sub>) / (x<sub>2</sub> &minus; x<sub>1</sub>) &nbsp;&nbsp;|&nbsp;&nbsp; m = &minus;a / b' },
        { label: 'Hubungan 2 Garis', html: 'Sejajar: m<sub>1</sub> = m<sub>2</sub> &nbsp;&nbsp;|&nbsp;&nbsp; Tegak Lurus: m<sub>1</sub> &middot; m<sub>2</sub> = &minus;1' },
        { label: 'Garis Melalui (x₁, y₁)', html: 'y &minus; y<sub>1</sub> = m(x &minus; x<sub>1</sub>)' }
      ],
      tip: 'Trik cepat garis tegak lurus ax + by = c: tukar koefisien x & y lalu ubah tanda tengah menjadi bx &minus; ay = konstanta!'
    },
    {
      id: 'k4',
      cat: 'kuadrat',
      catLabel: 'Kuadrat & Linear',
      title: 'Analisis Solusi SPLDV (Dua Garis)',
      equations: [
        { label: 'Sistem: a₁x + b₁y = c₁ &amp; a₂x + b₂y = c₂', html: 'Solusi Unik (Berpotongan): a<sub>1</sub>/a<sub>2</sub> &ne; b<sub>1</sub>/b<sub>2</sub>' },
        { label: 'Tak Hingga Solusi (Berimpit)', html: 'a<sub>1</sub>/a<sub>2</sub> = b<sub>1</sub>/b<sub>2</sub> = c<sub>1</sub>/c<sub>2</sub>' },
        { label: 'Tidak Ada Solusi (Sejajar)', html: 'a<sub>1</sub>/a<sub>2</sub> = b<sub>1</sub>/b<sub>2</sub> &ne; c<sub>1</sub>/c<sub>2</sub>' }
      ],
      tip: 'Soal UTBK sering menyembunyikan parameter k dalam SPLDV dan bertanya agar "tidak memiliki solusi". Cek rasio koefisien!'
    },

    // 2. GEOMETRI 2D & 3D
    {
      id: 'g1',
      cat: 'geometri',
      catLabel: 'Geometri 2D & 3D',
      title: 'Segitiga & Triple Pythagoras Wajib Hafal',
      equations: [
        { label: 'Luas Segitiga', html: 'L = &frac12; &middot; a &middot; t &nbsp;&nbsp;|&nbsp;&nbsp; L = &frac12; &middot; a &middot; b &middot; sin C' },
        { label: 'Triple Pythagoras Dasar', html: '(3, 4, 5) &bull; (5, 12, 13) &bull; (7, 24, 25) &bull; (8, 15, 17) &bull; (9, 40, 41)' },
        { label: 'Segitiga Siku-Siku Khusus', html: '45&deg;-45&deg;-90&deg; &rarr; 1 : 1 : &radic;2 &nbsp;&nbsp;|&nbsp;&nbsp; 30&deg;-60&deg;-90&deg; &rarr; 1 : &radic;3 : 2' }
      ],
      tip: 'Cek kelipatan Triple Pythagoras dulu (misal 9, 12, 15 = 3&times;(3, 4, 5)) sebelum menghitung akar kuadrat manual!'
    },
    {
      id: 'g2',
      cat: 'geometri',
      catLabel: 'Geometri 2D & 3D',
      title: 'Lingkaran, Busur, Juring & Sudut',
      equations: [
        { label: 'Luas & Keliling', html: 'L = &pi;r<sup>2</sup> &nbsp;&nbsp;|&nbsp;&nbsp; K = 2&pi;r' },
        { label: 'Panjang Busur & Luas Juring (&alpha;&deg;)', html: 'Busur = (&alpha;/360&deg;) &middot; 2&pi;r &nbsp;&nbsp;|&nbsp;&nbsp; Juring = (&alpha;/360&deg;) &middot; &pi;r<sup>2</sup>' },
        { label: 'Teorema Sudut Lingkaran', html: 'Sudut Pusat = 2 &times; Sudut Keliling (menghadap busur sama)' }
      ],
      tip: 'Sudut keliling yang menghadap diameter lingkaran selalu tepat 90&deg; (membentuk segitiga siku-siku).'
    },
    {
      id: 'g3',
      cat: 'geometri',
      catLabel: 'Geometri 2D & 3D',
      title: 'Bangun Datar 2D (Trapesium & Belah Ketupat)',
      equations: [
        { label: 'Luas Trapesium', html: 'L = &frac12; &middot; (sisi sejajar<sub>1</sub> + sisi sejajar<sub>2</sub>) &middot; tinggi' },
        { label: 'Luas Belah Ketupat / Layang-Layang', html: 'L = &frac12; &middot; d<sub>1</sub> &middot; d<sub>2</sub>' },
        { label: 'Segitiga Sama Sisi (sisi s)', html: 't = &frac12;s&radic;3 &nbsp;&nbsp;|&nbsp;&nbsp; L = &frac14;s<sup>2</sup>&radic;3' }
      ],
      tip: 'Segi-6 beraturan terdiri dari 6 segitiga sama sisi identik, sehingga luasnya langsung 6 &times; (&frac14;s²&radic;3) = (3/2)s²&radic;3!'
    },
    {
      id: 'g4',
      cat: 'geometri',
      catLabel: 'Geometri 2D & 3D',
      title: 'Bangun Ruang 3D (Kubus, Limas, Tabung, Bola)',
      equations: [
        { label: 'Kubus (rusuk s)', html: 'Diagonal sisi = s&radic;2 &nbsp;|&nbsp; Diagonal ruang = s&radic;3 &nbsp;|&nbsp; V = s<sup>3</sup>' },
        { label: 'Prisma / Tabung vs Limas / Kerucut', html: 'V<sub>prisma</sub> = L<sub>alas</sub> &middot; t &nbsp;&nbsp;|&nbsp;&nbsp; V<sub>limas</sub> = &frac13; &middot; L<sub>alas</sub> &middot; t' },
        { label: 'Bola (jari-jari r)', html: 'V = (4/3)&pi;r<sup>3</sup> &nbsp;&nbsp;|&nbsp;&nbsp; L<sub>permukaan</sub> = 4&pi;r<sup>2</sup>' }
      ],
      tip: 'Jarak titik sudut kubus ke diagonal ruang tertentu sering memakai luas segitiga siku-siku: (alas &times; tinggi) = (miring &times; jarak).'
    },

    // 3. BARISAN & DERET
    {
      id: 'd1',
      cat: 'deret',
      catLabel: 'Barisan & Deret',
      title: 'Barisan Aritmatika (Beda Tetap)',
      equations: [
        { label: 'Suku ke-n', html: 'U<sub>n</sub> = a + (n &minus; 1)b' },
        { label: 'Selisih 2 Suku Sembarang', html: 'b = (U<sub>p</sub> &minus; U<sub>q</sub>) / (p &minus; q)' },
        { label: 'Suku Tengah (n ganjil)', html: 'U<sub>t</sub> = (U<sub>1</sub> + U<sub>n</sub>) / 2' }
      ],
      tip: 'Jika diketahui U₅ dan U₁₂, cari beda b cukup pakai (U₁₂ &minus; U₅) / (12 &minus; 5) tanpa membuat SPLDV!'
    },
    {
      id: 'd2',
      cat: 'deret',
      catLabel: 'Barisan & Deret',
      title: 'Deret Aritmatika (Jumlah n Suku)',
      equations: [
        { label: 'Jumlah n Suku Pertama', html: 'S<sub>n</sub> = (n/2) &middot; (2a + (n &minus; 1)b) = (n/2) &middot; (a + U<sub>n</sub>)' },
        { label: 'Hubungan Sₙ dan Uₙ', html: 'U<sub>n</sub> = S<sub>n</sub> &minus; S<sub>n&minus;1</sub>' },
        { label: 'Trik Jika Sₙ = pn² + qn', html: 'Beda b = 2p &nbsp;&nbsp;|&nbsp;&nbsp; Suku pertama a = p + q' }
      ],
      tip: 'Untuk n ganjil, jumlah deret aritmatika = n &times; U_tengah! Super cepat untuk menghitung rata-rata & jumlah.'
    },
    {
      id: 'd3',
      cat: 'deret',
      catLabel: 'Barisan & Deret',
      title: 'Barisan & Deret Geometri',
      equations: [
        { label: 'Suku ke-n & Rasio', html: 'U<sub>n</sub> = a &middot; r<sup>n&minus;1</sup> &nbsp;&nbsp;|&nbsp;&nbsp; r<sup>p&minus;q</sup> = U<sub>p</sub> / U<sub>q</sub>' },
        { label: 'Jumlah n Suku (r &gt; 1)', html: 'S<sub>n</sub> = a(r<sup>n</sup> &minus; 1) / (r &minus; 1)' },
        { label: 'Suku Tengah Geometri', html: 'U<sub>t</sub><sup>2</sup> = U<sub>1</sub> &middot; U<sub>n</sub>' }
      ],
      tip: 'Jika 3 bilangan x, y, z membentuk barisan geometri, langsung pakai syarat y² = x &middot; z!'
    },
    {
      id: 'd4',
      cat: 'deret',
      catLabel: 'Barisan & Deret',
      title: 'Deret Geometri Tak Hingga & Bola Memantul',
      equations: [
        { label: 'Deret Konvergen (|r| &lt; 1)', html: 'S<sub>&infin;</sub> = a / (1 &minus; r)' },
        { label: 'Syarat Konvergen', html: '&minus;1 &lt; r &lt; 1' },
        { label: 'Total Lintasan Bola Pantul (r = p/q)', html: 'H<sub>total</sub> = h<sub>0</sub> &middot; (q + p) / (q &minus; p)' }
      ],
      tip: 'Trik pantulan bola H = h₀ &middot; (q+p)/(q&minus;p) langsung menghitung jatuh pertama + naik-turun berikutnya dalam 5 detik!'
    },

    // 4. TRIGONOMETRI DASAR
    {
      id: 't1',
      cat: 'trigonometri',
      catLabel: 'Trigonometri',
      title: 'Rasio Segitiga Siku-Siku & Sudut Istimewa',
      equations: [
        { label: 'Definisi Dasar', html: 'sin &theta; = De/Mi &nbsp;&bull;&nbsp; cos &theta; = Sa/Mi &nbsp;&bull;&nbsp; tan &theta; = De/Sa' },
        { label: 'Sinus (0&deg;, 30&deg;, 45&deg;, 60&deg;, 90&deg;)', html: '0, &nbsp;&frac12;, &nbsp;&frac12;&radic;2, &nbsp;&frac12;&radic;3, &nbsp;1' },
        { label: 'Tangen (0&deg;, 30&deg;, 45&deg;, 60&deg;, 90&deg;)', html: '0, &nbsp;&frac13;&radic;3, &nbsp;1, &nbsp;&radic;3, &nbsp;tak terdefinisi' }
      ],
      tip: 'Cosinus sudut istimewa tinggal balik urutan sinus dari 90&deg; ke 0&deg;: 1, &frac12;&radic;3, &frac12;&radic;2, &frac12;, 0.'
    },
    {
      id: 't2',
      cat: 'trigonometri',
      catLabel: 'Trigonometri',
      title: 'Kuadran & Sudut Berelasi',
      equations: [
        { label: 'Tanda Positif per Kuadran', html: 'I: Semua(+) &bull; II: Sin(+) &bull; III: Tan(+) &bull; IV: Cos(+)' },
        { label: 'Relasi Tetap (180&deg; &plusmn; &theta;, 360&deg; &minus; &theta;)', html: 'Fungsi TETAP (sin&rarr;sin, cos&rarr;cos), sesuaikan tanda kuadran' },
        { label: 'Relasi Berubah (90&deg; &plusmn; &theta;, 270&deg; &plusmn; &theta;)', html: 'sin &harr; cos &nbsp;|&nbsp; tan &harr; cot, sesuaikan tanda kuadran sudut awal' }
      ],
      tip: 'Selalu pakai patokan 180&deg; atau 360&deg; saat menyederhanakan sudut agar tidak perlu menukar sin/cos!'
    },
    {
      id: 't3',
      cat: 'trigonometri',
      catLabel: 'Trigonometri',
      title: 'Identitas Trigonometri Dasar',
      equations: [
        { label: 'Identitas Pythagoras', html: 'sin<sup>2</sup>x + cos<sup>2</sup>x = 1' },
        { label: 'Turunan Identitas', html: '1 + tan<sup>2</sup>x = sec<sup>2</sup>x &nbsp;&nbsp;|&nbsp;&nbsp; 1 + cot<sup>2</sup>x = csc<sup>2</sup>x' },
        { label: 'Rasio & Kebalikan', html: 'tan x = sin x / cos x &nbsp;|&nbsp; sec x = 1/cos x &nbsp;|&nbsp; csc x = 1/sin x' }
      ],
      tip: 'Jika bertemu (sin x + cos x)², langsung ingat hasilnya = 1 + 2 sin x cos x!'
    },
    {
      id: 't4',
      cat: 'trigonometri',
      catLabel: 'Trigonometri',
      title: 'Aturan Sinus & Aturan Cosinus',
      equations: [
        { label: 'Aturan Sinus', html: 'a / sin A = b / sin B = c / sin C' },
        { label: 'Aturan Cosinus', html: 'c<sup>2</sup> = a<sup>2</sup> + b<sup>2</sup> &minus; 2ab cos C' },
        { label: 'Mencari Cos Sudut', html: 'cos C = (a<sup>2</sup> + b<sup>2</sup> &minus; c<sup>2</sup>) / 2ab' }
      ],
      tip: 'Pakai Aturan Sinus jika diketahui pasangan sisi-sudut berhadapan. Pakai Aturan Cosinus jika diketahui 3 sisi (SSS) atau 2 sisi + 1 sudut apit (SAS)!'
    }
  ];

  const QUIZ_BANK = [
    // ==================== PK (10 soal) ====================
    {
      id: 'pk1',
      subtes: 'PK',
      topic: 'Persamaan Kuadrat & Vieta',
      firstStepTip: 'Identifikasi bentuk simetris x₁² + x₂². Jangan cari akarnya satu per satu—langsung pasang Teorema Vieta: x₁+x₂ = -b/a dan x₁·x₂ = c/a.',
      q: 'Jika x₁ dan x₂ adalah akar-akar persamaan kuadrat 2x² - 6x + 3 = 0, maka nilai dari x₁² + x₂² adalah ....',
      options: ['3', '6', '9', '12', '15'],
      answer: 1,
      exp: 'Langkah 1: Tentukan a = 2, b = -6, c = 3. Langkah 2: Hitung x₁ + x₂ = -b/a = 6/2 = 3 dan x₁·x₂ = c/a = 3/2. Langkah 3: Gunakan identitas x₁² + x₂² = (x₁ + x₂)² - 2x₁x₂ = 3² - 2(3/2) = 9 - 3 = 6.'
    },
    {
      id: 'pk2',
      subtes: 'PK',
      topic: 'Persamaan Garis Tegak Lurus',
      firstStepTip: 'Cari gradien garis awal m₁ = -a/b terlebih dahulu, lalu balik dan ubah tandanya (m₂ = -1/m₁) karena syarat garis tegak lurus.',
      q: 'Garis g melalui titik (2, -1) dan tegak lurus terhadap garis 3x - 6y + 12 = 0. Persamaan garis g adalah ....',
      options: ['2x + y - 3 = 0', '2x - y - 5 = 0', 'x + 2y = 0', 'x - 2y - 4 = 0', '2x + y + 3 = 0'],
      answer: 0,
      exp: 'Langkah 1: Gradien garis awal m₁ = -3/(-6) = 1/2. Langkah 2: Karena tegak lurus, m₂ = -1 / (1/2) = -2. Langkah 3: Masukkan titik (2, -1) ke y - y₁ = m₂(x - x₁) -> y + 1 = -2(x - 2) -> 2x + y - 3 = 0.'
    },
    {
      id: 'pk3',
      subtes: 'PK',
      topic: 'Teorema Pythagoras',
      firstStepTip: 'Kenali langsung pola Triple Pythagoras dasar (3, 4, 5) dan kelipatannya seperti (9, 12, 15) agar tidak perlu menghitung kuadrat besar.',
      q: 'Sebuah tangga sepanjang 15 meter bersandar pada dinding vertikal dengan jarak kaki tangga ke dinding 9 meter. Jika kaki tangga digeser menjauh 3 meter lagi dari dinding, berapa meter ujung atas tangga turun?',
      options: ['2 m', '3 m', '4 m', '5 m', '6 m'],
      answer: 1,
      exp: 'Langkah 1: Dengan sisi miring 15 m dan alas awal 9 m (triple 9-12-15), tinggi awal = 12 m. Langkah 2: Alas baru = 9 + 3 = 12 m, sehingga tinggi baru = √(15² - 12²) = 9 m. Langkah 3: Jarak turun = 12 - 9 = 3 m.'
    },
    {
      id: 'pk4',
      subtes: 'PK',
      topic: 'Deret Aritmatika (Sn)',
      firstStepTip: 'Jika diketahui Sₙ = pn² + qn, langsung pakai sifat U₁₀ = S₁₀ - S₉ atau trik cepat b = 2p dan a = p + q.',
      q: 'Diketahui jumlah n suku pertama suatu deret aritmatika adalah Sₙ = 2n² + 3n. Nilai suku ke-10 (U₁₀) deret tersebut adalah ....',
      options: ['37', '39', '41', '43', '45'],
      answer: 2,
      exp: 'Langkah 1: Dari Sₙ = 2n² + 3n diperoleh beda b = 2(2) = 4 dan suku pertama a = 2 + 3 = 5. Langkah 2: Hitung U₁₀ = a + 9b = 5 + 9(4) = 41. Bisa juga memakai S₁₀ - S₉ = 230 - 189 = 41.'
    },
    {
      id: 'pk5',
      subtes: 'PK',
      topic: 'Fungsi Invers',
      firstStepTip: 'Ingat sifat dasar f⁻¹(k) = x sama artinya dengan f(x) = k. Tidak perlu mencari rumus f⁻¹(x) secara utuh!',
      q: 'Jika fungsi f(x) = (2x + 7) / (x - 1) untuk x ≠ 1, maka nilai dari f⁻¹(5) adalah ....',
      options: ['2', '3', '4', '5', '6'],
      answer: 2,
      exp: 'Langkah 1: Misalkan f⁻¹(5) = a, maka f(a) = 5. Langkah 2: Substitusi (2a + 7) / (a - 1) = 5 -> 2a + 7 = 5a - 5. Langkah 3: Pindahkan suku -> 12 = 3a -> a = 4.'
    },
    {
      id: 'pk6',
      subtes: 'PK',
      topic: 'Pertidaksamaan Kuadrat',
      firstStepTip: 'Faktorkan bentuk kuadrat menjadi pembuat nol x₁ dan x₂ dahulu. Karena tanda ≤ 0 dan koefisien x² positif, daerah hasil berada DI ANTARA kedua akar.',
      q: 'Himpunan penyelesaian dari pertidaksamaan kuadrat x² - 5x + 6 ≤ 0 adalah ....',
      options: ['x ≤ 2 atau x ≥ 3', '2 ≤ x ≤ 3', '-3 ≤ x ≤ -2', 'x ≤ -3 atau x ≥ -2', '2 < x < 3'],
      answer: 1,
      exp: 'Langkah 1: Faktorkan x² - 5x + 6 = 0 menjadi (x - 2)(x - 3) = 0, sehingga pembuat nolnya x = 2 dan x = 3. Langkah 2: Uji garis bilangan atau pakai pola tanda ≤ 0 untuk a > 0, diperoleh 2 ≤ x ≤ 3.'
    },
    {
      id: 'pk7',
      subtes: 'PK',
      topic: 'Aritmatika Sosial (Diskon)',
      firstStepTip: 'Jangan langsung mengalikan harga setelah diskon dengan 20%! Harga bayar = (100% - 20%) × Harga Normal = 80% × Harga Normal.',
      q: 'Harga sebuah multimeter digital setelah mendapat diskon 20% adalah Rp240.000. Harga normal multimeter sebelum diskon adalah ....',
      options: ['Rp280.000', 'Rp288.000', 'Rp300.000', 'Rp320.000', 'Rp360.000'],
      answer: 2,
      exp: 'Langkah 1: Diskon 20% berarti pembeli membayar 80% (0,8) dari harga awal P. Langkah 2: 0,8 × P = 240.000 -> P = 240.000 / 0,8 = Rp300.000.'
    },
    {
      id: 'pk8',
      subtes: 'PK',
      topic: 'Fungsi Komposisi',
      firstStepTip: 'Kerjakan fungsi komposisi (f ∘ g)(2) dari sisi kanan (dalam) ke kiri: hitung g(2) dulu, lalu masukkan hasilnya ke f(x).',
      q: 'Diketahui f(x) = 2x - 3 dan g(x) = x² + 1. Nilai dari (f ∘ g)(2) adalah ....',
      options: ['3', '5', '7', '9', '11'],
      answer: 2,
      exp: 'Langkah 1: Hitung g(2) = 2² + 1 = 5. Langkah 2: Substitusi hasil g(2) ke fungsi f: f(5) = 2(5) - 3 = 10 - 3 = 7.'
    },
    {
      id: 'pk9',
      subtes: 'PK',
      topic: 'Persamaan Eksponen',
      firstStepTip: 'Samakan bilangan pokok (basis) kedua ruas menjadi basis 2 terlebih dahulu sebelum menyamakan pangkatnya.',
      q: 'Nilai x yang memenuhi persamaan eksponen 2^(2x - 1) = 32 adalah ....',
      options: ['2', '3', '4', '5', '6'],
      answer: 1,
      exp: 'Langkah 1: Ubah ruas kanan menjadi basis 2, yaitu 32 = 2⁵. Langkah 2: Karena basis sudah sama, samakan pangkat: 2x - 1 = 5 -> 2x = 6 -> x = 3.'
    },
    {
      id: 'pk10',
      subtes: 'PK',
      topic: 'Statistika Rata-Rata Gabungan',
      firstStepTip: 'Ubah langsung setiap informasi rata-rata menjadi TOTAL NILAI = (banyak data) × (rata-rata), lalu cari selisih total sesudah dan sebelum.',
      q: 'Rata-rata nilai tryout 4 siswa adalah 75. Setelah 1 siswa baru bergabung, rata-ratanya naik menjadi 78. Nilai siswa baru tersebut adalah ....',
      options: ['82', '85', '88', '90', '93'],
      answer: 3,
      exp: 'Langkah 1: Total nilai 4 siswa = 4 × 75 = 300. Langkah 2: Total nilai 5 siswa = 5 × 78 = 390. Langkah 3: Nilai siswa baru = 390 - 300 = 90.'
    },

    // ==================== PM (10 soal) ====================
    {
      id: 'pm1',
      subtes: 'PM',
      topic: 'Deret Geometri Tak Hingga',
      firstStepTip: 'Untuk total lintasan bola memantul dengan rasio p/q, langsung pakai trik H = h₀ × (q + p) / (q - p) agar tidak salah hitung pantulan naik-turun.',
      q: 'Sebuah bola dijatuhkan dari ketinggian 12 meter dan memantul kembali setinggi 2/3 dari tinggi sebelumnya secara terus-menerus hingga berhenti. Total panjang lintasan bola adalah ....',
      options: ['36 m', '48 m', '54 m', '60 m', '72 m'],
      answer: 3,
      exp: 'Langkah 1: Identifikasi h₀ = 12 m dan rasio pantulan p/q = 2/3. Langkah 2: Pakai rumus lintasan total H = 12 × (3 + 2) / (3 - 2) = 12 × 5 = 60 meter.'
    },
    {
      id: 'pm2',
      subtes: 'PM',
      topic: 'Trigonometri Sudut Elevasi',
      firstStepTip: 'Sketsa segitiga siku-siku: tinggi menara berada DI DEPAN sudut 60° dan jarak pengamat berada DI SAMPING sudut. Maka gunakan rasio tan θ = De/Sa.',
      q: 'Seorang siswa mengukur sudut elevasi puncak menara BTS dari jarak 30 meter di tanah datar (tinggi pengamat diabaikan) dan memperoleh sudut 60°. Tinggi menara tersebut adalah ....',
      options: ['15 m', '15√3 m', '30 m', '30√2 m', '30√3 m'],
      answer: 4,
      exp: 'Langkah 1: Gunakan tan 60° = tinggi / jarak alas. Langkah 2: Karena tan 60° = √3, maka tinggi = 30 × √3 = 30√3 meter.'
    },
    {
      id: 'pm3',
      subtes: 'PM',
      topic: 'Geometri 3D (Tabung & Kerucut)',
      firstStepTip: 'Bandingkan rumus volumenya langsung! Jika jari-jari dan tinggi sama persis, jangan hitung nilai π atau angkanya satu per satu.',
      q: 'Sebuah wadah tabung berjari-jari 7 cm dan tinggi 18 cm terisi penuh air. Seluruh air dituangkan ke gelas berbentuk kerucut yang memiliki jari-jari dan tinggi sama persis dengan tabung. Berapa banyak gelas kerucut yang dapat terisi penuh?',
      options: ['2 gelas', '3 gelas', '4 gelas', '6 gelas', '9 gelas'],
      answer: 1,
      exp: 'Langkah 1: V_tabung = πr²t sedangkan V_kerucut = (1/3)πr²t. Langkah 2: Karena r dan t identik, V_tabung / V_kerucut = 1 / (1/3) = 3 gelas.'
    },
    {
      id: 'pm4',
      subtes: 'PM',
      topic: 'Rasio Proporsional (Konteks Rangkaian Listrik)',
      firstStepTip: 'Pada rangkaian seri, arus listrik I sama di tiap komponen. Maka P = I²R langsung sebanding dengan nilai R (pembagi proporsional).',
      q: 'Pada rangkaian seri resistor dengan arus konstan, daya listrik berbanding lurus dengan hambatan (P = I²R). Dua resistor R₁ = 4 Ω dan R₂ = 6 Ω dipasang seri dan menyerap daya total 50 Watt. Daya yang diserap oleh R₂ adalah ....',
      options: ['20 Watt', '25 Watt', '30 Watt', '35 Watt', '40 Watt'],
      answer: 2,
      exp: 'Langkah 1: Jumlah rasio hambatan = 4 + 6 = 10 Ω. Langkah 2: Daya P₂ = [6 / (4 + 6)] × 50 Watt = (6/10) × 50 = 30 Watt.'
    },
    {
      id: 'pm5',
      subtes: 'PM',
      topic: 'Kecepatan Menyusul',
      firstStepTip: 'Hitung dulu jarak keunggulan awal (head start) pengendara pertama, lalu bagi dengan selisih kecepatan (v_cepat - v_lambat).',
      q: 'Andi berangkat pukul 07.00 mengendarai motor berkecepatan 40 km/jam. Pukul 07.30, Budi menyusul dari titik yang sama melewati rute sama dengan kecepatan 60 km/jam. Pada pukul berapa Budi tepat menyusul Andi?',
      options: ['08.00', '08.15', '08.30', '08.45', '09.00'],
      answer: 2,
      exp: 'Langkah 1: Saat Budi berangkat (07.30), Andi sudah jalan 0,5 jam sejauh 0,5 × 40 = 20 km. Langkah 2: Waktu menyusul = Jarak susul / Selisih kecepatan = 20 / (60 - 40) = 1 jam. Langkah 3: 07.30 + 1 jam = pukul 08.30.'
    },
    {
      id: 'pm6',
      subtes: 'PM',
      topic: 'Perbandingan Berbalik Nilai',
      firstStepTip: 'Kalikan jumlah pekerja × hari untuk mendapat total beban kerja. Hati-hati jebakan soal: yang ditanya adalah TEKNISI TAMBAHAN, bukan total teknisi!',
      q: 'Suatu proyek instalasi panel listrik dapat diselesaikan oleh 6 teknisi dalam 12 hari. Jika pimpinan proyek ingin menyelesaikannya dalam 8 hari, berapa orang teknisi tambahan yang dibutuhkan?',
      options: ['2 orang', '3 orang', '4 orang', '6 orang', '9 orang'],
      answer: 1,
      exp: 'Langkah 1: Total beban kerja = 6 teknisi × 12 hari = 72 orang-hari. Langkah 2: Jumlah teknisi untuk 8 hari = 72 / 8 = 9 orang. Langkah 3: Teknisi tambahan = 9 - 6 = 3 orang.'
    },
    {
      id: 'pm7',
      subtes: 'PM',
      topic: 'Peluang & Kombinasi',
      firstStepTip: 'Karena pengambilan dilakukan SEKALIGUS (urutan tidak diperhatikan), gunakan Kombinasi C(n, r) untuk ruang sampel total maupun kejadian yang diinginkan.',
      q: 'Di kotak peralatan terdapat 5 resistor bagus dan 3 resistor rusak. Jika diambil 2 resistor sekaligus secara acak, peluang terambilnya tepat 1 resistor bagus dan 1 resistor rusak adalah ....',
      options: ['15/56', '8/28', '15/28', '10/28', '1/2'],
      answer: 2,
      exp: 'Langkah 1: Ruang sampel total n(S) = C(8,2) = (8 × 7) / 2 = 28 cara. Langkah 2: Banyak cara memilih 1 bagus & 1 rusak = C(5,1) × C(3,1) = 5 × 3 = 15. Langkah 3: Peluang P = 15/28.'
    },
    {
      id: 'pm8',
      subtes: 'PM',
      topic: 'Geometri Luas Daerah (Taman & Kolam)',
      firstStepTip: 'Ubah diameter kolam 7 m menjadi jari-jari r = 3,5 m (atau 7/2 m) sebelum memakai πr², lalu kurangkan luas lingkaran dari luas persegi panjang.',
      q: 'Sebuah taman berbentuk persegi panjang berukuran 14 m × 10 m. Di tengah taman dibuat kolam berbentuk lingkaran berdiameter 7 m, sedangkan area luar kolam ditanami rumput. Dengan π = 22/7, luas area rumput adalah ....',
      options: ['86,5 m²', '94,5 m²', '101,5 m²', '112,0 m²', '129,0 m²'],
      answer: 2,
      exp: 'Langkah 1: Luas taman = 14 × 10 = 140 m². Langkah 2: Jari-jari kolam r = 7/2 = 3,5 m, maka luas kolam = (22/7) × (7/2) × (7/2) = 38,5 m². Langkah 3: Luas rumput = 140 - 38,5 = 101,5 m².'
    },
    {
      id: 'pm9',
      subtes: 'PM',
      topic: 'SPLDV Konteks Harga Alat Ukur',
      firstStepTip: 'Eliminasi variabel yang tidak ditanya (multimeter) dengan menyamakan koefisiennya terlebih dahulu agar langsung menemukan harga tang ampere.',
      q: 'Harga 2 multimeter dan 3 tang ampere adalah Rp850.000, sedangkan harga 1 multimeter dan 2 tang ampere adalah Rp500.000. Harga 1 buah tang ampere adalah ....',
      options: ['Rp120.000', 'Rp150.000', 'Rp175.000', 'Rp200.000', 'Rp250.000'],
      answer: 1,
      exp: 'Langkah 1: Tulis 2M + 3T = 850.000 dan kalikan persamaan kedua dengan 2 menjadi 2M + 4T = 1.000.000. Langkah 2: Kurangkan kedua persamaan: T = 1.000.000 - 850.000 = Rp150.000.'
    },
    {
      id: 'pm10',
      subtes: 'PM',
      topic: 'Konsumsi Energi Listrik (kWh)',
      firstStepTip: 'Hitung total energi harian dalam satuan Wh (Watt × jam), bagi 1.000 untuk mengubah ke kWh per hari, baru kalikan 30 hari dan tarifnya.',
      q: 'Sebuah ruang praktik menyalakan total lampu 200 Watt selama 10 jam per hari dan AC 800 Watt selama 5 jam per hari. Jika tarif listrik Rp1.500 per kWh, total biaya listrik kedua alat tersebut selama 30 hari adalah ....',
      options: ['Rp180.000', 'Rp225.000', 'Rp270.000', 'Rp300.000', 'Rp360.000'],
      answer: 2,
      exp: 'Langkah 1: Energi harian = (200 × 10) + (800 × 5) = 2.000 + 4.000 = 6.000 Wh = 6 kWh/hari. Langkah 2: Dalam 30 hari = 6 × 30 = 180 kWh. Langkah 3: Total biaya = 180 × Rp1.500 = Rp270.000.'
    },

    // ==================== PU (10 soal) ====================
    {
      id: 'pu1',
      subtes: 'PU',
      topic: 'Penalaran Deduktif (Modus Tollens)',
      firstStepTip: 'Ubah kalimat syarat menjadi pola simbol "Jika P maka Q". Cocokkan fakta yang terjadi: apakah P terpenuhi, atau justru ~Q (bukan Q)?',
      q: 'Jika jaringan listrik mengalami korsleting, maka MCB utama otomatis memutus arus. Hari ini MCB utama tidak memutus arus. Kesimpulan yang paling tepat adalah ....',
      options: [
        'Jaringan listrik hari ini mengalami korsleting',
        'Jaringan listrik hari ini tidak mengalami korsleting',
        'MCB utama rusak sehingga arus tetap mengalir',
        'Arus listrik hari ini sedang padam dari PLN',
        'Tidak dapat ditarik kesimpulan'
      ],
      answer: 1,
      exp: 'Langkah 1: Premis 1 berbentuk P -> Q (Korsleting -> MCB memutus arus). Langkah 2: Fakta adalah ~Q (MCB tidak memutus arus). Langkah 3: Berdasarkan Modus Tollens, kesimpulan sahnya adalah ~P, yaitu jaringan listrik hari ini tidak mengalami korsleting.'
    },
    {
      id: 'pu2',
      subtes: 'PU',
      topic: 'Pola Bilangan Bertingkat',
      firstStepTip: 'Selalu hitung selisih antar suku berdekatan di baris bawah untuk melihat apakah polanya tetap, bertingkat, atau perkalian.',
      q: 'Perhatikan barisan bilangan berikut: 3, 5, 9, 15, 23, 33, .... Bilangan berikutnya adalah ....',
      options: ['41', '43', '45', '47', '49'],
      answer: 2,
      exp: 'Langkah 1: Cari selisih tiap pasangan: 5-3=+2, 9-5=+4, 15-9=+6, 23-15=+8, 33-23=+10. Langkah 2: Selisih selalu bertambah 2, jadi langkah berikutnya +12. Langkah 3: 33 + 12 = 45.'
    },
    {
      id: 'pu3',
      subtes: 'PU',
      topic: 'Logika Kuantor (Semua vs Sebagian)',
      firstStepTip: 'Pisahkan mana premis yang memakai kata "Semua" (berlaku mutlak untuk seluruh anggota himpunan) dan mana yang hanya "Sebagian".',
      q: 'Semua peserta yang lolos STEI-R memiliki nilai PK di atas ambang batas. Sebagian peserta yang nilainya di atas ambang batas mengikuti tryout rutin. Jika Raka adalah peserta yang lolos STEI-R, maka pernyataan yang PASTI BENAR adalah ....',
      options: [
        'Raka pasti mengikuti tryout rutin',
        'Raka memiliki nilai PK di atas ambang batas',
        'Sebagian peserta yang lolos STEI-R tidak memiliki nilai PK tinggi',
        'Semua peserta tryout rutin pasti lolos STEI-R',
        'Raka hanya belajar PK saat tryout'
      ],
      answer: 1,
      exp: 'Langkah 1: Premis "Semua peserta lolos STEI-R -> nilai PK di atas ambang batas" bersifat universal. Langkah 2: Karena Raka lolos STEI-R, ia wajib memenuhi premis pertama (nilai PK di atas ambang batas), sedangkan keikutsertaan tryout rutin hanya "Sebagian" sehingga belum pasti.'
    },
    {
      id: 'pu4',
      subtes: 'PU',
      topic: 'Negasi Pernyataan Implikasi',
      firstStepTip: 'Ingat rumus negasi implikasi ~(P -> Q) ≡ P dan ~Q ("P terjadi TETAPI Q tidak terjadi"), bukan berbentuk "Jika ... maka ..." lagi!',
      q: 'Ingkaran (negasi) yang tepat dari pernyataan: "Jika listrik di bengkel padam, maka semua mesin bubut berhenti beroperasi" adalah ....',
      options: [
        'Jika listrik tidak padam, maka semua mesin bubut beroperasi',
        'Jika semua mesin bubut berhenti, maka listrik di bengkel padam',
        'Listrik di bengkel padam dan ada mesin bubut yang tetap beroperasi',
        'Listrik di bengkel tidak padam dan semua mesin bubut berhenti',
        'Semua mesin bubut tidak berhenti jika listrik tidak padam'
      ],
      answer: 2,
      exp: 'Langkah 1: Ubah ke logika: P = listrik padam, Q = semua mesin bubut berhenti. Langkah 2: Negasi P -> Q adalah P ∧ ~Q. Langkah 3: Negasi dari "semua mesin berhenti" adalah "ada mesin yang tidak berhenti (tetap beroperasi)".'
    },
    {
      id: 'pu5',
      subtes: 'PU',
      topic: 'Pola Bilangan Selang-Seling',
      firstStepTip: 'Jika angka pada barisan naik lalu turun berulang-ulang, uji pola selang-seling operasi (+ dan -) atau pisahkan menjadi suku ganjil & suku genap.',
      q: 'Tentukan bilangan selanjutnya pada pola: 4, 8, 6, 10, 8, 12, 10, ....',
      options: ['11', '12', '14', '16', '18'],
      answer: 2,
      exp: 'Langkah 1: Amati lompatan antar suku: 4->8 (+4), 8->6 (-2), 6->10 (+4), 10->8 (-2), 8->12 (+4), 12->10 (-2). Langkah 2: Giliran operasi berikutnya adalah +4. Langkah 3: 10 + 4 = 14.'
    },
    {
      id: 'pu6',
      subtes: 'PU',
      topic: 'Penalaran Analitik (Urutan Peringkat)',
      firstStepTip: 'Buat garis posisi berurutan dari kiri ke kanan (1 sampai 5) dan kunci dulu syarat mutlak yang menempatkan posisi pasti.',
      q: 'Lima peserta tryout—Dina, Eko, Fajar, Gita, dan Hadi—mendapat skor berbeda. Skor Eko lebih tinggi daripada Fajar tetapi di bawah Gita. Skor Dina paling tinggi. Skor Hadi tidak lebih rendah daripada Gita. Siapakah peserta dengan skor terendah?',
      options: ['Dina', 'Eko', 'Fajar', 'Gita', 'Hadi'],
      answer: 2,
      exp: 'Langkah 1: Dina tertinggi (#1). Langkah 2: Dari "Hadi ≥ Gita" dan "Gita > Eko > Fajar", urutan sementara adalah Gita > Eko > Fajar. Langkah 3: Karena Fajar di posisi paling kanan, skor terendah pasti Fajar.'
    },
    {
      id: 'pu7',
      subtes: 'PU',
      topic: 'Memperlemah Argumen',
      firstStepTip: 'Untuk MEMPERLEMAH kesimpulan argumen sebab-akibat, cari opsi yang menunjukkan hasil tetap terjadi tanpa sebab tersebut atau ada faktor lain yang lebih dominan.',
      q: 'Manajer sekolah menyatakan: "Nilai tryout siswa meningkat tajam bulan ini semata-mata karena sekolah mengganti warna cat ruang kelas menjadi biru." Pernyataan manakah yang PALING MEMPERLEMAH argumen manajer tersebut?',
      options: [
        'Warna biru memang disukai oleh mayoritas guru di sekolah tersebut',
        'Bulan ini seluruh siswa wajib mengikuti program evaluasi error log setiap hari',
        'Biaya pengecatan ulang ruang kelas masih cukup terjangkau anggaran sekolah',
        'Sekolah tetangga juga berencana mengecat ulang kelasnya tahun depan',
        'Siswa tetap datang ke sekolah pada jam masuk yang sama'
      ],
      answer: 1,
      exp: 'Langkah 1: Klaim manajer menyebut kenaikan nilai terjadi "semata-mata karena cat biru". Langkah 2: Adanya program wajib evaluasi error log harian memberi penyebab alternatif yang jauh lebih logis sehingga meruntuhkan klaim "semata-mata karena cat".'
    },
    {
      id: 'pu8',
      subtes: 'PU',
      topic: 'Silogisme Majemuk',
      firstStepTip: 'Rantai premis P -> Q dan Q -> R dapat langsung diringkas menjadi P -> R (hilangkan penghubung tengah Q).',
      q: 'Premis 1: Jika suhu prosesor melewati batas aman, maka sistem pendingin berputar penuh. Premis 2: Jika sistem pendingin berputar penuh, maka konsumsi daya meningkat. Kesimpulan yang sah adalah ....',
      options: [
        'Jika konsumsi daya meningkat, maka suhu prosesor melewati batas aman',
        'Jika suhu prosesor melewati batas aman, maka konsumsi daya meningkat',
        'Jika sistem pendingin tidak berputar penuh, konsumsi daya pasti naik',
        'Konsumsi daya hanya meningkat saat laptop dimatikan',
        'Suhu prosesor tidak pernah memengaruhi sistem pendingin'
      ],
      answer: 1,
      exp: 'Langkah 1: P = suhu melewati batas aman, Q = pendingin berputar penuh, R = konsumsi daya meningkat. Langkah 2: Dari P -> Q dan Q -> R, hukum silogisme menyimpulkan P -> R.'
    },
    {
      id: 'pu9',
      subtes: 'PU',
      topic: 'Pola Operasi Ganda',
      firstStepTip: 'Ketika lonjakan angka semakin membesar dua kali lipat secara cepat, uji pola perkalian tetap ditambah konstanta (×2 + k).',
      q: 'Angka yang tepat untuk melengkapi barisan 2, 5, 11, 23, 47, ... adalah ....',
      options: ['71', '84', '94', '95', '96'],
      answer: 3,
      exp: 'Langkah 1: Cek pola tiap langkah: 2×2+1=5, 5×2+1=11, 11×2+1=23, 23×2+1=47. Langkah 2: Suku selanjutnya adalah 47 × 2 + 1 = 94 + 1 = 95.'
    },
    {
      id: 'pu10',
      subtes: 'PU',
      topic: 'Kesesuaian Data Kuantitatif',
      firstStepTip: 'Cek pernyataan yang menggunakan kata mutlak ("selalu", "tertinggi", "turun") lalu bandingkan langsung dengan angka pada soal.',
      q: 'Produksi panel surya pabrik A berturut-turut dari Januari hingga April adalah 120, 150, 140, dan 210 unit. Manakah kesimpulan yang PASTI BENAR sesuai data tersebut?',
      options: [
        'Produksi panel surya selalu naik setiap bulan',
        'Kenaikan terbesar terjadi antara bulan Januari dan Februari',
        'Produksi pada bulan April meningkat 50% dibandingkan bulan Maret',
        'Rata-rata produksi empat bulan tersebut di bawah 140 unit',
        'Bulan Maret memiliki produksi terendah'
      ],
      answer: 2,
      exp: 'Langkah 1: Cek kenaikan Maret (140) ke April (210): selisihnya 70 unit. Langkah 2: Persentase kenaikan = (70 / 140) × 100% = 50%. Pilihan lain salah karena Maret sempat turun, kenaikan terbesar 70 terjadi Mar-Apr, dan terendah adalah Januari.'
    },

    // ==================== LBE (10 soal) ====================
    {
      id: 'lbe1',
      subtes: 'LBE',
      topic: 'Main Idea (Reading Comprehension)',
      firstStepTip: 'Identify the main subject in sentence 1 ("microgrids"), then look at sentence 2 for the specific advantage during grid failures.',
      q: 'Microgrids are localized energy networks that can disconnect from the traditional power grid and operate autonomously. During extreme weather events that damage central transmission lines, microgrids keep critical facilities such as hospitals and water treatment plants powered using local solar panels and battery storage.\n\nWhat is the main advantage of microgrids highlighted in the text?',
      options: [
        'They completely replace traditional power plants worldwide',
        'They eliminate the need for battery storage in hospitals',
        'They maintain power for essential facilities independently during grid disruptions',
        'They are always cheaper to build than solar panels',
        'They prevent extreme weather events from occurring'
      ],
      answer: 2,
      exp: 'Step 1: Sentence 1 defines microgrids as networks that can operate autonomously. Step 2: Sentence 2 explains that during extreme weather grid failures, they keep critical facilities like hospitals powered using local storage.'
    },
    {
      id: 'lbe2',
      subtes: 'LBE',
      topic: 'Vocabulary in Context',
      firstStepTip: 'Look for contrast signal words like "Although" in the first clause to deduce the opposite direction of the highlighted word.',
      q: 'Although early lithium-ion batteries degraded rapidly under high temperatures, recent solid-state electrolytes have substantially MITIGATED thermal runaway risks in electric vehicles.\n\nThe word "mitigated" in the sentence is closest in meaning to ....',
      options: ['accelerated', 'reduced', 'ignored', 'created', 'measured'],
      answer: 1,
      exp: 'Step 1: "Although" signals contrast between early high-risk batteries and newer solid-state electrolytes. Step 2: Therefore, "mitigated" means reduced or made less severe.'
    },
    {
      id: 'lbe3',
      subtes: 'LBE',
      topic: 'Author Perspective',
      firstStepTip: 'Pay attention to critical phrases like "over-reliance" and "without understanding" to locate the author\'s stance.',
      q: 'While artificial intelligence can draft boilerplate code in seconds, over-reliance on generated snippets without understanding underlying algorithms often leads to subtle security vulnerabilities and brittle software architecture.\n\nWhich statement best reflects the author\'s perspective?',
      options: [
        'AI coding tools should be banned from engineering education',
        'Speed of AI code generation guarantees bug-free architecture',
        'Developers need foundational understanding rather than blindly trusting AI output',
        'Security vulnerabilities only happen in manually written code',
        'Algorithms are no longer relevant when using AI tools'
      ],
      answer: 2,
      exp: 'Step 1: Notice the warning about "over-reliance ... without understanding underlying algorithms". Step 2: This shows the author values strong foundational understanding over blindly accepting fast AI code.'
    },
    {
      id: 'lbe4',
      subtes: 'LBE',
      topic: 'Pronoun Reference',
      firstStepTip: 'Read the sentence right before the pronoun "they" and match plural nouns that logically perform the action.',
      q: 'Regenerative braking systems allow electric trains to convert kinetic energy back into electricity when slowing down. Because they feed this recovered power into overhead lines or onboard capacitors, energy waste during frequent station stops drops considerably.\n\nThe word "they" in the second sentence refers to ....',
      options: [
        'electric trains',
        'overhead lines',
        'onboard capacitors',
        'regenerative braking systems',
        'station stops'
      ],
      answer: 3,
      exp: 'Step 1: Look at the plural subject of the preceding sentence: "Regenerative braking systems". Step 2: Those systems convert kinetic energy and feed the recovered power back, confirming option D.'
    },
    {
      id: 'lbe5',
      subtes: 'LBE',
      topic: 'Implied Inference',
      firstStepTip: 'Combine two facts from the passage without jumping beyond what the evidence logically supports.',
      q: 'High-efficiency monocrystalline solar panels generate more power per square meter than polycrystalline models, though at a higher upfront manufacturing cost. Consequently, homeowners with limited roof space often choose monocrystalline arrays to maximize daily output.\n\nWhat can be inferred about polycrystalline panels from the passage?',
      options: [
        'They cannot produce electricity on residential roofs',
        'They require more roof area to match the output of monocrystalline panels',
        'They are always more expensive upfront than monocrystalline models',
        'They last twice as long as monocrystalline solar panels',
        'They have replaced all monocrystalline arrays worldwide'
      ],
      answer: 1,
      exp: 'Step 1: Monocrystalline panels produce more power per square meter and fit limited roofs. Step 2: Logically, polycrystalline panels produce less power per square meter, so matching the same output requires more roof area.'
    },
    {
      id: 'lbe6',
      subtes: 'LBE',
      topic: 'Purpose of the Paragraph',
      firstStepTip: 'Identify whether the paragraph is arguing, warning, explaining a process, or comparing two alternatives.',
      q: 'Unlike conventional desalination plants that burn fossil fuels to boil seawater, solar-powered reverse osmosis systems push saltwater through semi-permeable membranes using clean photovoltaic electricity, offering coastal villages affordable drinking water without carbon emissions.\n\nWhat is the primary purpose of the passage?',
      options: [
        'To criticize the high cost of all drinking water projects',
        'To explain how solar reverse osmosis improves upon fossil-fuel desalination',
        'To warn coastal villages against using reverse osmosis membranes',
        'To describe the chemical structure of seawater minerals',
        'To prove that fossil fuels produce cleaner water than solar energy'
      ],
      answer: 1,
      exp: 'Step 1: The opening "Unlike conventional..." sets up a comparison. Step 2: It explains how the solar membrane system achieves clean, affordable water better than fossil-fuel plants.'
    },
    {
      id: 'lbe7',
      subtes: 'LBE',
      topic: 'Tone of the Passage',
      firstStepTip: 'Check the adjectives and verbs used by the author: are they emotional/alarmist, sarcastic, or objective and analytical?',
      q: 'Recent semiconductor shortages demonstrated how fragile global supply chains can become when chip fabrication is concentrated in just a few geographic hubs. Expanding regional fabrication facilities requires years of capital investment, yet economists note that diversification gradually lowers systemic disruption risks.\n\nHow would you describe the author\'s tone in the passage?',
      options: [
        'Panic-stricken and hopeless',
        'Humorous and playful',
        'Objective and analytical',
        'Angry and accusatory',
        'Indifferent and dismissive'
      ],
      answer: 2,
      exp: 'Step 1: The passage presents factual observations ("demonstrated", "requires years", "economists note") without emotional exaggeration. Step 2: This balanced phrasing reflects an objective and analytical tone.'
    },
    {
      id: 'lbe8',
      subtes: 'LBE',
      topic: 'Detailed Factual Question',
      firstStepTip: 'Scan directly for keywords from the question stem ("heat islands", "reflective") inside the short text.',
      q: 'Dense cities often experience "urban heat islands," where dark asphalt roads absorb sunlight and elevate nighttime temperatures by up to 4 degrees Celsius. Coating roofs with reflective white paint and planting street trees can substantially cool neighborhoods while lowering air-conditioning demand.\n\nAccording to the passage, what causes urban heat islands?',
      options: [
        'Excessive planting of street trees in dense cities',
        'Reflective white paint on residential rooftops',
        'Dark asphalt surfaces absorbing solar heat',
        'Low demand for nighttime air conditioning',
        'Cold coastal winds entering city streets'
      ],
      answer: 2,
      exp: 'Step 1: Locate "urban heat islands" in sentence 1. Step 2: It directly states that "dark asphalt roads absorb sunlight and elevate nighttime temperatures."'
    },
    {
      id: 'lbe9',
      subtes: 'LBE',
      topic: 'Transition & Logical Link',
      firstStepTip: 'Read the clauses before and after the blank: check if they express cause-effect, contrast, or addition.',
      q: 'Battery recycling plants recover valuable cobalt and lithium from retired electric vehicles. _____, recycling reduces the environmental damage associated with mining virgin raw materials.\n\nWhich connector best fits the blank?',
      options: ['However', 'In contrast', 'Furthermore', 'Otherwise', 'Nevertheless'],
      answer: 2,
      exp: 'Step 1: Clause 1 lists one benefit (recovering valuable metals), and Clause 2 adds a second benefit (reducing mining damage). Step 2: An additive transition like "Furthermore" connects two supporting benefits smoothly.'
    },
    {
      id: 'lbe10',
      subtes: 'LBE',
      topic: 'Best Summary Title',
      firstStepTip: 'Choose an option that covers BOTH halves of the paragraph rather than one narrow detail.',
      q: 'Open-source hardware platforms allow engineering students to inspect circuit schematics freely and modify microcontroller code for custom prototypes. Meanwhile, active online communities accelerate troubleshooting by sharing tested designs across borders.\n\nWhich title best summarizes the passage?',
      options: [
        'Why Commercial Hardware Patents Should Be Eliminated',
        'Collaborative Benefits of Open-Source Hardware Platforms',
        'The History of First-Generation Microcontrollers',
        'Security Flaws in Online Engineering Forums',
        'How to Solder Circuit Boards at Home'
      ],
      answer: 1,
      exp: 'Step 1: Sentence 1 highlights open hardware access for students, and Sentence 2 highlights community sharing. Step 2: "Collaborative Benefits of Open-Source Hardware Platforms" covers both points cleanly.'
    },

    // ==================== LBI (10 soal) ====================
    {
      id: 'lbi1',
      subtes: 'LBI',
      topic: 'Gagasan Utama Paragraf',
      firstStepTip: 'Cari kalimat berkonjungsi penyimpul seperti "Oleh karena itu..." di akhir paragraf karena sering memuat gagasan utama deduktif-induktif.',
      q: 'Pemanfaatan pembangkit listrik tenaga surya (PLTS) atap di Indonesia terus tumbuh, namun integrasinya ke jaringan listrik nasional masih menghadapi tantangan fluktuasi cuaca. Oleh karena itu, pengembangan sistem penyimpanan energi berbasis baterai (BESS) menjadi kunci untuk menjaga kestabilan pasokan daya listrik di jam beban puncak.\n\nGagasan utama paragraf tersebut adalah ....',
      options: [
        'Harga panel surya atap masih terlalu mahal bagi rumah tangga',
        'BESS diperlukan untuk menjaga kestabilan pasokan listrik dari PLTS atap',
        'Cuaca di Indonesia tidak mendukung operasional PLTS sama sekali',
        'Beban puncak listrik hanya terjadi pada siang hari yang cerah',
        'Jaringan listrik nasional harus diputus dari PLTS atap'
      ],
      answer: 1,
      exp: 'Langkah 1: Kalimat pertama menjelaskan masalah fluktuasi PLTS atap. Langkah 2: Kalimat simpulan ("Oleh karena itu...") menegaskan peran kunci BESS untuk menstabilkan pasokan listriknya.'
    },
    {
      id: 'lbi2',
      subtes: 'LBI',
      topic: 'Simpulan Bacaan',
      firstStepTip: 'Pastikan simpulan merangkum DUA unsur utama bacaan (membaca aktif DAN perlunya jeda istirahat), jangan hanya mengambil satu sisi.',
      q: 'Membaca aktif dengan membuat catatan ringkas terbukti meningkatkan retensi memori jangka panjang hingga dua kali lipat dibandingkan membaca pasif berulang-ulang. Namun, teknik ini tetap membutuhkan jeda istirahat berkala agar otak memiliki waktu untuk mengonsolidasikan informasi baru.\n\nSimpulan yang paling tepat berdasarkan bacaan tersebut adalah ....',
      options: [
        'Membaca pasif tanpa henti lebih efektif untuk ujian UTBK',
        'Catatan ringkas tidak berguna jika dibaca lebih dari satu kali',
        'Kombinasi membaca aktif dengan jeda istirahat berkala mendukung penguatan memori',
        'Istirahat berkala menggantikan kebutuhan untuk membaca materi',
        'Otak manusia hanya mampu mengingat informasi selama dua jam'
      ],
      answer: 2,
      exp: 'Langkah 1: Bacaan menekankan efektivitas membaca aktif sekaligus syarat jeda istirahat berkala. Langkah 2: Pilihan C menggabungkan kedua poin tersebut secara utuh.'
    },
    {
      id: 'lbi3',
      subtes: 'LBI',
      topic: 'Pernyataan Sesuai Teks',
      firstStepTip: 'Cocokkan langsung kata kunci pertanyaan ("cara VFD meningkatkan efisiensi") dengan frase harfiah di dalam paragraf.',
      q: 'Pada era transisi energi, efisiensi motor listrik industri dapat ditingkatkan melalui penggunaan Variable Frequency Drive (VFD) yang mengatur kecepatan putar motor sesuai kebutuhan beban aktual, bukan menjalankannya terus-menerus pada kecepatan maksimum.\n\nBerdasarkan teks, bagaimana cara VFD meningkatkan efisiensi motor listrik?',
      options: [
        'Mematikan motor listrik sepenuhnya saat beban meningkat',
        'Menjalankan motor listrik secara konstan pada putaran maksimum',
        'Menyesuaikan kecepatan putar motor dengan kebutuhan beban aktual',
        'Mengubah sumber energi motor listrik menjadi bahan bakar fosil',
        'Menghilangkan kebutuhan arus listrik pada sistem industri'
      ],
      answer: 2,
      exp: 'Langkah 1: Teks secara eksplisit menyebut VFD "mengatur kecepatan putar motor sesuai kebutuhan beban aktual". Langkah 2: Pilihan C adalah parafrasa langsung dari kalimat tersebut.'
    },
    {
      id: 'lbi4',
      subtes: 'LBI',
      topic: 'Makna Istilah Teknis Konteks',
      firstStepTip: 'Baca frasa penjelas yang berada tepat sebelum atau sesudah istilah bercetak/berhuruf kapital tersebut.',
      q: 'Indonesia mendorong hilirisasi industri baterai kendaraan listrik berjenis Lithium Ferro Phosphate (LFP) karena materialnya memiliki STABILITAS TERMAL lebih baik dan biaya produksi lebih ekonomis dibandingkan nikel kobalt.\n\nFrasa "stabilitas termal" pada bacaan bermakna ....',
      options: [
        'Kemampuan baterai terisi penuh dalam satu detik',
        'Ketahanan baterai mempertahankan kondisi aman terhadap kenaikan suhu panas',
        'Bobot baterai yang sangat ringan untuk pesawat terbang',
        'Warna lapisan pelindung pada sel baterai litium',
        'Harga jual baterai di pasar ekspor luar negeri'
      ],
      answer: 1,
      exp: 'Langkah 1: Kata "stabilitas" berarti kestabilan/ketahanan dan "termal" berkaitan dengan panas/suhu. Langkah 2: Dalam konteks baterai, artinya ketahanan tetap aman terhadap perubahan suhu panas.'
    },
    {
      id: 'lbi5',
      subtes: 'LBI',
      topic: 'Kalimat Utama Deduktif',
      firstStepTip: 'Perhatikan kalimat pertama: jika kalimat kedua dan ketiga berfungsi merinci atau memberi contohnya, maka paragrafnya bersifat deduktif.',
      q: '(1) Transmisi listrik jarak jauh bertegangan tinggi arus searah (HVDC) semakin dipilih untuk menghubungkan pembangkit antarpulau. (2) Teknologi ini mampu menekan rugi daya saluran hingga puluhan persen dibandingkan sistem arus bolak-balik konvensional. (3) Selain itu, kabel bawah laut HVDC membutuhkan lebar koridor ruang yang lebih ringkas.\n\nKalimat utama paragraf di atas terdapat pada kalimat nomor ....',
      options: ['(1)', '(2)', '(3)', '(1) dan (3)', 'Tidak ada kalimat utama'],
      answer: 0,
      exp: 'Langkah 1: Kalimat (1) menyampaikan pernyataan umum tentang dipilihnya HVDC antarpulau. Langkah 2: Kalimat (2) dan (3) menjelaskan alasan spesifik ("Teknologi ini...", "Selain itu..."), sehingga kalimat utama ada di (1).'
    },
    {
      id: 'lbi6',
      subtes: 'LBI',
      topic: 'Sikap / Keberpihakan Penulis',
      firstStepTip: 'Amati apakah penulis hanya memaparkan fakta netral, menolak mentah-mentah, atau mendukung dengan syarat/catatan kritis.',
      q: 'Digitalisasi modul ajar memungkinkan siswa dari daerah terpencil mengakses bank soal tryout secara merata. Meski demikian, pemerintah tetap perlu memastikan kesiapan infrastruktur listrik dan perangkat ramah anggaran agar kesenjangan belajar tidak melebar.\n\nBagaimana sikap penulis dalam teks tersebut?',
      options: [
        'Menolak keras program digitalisasi pendidikan di Indonesia',
        'Pesimistis bahwa siswa daerah terpencil mampu menggunakan aplikasi',
        'Mendukung digitalisasi disertai catatan perlunya pemerataan infrastruktur',
        'Menganggap kualitas modul cetak jauh lebih buruk daripada video',
        'Netral tanpa memberikan rekomendasi apa pun'
      ],
      answer: 2,
      exp: 'Langkah 1: Penulis mengakui manfaat positif digitalisasi di kalimat pertama. Langkah 2: Penulis menambahkan saran konstruktif lewat "Meski demikian, pemerintah tetap perlu...", menunjukkan dukungan bersyarat.'
    },
    {
      id: 'lbi7',
      subtes: 'LBI',
      topic: 'Tujuan Penulis',
      firstStepTip: 'Periksa fungsi teks: apakah untuk membujuk pembaca, melarang, memaparkan sebab-akibat, atau membandingkan dua metode.',
      q: 'Berbeda dari sistem lampu penerangan konvensional, lampu jalan pintar berbasis sensor cahaya otomatis meredup pada jam lalu lintas sepi sehingga menghemat konsumsi daya kota hingga 35 persen tanpa mengurangi keamanan pengendara.\n\nTujuan penulis menyajikan paragraf tersebut adalah ....',
      options: [
        'Melarang penggunaan lampu penerangan jalan pada malam hari',
        'Menjelaskan keunggulan penghematan energi lampu jalan pintar bersensor',
        'Memprotes tingginya tarif listrik penerangan di wilayah perkotaan',
        'Mengkritik pengendara yang melintas di jalanan sepi pada malam hari',
        'Membandingkan merek-merek lampu LED komersial di pasaran'
      ],
      answer: 1,
      exp: 'Langkah 1: Teks menyorot mekanisme kerja sensor cahaya lampu jalan pintar dan dampaknya (hemat 35% energi). Langkah 2: Jadi tujuannya menjelaskan keunggulan penghematan sistem tersebut.'
    },
    {
      id: 'lbi8',
      subtes: 'LBI',
      topic: 'Pernyataan Tidak Sesuai Teks',
      firstStepTip: 'Baca setiap opsi lalu verifikasi satu per satu dengan fakta teks—cari yang membalik makna atau memalsukan angka/klaim.',
      q: 'Kereta rel listrik (KRL) komuter mampu mengangkut lebih dari seribu penumpang dalam sekali jalan dengan emisi karbon per penumpang yang jauh lebih rendah daripada kendaraan pribadi berbahan bakar bensin. Namun, daya tariknya bergantung pada ketepatan jadwal dan kemudahan integrasi antarmoda.\n\nPernyataan yang TIDAK SESUAI dengan isi bacaan adalah ....',
      options: [
        'KRL dapat membawa lebih dari seribu penumpang sekali perjalanan',
        'Emisi karbon KRL per penumpang lebih rendah daripada mobil bensin pribadi',
        'Ketepatan jadwal memengaruhi minat masyarakat memakai KRL',
        'Integrasi antarmoda berperan mendukung daya tarik transportasi rel',
        'Penumpang langsung berpindah ke KRL meskipun jadwalnya selalu terlambat'
      ],
      answer: 4,
      exp: 'Langkah 1: Teks menegaskan daya tarik KRL bergantung pada ketepatan jadwal. Langkah 2: Klaim pada opsi E bahwa penumpang langsung pindah "meskipun selalu terlambat" bertentangan langsung dengan teks.'
    },
    {
      id: 'lbi9',
      subtes: 'LBI',
      topic: 'Hubungan Sebab-Akibat Paragraf',
      firstStepTip: 'Identifikasi kata penanda kausal seperti "mengakibatkan", "memicu", atau "akibatnya" lalu urutkan A -> B -> C.',
      q: 'Pemasangan kapasitor bank pada jaringan listrik pabrik bertujuan memperbaiki faktor daya yang terlalu rendah akibat banyaknya motor induksi. Perbaikan faktor daya ini menurunkan arus reaktif pada kabel sehingga rugi panas berlebih dapat dicegah.\n\nBerdasarkan teks, apa akibat langsung dari menurunnya arus reaktif pada kabel?',
      options: [
        'Seluruh motor induksi pabrik harus diganti dengan genset',
        'Faktor daya jaringan pabrik turun menjadi nol',
        'Rugi panas berlebih pada kabel dapat dicegah',
        'Pemasangan kapasitor bank dihentikan secara permanen',
        'Tagihan beban puncak pabrik meningkat dua kali lipat'
      ],
      answer: 2,
      exp: 'Langkah 1: Lihat bagian akhir kalimat kedua: "menurunkan arus reaktif pada kabel SEHINGGA rugi panas berlebih dapat dicegah". Langkah 2: Jawaban tepat ada pada opsi C.'
    },
    {
      id: 'lbi10',
      subtes: 'LBI',
      topic: 'Prediksi Dampak Logis',
      firstStepTip: 'Tarik kesimpulan lanjutan yang masih berada dalam koridor topik paragraf tanpa mengarang asumsi di luar teks.',
      q: 'Penggunaan sistem manajemen baterai (BMS) canggih menjaga suhu dan tegangan tiap sel agar tetap seimbang selama pengisian cepat berlangsung. Tanpa pengawasan BMS, pengisian daya berarus besar berisiko memicu penumpukan panas tidak merata yang mempercepat degradasi sel.\n\nJika sebuah paket baterai pengisian cepat dirancang tanpa BMS, dampak yang paling mungkin terjadi adalah ....',
      options: [
        'Kapasitas baterai berlipat ganda secara otomatis',
        'Suhu dan tegangan setiap sel menjadi sangat seragam',
        'Terjadi pemanasan tidak merata yang mempercepat kerusakan sel baterai',
        'Waktu pengisian cepat berkurang hingga nol detik',
        'Baterai tidak lagi memerlukan kabel pengisi daya'
      ],
      answer: 2,
      exp: 'Langkah 1: Kalimat kedua langsung menjelaskan skenario "Tanpa pengawasan BMS". Langkah 2: Risikonya adalah penumpukan panas tidak merata dan percepatan degradasi (kerusakan) sel baterai.'
    },

    // ==================== PPU (10 soal) ====================
    {
      id: 'ppu1',
      subtes: 'PPU',
      topic: 'Makna Imbuhan ke-an',
      firstStepTip: 'Uji makna setiap kata berimbuhan ke-an dengan menggantinya menjadi frasa "hal/keadaan ...", "terkena ...", atau "terlalu ...".',
      q: 'Imbuhan ke-an yang bermakna "hal atau keadaan yang bersifat" terdapat pada kalimat ....',
      options: [
        'Rumah itu kemasukan air saat hujan deras semalam.',
        'Ketinggian menara transmisi itu mencapai 40 meter.',
        'Adik kehujanan dalam perjalanan pulang dari sekolah.',
        'Baju seragamnya kebesaran karena salah memilih ukuran.',
        'Dompetnya ketinggalan di atas meja laboratorium.'
      ],
      answer: 1,
      exp: 'Langkah 1: Uji tiap kata. "Ketinggian" berarti hal atau keadaan tinggi (ukuran tinggi). Langkah 2: "Kemasukan" dan "kehujanan" bermakna terkena; "kebesaran" bermakna terlalu besar; "ketinggalan" bermakna tertinggal tak sengaja.'
    },
    {
      id: 'ppu2',
      subtes: 'PPU',
      topic: 'Kalimat Efektif (Subjek-Predikat)',
      firstStepTip: 'Coret kalimat yang diawali preposisi ("Bagi...", "Di dalam...") lalu berpredikat pasif/aktif tanpa subjek, serta hindari pleonasme dan konjungsi ganda.',
      q: 'Manakah kalimat berikut yang paling efektif dan baku sesuai EYD V?',
      options: [
        'Para siswa-siswa gap year sedang berlatih soal kuantitatif di perpustakaan.',
        'Meskipun lelah, tetapi ia tetap menyelesaikan target belajar hariannya.',
        'Bagi seluruh peserta tryout diharapkan membawa alat tulis sendiri.',
        'Peserta UTBK yang menargetkan STEI-R ITB harus menguasai penalaran matematika.',
        'Di dalam modul ini membahas tentang strategi mengerjakan soal literasi.'
      ],
      answer: 3,
      exp: 'Langkah 1: Cek kesalahan tiap opsi: A pleonasme ("Para siswa-siswa"), B konjungsi ganda ("Meskipun... tetapi"), C & E tidak punya subjek karena diawali preposisi "Bagi" dan "Di dalam". Langkah 2: Pilihan D memiliki subjek dan predikat jelas dan efektif.'
    },
    {
      id: 'ppu3',
      subtes: 'PPU',
      topic: 'Makna Imbuhan Pe-an (Proses vs Tempat)',
      firstStepTip: 'Bedakan kata pe-an yang menyatakan PROSES/CARA melakukan tindakan dengan kata yang menyatakan TEMPAT atau HASIL.',
      q: 'Kata berimbuhan pe-an yang bermakna "tempat" terdapat pada kalimat ....',
      options: [
        'Pemasangan panel surya di atap bengkel selesai lebih cepat.',
        'Pengukuran tegangan listrik menggunakan voltmeter digital sangat akurat.',
        'Peleburan tembaga dilakukan di dalam ruang tungku khusus.',
        'Kawasan pemukiman di dekat gardu induk tertata cukup rapi.',
        'Penjelasan guru tentang hukum Ohm mudah dipahami.'
      ],
      answer: 3,
      exp: 'Langkah 1: Cek arti tiap kata pe-an: "pemasangan", "pengukuran", "peleburan", dan "penjelasan" merujuk pada proses/perbuatan. Langkah 2: "Pemukiman" dalam "kawasan pemukiman" merujuk pada tempat bermukim (opsi D).'
    },
    {
      id: 'ppu4',
      subtes: 'PPU',
      topic: 'Bentuk & Hubungan Makna Kata (Asosiasi)',
      firstStepTip: 'Tentukan hubungan logis pasangan kata pertama (alat-fungsi, bahan-produk, besaran-satuan) lalu terapkan relasi identik ke pasangan kedua.',
      q: 'Ohmmeter : Hambatan listrik = .... : ....',
      options: [
        'Thermometer : Panas matahari',
        'Amperemeter : Arus listrik',
        'Baterai : Kabel tembaga',
        'Generator : Sakelar dinding',
        'Watt : Tegangan listrik'
      ],
      answer: 1,
      exp: 'Langkah 1: Hubungan kata pertama adalah "Alat ukur : Besaran yang diukur" (Ohmmeter mengukur hambatan listrik). Langkah 2: Pasangan yang identik dan benar secara fisika adalah Amperemeter mengukur arus listrik.'
    },
    {
      id: 'ppu5',
      subtes: 'PPU',
      topic: 'Pola Frasa Endosentris Sejajar',
      firstStepTip: 'Bandingkan jenis kelas kata penyusun frasanya (misal: Kata Benda + Kata Sifat) agar polanya identik.',
      q: 'Frasa yang memiliki pola pembentukan (Inti + Pewatas kata sifat) yang sama dengan frasa "arus kuat" adalah ....',
      options: [
        'Membaca buku',
        'Kabel tembaga',
        'Tegangan tinggi',
        'Di ruang kelas',
        'Sangat cepat'
      ],
      answer: 2,
      exp: 'Langkah 1: "Arus kuat" terdiri dari Nomina (arus) + Adjektiva (kuat). Langkah 2: Cek opsi: "Tegangan tinggi" juga tersusun dari Nomina (tegangan) + Adjektiva (tinggi), sedangkan "kabel tembaga" adalah Nomina + Nomina.'
    },
    {
      id: 'ppu6',
      subtes: 'PPU',
      topic: 'Kata Bermakna Konotatif',
      firstStepTip: 'Bedakan makna leksikal sebenarnya (denotasi) dengan makna kiasan/emosional (konotasi) yang tidak diartikan secara fisik.',
      q: 'Kalimat yang menggunakan kata bermakna KONOTATIF (kiasan) adalah ....',
      options: [
        'Teknisi memutus jalur kabel utama sebelum mengganti sakelar.',
        'Lampu indikator merah menyala saat baterai hampir habis.',
        'Ia menjadi tulang punggung keluarga setelah lulus dari SMK.',
        'Meja kerja praktikum terbuat dari kayu jati yang tebal.',
        'Siswa kelas XII mengikuti simulasi ujian di aula sekolah.'
      ],
      answer: 2,
      exp: 'Langkah 1: "Tulang punggung" pada kalimat C bukan bermakna tulang anatomi fisik, melainkan kiasan untuk penopang ekonomi keluarga. Langkah 2: Opsi lain seluruhnya bermakna lugas (denotasi).'
    },
    {
      id: 'ppu7',
      subtes: 'PPU',
      topic: 'Kalimat Inti (Pola S-P-O)',
      firstStepTip: 'Buang seluruh keterangan waktu/tempat serta perluasan anak kalimat ("yang...") untuk menemukan inti Subjek dan Predikat.',
      q: 'Kalimat inti dari "Peserta gap year lulusan SMK yang tekun berlatih soal setiap pagi berhasil meraih skor tinggi pada tryout kemarin" adalah ....',
      options: [
        'Lulusan SMK berlatih soal setiap pagi',
        'Peserta gap year berhasil meraih skor tinggi',
        'Soal setiap pagi meraih skor tinggi',
        'Tryout kemarin berhasil diraih peserta',
        'Peserta yang tekun berlatih di pagi hari'
      ],
      answer: 1,
      exp: 'Langkah 1: Inti Subjek = "Peserta gap year" (buang pewatas "lulusan SMK yang tekun..."). Langkah 2: Inti Predikat + Objek = "berhasil meraih skor tinggi" (buang keterangan "pada tryout kemarin").'
    },
    {
      id: 'ppu8',
      subtes: 'PPU',
      topic: 'Sinonim Kontekstual',
      firstStepTip: 'Substitusikan setiap opsi pengganti ke dalam kalimat soal untuk menguji apakah rasa bahasa dan maksud ilmiahnya tetap pas.',
      q: 'Dalam kalimat "Peningkatan kapasitas penyimpanan baterai masih menjadi kendala KRUSIAL dalam pengembangan kendaraan listrik jarak jauh", kata "krusial" dapat digantikan paling tepat oleh kata ....',
      options: ['sepele', 'penting', 'sementara', 'tersembunyi', 'lambat'],
      answer: 1,
      exp: 'Langkah 1: Menurut KBBI, "krusial" berarti gawat, genting, atau sangat penting dalam menentukan penyelesaian masalah. Langkah 2: Kata yang paling padan dalam konteks kalimat ini adalah "penting".'
    },
    {
      id: 'ppu9',
      subtes: 'PPU',
      topic: 'Kalimat Berpola Sama (S-P-O-K)',
      firstStepTip: 'Identifikasi struktur S, P, O, dan K pada kalimat soal terlebih dahulu (perhatikan apakah kata kerja berimbuhan me- butuh objek).',
      q: 'Kalimat manakah yang memiliki pola dasar S - P - O - K yang sama dengan kalimat "Adam menyelesaikan sepuluh soal kuantitatif dalam lima belas menit"?',
      options: [
        'Buku rumus cepat itu tersimpan rapi di laci meja.',
        'Teknisi listrik memasang panel surya di atap sekolah.',
        'Rangkaian paralel memiliki beberapa cabang jalur arus.',
        'Suara alarm Pomodoro berbunyi sangat nyaring pagi ini.',
        'Mahasiswa teknik elektro sedang berdiskusi di laboratorium.'
      ],
      answer: 1,
      exp: 'Langkah 1: Pola soal: Adam (S) / menyelesaikan (P) / sepuluh soal kuantitatif (O) / dalam lima belas menit (K). Langkah 2: Opsi B identik: Teknisi listrik (S) / memasang (P) / panel surya (O) / di atap sekolah (K).'
    },
    {
      id: 'ppu10',
      subtes: 'PPU',
      topic: 'Makna Gramatikal Kalimat Pasif/Aktif',
      firstStepTip: 'Periksa perubahan peran pelaku dan sasaran saat membalik kalimat aktif berimbuhan me- menjadi pasif berimbuhan di-.',
      q: 'Kalimat manakah yang menggunakan kata bermakna "mengakibatkan atau membuat jadi" pada imbuhan me-kan?',
      options: [
        'Ia meminjamkan multimeter cadangannya kepada teman sekelompok.',
        'Latihan rutin setiap hari meningkatkan ketelitian Adam dalam berhitung.',
        'Petugas menaikkan tangga ke atas atap gudang.',
        'Siswa menyerahkan lembar jawaban kepada pengawas ruang.',
        'Mereka membacakan pengumuman hasil tryout di depan kelas.'
      ],
      answer: 1,
      exp: 'Langkah 1: Kata "meningkatkan" berarti membuat jadi meningkat/lebih tinggi (kausatif). Langkah 2: Pada opsi lain, "meminjamkan", "menyerahkan", dan "membacakan" bermakna melakukan perbuatan untuk orang lain atau memindahkan benda.'
    },

    // ==================== PBM (10 soal) ====================
    {
      id: 'pbm1',
      subtes: 'PBM',
      topic: 'Kata Baku KBBI',
      firstStepTip: 'Cari minimal satu kata yang jelas tidak baku di tiap opsi (misalnya sistim, praktek, atlit, kwalitas) untuk eliminasi cepat dalam 10 detik!',
      q: 'Penulisan kata yang seluruhnya BAKU menurut KBBI dan EYD V terdapat pada pilihan ....',
      options: [
        'analisis, sistim, resiko',
        'hipotesis, teknik, efektivitas',
        'praktek, jadual, aktifitas',
        'kwalitas, apotik, diagnosa',
        'atlit, nasehat, ijasah'
      ],
      answer: 1,
      exp: 'Langkah 1: Cek tiap opsi: A salah pada sistim (sistem) dan resiko (risiko); C salah pada praktek (praktik), jadual (jadwal), aktifitas (aktivitas); D salah semuanya (kualitas, apotek, diagnosis); E salah semuanya (atlet, nasihat, ijazah). Langkah 2: Hanya B (hipotesis, teknik, efektivitas) yang seluruhnya baku.'
    },
    {
      id: 'pbm2',
      subtes: 'PBM',
      topic: 'Penggunaan Tanda Koma (EYD V)',
      firstStepTip: 'Ingat kaidah emas EYD V: anak kalimat di depan induk kalimat WAJIB dipisahkan tanda koma, sedangkan di belakang induk kalimat tidak perlu koma!',
      q: 'Penggunaan tanda koma yang TEPAT sesuai kaidah EYD V terdapat pada kalimat ....',
      options: [
        'Oleh karena itu kita harus menyusun jadwal belajar yang konsisten.',
        'Ia tidak masuk kelas hari ini, karena sedang mengikuti simulasi UTBK.',
        'Meskipun soalnya menantang, Andi berhasil menyelesaikannya tepat waktu.',
        'Buku ini membahas aljabar, geometri dan trigonometri dasar.',
        'Menurut pakar pendidikan belajar rutin lebih baik, daripada sistem kebut.'
      ],
      answer: 2,
      exp: 'Langkah 1: Pada opsi C, anak kalimat "Meskipun soalnya menantang" mendahului induk kalimat sehingga tanda koma wajib dipakai. Langkah 2: Opsi A kurang koma setelah "Oleh karena itu"; B salah koma sebelum "karena"; D kurang koma serial sebelum "dan"; E koma salah posisi.'
    },
    {
      id: 'pbm3',
      subtes: 'PBM',
      topic: 'Pemakaian Huruf Kapital (EYD V)',
      firstStepTip: 'Nama geografi ditulis kapital jika diikuti nama tempat spesifik, tetapi tetap huruf kecil jika hanya merujuk jenis benda (seperti gula jawa, jeruk bali).',
      q: 'Penulisan huruf kapital yang BENAR sesuai kaidah EYD V terdapat pada kalimat ....',
      options: [
        'Setelah lulus dari smk, ia ingin melanjutkan kuliah di Institut teknologi Bandung.',
        'Setiap hari Senin, Adam belajar Penalaran Kuantitatif di kamar.',
        'Ayah membeli Kunci Inggris dan Gergaji Listrik di toko bangunan.',
        'Mereka menyeberangi selat sunda untuk mengikuti lomba robotika nasional.',
        'Kita harus menguasai Bahasa inggris sebelum kuliah teknik elektro.'
      ],
      answer: 1,
      exp: 'Langkah 1: Nama hari ("Senin"), nama orang ("Adam"), dan nama bidang tes resmi tertentu ditulis kapital di huruf awal, sedangkan benda umum tidak. Langkah 2: Opsi A salah pada smk/teknologi; C salah kapital pada Kunci Inggris & Gergaji Listrik; D salah kecil pada selat sunda; E salah kecil pada inggris.'
    },
    {
      id: 'pbm4',
      subtes: 'PBM',
      topic: 'Penulisan Di- (Preposisi vs Imbuhan)',
      firstStepTip: 'Uji dengan aturan simpel: jika bisa diganti menjadi "ke ..." atau "dari ..." (menunjukkan tempat), maka "di" WAJIB dipisah. Jika bentuk pasif (bisa diubah ke "me-"), maka digabung!',
      q: 'Penulisan kata depan "di" dan awalan "di-" yang seluruhnya BENAR terdapat pada kalimat ....',
      options: [
        'Modul fisika listrik itu diletakkan diatas meja belajar.',
        'Kabel ground harus di pasang disisi luar panel kontrol.',
        'Data hasil latihan disimpan di dalam folder komputer secara otomatis.',
        'Peserta ujian di wajibkan hadir di gedung aula tepat waktu.',
        'Skema rangkaian elektronika digambar di kertas atau dipapan tulis.'
      ],
      answer: 2,
      exp: 'Langkah 1: Pada opsi C, "disimpan" adalah kata kerja pasif (digabung) dan "di dalam" adalah kata depan penunjuk tempat (dipisah). Langkah 2: Pilihan lain salah pada "diatas", "di pasang/disisi", "di wajibkan", dan "dipapan".'
    },
    {
      id: 'pbm5',
      subtes: 'PBM',
      topic: 'Konjungsi Antarkalimat vs Intrakalimat',
      firstStepTip: 'Kata "sedangkan", "melainkan", dan "sehingga" adalah konjungsi INTRAKALIMAT (tidak boleh mengawali kalimat baru!). Di awal kalimat gunakan "Oleh karena itu", "Namun", atau "Akan tetapi".',
      q: 'Penggunaan kata hubung (konjungsi) yang TEPAT terdapat pada kalimat ....',
      options: [
        'Ia selalu mengerjakan ulang soal salah. Sehingga pemahamannya makin kuat.',
        'Target kuliahnya adalah STEI-R ITB. Sedangkan pilihan keduanya Teknik Elektro.',
        'Waktu pengerjaan hampir habis. Oleh karena itu, ia langsung memprioritaskan soal mudah.',
        'Meskipun sudah memahami konsep dasar, namun ia tetap rutin berhitung cepat.',
        'Bukan baterai yang rusak, tetapi kabel pengisi dayanya yang terputus.'
      ],
      answer: 2,
      exp: 'Langkah 1: "Oleh karena itu," adalah konjungsi antarkalimat yang tepat diletakkan di awal kalimat diikuti koma. Langkah 2: A & B salah memakai konjungsi intrakalimat di awal kalimat; D konjungsi ganda; E pasangan korelatifnya harus "bukan ..., melainkan ...".'
    },
    {
      id: 'pbm6',
      subtes: 'PBM',
      topic: 'Penulisan Kata Gabung & Imbuhan',
      firstStepTip: 'Gabungan kata hanya ditulis serangkai jika diberi awalan DAN akhiran sekaligus (seperti "menandatangani"), tetapi tetap terpisah jika hanya mendapat salah satu ("tanda tangani", "beri tahu").',
      q: 'Penulisan gabungan kata yang SESUAI dengan EYD V terdapat pada kalimat ....',
      options: [
        'Seluruh teknisi wajib menanda tangani berita acara pemeriksaan.',
        'Pengawas akan memberitahukan jadwal simulasi melalui papan pengumuman.',
        'Peserta tryout harus bertanggungjawab atas keakuratan data pribadi.',
        'Guru menggarisbawahi rumus penting sebelum menyebar luaskan modul.',
        'Pemerintah berkerja sama dengan perguruan tinggi untuk riset tenaga surya.'
      ],
      answer: 1,
      exp: 'Langkah 1: Kata dasar "beri tahu" mendapat konfiks me-kan sekaligus, sehingga wajib dirangkai menjadi "memberitahukan". Langkah 2: Opsi A harus "menandatangani"; C "bertanggung jawab" (dipisah karena hanya ber-); D "menyebarluaskan"; E "bekerja sama".'
    },
    {
      id: 'pbm7',
      subtes: 'PBM',
      topic: 'Penulisan Partikel Pun',
      firstStepTip: 'Partikel "pun" pada kata hubung yang sudah padu (meskipun, walaupun, adapun, bagaimanapun) ditulis SERANGKAI; jika bermakna "juga" atau "saja" ditulis TERPISAH ("apa pun", "satu kali pun").',
      q: 'Penulisan partikel "pun" yang TEPAT terdapat pada kalimat ....',
      options: [
        'Siapapun peserta ujian wajib membawa kartu identitas asli.',
        'Walaupun hujan deras, ia tetap hadir mengikuti kelas pembahasan.',
        'Tidak satu kalipun ia melewatkan target belajar harian.',
        'Apa pun rintangannya, meskipun berat, tetap harus diatasi.',
        'Dari pagi sampai malam, adik pun belum menyentuh buku catatannya sama sekali maupun membuka aplikasi.'
      ],
      answer: 1,
      exp: 'Langkah 1: Kata hubung "Walaupun" menulis "pun" secara serangkai dengan tepat. Langkah 2: Opsi A seharusnya "Siapa pun"; C seharusnya "satu kali pun"; D dan E salah konteks/rancangan meskipun ada partikel.'
    },
    {
      id: 'pbm8',
      subtes: 'PBM',
      topic: 'Pemakaian Tanda Titik Dua (:)',
      firstStepTip: 'Tanda titik dua dipakai di akhir pernyataan lengkap yang diikuti perincian, tetapi TIDAK dipakai jika perinciannya merupakan objek langsung sesudah kata kerja.',
      q: 'Penggunaan tanda titik dua (:) yang BENAR sesuai kaidah EYD V terdapat pada kalimat ....',
      options: [
        'Adam membeli: penggaris, jangka, dan kalkulator ilmiah.',
        'Alat yang wajib dibawa saat praktikum adalah: obeng, tang, dan tespen.',
        'Kami memerlukan tiga alat ukur listrik: voltmeter, amperemeter, dan ohmmeter.',
        'Subtes yang paling menantang antara lain: PK, PM, dan Penalaran Umum.',
        'Ia hanya meminjam: dua buku bank soal dari perpustakaan.'
      ],
      answer: 2,
      exp: 'Langkah 1: Kalimat "Kami memerlukan tiga alat ukur listrik" sudah berpola lengkap (S-P-O) sebelum perincian, sehingga tanda titik dua tepat. Langkah 2: Opsi A, B, D, E menaruh ":" di tengah antara predikat/kopula dan pelengkap/objeknya, yang dilarang EYD V.'
    },
    {
      id: 'pbm9',
      subtes: 'PBM',
      topic: 'Kepaduan Paragraf (Kalimat Sumbang)',
      firstStepTip: 'Tentukan topik inti di kalimat (1), lalu cari satu kalimat yang melenceng jauh membahas hal lain di luar topik utama.',
      q: '(1) Penerapan timer Pomodoro melatih otak menjaga fokus belajar selama 25 menit penuh. (2) Setelah fokus berakhir, jeda 5 menit membantu mengembalikan kesegaran mental. (3) Pola selang-seling materi berat dan ringan juga mencegah kelelahan kognitif. (4) Harga meja belajar lipat dari kayu jati di toko daring cukup bervariasi. (5) Dengan ritme terjaga, siswa sanggup belajar hingga 6 jam sehari.\n\nKalimat yang mengganggu kepaduan paragraf tersebut adalah nomor ....',
      options: ['(1)', '(2)', '(3)', '(4)', '(5)'],
      answer: 3,
      exp: 'Langkah 1: Kalimat (1), (2), (3), dan (5) seragam membahas manajemen fokus Pomodoro dan ritme belajar. Langkah 2: Kalimat (4) tiba-tiba membahas harga meja belajar kayu jati, sehingga tidak padu.'
    },
    {
      id: 'pbm10',
      subtes: 'PBM',
      topic: 'Penulisan Kata Serapan Baku',
      firstStepTip: 'Ingat pola serapan ilmiah: akhiran -tion menjadi -si, konsonan ganda disederhanakan (kecuali massa), dan ph menjadi f (kecuali kata khusus nonserapan).',
      q: 'Kalimat yang menggunakan seluruh kata serapan secara BAKU adalah ....',
      options: [
        'Frekuensi listrik rumah tangga standar di Indonesia sebesar 50 Hertz.',
        'Konduktifitas kabel tembaga perlu diuji sebelum instalasi gedung.',
        'Otomatisasi sistim kontrol membutuhkan sensor yang presisi.',
        'Analisa rangkaian seri dapat diselesaikan dalam waktu singkat.',
        'Atmosfir laboratorium dijaga tetap kering agar komponen tidak korosi.'
      ],
      answer: 0,
      exp: 'Langkah 1: Kata "frekuensi" dan "standar" (bukan standard) pada opsi A sudah baku KBBI. Langkah 2: Kesalahan di opsi lain: konduktifitas (seharusnya konduktivitas), sistim (sistem), analisa (analisis), atmosfir (atmosfer).'
    }
  ];

  global.HudData = {
    SUBTESTS,
    SUBTEST_ORDER,
    FORMULAS,
    QUIZ_BANK
  };
})(window);
