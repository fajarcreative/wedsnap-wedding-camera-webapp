import React from 'react';
import { useApp } from '../context/AppContext';

export const PolaroidModal: React.FC = () => {
  const { previewPhoto, setPreviewPhoto, deletePhoto } = useApp();

  if (!previewPhoto) return null;

  const handleDelete = () => {
    if (
      window.confirm(
        'Hapus foto ini dari rol film kamu? Kuota frame akan tetap terhitung sesuai aturan kamera analog.'
      )
    ) {
      deletePhoto(previewPhoto.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/85 backdrop-blur-md flex flex-col justify-between p-4 transition-opacity">
      {/* Modal Top Bar */}
      <div className="flex items-center justify-between pt-safe max-w-sm w-full mx-auto">
        <div className="flex flex-col text-inverse-on-surface">
          <span className="font-label-sm text-label-sm tracking-widest text-primary-fixed-dim uppercase">
            FRAME #{previewPhoto.frameNumber < 10 ? `0${previewPhoto.frameNumber}` : previewPhoto.frameNumber} • {previewPhoto.timestamp}
          </span>
          <h4 className="font-headline-sm text-headline-sm text-inverse-on-surface line-clamp-1">
            {previewPhoto.caption}
          </h4>
        </div>
        <button
          onClick={() => setPreviewPhoto(null)}
          className="w-10 h-10 rounded-full bg-surface-container-highest/20 text-inverse-on-surface flex items-center justify-center backdrop-blur-sm active:scale-95 transition-transform"
          type="button"
          aria-label="Tutup Pratinjau"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>

      {/* Zoomable Photo Container with Polaroid Style Margin */}
      <div className="flex-1 flex items-center justify-center my-auto py-4">
        <div className="bg-surface-container-lowest p-3 pb-8 rounded-xl shadow-2xl max-w-sm w-full transition-transform transform">
          <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-surface-container">
            <img
              src={previewPhoto.url}
              alt={previewPhoto.caption}
              className="w-full h-full object-cover"
            />
            {/* Status Pill */}
            <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              {previewPhoto.status === 'saved' && (
                <>
                  <span
                    className="material-symbols-outlined text-primary text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface font-medium">
                    Tersimpan di Cloud
                  </span>
                </>
              )}
              {previewPhoto.status === 'uploading' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold">
                    Sedang Mengunggah...
                  </span>
                </>
              )}
              {previewPhoto.status === 'failed' && (
                <>
                  <span className="material-symbols-outlined text-error text-[16px]">
                    error
                  </span>
                  <span className="font-label-sm text-label-sm text-error font-semibold">
                    Gagal Mengunggah
                  </span>
                </>
              )}
            </div>

            <div className="absolute bottom-2 right-2 bg-inverse-surface/60 backdrop-blur-xs text-inverse-on-surface rounded px-1.5 py-0.5 font-label-sm text-label-sm">
              #{previewPhoto.frameNumber < 10 ? `0${previewPhoto.frameNumber}` : previewPhoto.frameNumber}
            </div>
          </div>

          <div className="pt-4 px-2 text-center">
            <p className="font-headline-sm text-headline-sm italic text-on-surface text-[17px]">
              {previewPhoto.caption}
            </p>
            <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest mt-1 block">
              WedSnap Kept Memory • {previewPhoto.author}
            </span>
          </div>
        </div>
      </div>

      {/* Modal Bottom Actions */}
      <div className="flex items-center gap-3 pb-safe max-w-sm w-full mx-auto">
        {previewPhoto.isUserPhoto && (
          <button
            onClick={handleDelete}
            type="button"
            className="flex-1 h-12 bg-error text-on-error rounded-xl flex items-center justify-center gap-2 font-label-lg text-label-lg uppercase tracking-wider active:scale-95 transition-transform shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
            <span>Hapus Foto</span>
          </button>
        )}
        <button
          onClick={() => setPreviewPhoto(null)}
          type="button"
          className="flex-1 h-12 bg-surface-container-highest/30 text-inverse-on-surface backdrop-blur-md rounded-xl flex items-center justify-center font-label-lg text-label-lg uppercase tracking-wider active:scale-95 transition-transform"
        >
          <span>Tutup</span>
        </button>
      </div>
    </div>
  );
};

