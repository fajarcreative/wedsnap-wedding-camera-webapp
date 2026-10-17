import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Photo } from '../types';

interface CinematicSlide {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  quote: string;
}

const CINEMATIC_SLIDES: CinematicSlide[] = [
  {
    id: 'cine-1',
    title: 'Ikrar Janji Suci',
    subtitle: 'Momen Sakral Ijab Qabul',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXMkweGvEM5kLZBIgQ_UANVn_x2963iLNtC78omrADoLwYmbiD20fS5lfq_lsQaUn6YUbRpMrEVBmmEr8br4MqYisdbdsxZYN87lwnFPQ7niqhmjje4KTryfdUKGpx4LZezqyi39nrBYerA-ByR0Bp0RW-auQrgBo22TrjSlpMqf_tlhSjfeDy0PZpCT-cIjp6WMUIAurRP2l4fYzGQARgqs6tx5DbYBFlSr3_7Lh1PKY55k_V8LcBlA',
    quote: 'Dua jiwa, satu takdir, dipersatukan dalam ikrar suci di hadapan Sang Pencipta.'
  },
  {
    id: 'cine-2',
    title: 'Dansa Pertama',
    subtitle: 'Alunan Melodi Cinta Abadi',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCEMN0MpZO4n3HuJqVz0Qvzz314MbtOx0ZJX_l0Q4vZv_731NG2DZlyD9aULwqrOKaKTvJ9P78kJma3l_NXiN653y3pFYmIGRFpEUCezV8VnDcKxFmvTBAVhhwVIb_BYZyZLktLfUYmTapARz5lGGbGNS1gFpbGpJ2eboLdN7_9cpp-pHs1QnpjMRPNHKjdy4LBJ4utRmupMcJeS_UE5JxAfTdbXl4-DNX4MIn7VX8iM_XFB3Q5mdKNw',
    quote: 'Di bawah kerlap-kerlip cahaya, setiap tatapan adalah janji untuk saling menjaga selamanya.'
  },
  {
    id: 'cine-3',
    title: 'Cincin & Doa Bersama',
    subtitle: 'Simbol Keabadian Cinta',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaTgYOQGkOoNnfNnf9sv2vPECWf7Nhzc9keRrSrbSoTkn3-hq1WjoeMDVLaXSQnvKHp2hn_Xsg_DKdwgK0hhOYF0t9uFRlSHVtYkGNbIVhq4nWy1BqUT8GStuXTLMzIq75HvfiQv1Oahth3FiJ8wY1jJj9I-vI2soefl4pzjICRNhBdymVSMTwCJYnXXm8_F8Lk-vm65nOtsWwFRD84Qf25MOj8sCglIPaaGy_gFyKCwJ2An41XQHbXQ',
    quote: 'Melingkar erat di jemari, pengingat bahwa cinta sejati bermula dari kesetiaan tanpa batas.'
  },
  {
    id: 'cine-4',
    title: 'Binar Senyuman Aulia',
    subtitle: 'Sang Mempelai Wanita yang Anggun',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALqqgXFDCN_4IdlacBsDqXoX0-mLWA2xakYjs9asn12IxqyFytfWZec7d0opKy_xKzKw51mSTKM2cY_6xfM3gSAKp34u8-jpoKdaqJeAIqg-IcodNeKrp51qyweAn6PTTp6sxyPJdbJ4APnBdgrELNrUoVKdnrTOTC-rn6O7cLFeBh8UP2-8bqFBFDLWgLncpzVfz2JSkx9HdOY0VbQeG-Qv3N2-JAKYzJC0IFbgRP-5YhOv4sJiqP6g',
    quote: 'Senyuman penuh keteduhan yang mengubah seluruh dunia menjadi begitu indah.'
  },
  {
    id: 'cine-5',
    title: 'Canda & Syukur Bersama',
    subtitle: 'Kehangatan Sahabat & Keluarga',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKTBb5VGlgfAU9rSVw69fmhwTw0-IP4p5FnVgndoOv49oui_NLGO0UsEgtQBvf9l5NmDAN471_wDwwpjzTwqIYF7KIU-CJo_TJn59LVqjxMYasQJeB95f-D4sLFXP3LX7qXzZBqVzjPRVDGDx7S4cL2u844TQZ-snC7CCP2dxM2MEvdbAoZ6ASZ8mhJCO_aZb9-lZ9mYOQ9VV4pRvEdjyzqqaPEUuQU4IbJXF85RHTZLhznVdH0jt2yA',
    quote: 'Kebahagiaan kami tak akan pernah lengkap tanpa pelukan dan gelak tawa para sahabat tercinta.'
  }
];

