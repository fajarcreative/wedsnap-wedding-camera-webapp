import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const SlideshowModal: React.FC = () => {
  const { isSlideshowOpen, setIsSlideshowOpen, photos, eventSettings } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const availablePhotos = photos.filter((p) => p.status === 'saved');

  useEffect(() => {
    if (!isSlideshowOpen || !isPlaying || availablePhotos.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % availablePhotos.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isSlideshowOpen, isPlaying, availablePhotos.length]);

  if (!isSlideshowOpen) return null;

  const currentPhoto = availablePhotos[currentIndex] || availablePhotos[0];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12110f] text-on-primary flex flex-col justify-between p-4 md:p-8 animate-fade-in select-none">
      {/* Top Bar for Projector */}
      <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-lg">
            <span className="material-symbols-outlined text-[24px]">slideshow</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-[#fbf9f6] tracking-wide">
              {eventSettings.coupleNames} • Live Projector Slideshow
            </h2>
            <p className="font-label-sm text-label-sm text-[#e9c176] tracking-widest uppercase">
              {eventSettings.venue} • {availablePhotos.length} Foto Terkumpul
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 rounded-full bg-surface-container/20 text-[#fbf9f6] hover:bg-surface-container/40 flex items-center gap-1.5 font-label-md text-label-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-surface-container/20 text-[#fbf9f6] hover:bg-surface-container/40 transition-colors"
            title="Layar Penuh"
          >
            <span className="material-symbols-outlined text-[20px]">fullscreen</span>
          </button>

          <button
            onClick={() => setIsSlideshowOpen(false)}
            className="p-2 rounded-full bg-error/80 text-on-error hover:bg-error transition-colors"
            title="Tutup Slideshow"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* Main Slide Presentation */}
      <div className="flex-1 flex items-center justify-center relative my-4">
        {currentPhoto ? (
          <div className="relative max-w-4xl max-h-[75vh] w-full h-full flex flex-col items-center justify-center">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.8)] border border-[#c5a059]/30 bg-black/40 flex items-center justify-center max-h-full">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl transition-all duration-700 ease-in-out"
              />

              {/* Watermark / Badge */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-primary-container/40 flex items-center gap-2 text-primary-fixed">
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">
                  Foto Tamu #{currentPhoto.frameNumber} • {currentPhoto.table}
                </span>
              </div>
            </div>

            {/* Caption Banner */}
            <div className="mt-4 text-center">
              <p className="font-headline-md text-headline-md text-[#fbf9f6] italic tracking-wide">
                "{currentPhoto.caption}"
              </p>
              <p className="font-body-sm text-body-sm text-[#e9c176] mt-1">
                Diabadikan oleh <span className="font-semibold">{currentPhoto.author}</span> • {currentPhoto.timestamp}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-on-surface-variant">
            <p className="font-headline-sm text-headline-sm">Belum ada foto tersimpan untuk slideshow</p>
          </div>
        )}

        {/* Prev / Next navigation overlay */}
        {availablePhotos.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex(
                  (prev) => (prev - 1 + availablePhotos.length) % availablePhotos.length
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all"
              aria-label="Foto Sebelumnya"
            >
              <span className="material-symbols-outlined text-[28px]">chevron_left</span>
            </button>
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev + 1) % availablePhotos.length)
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all"
              aria-label="Foto Selanjutnya"
            >
              <span className="material-symbols-outlined text-[28px]">chevron_right</span>
            </button>
          </>
        )}
      </div>

      {/* Progress Indicators */}
      <div className="flex items-center justify-between border-t border-[#c5a059]/20 pt-3">
        <span className="font-label-sm text-label-sm text-[#e9c176]">
          Frame {availablePhotos.length > 0 ? currentIndex + 1 : 0} dari {availablePhotos.length}
        </span>
        <div className="flex items-center gap-1.5 max-w-xs overflow-x-auto py-1">
          {availablePhotos.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-6 bg-[#c5a059]' : 'w-2 bg-[#4e4639]'
              }`}
            />
          ))}
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Auto-play 4.5 detik
        </span>
      </div>
    </div>
  );
};

