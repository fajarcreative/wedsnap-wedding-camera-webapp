import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { playShutterSound } from '../utils/sound';

export const CameraView: React.FC = () => {
  const {
    photos,
    shotsRemaining,
    totalShotsLimit,
    takePhoto,
    retryUpload,
    navigateTo,
    eventSettings,
    setPreviewPhoto,
    showToast
  } = useApp();

  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [flashMode, setFlashMode] = useState<'AUTO' | 'ON' | 'OFF'>('AUTO');
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [isShutterPressed, setIsShutterPressed] = useState<boolean>(false);
  const [dialShift, setDialShift] = useState<number>(0);
  const [isRetryingCamera, setIsRetryingCamera] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Browser Camera
  const startCamera = useCallback(async () => {
    try {
      setPermissionError(false);
      setIsRetryingCamera(true);

      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1080 },
            height: { ideal: 1350 }
          },
          audio: false
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setIsCameraActive(true);
      } else {
        setPermissionError(true);
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setPermissionError(true);
      setIsCameraActive(false);
    } finally {
      setIsRetryingCamera(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Flip Camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Flash mode cycle
  const toggleFlash = () => {
    if (flashMode === 'AUTO') setFlashMode('ON');
    else if (flashMode === 'ON') setFlashMode('OFF');
    else setFlashMode('AUTO');
  };

  // Shutter action
  const handleShutter = async () => {
    if (shotsRemaining <= 0) {
      showToast('warning', 'Rol film Anda telah habis (36/36 foto terpakai)! Silakan nikmati galeri bersama.', 'error');
      return;
    }

    setIsShutterPressed(true);
    playShutterSound();

    if (navigator.vibrate) {
      navigator.vibrate(45);
    }

    // Trigger visual flash
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 140);

    // Mechanical dial wheel jitter animation
    setDialShift(Math.random() > 0.5 ? -3 : 3);
    setTimeout(() => setDialShift(0), 220);

    let photoDataUrl = '';

    if (isCameraActive && videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 900;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Vintage Kodak 400 disposable camera film color grading filter
          ctx.globalCompositeOperation = 'overlay';
          ctx.fillStyle = 'rgba(245, 158, 11, 0.08)'; // warm amber tint
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Add nostalgic vintage date stamp in bottom right
          ctx.globalCompositeOperation = 'source-over';
          ctx.font = 'bold 24px monospace';
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          const dateStr = "'25 10 24";
          ctx.fillText(dateStr, canvas.width - 150, canvas.height - 30);

          photoDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        }
      } catch (e) {
        console.error('Canvas capture failed', e);
      }
    }

    // Fallback if camera stream not available
    if (!photoDataUrl) {
      photoDataUrl =
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDZtG3lM_qf8sa-IHjbgH6zEGsUUcoIeS8YF9w2N_4riNlq-kp6XSdCTnPIpxO7BDieOmKa9LTmuhJvo8FdeTwsWOJpm2GaSj1HY_slgHvxqIi5dDQBxTL405LSzQ9btFQ3YS2pQ6VjP79PxeLEwrM4KTUWPDNR_2dQWvNUK-HpAcmYMNzhbIR0AtOh9jC0t42zldTICUlLUoO9E_2cbZQtJNeL1TRK3wgdR447MlGvIKwU8nQL2KZpOw';
    }

    await takePhoto(photoDataUrl);
    setTimeout(() => setIsShutterPressed(false), 200);
  };

  // Upload photo from device file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          takePhoto(event.target.result as string, 'Unggahan Galeri Ponsel');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Recent user photos
  const userRecentPhotos = photos.filter((p) => p.isUserPhoto).slice(0, 3);

  return (
    <div className="flex flex-col w-full px-margin pb-6 gap-space-md max-w-lg lg:max-w-5xl mx-auto">
      {/* Event Sub-Header */}
      <section className="flex flex-col items-center text-center pt-2">
        <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-primary font-bold">
          {eventSettings.title}
        </span>
        <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight mt-1 text-[26px]">
          {eventSettings.coupleNames}
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant italic mt-0.5">
          {eventSettings.date} • {eventSettings.venue}
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-full bg-surface-container shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Foto-fotomu akan menjadi bagian dari kenangan indah kami
          </p>
        </div>
      </section>

      {/* Permission Warning Banner (Rule #9) */}
      {permissionError && (
        <div
          id="permission-banner"
          className="flex flex-col gap-2 p-3.5 rounded-xl bg-secondary-fixed text-on-secondary-fixed shadow-sm animate-fade-in"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-secondary">
                videocam_off
              </span>
              <span className="font-label-lg text-label-lg font-semibold">
                Izin Kamera Belum Aktif
              </span>
            </div>
            <button
              className="text-on-secondary-fixed hover:opacity-75"
              onClick={() => setPermissionError(false)}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <p className="font-body-sm text-body-sm leading-snug">
            Aktifkan akses lensa di browser agar WedSnap dapat merekam kehangatan momen{' '}
            {eventSettings.coupleNames}.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={startCamera}
              disabled={isRetryingCamera}
              className="px-3 py-1.5 rounded-lg bg-surface text-secondary font-label-md text-label-md font-semibold shadow-xs active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <span
                className={`material-symbols-outlined text-[16px] ${
                  isRetryingCamera ? 'animate-spin' : ''
                }`}
              >
                refresh
              </span>
              {isRetryingCamera ? 'Menghubungkan...' : 'Muat Ulang Kamera'}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold shadow-xs active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              Pilih dari File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      )}

      {/* Responsive Viewfinder + Controls Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Viewfinder Housing */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <section className="relative w-full rounded-2xl bg-surface-container-high p-2 shadow-md border border-outline-variant/30">
            {/* Top Viewfinder Toolbar */}
            <div className="flex items-center justify-between px-2.5 py-1.5 mb-2 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                {/* Flash Mode Toggle */}
                <button
                  onClick={toggleFlash}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant active:scale-95 transition-transform"
                  title="Ganti Mode Flash"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    {flashMode === 'AUTO'
                      ? 'flash_auto'
                      : flashMode === 'ON'
                      ? 'flash_on'
                      : 'flash_off'}
                  </span>
                  <span className="font-label-sm text-label-sm font-semibold">{flashMode}</span>
                </button>

                {/* ISO Meter */}
                <div className="flex items-center px-2 py-1 rounded-full bg-surface-container/60">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                    ISO 400
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wider font-mono">
                  EXP ±0.0
                </span>
                {/* Flip Camera Trigger */}
                <button
                  onClick={toggleFacingMode}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface active:rotate-180 transition-transform duration-300"
                  title="Balik Lensa Kamera (Depan / Belakang)"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    flip_camera_ios
                  </span>
                </button>
              </div>
            </div>

            {/* Viewfinder Window (Aspect 4:5 as in Stitch template) */}
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-inverse-surface shadow-inner select-none">
              {/* Live Video Feed or Fallback Background */}
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-transform ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  }`}
                />
              ) : (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-300 filter contrast-[1.05] saturate-[1.1]"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZtG3lM_qf8sa-IHjbgH6zEGsUUcoIeS8YF9w2N_4riNlq-kp6XSdCTnPIpxO7BDieOmKa9LTmuhJvo8FdeTwsWOJpm2GaSj1HY_slgHvxqIi5dDQBxTL405LSzQ9btFQ3YS2pQ6VjP79PxeLEwrM4KTUWPDNR_2dQWvNUK-HpAcmYMNzhbIR0AtOh9jC0t42zldTICUlLUoO9E_2cbZQtJNeL1TRK3wgdR447MlGvIKwU8nQL2KZpOw')`
                  }}
                />
              )}

              {/* Film Tint Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary-fixed/20 pointer-events-none mix-blend-screen"></div>

              {/* Golden Crosshair Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-28 h-28 flex items-center justify-center opacity-60">
                  <div className="absolute w-full h-[1px] bg-primary-fixed-dim/70"></div>
                  <div className="absolute h-full w-[1px] bg-primary-fixed-dim/70"></div>
                  <div className="w-8 h-8 rounded-full border border-primary-fixed-dim/80"></div>
                </div>
              </div>

              {/* Corner Framing Tick Marks */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-primary-fixed-dim/80 pointer-events-none"></div>
              <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-primary-fixed-dim/80 pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-primary-fixed-dim/80 pointer-events-none"></div>
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-primary-fixed-dim/80 pointer-events-none"></div>

              {/* Vintage Stamp Date */}
              <div className="absolute bottom-3 right-3.5 px-2 py-0.5 rounded bg-inverse-surface/50 backdrop-blur-sm pointer-events-none">
                <p className="font-label-sm text-label-sm tracking-widest text-[#f59e0b] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-mono font-bold">
                  '25 10 24
                </p>
              </div>

              {/* REC LIVE Badge */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-inverse-surface/50 backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                <span className="font-label-sm text-label-sm text-on-primary tracking-wider uppercase font-semibold text-[10px]">
                  REC • {isCameraActive ? 'LIVE' : 'SIM'}
                </span>
              </div>

              {/* Screen Flash Animation */}
              <div
                className={`absolute inset-0 bg-surface-container-lowest pointer-events-none transition-opacity duration-150 ${
                  flashActive ? 'opacity-90' : 'opacity-0'
                }`}
              ></div>
            </div>

            {/* Viewfinder Footer Legend */}
            <div className="flex items-center justify-between mt-2.5 px-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  auto_stories
                </span>
                <p className="font-headline-sm text-headline-sm text-on-surface italic text-sm">
                  Abadikan momen-momen kecil yang berarti.
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[16px]">
                  lens_blur
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                  KODAK 400
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (Controls Side-Rail on Desktop & Tablet) */}
        <div className="lg:col-span-5 flex flex-col gap-4">

      {/* Shutter Deck & Mechanical Dial Section */}
      <section className="flex flex-col items-center gap-space-sm pt-1">
        {/* Dial Wheel & Exposures Remaining */}
        <div className="flex items-center justify-between w-full max-w-xs px-4 py-2 rounded-xl bg-surface-container shadow-inner border border-outline-variant/20">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-md bg-inverse-surface flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 flex flex-col items-center justify-center text-primary-fixed-dim transition-transform duration-300"
                style={{ transform: `translateY(${dialShift}px)` }}
              >
                <span className="font-label-sm text-label-sm font-mono font-bold leading-none text-xs">
                  {shotsRemaining}
                </span>
              </div>
              <div className="absolute inset-x-0 top-0 h-1 bg-surface-dim/40 pointer-events-none"></div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-surface-dim/40 pointer-events-none"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold text-[10px]">
                Film Roll #01
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant text-xs leading-none">
                Vintage Kodacolor
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-headline-sm text-headline-sm text-primary font-bold">
              {shotsRemaining}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              / {totalShotsLimit} Foto
            </span>
          </div>
        </div>

        {/* Tactile Dual-Ring Shutter Button */}
        <div className="relative flex items-center justify-center my-2">
          <div className="absolute -inset-3 rounded-full bg-primary-container/20 blur-sm pointer-events-none animate-pulse"></div>
          <div className="relative p-1.5 rounded-full bg-gradient-to-b from-primary-fixed-dim to-primary shadow-lg">
            <button
              onClick={handleShutter}
              aria-label="Ambil Foto"
              className={`w-20 h-20 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-[inset_0_2px_6px_rgba(119,90,25,0.25)] transition-all duration-100 group ${
                isShutterPressed ? 'scale-90 bg-surface-container' : 'active:scale-95'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-container via-primary-fixed to-secondary-container flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-on-primary-container text-[30px] group-active:scale-95 transition-transform">
                  photo_camera
                </span>
              </div>
            </button>
          </div>
        </div>

        <p className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
          Tekan untuk menjepret momen indah
        </p>
      </section>

      {/* Rol Foto Baru Saja Strip */}
      <section className="flex flex-col gap-2 mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">
              collections
            </span>
            <h3 className="font-label-lg text-label-lg text-on-surface font-semibold">
              Rol Foto Anda Baru Saja
            </h3>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Otomatis sinkron
          </span>
        </div>

        {userRecentPhotos.length === 0 ? (
          <div className="p-4 rounded-xl bg-surface-container/60 text-center text-on-surface-variant">
            <p className="font-body-sm text-body-sm">
              Belum ada foto yang diambil. Tekan tombol kamera di atas!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {userRecentPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setPreviewPhoto(photo)}
                className="relative flex flex-col p-1.5 rounded-xl bg-surface-container shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-dim">
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />

                  {photo.status === 'saved' && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow">
                      <span className="material-symbols-outlined text-on-primary text-[13px]">
                        check
                      </span>
                    </div>
                  )}

                  {photo.status === 'uploading' && (
                    <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full border-2 border-primary-fixed border-t-transparent animate-spin"></div>
                    </div>
                  )}

                  {photo.status === 'failed' && (
                    <div className="absolute inset-0 bg-error-container/60 flex flex-col items-center justify-center p-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          retryUpload(photo.id);
                        }}
                        className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm active:scale-95 shadow-xs flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-[12px]">replay</span>
                        Ulang
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1 px-0.5">
                  <span
                    className={`font-label-sm text-label-sm font-bold ${
                      photo.status === 'failed' ? 'text-error' : 'text-primary'
                    }`}
                  >
                    #{photo.frameNumber < 10 ? `0${photo.frameNumber}` : photo.frameNumber}
                  </span>
                  <span
                    className={`font-label-sm text-label-sm truncate ${
                      photo.status === 'saved'
                        ? 'text-on-surface-variant'
                        : photo.status === 'uploading'
                        ? 'text-secondary font-medium'
                        : 'text-error'
                    }`}
                  >
                    {photo.status === 'saved'
                      ? 'Tersimpan'
                      : photo.status === 'uploading'
                      ? 'Unggah...'
                      : 'Koneksi lemah'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Action Navigation Buttons */}
      <section className="flex flex-col gap-2 pt-1">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigateTo('review')}
            className="flex items-center justify-center gap-1.5 h-12 rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg active:scale-95 transition-all shadow-sm hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">
              photo_library
            </span>
            <span>Foto Saya ({userRecentPhotos.length})</span>
          </button>

          <button
            onClick={() => navigateTo('gallery')}
            className="flex items-center justify-center gap-1.5 h-12 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg active:scale-95 transition-all shadow-md hover:opacity-95"
          >
            <span className="material-symbols-outlined text-[18px]">favorite</span>
            <span>Galeri Bersama</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 py-1 text-center">
          <span className="material-symbols-outlined text-primary text-[14px]">lock</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">
            Momen tersimpan selamanya dalam album kenangan {eventSettings.coupleNames}
          </p>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
};

