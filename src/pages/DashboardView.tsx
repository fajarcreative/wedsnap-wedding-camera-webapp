import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import JSZip from 'jszip';

export const DashboardView: React.FC = () => {
  const {
    photos,
    eventSettings,
    updateSettings,
    showToast,
    setIsSlideshowOpen,
    setIsTableQROpen,
    isEmptyStateMode,
    toggleEmptyStateMode,
    guestActivities
  } = useApp();

  const [isZipping, setIsZipping] = useState(false);

  const totalPhotosCount = photos.length;
  const capacityPercent = Math.min(
    100,
    Number(((totalPhotosCount / eventSettings.maxCapacity) * 100).toFixed(1))
  );

  // Storage estimation (~3.8MB per raw high res photo)
  const storageMB = totalPhotosCount * 3.8;
  const storageGB = (storageMB / 1024).toFixed(1);

  // Unique guest sessions count
  const guestSessionsCount = new Set(photos.map((p) => p.author)).size;

  // Real ZIP download handler (Rule #8)
  const handleDownloadAllZip = async () => {
    if (photos.length === 0) {
      showToast('warning', 'Belum ada foto yang tersedia untuk diunduh', 'error');
      return;
    }

    try {
      setIsZipping(true);
      showToast('folder_zip', 'Menyiapkan arsip ZIP seluruh foto pernikahan...');

      const zip = new JSZip();
      const folder = zip.folder(`WedSnap_${eventSettings.coupleNames.replace(/\s+/g, '_')}`);

      // Add readme text
      folder?.file(
        'README.txt',
        `WedSnap Wedding Album\nPasangan: ${eventSettings.coupleNames}\nTanggal: ${eventSettings.date}\nLokasi: ${eventSettings.venue}\nTotal Foto: ${photos.length} item`
      );

      // Download images and pack into ZIP
      const fetchPromises = photos.map(async (photo, index) => {
        try {
          let blob: Blob;
          if (photo.url.startsWith('data:image/')) {
            const res = await fetch(photo.url);
            blob = await res.blob();
          } else {
            // For remote cors images, fetch with mode cors or fallback to canvas blob
            const img = new Image();
            img.crossOrigin = 'anonymous';
            const loaded = new Promise<Blob>((resolve) => {
              img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || 800;
                canvas.height = img.naturalHeight || 1000;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.9);
              };
              img.onerror = () => {
                resolve(new Blob([`Foto ${photo.caption}`], { type: 'text/plain' }));
              };
            });
            img.src = photo.url;
            blob = await loaded;
          }

          const filename = `${String(index + 1).padStart(3, '0')}_${photo.category}_${photo.caption
            .replace(/[^a-zA-Z0-9]/g, '_')
            .slice(0, 25)}.jpg`;
          folder?.file(filename, blob);
        } catch (e) {
          console.warn(`Gagal memuat foto ${photo.id}`, e);
        }
      });

      await Promise.all(fetchPromises);

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(content);
      downloadLink.download = `WedSnap_${eventSettings.coupleNames.replace(/\s+/g, '_')}_Full_Album.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      showToast('check_circle', 'Arsip ZIP berhasil diunduh ke komputer!');
    } catch (err) {
      console.error('ZIP error:', err);
      showToast('error', 'Gagal membuat arsip ZIP', 'error');
    } finally {
      setIsZipping(false);
    }
  };

  const handleShareGuestLink = () => {
    const url = 'https://wedsnap.id/fajar-aulia';
    if (navigator.share) {
      navigator
        .share({
          title: `WedSnap - ${eventSettings.coupleNames} Wedding`,
          text: `Ayo ambil foto momen pernikahan ${eventSettings.coupleNames} bersama kami!`,
          url
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).then(() => {
        showToast('share', 'Tautan kamera tamu siap dibagikan ke WhatsApp!');
      });
    }
  };

  return (
    <div className="flex flex-col w-full px-gutter pb-16 space-y-space-lg max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto">
      {/* Prototype / Production Disclaimer Banner (Rule #12) */}
      <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-xs rounded-xl border border-outline-variant/30">
        <div className="flex items-center gap-space-xs min-w-0">
          <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">
            {isEmptyStateMode ? 'folder_open' : 'info'}
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant truncate text-xs">
            {isEmptyStateMode
              ? 'Mode Produksi Bersih (Empty State aktif)'
              : 'Data pratinjau desain interaktif (Stitch demo).'}
          </p>
        </div>
        <button
          onClick={toggleEmptyStateMode}
          className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold text-[11px] hover:underline flex-shrink-0 ml-2"
        >
          {isEmptyStateMode ? 'Ganti ke Demo' : 'Uji Empty State'}
        </button>
      </div>

      {/* Event Header & Live Badge */}
      <section className="flex flex-col space-y-space-sm bg-surface-container-lowest p-space-lg rounded-xl shadow-[0_4px_20px_-2px_rgba(197,160,89,0.08)] border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-secondary-container/30 text-on-secondary-container">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold text-[10px]">
              Acara Sedang Berlangsung (Live)
            </span>
          </div>

          <div
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-primary border border-outline-variant/30 text-[11px] font-semibold"
            title="Identitas Acara Resmi & Terverifikasi"
          >
            <span className="material-symbols-outlined text-[15px]">verified</span>
            <span className="text-[10px] tracking-wider uppercase font-bold">Resmi</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <h2 className="font-headline-md text-headline-md text-on-surface leading-tight text-[24px]">
            {eventSettings.coupleNames} Wedding
          </h2>
          <div className="flex items-center gap-1.5 text-on-surface-variant flex-wrap text-xs">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">
                calendar_today
              </span>
              <p className="font-body-sm text-body-sm">{eventSettings.date}</p>
            </div>
            <span className="text-tertiary-container">•</span>
            <div className="flex items-center gap-1 truncate">
              <span className="material-symbols-outlined text-[16px] text-primary">
                location_on
              </span>
              <p className="font-body-sm text-body-sm truncate">{eventSettings.venue}</p>
            </div>
          </div>
        </div>

        {/* Quick Stat Bar */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">
              Kapasitas Album Resepsi
            </span>
            <span className="font-label-sm text-label-sm font-semibold text-primary font-mono text-[11px]">
              {totalPhotosCount} / {eventSettings.maxCapacity.toLocaleString()} Foto ({capacityPercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
            <div
              className="h-full bg-primary-container rounded-full transition-all duration-700"
              style={{ width: `${capacityPercent}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* KPI Bento Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">photo_library</span>
            </div>
            <span className="font-label-sm text-label-sm text-secondary font-semibold font-mono text-[11px]">
              +24/jam
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline-sm text-headline-sm text-on-surface block leading-tight font-semibold text-[22px]">
              {totalPhotosCount}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
              Foto Terkumpul
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
            <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-semibold text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span> Aktif
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline-sm text-headline-sm text-on-surface block leading-tight font-semibold text-[22px]">
              {guestSessionsCount} Sesi
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
              Kamera Tamu
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">cloud_done</span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-semibold text-[11px]">
              Optimal
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline-sm text-headline-sm text-on-surface block leading-tight font-semibold text-[22px] font-mono">
              99.4%
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
              Keberhasilan Unggah
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">database</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant text-[11px] font-mono">
              10 GB Kuota
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline-sm text-headline-sm text-on-surface block leading-tight font-semibold text-[22px] font-mono">
              {storageGB} GB
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
              Penyimpanan Terpakai
            </span>
          </div>
        </div>
      </section>

      {/* Quick Action Buttons for Bride & Groom / WO */}
      <section className="space-y-space-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-label-lg text-label-lg text-on-surface tracking-wider uppercase font-bold text-xs">
            Aksi Cepat Acara
          </h3>
          <span className="font-label-sm text-label-sm text-primary font-semibold">
            3 Menu Siap
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Slideshow Action */}
          <button
            onClick={() => setIsSlideshowOpen(true)}
            className="w-full flex items-center justify-between bg-primary text-on-primary px-space-md py-3 rounded-lg shadow-md hover:bg-primary/95 active:scale-[0.99] transition-all"
            type="button"
          >
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-full bg-on-primary/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">slideshow</span>
              </div>
              <div className="text-left">
                <span className="font-label-lg text-label-lg block leading-none font-semibold">
                  Tayangkan Slideshow Resepsi
                </span>
                <span className="font-body-sm text-body-sm text-primary-fixed opacity-90 text-xs">
                  Koneksikan ke layar LED proyektor
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
          </button>

          {/* Download Action */}
          <button
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            className="w-full flex items-center justify-between bg-surface-container-lowest text-on-surface px-space-md py-3 rounded-lg shadow-sm hover:bg-surface-container-low transition-colors border border-outline-variant/30"
            type="button"
          >
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-full bg-secondary-fixed/40 text-secondary flex items-center justify-center">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isZipping ? 'animate-spin' : ''
                  }`}
                >
                  {isZipping ? 'sync' : 'folder_zip'}
                </span>
              </div>
              <div className="text-left">
                <span className="font-label-lg text-label-lg block leading-none font-semibold">
                  {isZipping ? 'Mengompresi Foto...' : 'Unduh Semua Foto (ZIP)'}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                  Resolusi tinggi original ({storageGB} GB • {totalPhotosCount} item)
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-primary">
              download
            </span>
          </button>

          {/* Share Guest Link */}
          <button
            onClick={handleShareGuestLink}
            className="w-full flex items-center justify-between bg-surface-container-lowest text-on-surface px-space-md py-3 rounded-lg shadow-sm hover:bg-surface-container-low transition-colors border border-outline-variant/30"
            type="button"
          >
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-full bg-primary-fixed/40 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </div>
              <div className="text-left">
                <span className="font-label-lg text-label-lg block leading-none font-semibold">
                  Bagikan Link Kamera Tamu
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                  Tautan langsung tanpa instal aplikasi
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-primary">send</span>
          </button>
        </div>
      </section>

      {/* Guest Table QR Code Management Card */}
      <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-[0_4px_20px_-2px_rgba(197,160,89,0.08)] space-y-space-md border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface text-[20px]">
              QR Code Meja Tamu
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">
              Akses instan disposable camera untuk tamu undangan
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-[28px]">
            qr_code_scanner
          </span>
        </div>

        {/* QR Visual Card with Champagne Botanical Framing */}
        <div className="bg-surface-container-low p-space-lg rounded-xl flex flex-col items-center text-center relative overflow-hidden shadow-xs border border-outline-variant/30">
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-secondary-fixed/30 blur-2xl pointer-events-none"></div>

          <div className="mb-3 px-3 py-0.5 rounded-full bg-surface-container-lowest shadow-xs flex items-center gap-1.5 border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[14px]">
              local_florist
            </span>
            <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest text-[10px] font-semibold">
              Meja VIP & Reguler
            </span>
          </div>

          {/* QR Code Art Display */}
          <div
            onClick={() => setIsTableQROpen(true)}
            className="w-44 h-44 bg-surface-container-lowest p-3 rounded-xl shadow-md flex items-center justify-center relative cursor-pointer hover:scale-105 transition-transform"
            title="Klik untuk membuka Kartu Meja Cetak"
          >
            <svg className="w-full h-full text-on-surface" fill="currentColor" viewBox="0 0 160 160">
              <rect fill="#775a19" height="40" rx="6" width="40" x="10" y="10"></rect>
              <rect fill="#fbf9f6" height="24" rx="3" width="24" x="18" y="18"></rect>
              <rect fill="#775a19" height="12" rx="2" width="12" x="24" y="24"></rect>

              <rect fill="#775a19" height="40" rx="6" width="40" x="110" y="10"></rect>
              <rect fill="#fbf9f6" height="24" rx="3" width="24" x="118" y="18"></rect>
              <rect fill="#775a19" height="12" rx="2" width="12" x="124" y="24"></rect>

              <rect fill="#775a19" height="40" rx="6" width="40" x="10" y="110"></rect>
              <rect fill="#fbf9f6" height="24" rx="3" width="24" x="18" y="118"></rect>
              <rect fill="#775a19" height="12" rx="2" width="12" x="24" y="124"></rect>

              <circle cx="65" cy="20" fill="#4e4639" r="4"></circle>
              <circle cx="80" cy="20" fill="#c5a059" r="4"></circle>
              <circle cx="95" cy="20" fill="#4e4639" r="4"></circle>
              <circle cx="65" cy="35" fill="#c5a059" r="4"></circle>
              <circle cx="80" cy="35" fill="#4e4639" r="4"></circle>
              <circle cx="65" cy="50" fill="#4e4639" r="4"></circle>
              <circle cx="95" cy="50" fill="#c5a059" r="4"></circle>

              <circle cx="80" cy="80" fill="#fbf9f6" r="16"></circle>
              <circle cx="80" cy="80" fill="#fed65b" r="13"></circle>
              <path
                d="M80 87.5s-6-3.8-6-7.5c0-2 1.5-3.5 3.5-3.5 1.3 0 2.2.8 2.5 1.3.3-.5 1.2-1.3 2.5-1.3 2 0 3.5 1.5 3.5 3.5 0 3.7-6 7.5-6 7.5z"
                fill="#745c00"
              ></path>

              <circle cx="65" cy="110" fill="#4e4639" r="4"></circle>
              <circle cx="80" cy="110" fill="#c5a059" r="4"></circle>
              <circle cx="95" cy="110" fill="#4e4639" r="4"></circle>
              <circle cx="110" cy="70" fill="#4e4639" r="4"></circle>
              <circle cx="125" cy="70" fill="#c5a059" r="4"></circle>
              <circle cx="140" cy="70" fill="#4e4639" r="4"></circle>
              <circle cx="110" cy="90" fill="#c5a059" r="4"></circle>
              <circle cx="125" cy="90" fill="#4e4639" r="4"></circle>
              <circle cx="140" cy="90" fill="#4e4639" r="4"></circle>
              <circle cx="125" cy="125" fill="#775a19" r="4"></circle>
              <circle cx="140" cy="140" fill="#c5a059" r="4"></circle>
              <circle cx="70" cy="135" fill="#4e4639" r="4"></circle>
              <circle cx="90" cy="135" fill="#775a19" r="4"></circle>
            </svg>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 max-w-xs text-xs">
            Scan kamera ponsel langsung terbuka di browser tamu. Tanpa registrasi akun.
          </p>

          <div className="mt-2 text-primary font-body-sm text-body-sm font-semibold tracking-wide text-xs">
            wedsnap.id/fajar-aulia
          </div>
        </div>

        {/* QR Code Action Buttons */}
        <div className="grid grid-cols-2 gap-space-sm pt-1">
          <button
            onClick={() => setIsTableQROpen(true)}
            className="w-full flex items-center justify-center gap-1.5 bg-primary-container text-on-primary-container px-3 py-2.5 rounded-lg font-label-md text-label-md uppercase tracking-wider font-semibold active:opacity-90 transition-opacity shadow-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Cetak Meja</span>
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText('https://wedsnap.id/fajar-aulia');
              showToast('content_copy', 'Link QR kamera tersalin ke clipboard');
            }}
            className="w-full flex items-center justify-center gap-1.5 bg-surface-container text-on-surface-variant hover:text-on-surface px-3 py-2.5 rounded-lg font-label-md text-label-md uppercase tracking-wider font-semibold active:bg-surface-container-high transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
            <span>Salin URL</span>
          </button>
        </div>
      </section>

      {/* Real-Time Guest Activity Feed */}
      <section className="space-y-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="font-label-lg text-label-lg text-on-surface tracking-wider uppercase font-bold text-xs">
              Aktivitas Unggahan
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-semibold text-[10px]">
              Live
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-primary font-semibold text-xs">
            {guestActivities.length} Tamu
          </span>
        </div>

        {guestActivities.length === 0 ? (
          <div className="p-4 bg-surface-container-low rounded-xl text-center text-on-surface-variant text-xs border border-outline-variant/30">
            Belum ada aktivitas unggahan tamu.
          </div>
        ) : (
          <div className="space-y-2">
            {guestActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-space-sm bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed/50 flex items-center justify-center text-primary font-semibold text-body-sm flex-shrink-0 text-xs">
                    {act.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-body-md text-body-md font-semibold text-on-surface truncate text-sm">
                      {act.author}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 text-[11px]">
                      <span>{act.table}</span>
                      <span className="text-tertiary-container">•</span>
                      <span>{act.timeAgo}</span>
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden flex-shrink-0 relative">
                  <img
                    src={act.thumbnail}
                    alt={act.author}
                    className="w-full h-full object-cover"
                  />
                  {act.photoCount > 1 && (
                    <div className="absolute bottom-0 right-0 bg-primary/80 text-on-primary text-[10px] px-1 rounded-tl font-bold">
                      +{act.photoCount - 1}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Event Controls & Privacy Restrictions */}
      <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-[0_4px_20px_-2px_rgba(197,160,89,0.08)] space-y-space-md mb-space-lg border border-outline-variant/30">
        <div className="space-y-0.5">
          <h3 className="font-headline-sm text-headline-sm text-on-surface text-[20px]">
            Batasan & Moderasi
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">
            Kendali privasi dan kenyamanan foto momen sakral
          </p>
        </div>

        <div className="space-y-4">
          {/* Setting 1: Moderation */}
          <div className="flex items-center justify-between gap-space-sm">
            <div className="space-y-0.5 pr-2">
              <span className="font-label-lg text-label-lg font-semibold text-on-surface block text-sm">
                Moderasi Foto Otomatis
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant block text-xs">
                Saring foto blur & konten tidak pantas sebelum masuk tayangan proyektor
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={eventSettings.autoModeration}
                onChange={(e) => updateSettings({ autoModeration: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Setting 2: Guest Photo Limit */}
          <div className="flex items-center justify-between gap-space-sm">
            <div className="space-y-0.5 pr-2">
              <span className="font-label-lg text-label-lg font-semibold text-on-surface block text-sm">
                Batasi 36 Foto / Tamu
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant block text-xs">
                Sensasi rol film analog sekali pakai agar setiap potret terasa berharga
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={eventSettings.limit36Photos}
                onChange={(e) => updateSettings({ limit36Photos: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Setting 3: Live Gallery Visibility */}
          <div className="flex items-center justify-between gap-space-sm">
            <div className="space-y-0.5 pr-2">
              <span className="font-label-lg text-label-lg font-semibold text-on-surface block text-sm">
                Privasi Galeri Tamu
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant block text-xs">
                Tamu hanya dapat melihat foto yang diunggah mereka sendiri
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={eventSettings.guestPrivacy}
                onChange={(e) => updateSettings({ guestPrivacy: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
};
