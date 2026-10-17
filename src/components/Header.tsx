import React from 'react';
import { useApp } from '../context/AppContext';
import { AppRoute } from '../types';

export const Header: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    guestIdentity,
    getGuestInitials,
    setIsIdentityModalOpen,
    installPWA,
    isAppInstalled
  } = useApp();

  const getPageTitle = (route: AppRoute) => {
    switch (route) {
      case 'home':
        return 'Beranda';
      case 'camera':
        return 'Camera View';
      case 'review':
        return 'Review Foto';
      case 'gallery':
        return 'Galeri Bersama';
      case 'chat':
        return 'Pesan & Obrolan Tamu';
      case 'dashboard':
        return 'Dashboard Pengantin';
      default:
        return 'WedSnap';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(119,90,25,0.05)] pt-safe border-b border-outline-variant/20">
      <div className="h-16 px-gutter flex items-center justify-between gap-space-sm max-w-5xl mx-auto w-full">
        {/* Brand & Page Info */}
        <div 
          onClick={() => navigateTo('home')}
          className="flex items-center gap-space-sm min-w-0 cursor-pointer group"
          title="Ke Beranda"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-on-primary text-[20px]">
              photo_camera
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold leading-none">
              WedSnap
            </span>
            <h1 className="font-headline-sm text-headline-sm text-on-surface truncate leading-tight tracking-normal text-[18px]">
              {getPageTitle(currentRoute)}
            </h1>
          </div>
        </div>

        {/* Desktop Navigation Navigation Pills */}
        <div className="hidden md:flex items-center gap-1 bg-surface-container/60 p-1 rounded-full">
          <button
            onClick={() => navigateTo('home')}
            className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all ${
              currentRoute === 'home'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => navigateTo('camera')}
            className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all ${
              currentRoute === 'camera'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Kamera
          </button>
          <button
            onClick={() => navigateTo('review')}
            className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all ${
              currentRoute === 'review'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Review Foto
          </button>
          <button
            onClick={() => navigateTo('gallery')}
            className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all ${
              currentRoute === 'gallery'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Galeri
          </button>
          <button
            onClick={() => navigateTo('chat')}
            className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all ${
              currentRoute === 'chat'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Pesan Tamu
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all ${
              currentRoute === 'dashboard'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Dashboard
          </button>
        </div>

        {/* Right Actions: Install App Button & Guest Profile */}
        <div className="flex items-center gap-space-xs flex-shrink-0">
          {/* Install App Button */}
          {!isAppInstalled && (
            <button
              onClick={installPWA}
              title="Pasang WedSnap sebagai aplikasi di HP (Add to Home Screen)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-label-sm bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-all active:scale-95 shadow-2xs font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">install_mobile</span>
              <span className="hidden sm:inline">Pasang Aplikasi</span>
              <span className="sm:hidden">Instal</span>
            </button>
          )}

          {/* Guest Identity Profile Trigger */}
          <button
            onClick={() => setIsIdentityModalOpen(true)}
            className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface transition-all active:scale-95"
            title={
              guestIdentity?.name
                ? `${guestIdentity.name} (${guestIdentity.relationship}) - Ketuk untuk ubah identitas`
                : 'Isi Identitas Tamu Undangan'
            }
          >
            <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-[11px] font-bold shadow-xs">
              {guestIdentity?.name ? getGuestInitials(guestIdentity.name) : 'TM'}
            </div>
            <span className="hidden sm:inline text-xs font-semibold max-w-[90px] truncate text-on-surface">
              {guestIdentity?.name || 'Tamu'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
