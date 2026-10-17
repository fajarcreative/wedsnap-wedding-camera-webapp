import React from 'react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { currentRoute, navigateTo, photos, shotsRemaining } = useApp();

  const userPhotosCount = photos.filter((p) => p.isUserPhoto).length;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-2xl shadow-[0_-4px_24px_rgba(119,90,25,0.06)] border-t border-outline-variant/20 md:hidden"
      data-active-classes="text-primary font-semibold"
    >
      <div className="flex justify-around items-center h-20 px-space-xs max-w-lg mx-auto">
        {/* Beranda Tab */}
        <button
          onClick={() => navigateTo('home')}
          aria-current={currentRoute === 'home' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center min-w-[58px] min-h-[44px] py-1 transition-colors ${
            currentRoute === 'home'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
          <span className="font-label-sm text-label-sm mt-0.5 tracking-tight text-[11px]">
            Beranda
          </span>
        </button>

        {/* Kamera Tab */}
        <button
          onClick={() => navigateTo('camera')}
          aria-current={currentRoute === 'camera' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 transition-colors ${
            currentRoute === 'camera'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">photo_camera</span>
          <span className="font-label-sm text-label-sm mt-0.5 tracking-tight text-[11px]">
            Kamera
          </span>
          {shotsRemaining > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-primary text-on-primary text-[9px] flex items-center justify-center font-bold">
              {shotsRemaining}
            </span>
          )}
        </button>

        {/* Review Foto Tab */}
        <button
          onClick={() => navigateTo('review')}
          aria-current={currentRoute === 'review' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 transition-colors ${
            currentRoute === 'review'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">camera_roll</span>
          <span className="font-label-sm text-label-sm mt-0.5 tracking-tight text-[11px]">
            Review
          </span>
          {userPhotosCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-surface-container-high text-primary border border-primary/20 text-[9px] flex items-center justify-center font-bold">
              {userPhotosCount}
            </span>
          )}
        </button>

        {/* Galeri Bersama Tab */}
        <button
          onClick={() => navigateTo('gallery')}
          aria-current={currentRoute === 'gallery' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 transition-colors ${
            currentRoute === 'gallery'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">photo_library</span>
          <span className="font-label-sm text-label-sm mt-0.5 tracking-tight text-[11px]">
            Galeri
          </span>
          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-secondary animate-ping"></span>
        </button>

        {/* Pesan Tamu (Group Chat) Tab */}
        <button
          onClick={() => navigateTo('chat')}
          aria-current={currentRoute === 'chat' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 transition-colors ${
            currentRoute === 'chat'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">chat</span>
          <span className="font-label-sm text-label-sm mt-0.5 tracking-tight text-[11px]">
            Pesan
          </span>
          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        </button>

        {/* Pengantin Dashboard Tab */}
        <button
          onClick={() => navigateTo('dashboard')}
          aria-current={currentRoute === 'dashboard' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 transition-colors ${
            currentRoute === 'dashboard'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">favorite</span>
          <span className="font-label-sm text-label-sm mt-0.5 tracking-tight text-[11px]">
            Pengantin
          </span>
        </button>
      </div>
    </nav>
  );
};

