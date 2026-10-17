import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Photo } from '../types';

export const ReviewView: React.FC = () => {
  const {
    photos,
    shotsRemaining,
    totalShotsLimit,
    guestWishInput,
    setGuestWishInput,
    submitWish,
    retryUpload,
    setPreviewPhoto,
    navigateTo,
    eventSettings,
    guestIdentity,
    getGuestInitials,
    setIsIdentityModalOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'failed'>('all');

  // Filter to user photos
  const userPhotos = photos.filter((p) => p.isUserPhoto);
  const failedPhotos = userPhotos.filter((p) => p.status === 'failed');

  const displayedPhotos = activeTab === 'all' ? userPhotos : failedPhotos;
  const takenCount = totalShotsLimit - shotsRemaining;
  const progressPercent = Math.min(100, Math.round((takenCount / totalShotsLimit) * 100));

  const setQuickWish = (text: string) => {
    setGuestWishInput(text);
  };

  return (
    <div className="flex flex-col w-full px-margin pb-8 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto">
      {/* Header Text Context */}
      <header className="flex flex-col mt-2 mb-5">
        <div className="flex items-center gap-space-xs mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
            Kamera Sekali Pakai Digital
          </span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface leading-tight text-[24px]">
          Foto Saya di Pernikahan {eventSettings.coupleNames}
        </h2>

        {/* Guest Identity Chip */}
        {guestIdentity && (
          <div
            onClick={() => setIsIdentityModalOpen(true)}
            className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/30 w-fit mt-2 cursor-pointer hover:bg-surface-container transition-colors shadow-2xs"
            title="Ketuk untuk ubah identitas tamu"
          >
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
              {getGuestInitials(guestIdentity.name)}
            </span>
            <span className="text-xs font-semibold text-on-surface">
              {guestIdentity.name}
            </span>
            <span className="text-[11px] text-tertiary">
              • {guestIdentity.relationship} ({guestIdentity.address})
            </span>
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
              edit
            </span>
          </div>
        )}

        <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
          Kamu telah mengambil {takenCount.toLocaleString()} dari kapasitas penyimpanan {totalShotsLimit.toLocaleString()} foto.
        </p>
      </header>

      {/* Film Roll Progress & Remaining Frame Indicator */}
      <section className="bg-surface-container-low rounded-xl p-space-md shadow-sm mb-6 relative overflow-hidden border border-outline-variant/30">
        <div className="flex items-center justify-between gap-space-sm mb-3">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">
              photo_library
            </span>
            <span className="font-label-md text-label-md text-on-surface tracking-wide uppercase font-semibold">
              Kapasitas Album (10.000 Foto)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-primary/20">
              <span className="font-label-sm text-label-sm text-primary font-bold">
                {shotsRemaining.toLocaleString()} TERSISA
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Exposures Info */}
        <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-primary-container h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center mt-2.5 text-on-surface-variant font-mono">
          <span className="font-label-sm text-label-sm tracking-wide">
            {takenCount.toLocaleString()} / {totalShotsLimit.toLocaleString()} FOTO TERPAKAI
          </span>
          <span className="font-label-sm text-label-sm text-secondary font-medium">
            {progressPercent}% Kapasitas
          </span>
        </div>

        {/* Film Strip Sprockets Aesthetic Details */}
        <div className="flex justify-between items-center pt-3 mt-3 border-t border-outline-variant/30 opacity-70">
          <div className="flex gap-2">
            <span className="w-2.5 h-1.5 bg-outline-variant/60 rounded-xs"></span>
            <span className="w-2.5 h-1.5 bg-outline-variant/60 rounded-xs"></span>
            <span className="w-2.5 h-1.5 bg-outline-variant/60 rounded-xs"></span>
            <span className="w-2.5 h-1.5 bg-outline-variant/60 rounded-xs"></span>
          </div>
          <span className="font-label-sm text-label-sm tracking-widest uppercase text-tertiary font-mono text-[9px]">
            KODAK PORTRA 400 EMULATION
          </span>
          <div className="flex gap-2">
            <span className="w-2.5 h-1.5 bg-outline-variant/60 rounded-xs"></span>
            <span className="w-2.5 h-1.5 bg-outline-variant/60 rounded-xs"></span>
            <span className="w-2.5 h-1.5 bg-outline-variant/60 rounded-xs"></span>
            <span className="w-2.5 h-1.5 bg-outline-variant/60 rounded-xs"></span>
          </div>
        </div>
      </section>

      {/* Photo Grid Filter Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-full font-label-sm text-label-sm tracking-wide shadow-xs transition-colors ${
              activeTab === 'all'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
            type="button"
          >
            Semua ({userPhotos.length})
          </button>
          <button
            onClick={() => setActiveTab('failed')}
            className={`px-3 py-1 rounded-full font-label-sm text-label-sm tracking-wide transition-colors ${
              activeTab === 'failed'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
            type="button"
          >
            Gagal ({failedPhotos.length})
          </button>
        </div>
        <span className="font-label-sm text-label-sm text-tertiary italic text-[11px]">
          Ketuk foto untuk zoom
        </span>
      </div>

      {/* Polaroid-Inspired Photo Grid */}
      {displayedPhotos.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface-container-low text-center mb-6 border border-outline-variant/30">
          <span className="material-symbols-outlined text-[36px] text-primary mb-2">
            photo_library
          </span>
          <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            {activeTab === 'failed'
              ? 'Tidak Ada Foto Gagal'
              : 'Belum Ada Foto di Rol Anda'}
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mx-auto mb-3">
            {activeTab === 'failed'
              ? 'Semua foto di rol kamu berhasil tersinkronisasi ke server pengantin!'
              : 'Gunakan kamera sekali pakai untuk mengambil momen pertama Anda.'}
          </p>
          <button
            onClick={() => navigateTo('camera')}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider"
          >
            Buka Kamera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 mb-6">
          {displayedPhotos.map((photo: Photo) => (
            <article
              key={photo.id}
              onClick={() => setPreviewPhoto(photo)}
              className="bg-surface-container-lowest rounded-xl p-2.5 shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer border border-outline-variant/20"
            >
              <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-surface-container">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />

                {/* Status Badges */}
                {photo.status === 'saved' && (
                  <div className="absolute top-2 left-2 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <span
                      className="material-symbols-outlined text-primary text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface">
                      Tersimpan
                    </span>
                  </div>
                )}

                {photo.status === 'uploading' && (
                  <div className="absolute top-2 left-2 bg-surface-container-lowest/95 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">
                      Mengunggah...
                    </span>
                  </div>
                )}

                {photo.status === 'failed' && (
                  <div className="absolute top-2 left-2 bg-error-container/95 text-on-error-container backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span className="font-label-sm text-label-sm font-semibold">
                      Gagal Unggah
                    </span>
                  </div>
                )}

                <div className="absolute bottom-2 right-2 bg-inverse-surface/60 backdrop-blur-xs text-inverse-on-surface rounded px-1.5 py-0.5 font-label-sm text-label-sm font-mono">
                  #{photo.frameNumber < 10 ? `0${photo.frameNumber}` : photo.frameNumber}
                </div>
              </div>

              <div className="pt-2 px-1 pb-1 flex flex-col">
                <p className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 italic text-[15px] leading-tight">
                  {photo.caption}
                </p>
                <span className="font-body-sm text-body-sm text-tertiary text-[11px] leading-normal">
                  {photo.timestamp}
                </span>

                {photo.status === 'failed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      retryUpload(photo.id);
                    }}
                    type="button"
                    className="mt-2 w-full py-1 px-2 bg-error text-on-error rounded-md flex items-center justify-center gap-1 font-label-sm text-label-sm shadow-xs active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[14px]">sync</span>
                    <span>Coba Lagi</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Guest Wishes & Prayers Keepsake Card Section */}
      <section className="bg-surface-container-low rounded-xl p-space-md shadow-sm mb-6 relative overflow-hidden border border-outline-variant/30">
        <div className="flex items-center gap-space-xs mb-2">
          <span className="material-symbols-outlined text-primary text-[22px]">
            auto_stories
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface text-[19px]">
            Pesan & Doa untuk Pengantin
          </h3>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 text-[13px]">
          Kartu doa ini akan dicetak langsung ke dalam album digital kenang-kenangan{' '}
          {eventSettings.coupleNames} bersama seluruh foto rol filmmu.
        </p>

        {/* Letterpress Style Note Input Container */}
        <div className="bg-surface-container-lowest rounded-lg p-3 shadow-inner border border-outline-variant/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider font-bold text-[10px]">
              Pesan Dari Kamu
            </span>
            <span className="font-label-sm text-label-sm text-primary font-medium font-mono">
              {guestWishInput.length} / 250
            </span>
          </div>
          <textarea
            className="w-full bg-transparent text-on-surface font-body-md text-body-md placeholder:text-outline/60 focus:outline-none resize-none"
            id="wishes-input"
            maxLength={250}
            rows={3}
            value={guestWishInput}
            onChange={(e) => setGuestWishInput(e.target.value)}
            placeholder="Tuliskan doa terhangat atau momen favoritmu hari ini bersama kedua mempelai..."
          />
        </div>

        {/* Quick Inspiration Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="font-label-sm text-label-sm text-tertiary self-center mr-1 text-[11px]">
            Inspirasi:
          </span>
          <button
            onClick={() =>
              setQuickWish('Bahagia selalu hingga akhir hayat, Fajar & Aulia! ❤️')
            }
            type="button"
            className="px-2.5 py-1 rounded-full bg-surface text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm transition-colors text-[11px] border border-outline-variant/30"
          >
            "Bahagia selalu..."
          </button>
          <button
            onClick={() =>
              setQuickWish('Acara pernikahan yang sangat syahdu & berkesan! ✨')
            }
            type="button"
            className="px-2.5 py-1 rounded-full bg-surface text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm transition-colors text-[11px] border border-outline-variant/30"
          >
            "Sangat syahdu..."
          </button>
        </div>
      </section>

      {/* Sticky/Floating Action Deck for Mobile Hand Comfort */}
      <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-xl flex flex-col gap-3 border border-outline-variant/20">
        {/* Primary Camera Trigger Button */}
        <button
          onClick={() => navigateTo('camera')}
          className="w-full h-14 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined text-[24px]">photo_camera</span>
          <span className="font-label-lg text-label-lg uppercase tracking-wider font-semibold">
            Lanjut Ambil Foto (Sisa {shotsRemaining})
          </span>
        </button>

        {/* Secondary Finalize & Submit Button */}
        <button
          onClick={submitWish}
          type="button"
          className="w-full h-12 bg-surface-container text-on-surface rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container-high active:scale-[0.98] transition-all font-semibold"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">
            celebration
          </span>
          <span className="font-label-lg text-label-lg uppercase tracking-wider">
            Selesaikan Sesi & Bagikan Ucapan
          </span>
        </button>

        <p className="text-center font-label-sm text-label-sm text-tertiary text-[11px]">
          Sesi dapat diselesaikan kapan saja meski kuota frame belum habis.
        </p>
      </section>
    </div>
  );
};
