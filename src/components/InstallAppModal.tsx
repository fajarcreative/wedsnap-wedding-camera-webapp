import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const InstallAppModal: React.FC = () => {
  const { isInstallModalOpen, setIsInstallModalOpen, deferredPrompt, installPWA, isAppInstalled } =
    useApp();

  // Detect iOS
  const isIOS =
    typeof window !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const [activeTab, setActiveTab] = useState<'ios' | 'android'>(isIOS ? 'ios' : 'android');

  if (!isInstallModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary-container/70 via-surface-container to-surface p-5 border-b border-outline-variant/20 flex flex-col items-center text-center">
          <button
            onClick={() => setIsInstallModalOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
            title="Tutup"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          <div className="w-16 h-16 rounded-2xl bg-surface shadow-md border border-outline-variant/30 flex items-center justify-center mb-3 overflow-hidden p-2">
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-on-primary text-[30px]">
                photo_camera
              </span>
            </div>
          </div>

          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
            Aplikasi Mobile
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1 text-[20px] font-semibold">
            Pasang WedSnap di HP Anda
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-[13px] max-w-xs">
            Buka kamera lebih cepat, mode layar penuh (full screen), dan hemat kuota selama pesta pernikahan!
          </p>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {isAppInstalled ? (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center space-y-2">
              <span className="material-symbols-outlined text-primary text-[32px]">
                check_circle
              </span>
              <h3 className="text-sm font-bold text-on-surface">
                Aplikasi Sudah Terpasang!
              </h3>
              <p className="text-xs text-on-surface-variant">
                Anda sudah dapat membuka WedSnap langsung dari Layar Utama HP Anda.
              </p>
            </div>
          ) : (
            <>
              {/* Direct 1-Click Install Button if supported */}
              {deferredPrompt && (
                <button
                  onClick={installPWA}
                  className="w-full py-3.5 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider font-bold shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mb-2"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  <span>Pasang Sekarang (1-Klik)</span>
                </button>
              )}

              {/* OS Tabs */}
              <div className="flex rounded-xl bg-surface-container p-1 border border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'android'
                      ? 'bg-surface text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">android</span>
                  <span>Android (Chrome)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'ios'
                      ? 'bg-surface text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">phone_iphone</span>
                  <span>iPhone / iPad (Safari)</span>
                </button>
              </div>

              {/* Step by Step Guide */}
              {activeTab === 'ios' ? (
                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="text-xs text-on-surface leading-relaxed">
                      Buka situs ini di browser <span className="font-semibold text-primary">Safari</span>, lalu ketuk tombol <span className="font-semibold">Bagikan (Share)</span>{' '}
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-surface rounded border border-outline-variant/40 font-mono text-[11px]">
                        <span className="material-symbols-outlined text-[14px]">ios_share</span>
                      </span>{' '}
                      di bar bawah Safari.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-xs text-on-surface leading-relaxed">
                      Gulir ke bawah dan ketuk opsi{' '}
                      <span className="font-bold text-primary">"Tambah ke Layar Utama"</span>{' '}
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-surface rounded border border-outline-variant/40 text-[11px]">
                        <span className="material-symbols-outlined text-[14px]">add_box</span> (Add to Home Screen)
                      </span>.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="text-xs text-on-surface leading-relaxed">
                      Ketuk <span className="font-bold text-primary">"Tambah" (Add)</span> di pojok kanan atas. Ikon WedSnap akan langsung muncul di Layar Utama HP Anda seperti aplikasi native!
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="text-xs text-on-surface leading-relaxed">
                      Buka menu browser Chrome dengan mengetuk ikon <span className="font-bold">titik tiga (⋮)</span> di pojok kanan atas layar.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-xs text-on-surface leading-relaxed">
                      Pilih <span className="font-bold text-primary">"Instal aplikasi"</span> atau <span className="font-bold text-primary">"Tambahkan ke Layar Utama"</span>.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="text-xs text-on-surface leading-relaxed">
                      Konfirmasi pemasangan. Aplikasi WedSnap siap digunakan langsung dari layar utama kapan saja!
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Feature Badges */}
          <div className="pt-2 border-t border-outline-variant/20 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-surface-container text-[11px]">
              <span className="material-symbols-outlined text-primary text-[18px] block mb-0.5">
                speed
              </span>
              <span className="text-on-surface-variant font-medium">Buka Cepat</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-container text-[11px]">
              <span className="material-symbols-outlined text-primary text-[18px] block mb-0.5">
                fullscreen
              </span>
              <span className="text-on-surface-variant font-medium">Layar Penuh</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-container text-[11px]">
              <span className="material-symbols-outlined text-primary text-[18px] block mb-0.5">
                offline_pin
              </span>
              <span className="text-on-surface-variant font-medium">Ringan & Offline</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsInstallModalOpen(false)}
            className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
