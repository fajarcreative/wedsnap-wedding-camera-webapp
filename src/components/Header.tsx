import React from 'react';
import { useApp } from '../context/AppContext';
import { AppRoute } from '../types';

export const Header: React.FC = () => {
  const { currentRoute, navigateTo, isEmptyStateMode, toggleEmptyStateMode } = useApp();

  const getPageTitle = (route: AppRoute) => {
    switch (route) {
      case 'camera':
        return 'Camera View';
      case 'review':
        return 'Review Foto';
      case 'gallery':
        return 'Galeri Bersama';
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
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-xs flex-shrink-0">
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
            Galeri Bersama
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all ${
              currentRoute === 'dashboard'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Dashboard Pengantin
          </button>
        </div>

        {/* Right Actions: Empty State Switcher & Profile */}
        <div className="flex items-center gap-space-xs flex-shrink-0">
          <button
            onClick={toggleEmptyStateMode}
            title={
              isEmptyStateMode
                ? 'Mode saat ini: Empty State Kosong (Klik untuk beralih ke Data Demo Stitch)'
                : 'Mode saat ini: Data Demo Stitch (Klik untuk beralih ke Empty State Kosong)'
            }
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-label-sm border transition-all ${
              isEmptyStateMode
                ? 'bg-secondary-container/40 text-on-secondary-container border-secondary/30'
                : 'bg-surface-container text-on-surface-variant border-outline-variant/40'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {isEmptyStateMode ? 'folder_open' : 'dataset'}
            </span>
            <span className="hidden sm:inline font-semibold">
              {isEmptyStateMode ? 'Empty State' : 'Data Demo'}
            </span>
          </button>

          <div
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm cursor-pointer hover:opacity-90"
            title="Profil Pengguna & Tamu"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