export const HomeView: React.FC = () => {
  const {
    eventSettings,
    navigateTo,
    guestIdentity,
    setIsIdentityModalOpen,
    shotsRemaining,
    setPreviewPhoto,
    installPWA,
    isAppInstalled
  } = useApp();

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto advance slideshow every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CINEMATIC_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentSlide = CINEMATIC_SLIDES[activeSlide];

  const handleOpenPhotoPreview = (slide: CinematicSlide) => {
    const photoObj: Photo = {
      id: slide.id,
      url: slide.url,
      caption: `${slide.title} — ${slide.subtitle}`,
      author: 'Fajar & Aulia',
      authorInitials: 'FA',
      table: 'Mempelai Pengantin',
      category: 'akad',
      timestamp: 'Cinematic Series',
      timeAgo: 'Momen Pilihan',
      status: 'saved',
      likes: 128,
      frameNumber: activeSlide + 1,
      isUserPhoto: false
    };
    setPreviewPhoto(photoObj);
  };

  return (
    <div className="flex flex-col w-full px-margin pb-16 space-y-6 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto animate-fade-in">
      {/* 1. Romantic Monogram & Wedding Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface-container-high/60 via-surface-container-low to-surface border border-outline-variant/30 p-6 sm:p-8 text-center shadow-sm">
        {/* Decorative Floral / Ring Watermark */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/5 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-secondary/5 blur-2xl pointer-events-none"></div>

        {/* Monogram Seal */}
        <div className="mx-auto w-16 h-16 rounded-full bg-surface-container border border-primary/30 flex items-center justify-center shadow-xs mb-3">
          <span className="font-serif italic font-bold text-primary text-xl tracking-wider">
            F & A
          </span>
        </div>

        <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-primary font-bold text-[11px] block">
          The Wedding Celebration
        </span>

        <h1 className="font-serif font-bold text-[34px] sm:text-[42px] text-on-surface leading-tight mt-1 tracking-tight">
          {eventSettings.coupleNames}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <span className="material-symbols-outlined text-[15px]">calendar_today</span>
            <span>{eventSettings.date}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium border border-outline-variant/30">
            <span className="material-symbols-outlined text-[15px]">location_on</span>
            <span className="max-w-[200px] truncate">{eventSettings.venue}</span>
          </span>
        </div>

        <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container text-[11px] font-semibold border border-secondary/20">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
          <span>Hari Bahagia Sedang Berlangsung ✨</span>
        </div>
      </section>

      {/* 2. Personalized Guest Welcome Card */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                sentiment_satisfied
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold text-[11px]">
                Selamat Datang Tamu Kehormatan
              </span>
            </div>

            {guestIdentity?.name ? (
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface text-[19px] font-bold">
                  Halo, {guestIdentity.name}!
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                    {guestIdentity.relationship}
                  </span>
                  <span className="text-[11px] text-tertiary">
                    • {guestIdentity.address}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 text-[13px] leading-relaxed">
                  Terima kasih banyak telah hadir di hari bahagia kami. Silakan abadikan setiap momen canda tawa dan kenangan manis hari ini melalui kamera digital sekali pakai yang telah kami siapkan khusus untuk Anda!
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface text-[18px] font-bold">
                  Selamat Datang di Hari Bahagia Kami!
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-[13px] leading-relaxed">
                  Sebelum mulai mengambil foto dan membagikan doa hangat, mohon masukkan identitas Anda agar nama Anda tercatat di buku tamu & rol foto pengantin.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsIdentityModalOpen(true)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-2xs"
            title={guestIdentity?.name ? 'Ubah data identitas tamu' : 'Isi identitas tamu'}
          >
            <span className="material-symbols-outlined text-[15px] text-primary">
              {guestIdentity?.name ? 'edit' : 'badge'}
            </span>
            <span>{guestIdentity?.name ? 'Ubah' : 'Isi Data'}</span>
          </button>
        </div>
      </section>

      {/* 3. Cinematic Couple Photo Showcase (Interactive Carousel) */}
      <section
        className="flex flex-col space-y-3"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">
              movie
            </span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface text-[18px] font-bold leading-tight">
                Galeri Sinematik Pengantin
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-[12px]">
                Cuplikan momen sakral & cinta Fajar & Aulia
              </p>
            </div>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setActiveSlide(
                  (prev) => (prev - 1 + CINEMATIC_SLIDES.length) % CINEMATIC_SLIDES.length
                )
              }
              className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant active:scale-95 transition-all"
              title="Foto Sebelumnya"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              onClick={() =>
                setActiveSlide((prev) => (prev + 1) % CINEMATIC_SLIDES.length)
              }
              className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant active:scale-95 transition-all"
              title="Foto Berikutnya"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Cinematic Slide Card */}
        <div
          onClick={() => handleOpenPhotoPreview(currentSlide)}
          className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-lg border border-outline-variant/30 cursor-pointer group bg-surface-container-lowest"
        >
          <img
            src={currentSlide.url}
            alt={currentSlide.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Cinematic Vignette & Bottom Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/95 via-inverse-surface/30 to-transparent flex flex-col justify-end p-4 sm:p-6 text-inverse-on-surface">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider">
                Foto {activeSlide + 1} / {CINEMATIC_SLIDES.length}
              </span>
              <span className="text-[12px] text-inverse-on-surface/80 font-mono">
                {currentSlide.subtitle}
              </span>
            </div>

            <h4 className="font-serif text-[20px] sm:text-[24px] font-bold leading-tight">
              {currentSlide.title}
            </h4>

            <p className="font-body-sm text-body-sm text-inverse-on-surface/90 text-xs sm:text-sm mt-1 italic line-clamp-2">
              "{currentSlide.quote}"
            </p>

            <div className="flex items-center gap-1 text-[11px] text-primary-fixed mt-2 opacity-90 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-[14px]">zoom_in</span>
              <span>Ketuk foto untuk melihat layar penuh</span>
            </div>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {CINEMATIC_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeSlide === idx
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-outline-variant/60 hover:bg-outline-variant'
              }`}
              title={slide.title}
            />
          ))}
        </div>
      </section>

      {/* 4. Ucapan Terima Kasih Dari Kedua Mempelai */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-primary/25 shadow-md relative overflow-hidden">
        {/* Soft Gold Background Accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-3">
          <span
            className="material-symbols-outlined text-primary text-[24px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            volunteer_activism
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold text-[11px]">
            Ungkapan Terima Kasih Mempelai
          </span>
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl text-on-surface font-bold leading-snug">
          Dari Lubuk Hati Kami yang Terdalam
        </h3>

        <div className="mt-4 space-y-3.5 text-on-surface-variant font-body-md text-[14px] leading-relaxed border-l-2 border-primary/40 pl-4">
          <p className="italic font-serif text-on-surface text-[15px]">
            "Bismillahirrahmannirrahim,"
          </p>
          <p>
            Dengan penuh rasa syukur dan sukacita yang mendalam, kami berdua, <strong className="text-on-surface font-semibold">Fajar & Aulia</strong>, menghaturkan rasa terima kasih yang setulus-tulusnya kepada Bapak, Ibu, Saudara, Sahabat, dan seluruh Tamu Undangan yang telah meluangkan waktu berharga untuk hadir serta memanjatkan doa restu pada hari pernikahan kami.
          </p>
          <p>
            Kehadiran, pelukan hangat, serta senyum tulus Anda adalah hadiah terindah yang menyempurnakan kebahagiaan kami berdua dalam memulai perjalanan mengarungi bahtera rumah tangga yang sakinah, mawaddah, dan warahmah.
          </p>
          <p>
            Semoga setiap langkah kebaikan Anda dibalas dengan limpahan rahmat, kesehatan, rezeki, dan kebahagiaan yang berlipat ganda oleh Tuhan Yang Maha Esa.
          </p>
        </div>

        {/* Couple Signatures */}
        <div className="mt-6 pt-5 border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="font-label-sm text-label-sm text-tertiary block text-[11px] uppercase tracking-wider">
              Dengan Penuh Cinta & Hormat,
            </span>
            <p className="font-serif font-bold text-[22px] text-primary italic mt-0.5">
              Fajar & Aulia
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/30 w-fit">
            <span className="material-symbols-outlined text-primary text-[16px]">
              verified
            </span>
            <span>Sampoerna Strategic Square • Jakarta</span>
          </div>
        </div>
      </section>

      {/* 5. Quick Action Cards (Mulai Foto, Galeri, & Ucapan) */}
      <section className="space-y-3">
        <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold text-[11px]">
          Aktivitas Tamu di Pernikahan
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Action 1: Buka Kamera Sekali Pakai */}
          <div
            onClick={() => navigateTo('camera')}
            className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-md hover:shadow-lg transition-all cursor-pointer group active:scale-[0.98] flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-surface/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">photo_camera</span>
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-surface/25">
                {shotsRemaining} Sisa Foto
              </span>
            </div>
            <div>
              <h5 className="font-bold text-base mt-3 leading-tight flex items-center gap-1">
                <span>Kamera Sekali Pakai</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </h5>
              <p className="text-xs opacity-90 mt-1">
                Jepret momen candid seketika dengan filter analog nostalgia.
              </p>
            </div>
          </div>

          {/* Action 2: Review & Kirim Doa */}
          <div
            onClick={() => navigateTo('review')}
            className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-on-surface shadow-xs hover:shadow-sm transition-all cursor-pointer group active:scale-[0.98] flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">camera_roll</span>
              </span>
              <span className="text-[11px] font-semibold text-tertiary">
                Rol Film Saya
              </span>
            </div>
            <div>
              <h5 className="font-bold text-base mt-3 leading-tight text-on-surface flex items-center gap-1">
                <span>Review & Doa</span>
                <span className="material-symbols-outlined text-[16px] text-primary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </h5>
              <p className="text-xs text-on-surface-variant mt-1">
                Tinjau foto jepretan Anda dan tulis doa terhangat untuk pengantin.
              </p>
            </div>
          </div>

          {/* Action 3: Galeri Bersama */}
          <div
            onClick={() => navigateTo('gallery')}
            className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-on-surface shadow-xs hover:shadow-sm transition-all cursor-pointer group active:scale-[0.98] flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[24px]">photo_library</span>
              </span>
              <span className="text-[11px] font-semibold text-secondary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                <span>Live Feed</span>
              </span>
            </div>
            <div>
              <h5 className="font-bold text-base mt-3 leading-tight text-on-surface flex items-center gap-1">
                <span>Galeri Bersama</span>
                <span className="material-symbols-outlined text-[16px] text-secondary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </h5>
              <p className="text-xs text-on-surface-variant mt-1">
                Lihat momen seru yang ditangkap oleh seluruh tamu undangan lainnya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Install App Prompt banner (if not yet installed) */}
      {!isAppInstalled && (
        <section className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/30 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs flex-shrink-0">
              <span className="material-symbols-outlined text-[24px]">install_mobile</span>
            </div>
            <div>
              <h5 className="font-bold text-sm text-on-surface leading-tight">
                Pasang WedSnap di Layar Utama HP
              </h5>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Akses kamera lebih cepat & mode layar penuh tanpa repot buka browser.
              </p>
            </div>
          </div>
          <button
            onClick={installPWA}
            className="px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold uppercase tracking-wider flex-shrink-0 shadow-xs active:scale-95 transition-all"
          >
            Pasang
          </button>
        </section>
      )}

      {/* 7. Romantic Quranic Verse Quote */}
      <footer className="text-center py-4 px-2 space-y-2">
        <p className="font-serif italic text-xs text-tertiary max-w-md mx-auto leading-relaxed">
          "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang."
        </p>
        <span className="text-[10px] uppercase tracking-widest text-primary font-bold block">
          (QS. Ar-Rum: 21)
        </span>
      </footer>
    </div>
  );
};
