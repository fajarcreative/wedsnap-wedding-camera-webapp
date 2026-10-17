import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { playShutterSound } from '../utils/sound';

export type AspectRatio = '4:5' | '1:1' | '9:16' | '3:4';
export type ButtonPosition = 'in_frame' | 'docked';

const ASPECT_RATIO_VALUES: Record<AspectRatio, number> = {
  '4:5': 4 / 5,
  '1:1': 1,
  '9:16': 9 / 16,
  '3:4': 3 / 4
};

const ASPECT_RATIO_CLASSES: Record<AspectRatio, string> = {
  '4:5': 'aspect-[4/5] max-h-[70vh]',
  '1:1': 'aspect-square max-h-[62vh]',
  '9:16': 'aspect-[9/16] max-h-[76vh]',
  '3:4': 'aspect-[3/4] max-h-[70vh]'
};

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

  // New Camera Mode States: Aspect Ratio & In-Frame Button Position
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:5');
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition>('in_frame');

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
        const targetRatio = ASPECT_RATIO_VALUES[aspectRatio];
        const videoW = video.videoWidth || 1080;
        const videoH = video.videoHeight || 1350;
        const videoRatio = videoW / videoH;

        let sWidth = videoW;
        let sHeight = videoH;
        let sx = 0;
        let sy = 0;

        if (videoRatio > targetRatio) {
          // Video stream is wider than target ratio: crop sides
          sWidth = videoH * targetRatio;
          sx = (videoW - sWidth) / 2;
        } else {
          // Video stream is taller than target ratio: crop top/bottom
          sHeight = videoW / targetRatio;
          sy = (videoH - sHeight) / 2;
        }

        const maxDim = 1440;
        let canvasW = maxDim;
        let canvasH = maxDim;
        if (targetRatio <= 1) {
          canvasH = maxDim;
          canvasW = Math.round(maxDim * targetRatio);
        } else {
          canvasW = maxDim;
          canvasH = Math.round(maxDim / targetRatio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (facingMode === 'user') {
            ctx.translate(canvasW, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvasW, canvasH);

          // Vintage Kodak 400 disposable camera film color grading filter
          ctx.globalCompositeOperation = 'overlay';
          ctx.fillStyle = 'rgba(245, 158, 11, 0.08)'; // warm amber tint
          ctx.fillRect(0, 0, canvasW, canvasH);

          // Add nostalgic vintage date stamp in bottom right
          ctx.globalCompositeOperation = 'source-over';
          ctx.font = 'bold 28px monospace';
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = 'rgba(0,0,0,0.85)';
          ctx.shadowBlur = 4;
          const dateStr = "'25 10 24";
          ctx.fillText(dateStr, canvasW - 170, canvasH - 32);

          photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
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
          <section className="relative w-full rounded-2xl bg-surface-container-high p-2.5 shadow-md border border-outline-variant/30">
            {/* Top Viewfinder Toolbar: Flash, Aspect Ratio & Button Mode */}
            <div className="flex items-center justify-between px-2 py-1.5 mb-2 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md gap-1.5 flex-wrap">
              {/* Flash Mode Toggle */}
              <button
                onClick={toggleFlash}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant active:scale-95 transition-transform"
                title="Ganti Mode Flash"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  {flashMode === 'AUTO'
                    ? 'flash_auto'
                    : flashMode === 'ON'
                    ? 'flash_on'
                    : 'flash_off'}
                </span>
                <span className="font-label-sm text-label-sm font-semibold text-xs">{flashMode}</span>
              </button>

              {/* Aspect Ratio Selector Pills (Rule: Rasio yang bisa diatur) */}
              <div className="flex items-center gap-1 bg-surface-container/80 p-0.5 rounded-full border border-outline-variant/30">
                {(['4:5', '1:1', '9:16', '3:4'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => {
                      setAspectRatio(ratio);
                      showToast('aspect_ratio', `Rasio kamera disetel ke ${ratio}`);
                    }}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold transition-all ${
                      aspectRatio === ratio
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title={`Ubah Rasio ke ${ratio}`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              {/* Shutter Placement Mode Toggle (In-Frame vs Docked) */}
              <button
                onClick={() => {
                  const nextPos = buttonPosition === 'in_frame' ? 'docked' : 'in_frame';
                  setButtonPosition(nextPos);
                  showToast(
                    nextPos === 'in_frame' ? 'crop_free' : 'dock',
                    nextPos === 'in_frame'
                      ? 'Mode Tombol di Dalam Frame aktif'
                      : 'Mode Tombol di Bawah Frame aktif'
                  );
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold active:scale-95 transition-all ${
                  buttonPosition === 'in_frame'
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
                title="Pilih posisi tombol kamera (Di dalam frame kamera / Di bawah frame)"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {buttonPosition === 'in_frame' ? 'crop_free' : 'vertical_align_bottom'}
                </span>
                <span className="hidden sm:inline font-label-sm text-label-sm">
                  {buttonPosition === 'in_frame' ? 'In-Frame' : 'Di Bawah'}
                </span>
              </button>
            </div>

            {/* Viewfinder Window (Aspect ratio dynamically matches selected ratio) */}
            <div
              style={{ aspectRatio: aspectRatio.replace(':', '/') }}
              className="relative w-full max-h-[70vh] rounded-xl overflow-hidden bg-inverse-surface shadow-inner select-none transition-all duration-300 mx-auto"
            >
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

              {/* Vintage Stamp Date (dynamically shifts upward when in-frame controls are active) */}
              <div
                className={`absolute ${
                  buttonPosition === 'in_frame' ? 'bottom-28' : 'bottom-3'
                } right-3.5 px-2 py-0.5 rounded bg-inverse-surface/60 backdrop-blur-sm pointer-events-none transition-all duration-300`}
              >
                <p className="font-label-sm text-label-sm tracking-widest text-[#f59e0b] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-mono font-bold text-[11px]">
                  '25 10 24
                </p>
              </div>

              {/* REC LIVE Badge */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-inverse-surface/60 backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
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

              {/* IN-FRAME CAMERA CONTROLS: Tombol Shutter di dalam frame kamera */}
              {buttonPosition === 'in_frame' && (
                <div className="absolute inset-x-0 bottom-3 px-4 z-20 flex flex-col items-center gap-2 pointer-events-auto animate-fade-in">
                  {/* Floating Exposure & Ratio Tag */}
                  <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="font-label-sm text-label-sm font-mono text-[11px] font-bold text-primary-fixed">
                      {shotsRemaining} / {totalShotsLimit} Foto
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="font-label-sm text-label-sm font-mono text-[10px] text-white/90">
                      Rasio {aspectRatio}
                    </span>
                  </div>

                  {/* Buttons Row: File/Gallery | TACTILE SHUTTER | Flip Lens */}
                  <div className="w-full flex items-center justify-between max-w-[280px] px-2">
                    {/* Left: Gallery / Upload file */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
                      title="Pilih dari Galeri Ponsel"
                      type="button"
                    >
                      {userRecentPhotos.length > 0 ? (
                        <img
                          src={userRecentPhotos[0].url}
                          alt="Terbaru"
                          className="w-full h-full object-cover rounded-full p-0.5"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[20px] text-primary-fixed">
                          photo_library
                        </span>
                      )}
                    </button>

                    {/* Center: Tactile In-Frame Shutter Button */}
                    <div className="relative flex items-center justify-center">
                      <div className="absolute -inset-2 rounded-full bg-primary/40 blur-md pointer-events-none animate-pulse"></div>
                      <div className="relative p-1 rounded-full bg-gradient-to-b from-primary-fixed via-primary to-amber-700 shadow-xl">
                        <button
                          onClick={handleShutter}
                          aria-label="Ambil Foto"
                          type="button"
                          className={`w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-[inset_0_2px_4px_rgba(119,90,25,0.4)] transition-all duration-100 ${
                            isShutterPressed ? 'scale-90 bg-surface-container' : 'active:scale-95'
                          }`}
                        >
                          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-primary-container via-primary-fixed to-secondary-container flex items-center justify-center shadow">
                            <span className="material-symbols-outlined text-on-primary-container text-[28px]">
                              photo_camera
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Right: Flip Camera Lens */}
                    <button
                      onClick={toggleFacingMode}
                      className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:rotate-180 transition-all duration-300 shadow-lg"
                      title="Balik Lensa Kamera (Depan / Belakang)"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px] text-white">
                        flip_camera_ios
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DOCKED CONTROLS: Tepat di Bawah Frame (Tanpa Jarak Jauh) */}
            {buttonPosition === 'docked' && (
              <div className="w-full flex items-center justify-between px-3 py-2 mt-2 rounded-xl bg-surface-container shadow-inner border border-outline-variant/20 animate-fade-in">
                {/* Left: Upload file / gallery */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-11 h-11 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface active:scale-90 transition-transform shadow-sm"
                  title="Pilih dari Galeri Ponsel"
                  type="button"
                >
                  {userRecentPhotos.length > 0 ? (
                    <img
                      src={userRecentPhotos[0].url}
                      alt="Terbaru"
                      className="w-full h-full object-cover rounded-full p-0.5"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      photo_library
                    </span>
                  )}
                </button>

                {/* Center: Tactile Shutter with Exposures count */}
                <div className="flex flex-col items-center gap-1">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute -inset-2 rounded-full bg-primary-container/30 blur-sm pointer-events-none animate-pulse"></div>
                    <div className="relative p-1 rounded-full bg-gradient-to-b from-primary-fixed-dim to-primary shadow-lg">
                      <button
                        onClick={handleShutter}
                        aria-label="Ambil Foto"
                        type="button"
                        className={`w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-[inset_0_2px_4px_rgba(119,90,25,0.3)] transition-all duration-100 ${
                          isShutterPressed ? 'scale-90 bg-surface-container' : 'active:scale-95'
                        }`}
                      >
                        <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-primary-container via-primary-fixed to-secondary-container flex items-center justify-center shadow">
                          <span className="material-symbols-outlined text-on-primary-container text-[28px]">
                            photo_camera
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm font-mono font-bold text-primary text-[11px]">
                    {shotsRemaining} / {totalShotsLimit} Foto
                  </span>
                </div>

                {/* Right: Flip Camera */}
                <button
                  onClick={toggleFacingMode}
                  className="w-11 h-11 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface active:rotate-180 transition-all duration-300 shadow-sm"
                  title="Balik Lensa Kamera (Depan / Belakang)"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    flip_camera_ios
                  </span>
                </button>
              </div>
            )}

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
                <span className="font-label-sm text-label-sm text-on-surface-variant font-mono text-xs">
                  KODAK 400
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (Controls Side-Rail on Desktop & Tablet) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Shutter Deck & Mechanical Dial Section (Visible on desktop or complementary indicator) */}
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

            {/* Desktop-only Shutter button for users operating with mouse */}
            <div className="hidden lg:flex flex-col items-center gap-1.5 my-1">
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-3 rounded-full bg-primary-container/20 blur-sm pointer-events-none animate-pulse"></div>
                <div className="relative p-1.5 rounded-full bg-gradient-to-b from-primary-fixed-dim to-primary shadow-lg">
                  <button
                    onClick={handleShutter}
                    aria-label="Ambil Foto (Desktop)"
                    type="button"
                    className={`w-18 h-18 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-[inset_0_2px_6px_rgba(119,90,25,0.25)] transition-all duration-100 group ${
                      isShutterPressed ? 'scale-90 bg-surface-container' : 'active:scale-95'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary-container via-primary-fixed to-secondary-container flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-on-primary-container text-[26px] group-active:scale-95 transition-transform">
                        photo_camera
                      </span>
                    </div>
                  </button>
                </div>
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase text-[10px]">
                Tekan tombol untuk mengambil foto
              </p>
            </div>
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

