import React from 'react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { currentRoute, navigateTo, photos, shotsRemaining } = useApp();

  const userPhotosCount = photos.filter((p) => p.isUserPhoto).length;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/95 backdrop-blur-2xl shadow-[0_-4px_24px_rgba(119,90,25,0.06)] border-t border-outline-variant/20 md:hidden"
      data-active-classes="text-primary font-semibold"
    >
      <div className="flex justify-between items-center h-16 px-1 max-w-lg mx-auto w-full">
        {/* Beranda Tab */}
        <button
          onClick={() => navigateTo('home')}
          aria-current={currentRoute === 'home' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center flex-1 min-w-0 min-h-[44px] py-1 transition-colors ${
            currentRoute === 'home'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="font-label-sm text-label-sm mt-0.5 tracking-tight text-[10px] truncate max-w-full">
            Beranda
          </span>
        </button>

        {/* Kamera Tab */}
        <button
          onClick={() => navigateTo('camera')}
          aria-current={currentRoute === 'camera' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center flex-1 min-w-0 min-h-[44px] py-1 transition-colors ${
            currentRoute === 'camera'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">photo_camera</span>
          <span className="font-label-sm text-label-sm mt-0.5 tracking-tight text-[10px] truncate max-w-full">
            Kamera
          </span>
          {shotsRemaining > 0 && (
            <span className="absolute top-1 right-1 sm:right-2 min-w-[16px] h-3.5 px-0.5 rounded-full bg-primary text-on-primary text-[8px] flex items-center justify-center font-bold shadow-2xs">
              {shotsRemaining > 999 ? `${Math.round(shotsRemaining / 1000)}k` : shotsRemaining}
            </span>
          )}
        </button>

        {/* Review Foto Tab */}
        <button
          onClick={() => navigateTo('review')}
          aria-current={currentRoute === 'review' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center flex-1 min-w-0 min-h-[44px] py-1 transition-colors ${
            currentRoute === 'review'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">camera_roll</span>
          <span className="font-label-sm text-label-sm mt-0.5 tracking-tight text-[10px] truncate max-w-full">
            Review
          </span>
          {userPhotosCount > 0 && (
            <span className="absolute top-1 right-1 sm:right-2 w-3.5 h-3.5 rounded-full bg-surface-container-high text-primary border border-primary/20 text-[8px] flex items-center justify-center font-bold">
              {userPhotosCount}
            </span>
          )}
        </button>

        {/* Galeri Bersama Tab */}
        <button
          onClick={() => navigateTo('gallery')}
          aria-current={currentRoute === 'gallery' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center flex-1 min-w-0 min-h-[44px] py-1 transition-colors ${
            currentRoute === 'gallery'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">photo_library</span>
          <span className="font-label-sm text-label-sm mt-0.5 tracking-tight text-[10px] truncate max-w-full">
            Galeri
          </span>
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
        </button>

        {/* Pesan Tamu (Group Chat) Tab */}
        <button
          onClick={() => navigateTo('chat')}
          aria-current={currentRoute === 'chat' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center flex-1 min-w-0 min-h-[44px] py-1 transition-colors ${
            currentRoute === 'chat'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">chat</span>
          <span className="font-label-sm text-label-sm mt-0.5 tracking-tight text-[10px] truncate max-w-full font-bold">
            Pesan
          </span>
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
        </button>

        {/* Pengantin Dashboard Tab */}
        <button
          onClick={() => navigateTo('dashboard')}
          aria-current={currentRoute === 'dashboard' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center flex-1 min-w-0 min-h-[44px] py-1 transition-colors ${
            currentRoute === 'dashboard'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">favorite</span>
          <span className="font-label-sm text-label-sm mt-0.5 tracking-tight text-[10px] truncate max-w-full">
            Pengantin
          </span>
        </button>
      </div>
    </nav>
  );
};
