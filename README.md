# WedSnap — Disposable Wedding Camera & Shared Keepsake WebApp

> **Aesthetic Luxury Wedding Disposable Camera Web Application**  
> Didesain dengan tema **Atelier Nuptial** dari Google Stitch, diimplementasikan menggunakan **React 18**, **TypeScript**, **Tailwind CSS**, dan **Vite**.

---

## 📷 Tentang Proyek

**WedSnap** adalah aplikasi kamera sekali pakai digital (*disposable camera*) untuk pesta pernikahan. Para tamu dapat mengambil foto momen candid spontan langsung melalui browser smartphone tanpa perlu mengunduh aplikasi, kemudian foto otomatis tersinkronisasi ke galeri bersama dan dashboard pengantin.

### ✨ Fitur Utama:

1. **Kamera Tamu (Disposable Camera Viewfinder)**:
   - Integrasi nyata Browser Camera API (`navigator.mediaDevices.getUserMedia`).
   - Frame rasio 4:5 dengan crosshair emas, framing ticks, dan tanggal analog *vintage* (`'25 10 24`).
   - Tombol Shutter ganda dengan audio shutter klik analog via Web Audio API, haptic feedback ponsel, dan flash layar.
   - Indikator rol film mekanik analog (hitungan sisa 18 / 36 foto) dengan roda dial bergetar.
   - Pilihan Flash (`AUTO`, `ON`, `OFF`) dan tombol Flip Kamera (lensa depan & belakang).
   - Strip pratinjau 3 foto terakhir dengan status sinkronisasi (*Tersimpan*, *Unggah...*, *Koneksi lemah* + tombol *Coba Lagi*).

2. **Review Rol Film Tamu**:
   - Indikator kapasitas film analog & *sprocket holes* estetika Kodak Portra 400.
   - Filter tab: *Semua Foto* vs *Gagal Unggah*.
   - Grid polaroid dengan badge status upload awan.
   - Modal Zoom Polaroid resolusi tinggi dengan opsi *Hapus Foto* dari rol.
   - Formulir doa & pesan ke pengantin bergaya letterpress dengan penghitung karakter dinamis dan tombol inspirasi cepat.
   - Tombol *Selesaikan Sesi & Bagikan Ucapan* dengan efek konfeti perayaan.

3. **Galeri Bersama (Live Shared Album)**:
   - Header privat terproteksi PIN.
   - Filter kategori momen instan: *Semua Momen*, *Akad / Pemberkatan*, *Resepsi & Dansa*, *Meja Tamu & Candid*, dan *Photobooth*.
   - Indikator *Live Sync Aktif*.
   - Kartu foto interaktif dengan nama pengunggah, meja tamu, tombol *Like* interaktif, dan tombol *Unduh Foto HD*.
   - Floating Action Button (*+ Jepret*) untuk akses instan ke kamera.
   - Dukungan *Empty State* resmi jika kategori foto belum terisi.

4. **Dashboard Pengantin**:
   - Metrik real-time: Foto Terkumpul, Sesi Kamera Tamu Aktif, Tingkat Keberhasilan Unggah, dan Penyimpanan Terpakai (GB/MB).
   - **Tayangkan Slideshow Resepsi**: Mode proyektor layar penuh untuk layar LED venue dengan slide otomatis tiap 4.5 detik.
   - **Unduh Semua Foto (ZIP)**: Generator arsip ZIP nyata menggunakan library `jszip`.
   - **QR Code Meja Tamu**: Kartu QR bergaya monogram floral dengan tombol *Cetak Meja* (`window.print()`) dan *Salin URL*.
   - Feed aktivitas tamu langsung secara berkala.
   - Pengaturan & Moderasi: Kontrol toggle moderasi otomatis, batasan 36 foto/tamu, dan privasi galeri.

5. **Mode Empty State (Aturan #12)**:
   - Toggle switcher di Header dan Dashboard untuk beralih antara *Mode Data Demo* dan *Mode Empty State Murni* agar data demo tidak tersamarkan sebagai data produksi.

---

## 🎨 Desain Sistem: Atelier Nuptial

- **Canvas & Background:** Warm Ivory (`#FBF9F6`)
- **Primary Foil:** Burnished Warm Gold (`#775A19` / `#C5A059`)
- **Secondary Accent:** Champagne (`#735C00` / `#FED65B`)
- **Ink / Typography:** Deep Charcoal (`#1B1C1A`)
- **Tipografi:** *Playfair Display* (Editorial Serif) & *Plus Jakarta Sans* (Humanist Sans)

---

## 🚀 Cara Menjalankan Proyek

### 1. Menggunakan File Peluncur (macOS):
Klik 2 kali file:
```bash
Jalankan_WedSnap.command
```

### 2. Menggunakan Terminal:
```bash
# Instal dependensi
npm install

# Jalankan server development
npm run dev

# Buka http://localhost:3000 di browser
```

### 3. Build untuk Produksi:
```bash
npm run build
```
Hasil build siap disajikan di folder `dist/`.

---

## 📁 Struktur Direktori

```
├── atelier_nuptial/               # Dokumentasi token desain Google Stitch
├── wedsnap_kamera_tamu/           # Desain referensi kamera tamu
├── wedsnap_review_foto_tamu/      # Desain referensi review rol film
├── wedsnap_galeri_bersama/        # Desain referensi galeri bersama
├── wedsnap_dashboard_pengantin/   # Desain referensi dashboard pengantin
├── src/
│   ├── components/                # Komponen reusable (Header, BottomNav, Modals, Toast)
│   ├── context/                   # AppContext (State management, photos, storage)
│   ├── pages/                     # CameraView, ReviewView, GalleryView, DashboardView
│   ├── types/                     # TypeScript types & interfaces
│   ├── utils/                     # Shutter sound generator, seed data
│   ├── App.tsx                    # Komponen utama & router
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Tailwind styles
├── dist/                          # Hasil build statis produksi
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 📜 Lisensi
Dibuat untuk perayaan pernikahan Fajar & Aulia dengan tema **Atelier Nuptial**.

