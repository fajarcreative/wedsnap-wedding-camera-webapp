import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const RELATIONSHIP_OPTIONS = [
  'Sahabat Fajar',
  'Sahabat Aulia',
  'Keluarga Fajar',
  'Keluarga Aulia',
  'Rekan Kerja',
  'Teman Kuliah / Sekolah',
  'Tamu Undangan / Tetangga',
  'Lainnya'
];

export const GuestIdentityModal: React.FC = () => {
  const {
    guestIdentity,
    saveGuestIdentity,
    isIdentityModalOpen,
    setIsIdentityModalOpen,
    eventSettings,
    showToast
  } = useApp();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState(RELATIONSHIP_OPTIONS[0]);
  const [customRelationship, setCustomRelationship] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync when guestIdentity changes
  useEffect(() => {
    if (guestIdentity) {
      setName(guestIdentity.name || '');
      setAddress(guestIdentity.address || '');
      if (RELATIONSHIP_OPTIONS.includes(guestIdentity.relationship)) {
        setSelectedRelationship(guestIdentity.relationship);
      } else if (guestIdentity.relationship) {
        setSelectedRelationship('Lainnya');
        setCustomRelationship(guestIdentity.relationship);
      }
    }
  }, [guestIdentity]);

  if (!isIdentityModalOpen) return null;

  const isFirstTime = !guestIdentity?.name;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName) {
      setErrorMsg('Silakan masukkan nama lengkap atau nama panggilan Anda.');
      return;
    }
    if (!trimmedAddress) {
      setErrorMsg('Silakan masukkan alamat, kota, atau nomor meja Anda.');
      return;
    }

    const relationship =
      selectedRelationship === 'Lainnya'
        ? customRelationship.trim() || 'Tamu Undangan'
        : selectedRelationship;

    saveGuestIdentity({
      name: trimmedName,
      address: trimmedAddress,
      relationship
    });
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Romantic Floral / Rings Accent */}
        <div className="relative bg-gradient-to-br from-primary-container/60 via-surface-container to-surface p-5 border-b border-outline-variant/20 flex flex-col items-center text-center">
          {!isFirstTime && (
            <button
              onClick={() => setIsIdentityModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
              title="Tutup"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}

          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 shadow-sm">
            <span
              className="material-symbols-outlined text-primary text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              badge
            </span>
          </div>

          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
            Buku Tamu Digital
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1 text-[20px] font-semibold">
            Pernikahan {eventSettings.coupleNames}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-[13px] max-w-xs">
            {isFirstTime
              ? 'Selamat datang! Silakan lengkapi data tamu di bawah ini. Identitas Anda akan otomatis tercantum pada setiap foto & ucapan kenangan.'
              : 'Perbarui data identitas tamu undangan Anda.'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error/30 text-error flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Input Nama */}
          <div className="flex flex-col space-y-1.5">
            <label className="font-label-sm text-label-sm font-semibold text-on-surface flex items-center justify-between">
              <span>Nama Lengkap / Panggilan *</span>
              <span className="text-tertiary text-[11px] font-normal">Wajib diisi</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                person
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Contoh: Dimas Prasetyo"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 focus:border-primary focus:bg-surface text-on-surface placeholder:text-outline/60 text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Input Alamat / Meja */}
          <div className="flex flex-col space-y-1.5">
            <label className="font-label-sm text-label-sm font-semibold text-on-surface flex items-center justify-between">
              <span>Alamat / Kota / Nomor Meja *</span>
              <span className="text-tertiary text-[11px] font-normal">Wajib diisi</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                location_on
              </span>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Contoh: Bandung / Meja VIP 05"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 focus:border-primary focus:bg-surface text-on-surface placeholder:text-outline/60 text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Hubungan dengan Mempelai */}
          <div className="flex flex-col space-y-2">
            <label className="font-label-sm text-label-sm font-semibold text-on-surface">
              Hubungan dengan Mempelai
            </label>
            <div className="flex flex-wrap gap-1.5">
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setSelectedRelationship(opt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedRelationship === opt
                      ? 'bg-primary text-on-primary shadow-xs font-semibold'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {selectedRelationship === 'Lainnya' && (
              <div className="pt-1.5">
                <input
                  type="text"
                  value={customRelationship}
                  onChange={(e) => setCustomRelationship(e.target.value)}
                  placeholder="Ketik hubungan dengan mempelai..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 focus:border-primary focus:bg-surface text-on-surface placeholder:text-outline/60 text-xs focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Identity Preview Card */}
          {name.trim() && (
            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                {name
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-on-surface truncate">{name}</p>
                <p className="text-[11px] text-tertiary truncate">
                  {selectedRelationship === 'Lainnya'
                    ? customRelationship || 'Tamu Undangan'
                    : selectedRelationship}{' '}
                  {address.trim() && `• ${address}`}
                </p>
              </div>
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider font-bold shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              <span>{isFirstTime ? 'Simpan & Mulai Abadikan Momen' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

