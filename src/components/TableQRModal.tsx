import React from 'react';
import { useApp } from '../context/AppContext';

export const TableQRModal: React.FC = () => {
  const { isTableQROpen, setIsTableQROpen, eventSettings, showToast } = useApp();

  if (!isTableQROpen) return null;

  const guestUrl = `https://wedsnap.id/fajar-aulia`;

  const copyUrl = () => {
    navigator.clipboard?.writeText(guestUrl).then(() => {
      showToast('content_copy', 'Tautan kamera tamu berhasil disalin!');
    }).catch(() => {
      showToast('error', 'Gagal menyalin tautan');
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 flex flex-col items-center text-center relative max-h-[90vh] overflow-y-auto print:max-w-none print:w-full print:shadow-none print:border-none">
        {/* Close Button */}
        <button
          onClick={() => setIsTableQROpen(false)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface print:hidden"
          title="Tutup"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Printable Card Area */}
        <div className="w-full border-2 border-dashed border-[#c5a059]/60 rounded-xl p-6 bg-surface-container-low flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container shadow-xs mb-2">
            <span className="material-symbols-outlined text-primary text-[14px]">local_florist</span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
              WedSnap Table Card
            </span>
          </div>

          <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
            {eventSettings.coupleNames}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant italic">
            {eventSettings.date} • {eventSettings.venue}
          </p>

          {/* QR Code SVG */}
          <div className="my-5 p-3 rounded-xl bg-surface-container-lowest shadow-md flex items-center justify-center w-52 h-52">
            <svg className="w-full h-full text-on-surface" fill="currentColor" viewBox="0 0 160 160">
              <rect fill="#775a19" height="40" rx="6" width="40" x="10" y="10"></rect>
              <rect fill="#fbf9f6" height="24" rx="3" width="24" x="18" y="18"></rect>
              <rect fill="#775a19" height="12" rx="2" width="12" x="24" y="24"></rect>

              <rect fill="#775a19" height="40" rx="6" width="40" x="110" y="10"></rect>
              <rect fill="#fbf9f6" height="24" rx="3" width="24" x="118" y="18"></rect>
              <rect fill="#775a19" height="12" rx="2" width="12" x="124" y="24"></rect>

              <rect fill="#775a19" height="40" rx="6" width="40" x="10" y="110"></rect>
              <rect fill="#fbf9f6" height="24" rx="3" width="24" x="18" y="118"></rect>
              <rect fill="#775a19" height="12" rx="2" width="12" x="24" y="124"></rect>

              <circle cx="65" cy="20" fill="#4e4639" r="4"></circle>
              <circle cx="80" cy="20" fill="#c5a059" r="4"></circle>
              <circle cx="95" cy="20" fill="#4e4639" r="4"></circle>
              <circle cx="65" cy="35" fill="#c5a059" r="4"></circle>
              <circle cx="80" cy="35" fill="#4e4639" r="4"></circle>
              <circle cx="65" cy="50" fill="#4e4639" r="4"></circle>
              <circle cx="95" cy="50" fill="#c5a059" r="4"></circle>

              <circle cx="80" cy="80" fill="#fbf9f6" r="16"></circle>
              <circle cx="80" cy="80" fill="#fed65b" r="13"></circle>
              <path
                d="M80 87.5s-6-3.8-6-7.5c0-2 1.5-3.5 3.5-3.5 1.3 0 2.2.8 2.5 1.3.3-.5 1.2-1.3 2.5-1.3 2 0 3.5 1.5 3.5 3.5 0 3.7-6 7.5-6 7.5z"
                fill="#745c00"
              ></path>

              <circle cx="65" cy="110" fill="#4e4639" r="4"></circle>
              <circle cx="80" cy="110" fill="#c5a059" r="4"></circle>
              <circle cx="95" cy="110" fill="#4e4639" r="4"></circle>
              <circle cx="110" cy="70" fill="#4e4639" r="4"></circle>
              <circle cx="125" cy="70" fill="#c5a059" r="4"></circle>
              <circle cx="140" cy="70" fill="#4e4639" r="4"></circle>
              <circle cx="110" cy="90" fill="#c5a059" r="4"></circle>
              <circle cx="125" cy="90" fill="#4e4639" r="4"></circle>
              <circle cx="140" cy="90" fill="#4e4639" r="4"></circle>
              <circle cx="125" cy="125" fill="#775a19" r="4"></circle>
              <circle cx="140" cy="140" fill="#c5a059" r="4"></circle>
              <circle cx="70" cy="135" fill="#4e4639" r="4"></circle>
              <circle cx="90" cy="135" fill="#775a19" r="4"></circle>
            </svg>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs leading-snug">
            Arahkan kamera smartphone ke QR Code ini untuk membuka kamera sekali pakai & mengabadikan momen spontan kita.
          </p>

          <span className="font-label-md text-label-md text-primary font-bold mt-2">
            {guestUrl}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full mt-5 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 h-11 bg-primary text-on-primary rounded-xl font-label-md text-label-md uppercase tracking-wider font-semibold active:scale-95 transition-transform shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Cetak Kartu</span>
          </button>

          <button
            onClick={copyUrl}
            className="flex items-center justify-center gap-1.5 h-11 bg-surface-container text-on-surface rounded-xl font-label-md text-label-md uppercase tracking-wider font-semibold active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
            <span>Salin URL</span>
          </button>
        </div>
      </div>
    </div>
  );
};

