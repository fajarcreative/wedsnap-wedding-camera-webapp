import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Photo, PhotoCategory } from '../types';

export const GalleryView: React.FC = () => {
  const {
    photos,
    toggleLike,
    navigateTo,
    showToast,
    eventSettings,
    setPreviewPhoto,
    refreshGalleryNow,
    isSyncing
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<PhotoCategory | 'all'>('all');

  const categories: { key: PhotoCategory | 'all'; label: string; icon?: string }[] = [
    { key: 'all', label: 'Semua Momen', icon: 'auto_awesome' },
    { key: 'akad', label: 'Akad / Pemberkatan' },
    { key: 'resepsi', label: 'Resepsi & Dansa' },
    { key: 'candid', label: 'Meja Tamu & Candid' },
    { key: 'photobooth', label: 'Photobooth' }
  ];

  const filteredPhotos = photos.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  // Calculate unique contributors
  const uniqueAuthors = new Set(photos.map((p) => p.author)).size;

  const handleShareGallery = () => {
    const url = 'https://wedsnap.id/fajar-aulia/galeri';
    if (navigator.share) {
      navigator
        .share({
          title: `Galeri Bersama Pernikahan ${eventSettings.coupleNames}`,
          text: `Lihat seluruh foto momen pernikahan ${eventSettings.coupleNames} di WedSnap!`,
          url
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).then(() => {
        showToast('share', 'Tautan galeri disalin ke papan klip!');
      });
    }
  };

  const handleDownloadHD = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `WedSnap_${photo.caption.replace(/\s+/g, '_')}_${photo.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('download', 'Mengunduh foto resolusi tinggi...');
  };

  return (
    <div className="flex flex-col w-full px-margin pb-12 space-y-space-lg max-w-lg md:max-w-3xl lg:max-w-6xl mx-auto">
      {/* Editorial Keepsake Header Section */}
      <div className="relative bg-surface-container-low rounded-xl p-space-lg shadow-sm overflow-hidden flex flex-col items-center text-center border border-outline-variant/30">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-secondary-fixed/20 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-primary-fixed-dim/20 blur-xl pointer-events-none"></div>

        {/* PIN Badge */}
        <div className="inline-flex items-center gap-space-xs bg-surface-container-highest px-3 py-1 rounded-full mb-space-sm shadow-xs border border-outline-variant/30">
          <span
            className="material-symbols-outlined text-primary text-[15px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lock
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant text-[10px] font-semibold">
            Galeri Privat Terproteksi PIN
          </span>
        </div>

        <span className="font-label-md text-label-md uppercase tracking-[0.2em] text-secondary font-bold text-[11px]">
          The Wedding Celebration
        </span>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mt-1 mb-1 tracking-tight text-[28px]">
          {eventSettings.coupleNames}
        </h2>
        <div className="w-10 h-0.5 bg-primary-container mb-space-sm rounded-full"></div>
        <p className="font-headline-sm text-headline-sm italic text-primary font-normal leading-snug text-[18px]">
          Kenangan Pernikahan Kami
        </p>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mt-2 leading-relaxed text-[13px]">
          Koleksi momen spontan dari sudut pandang tamu-tamu terkasih kami.
        </p>

        {/* Live Stream Counter Pill */}
        <div className="mt-space-md w-full bg-surface-container-lowest/80 backdrop-blur-md rounded-lg p-space-sm flex items-center justify-around shadow-xs border border-outline-variant/20">
          <div className="flex flex-col items-center">
            <span className="font-headline-sm text-headline-sm text-primary font-semibold text-[20px]">
              {photos.length}
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant text-[10px]">
              Foto Terkumpul
            </span>
          </div>
          <div className="h-6 w-px bg-outline-variant/60"></div>
          <div className="flex flex-col items-center">
            <span className="font-headline-sm text-headline-sm text-primary font-semibold text-[20px]">
              {uniqueAuthors > 0 ? uniqueAuthors : 0}
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant text-[10px]">
              Tamu Berbagi
            </span>
          </div>
        </div>

        {/* Quick Editorial Action Strip */}
        <div className="flex items-center gap-space-sm w-full mt-space-md">
          <button
            onClick={handleShareGallery}
            className="flex-1 bg-surface-container-highest active:bg-surface-dim text-on-surface h-10 px-space-sm rounded-lg flex items-center justify-center gap-space-xs shadow-xs transition-transform active:scale-[0.98] font-semibold text-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">share</span>
            <span className="font-label-md text-label-md">Bagikan Tautan</span>
          </button>
          <button
            onClick={() =>
              showToast(
                'verified_user',
                'Galeri ini diproteksi sandi oleh Pengantin. Semua unggahan telah terverifikasi.'
              )
            }
            className="bg-surface-container-highest active:bg-surface-dim text-on-surface-variant h-10 px-3 rounded-lg flex items-center justify-center shadow-xs"
            title="Info Proteksi PIN"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills (Horizontal Scroll) */}
      <div className="flex flex-col space-y-space-xs">
        <div className="flex items-center justify-between px-1">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant text-[10px] font-bold">
            Kategori Momen
          </span>
          <span className="font-label-sm text-label-sm text-secondary text-[11px]">
            Geser • Filter
          </span>
        </div>
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 pt-0.5 no-scrollbar -mx-margin px-margin">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md transition-all duration-200 shadow-xs flex items-center gap-1.5 ${
                activeCategory === cat.key
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat.icon && (
                <span
                  className="material-symbols-outlined text-[15px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {cat.icon}
                </span>
              )}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Status Bar with Manual Refresh */}
      <div className="flex items-center justify-between bg-surface-container-low px-space-md py-2.5 rounded-lg border border-outline-variant/30 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="font-label-md text-label-md text-on-surface font-semibold text-xs sm:text-sm">
            Live Sync Cloud Aktif
          </span>
        </div>
        <button
          onClick={() => refreshGalleryNow()}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-highest border border-outline-variant/40 text-xs text-primary font-semibold transition-all active:scale-95 shadow-2xs"
          title="Sinkronkan foto dari semua tamu undangan"
        >
          <span className={`material-symbols-outlined text-[15px] ${isSyncing ? 'animate-spin' : ''}`}>
            sync
          </span>
          <span>Segarkan ({filteredPhotos.length} Foto)</span>
        </button>
      </div>

      {/* Dynamic Gallery Cards Feed */}
      {filteredPhotos.length === 0 ? (
        /* Empty State Fallback (Rule #12) */
        <div className="flex flex-col items-center justify-center text-center py-space-xl px-space-lg bg-surface-container-low rounded-xl border border-outline-variant/30">
          <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-space-sm text-primary">
            <span className="material-symbols-outlined text-[32px]">photo_library</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Sudut Belum Terjamah
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mb-space-md text-sm">
            Belum ada foto di kategori ini. Jadilah yang pertama mengabadikannya untuk{' '}
            {eventSettings.coupleNames}!
          </p>
          <button
            onClick={() => navigateTo('camera')}
            className="bg-primary text-on-primary h-11 px-space-lg rounded-lg font-label-lg text-label-lg uppercase tracking-wider shadow-sm flex items-center gap-2 active:scale-95 transition-transform font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            <span>Ambil Foto Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setPreviewPhoto(photo)}
              className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col transition-all duration-300 border border-outline-variant/20 hover:shadow-md cursor-pointer"
            >
              {/* Photo Image Frame */}
              <div className="relative w-full aspect-[4/5] bg-surface-container overflow-hidden group">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/70 via-transparent to-transparent opacity-80"></div>

                {/* Category Pill Tag */}
                <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[14px]">
                    {photo.category === 'akad'
                      ? 'church'
                      : photo.category === 'resepsi'
                      ? 'nightlife'
                      : photo.category === 'photobooth'
                      ? 'photo_camera_front'
                      : 'wine_bar'}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold text-[10px]">
                    {photo.category}
                  </span>
                </div>

                {/* Caption on Image */}
                <div className="absolute bottom-3 left-3 right-3 text-on-primary flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-surface-bright italic text-[18px]">
                    {photo.caption}
                  </span>
                  <span className="font-body-sm text-body-sm text-surface-bright/90 line-clamp-1 text-xs">
                    {photo.table} • Frame #{photo.frameNumber}
                  </span>
                </div>
              </div>

              {/* Card Meta & Actions Footer */}
              <div className="p-space-md flex flex-col space-y-space-sm bg-surface-container-lowest">
                <div className="flex items-center justify-between">
                  {/* Uploader Avatar & Info */}
                  <div className="flex items-center gap-space-xs min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0 text-on-primary-fixed font-label-md font-bold text-xs">
                      {photo.authorInitials || photo.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface truncate font-semibold">
                        {photo.author}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 text-[11px]">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>{' '}
                        {photo.timeAgo}
                      </span>
                    </div>
                  </div>

                  {/* Like & Download Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(photo.id);
                      }}
                      className={`p-2 rounded-full active:scale-125 transition-transform flex items-center gap-1 ${
                        photo.isLikedByMe ? 'text-error' : 'text-on-surface-variant hover:text-error'
                      }`}
                      title={photo.isLikedByMe ? 'Batal Suka' : 'Suka'}
                    >
                      <span
                        className="material-symbols-outlined text-[20px] transition-colors"
                        style={{
                          fontVariationSettings: photo.isLikedByMe ? "'FILL' 1" : "'FILL' 0"
                        }}
                      >
                        favorite
                      </span>
                      <span className="font-label-md text-label-md font-semibold text-xs">
                        {photo.likes}
                      </span>
                    </button>

                    <button
                      onClick={(e) => handleDownloadHD(e, photo)}
                      className="p-2 rounded-full text-on-surface-variant hover:text-primary active:bg-surface-container transition-colors"
                      title="Unduh Foto HD"
                    >
                      <span className="material-symbols-outlined text-[20px]">download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky Floating Action Bar for Quick Capture */}
      <div className="sticky bottom-4 z-30 w-full flex justify-center pt-2">
        <button
          onClick={() => navigateTo('camera')}
          className="w-full max-w-md bg-gradient-to-r from-primary to-primary-container text-on-primary h-14 rounded-full px-space-lg flex items-center justify-between shadow-lg active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-full bg-on-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[20px]">
                add_a_photo
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-label-lg text-label-lg uppercase tracking-wider leading-none font-semibold">
                Buka Kamera
              </span>
              <span className="font-body-sm text-body-sm text-on-primary/80 text-[11px] leading-tight">
                Unggah momen langsung ke album
              </span>
            </div>
          </div>
          <div className="flex items-center bg-on-primary/15 px-2.5 py-1 rounded-full text-[12px] font-label-md font-semibold">
            <span>+ Jepret</span>
          </div>
        </button>
      </div>
    </div>
  );
};
