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

  // New Camera Mode States: Aspect Ratio (default 9:16) & In-Frame Button Position
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition>('in_frame');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Browser Camera with progressive mobile fallbacks
  const startCamera = useCallback(async () => {
    try {
      setPermissionError(false);
      setIsRetryingCamera(true);

      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError(true);
        setIsCameraActive(false);
        return;
      }

      const constraintPresets: MediaStreamConstraints[] = [
        {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        },
        {
          video: {
            facingMode: { ideal: facingMode }
          },
          audio: false
        },
        {
          video: {
            facingMode: facingMode
          },
          audio: false
        },
        {
          video: true,
          audio: false
        }
      ];

      let stream: MediaStream | null = null;
      let lastErr: any = null;

      for (const preset of constraintPresets) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(preset);
          if (stream) break;
        } catch (err) {
          lastErr = err;
        }
      }

      if (!stream) {
        throw lastErr || new Error('Tidak dapat mengakses kamera');
      }

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.srcObject = stream;
        try {
          await video.play();
        } catch (playErr) {
          console.warn('Auto play video warning:', playErr);
        }
      }
      setIsCameraActive(true);
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

    if (videoRef.current && videoRef.current.videoWidth > 0) {
      try {
        const video = videoRef.current;
        const targetRatio = ASPECT_RATIO_VALUES[aspectRatio];
        const videoW = video.videoWidth;
        const videoH = video.videoHeight;
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

    try {
      await takePhoto(photoDataUrl);
    } catch (err) {
      console.warn('Photo capture ended with notice', err);
    } finally {
      setTimeout(() => setIsShutterPressed(false), 200);
    }
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
    <div className="flex flex-col w-full h-full max-h-full px-2 py-1 mx-auto max-w-lg lg:max-w-5xl overflow-hidden justify-between select-none">
      {/* Top Bar: Couple Name & Controls */}
      <div className="flex items-center justify-between px-2.5 py-1 mb-1 rounded-xl bg-surface-container-lowest/85 backdrop-blur-md gap-1 flex-shrink-0 border border-outline-variant/30 shadow-xs">
        {/* Left: Couple Name badge */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0"></span>
          <span className="font-label-sm text-label-sm font-bold text-on-surface truncate text-xs">
            {eventSettings.coupleNames}
          </span>
        </div>

        {/* Center: Aspect Ratio Selector Pills (Default 9:16) */}
        <div className="flex items-center gap-0.5 bg-surface-container/90 p-0.5 rounded-full border border-outline-variant/30">
          {(['9:16', '4:5', '1:1', '3:4'] as const).map((ratio) => (
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

        {/* Right Tools: Flash & File Upload */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={toggleFlash}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-surface-container text-on-surface-variant active:scale-95 transition-transform"
            title={`Mode Flash: ${flashMode}`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">
              {flashMode === 'AUTO' ? 'flash_auto' : flashMode === 'ON' ? 'flash_on' : 'flash_off'}
            </span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-surface-container text-on-surface-variant active:scale-95 transition-transform"
            title="Pilih File dari Galeri Ponsel"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
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

      {/* Permission Warning Banner if any */}
      {permissionError && (
        <div
          id="permission-banner"
          className="flex items-center justify-between gap-2 p-2 mb-1 rounded-xl bg-secondary-fixed text-on-secondary-fixed shadow-sm animate-fade-in flex-shrink-0 text-xs"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="material-symbols-outlined text-[16px] text-secondary flex-shrink-0">
              videocam_off
            </span>
            <span className="truncate">Izin kamera belum aktif</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={startCamera}
              disabled={isRetryingCamera}
              className="px-2 py-0.5 rounded-lg bg-surface text-secondary text-[11px] font-semibold active:scale-95"
            >
              {isRetryingCamera ? '...' : 'Muat Ulang'}
            </button>
            <button
              className="text-on-secondary-fixed"
              onClick={() => setPermissionError(false)}
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Full Responsive Camera Viewport */}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center relative overflow-hidden">
        {/* Viewfinder Window (Zero scrolling on mobile, full camera) */}
        <div
          style={{ aspectRatio: aspectRatio.replace(':', '/') }}
          className="relative w-full h-full max-h-full max-w-full rounded-2xl overflow-hidden bg-black shadow-2xl select-none mx-auto flex items-center justify-center transition-all duration-300"
        >
          {/* Live Video Feed - Always mounted so videoRef is always available */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            } ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Fallback Overlay & Explicit Activate Button if camera not yet playing */}
          {!isCameraActive && (
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300 filter contrast-[1.05] saturate-[1.1] flex flex-col items-center justify-center p-4 text-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZtG3lM_qf8sa-IHjbgH6zEGsUUcoIeS8YF9w2N_4riNlq-kp6XSdCTnPIpxO7BDieOmKa9LTmuhJvo8FdeTwsWOJpm2GaSj1HY_slgHvxqIi5dDQBxTL405LSzQ9btFQ3YS2pQ6VjP79PxeLEwrM4KTUWPDNR_2dQWvNUK-HpAcmYMNzhbIR0AtOh9jC0t42zldTICUlLUoO9E_2cbZQtJNeL1TRK3wgdR447MlGvIKwU8nQL2KZpOw')`
              }}
            >
              <div className="bg-black/75 backdrop-blur-md p-4 rounded-2xl max-w-xs text-white border border-white/20 shadow-xl flex flex-col items-center">
                <span className="material-symbols-outlined text-[36px] text-primary mb-1">
                  photo_camera
                </span>
                <p className="text-xs font-semibold mb-2.5">
                  {permissionError
                    ? 'Izin kamera belum aktif. Ketuk tombol untuk menghubungkan kamera HP Anda.'
                    : 'Menghubungkan ke kamera ponsel...'}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isRetryingCamera}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">videocam</span>
                  <span>{isRetryingCamera ? 'Menghubungkan...' : 'Aktifkan Kamera'}</span>
                </button>
              </div>
            </div>
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
          <div className="absolute bottom-24 right-3.5 px-2 py-0.5 rounded bg-inverse-surface/60 backdrop-blur-sm pointer-events-none">
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

          {/* IN-FRAME CAMERA CONTROLS: Tombol Shutter & Lihat Gambar di Dalam Frame */}
          <div className="absolute inset-x-0 bottom-3 px-4 z-20 flex flex-col items-center gap-2 pointer-events-auto">
            {/* Floating Exposure & Ratio Tag */}
            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white shadow-lg">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm font-mono text-[11px] font-bold text-primary-fixed">
                {shotsRemaining} / {totalShotsLimit} Foto
              </span>
              <span className="text-white/40">•</span>
              <span className="font-label-sm text-label-sm font-mono text-[10px] text-white/90">
                {aspectRatio}
              </span>
            </div>

            {/* Buttons Row: Lihat Gambar (Review) | TACTILE SHUTTER | Flip Lens */}
            <div className="w-full flex items-center justify-between max-w-[280px] px-2">
              {/* Left: LIHAT GAMBAR (langsung terhubung ke menu Review!) */}
              <button
                onClick={() => navigateTo('review')}
                className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/30 flex items-center justify-center text-white active:scale-90 transition-transform shadow-xl relative group flex-shrink-0"
                title="Lihat Rol Foto Saya (Buka Menu Review)"
                type="button"
              >
                {userRecentPhotos.length > 0 ? (
                  <>
                    <img
                      src={userRecentPhotos[0].url}
                      alt="Foto Terakhir"
                      className="w-full h-full object-cover rounded-full p-0.5"
                    />
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold shadow flex items-center justify-center">
                      {photos.filter((p) => p.isUserPhoto).length}
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[22px] text-primary-fixed">
                      camera_roll
                    </span>
                  </div>
                )}
              </button>

              {/* Center: Tactile In-Frame Shutter Button */}
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-2.5 rounded-full bg-primary/40 blur-md pointer-events-none animate-pulse"></div>
                <div className="relative p-1 rounded-full bg-gradient-to-b from-primary-fixed via-primary to-amber-700 shadow-2xl">
                  <button
                    onClick={handleShutter}
                    aria-label="Ambil Foto"
                    type="button"
                    className={`w-17 h-17 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-[inset_0_2px_4px_rgba(119,90,25,0.4)] transition-all duration-100 ${
                      isShutterPressed ? 'scale-90 bg-surface-container' : 'active:scale-95'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary-container via-primary-fixed to-secondary-container flex items-center justify-center shadow">
                      <span className="material-symbols-outlined text-on-primary-container text-[30px]">
                        photo_camera
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Right: Flip Camera Lens */}
              <button
                onClick={toggleFacingMode}
                className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/25 flex items-center justify-center text-white active:rotate-180 transition-all duration-300 shadow-xl flex-shrink-0"
                title="Balik Lensa Kamera (Depan / Belakang)"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px] text-white">
                  flip_camera_ios
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

