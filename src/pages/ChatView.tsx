import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import confetti from 'canvas-confetti';

const QUICK_GREETINGS = [
  'Selamat menempuh hidup baru Fajar & Aulia! ❤️',
  'Semoga menjadi keluarga sakinah, mawaddah, warahmah 🤲',
  'Momen akad nikahnya sangat mengharukan & syahdu ✨',
  'Selamat berbahagia dan langgeng sampai kakek nenek! 💐',
  'Dekorasi dan makanannya enak banget! 🥂'
];

const EMOJI_PALETTE = ['❤️', '🎉', '🥂', '🤲', '💐', '✨', '👏'];

export const ChatView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    addChatReaction,
    guestIdentity,
    setIsIdentityModalOpen,
    eventSettings,
    getGuestInitials,
    navigateTo,
    refreshChatNow,
    isSyncing
  } = useApp();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to latest message on load and when new messages arrive
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    if (!guestIdentity?.name) {
      setIsIdentityModalOpen(true);
      return;
    }

    // Light haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }

    sendChatMessage(trimmed);
    setInputText('');

    // Play light celebratory confetti on chat greeting
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.85 },
      colors: ['#c5a059', '#775a19', '#fed65b']
    });

    setTimeout(() => {
      scrollToBottom('smooth');
    }, 50);
  };

  const handleQuickGreeting = (text: string, sendImmediately = false) => {
    if (sendImmediately) {
      if (!guestIdentity?.name) {
        setIsIdentityModalOpen(true);
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
      sendChatMessage(text);
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.85 },
        colors: ['#c5a059', '#775a19', '#fed65b']
      });
      setTimeout(() => scrollToBottom('smooth'), 50);
    } else {
      setInputText(text);
      inputRef.current?.focus();
    }
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollToBottom('smooth');
    }, 250);
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-amber-700 text-amber-50',
      'bg-emerald-700 text-emerald-50',
      'bg-indigo-700 text-indigo-50',
      'bg-rose-700 text-rose-50',
      'bg-teal-700 text-teal-50',
      'bg-orange-700 text-orange-50'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex flex-col w-full h-full max-h-full max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto bg-surface overflow-hidden border-x border-outline-variant/20 shadow-sm animate-fade-in select-none">
      {/* 1. Group Chat Header (WhatsApp Style) */}
      <div className="bg-surface-container-high/95 backdrop-blur-md px-3 sm:px-4 py-2.5 pt-safe border-b border-outline-variant/30 flex items-center justify-between shadow-2xs z-10 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Back button */}
          <button
            onClick={() => navigateTo('home')}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface -ml-1 flex-shrink-0 transition-transform active:scale-90"
            title="Kembali ke Beranda"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center font-serif font-bold text-sm shadow-xs">
              FA
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface"></span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold text-[15px] truncate leading-tight">
                Grup Tamu {eventSettings.coupleNames}
              </h2>
              <span className="material-symbols-outlined text-primary text-[15px]">
                verified
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-[10px] sm:text-[11px] truncate flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              <span className="font-medium text-emerald-700">Terhubung Antar Tamu • Real-time</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Refresh & Identity Pill */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Manual Refresh / Sync Button */}
          <button
            onClick={() => refreshChatNow()}
            disabled={isSyncing}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-highest border border-outline-variant/40 flex items-center justify-center text-primary transition-all active:scale-90 flex-shrink-0 shadow-2xs"
            title="Segarkan pesan obrolan sekarang"
          >
            <span className={`material-symbols-outlined text-[17px] ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
          </button>

          {/* Identity Pill Trigger */}
          <button
            onClick={() => setIsIdentityModalOpen(true)}
            className="px-2 py-1 rounded-full bg-surface-container hover:bg-surface-container-highest border border-outline-variant/40 flex items-center gap-1 text-xs text-on-surface transition-all active:scale-95 flex-shrink-0"
            title="Ubah identitas pengirim Anda"
          >
            <div className="w-5 h-5 rounded-full bg-primary text-on-primary text-[9px] font-bold flex items-center justify-center">
              {guestIdentity?.name ? getGuestInitials(guestIdentity.name) : 'TM'}
            </div>
            <span className="hidden sm:inline font-semibold text-[11px]">
              {guestIdentity?.name ? guestIdentity.name.split(' ')[0] : 'Identitas'}
            </span>
            <span className="material-symbols-outlined text-[13px] text-tertiary">edit</span>
          </button>
        </div>
      </div>

      {/* 2. Chat Message Stream */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 bg-surface-container-low/40">
        {/* System Notice & Date Stamp */}
        <div className="flex flex-col items-center gap-1.5 my-1">
          <span className="px-3 py-0.5 rounded-full bg-surface-container border border-outline-variant/30 text-[10px] font-mono font-semibold text-tertiary uppercase tracking-wider shadow-2xs">
            HARI INI • {eventSettings.date.toUpperCase()}
          </span>

          <div className="max-w-md bg-primary-container/20 border border-primary/20 rounded-2xl p-2.5 sm:p-3 text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-primary text-xs font-bold mb-0.5">
              <span className="material-symbols-outlined text-[15px]">celebration</span>
              <span>Ruang Obrolan & Ucapan Selamat Tamu</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Setiap pesan yang Anda kirim akan otomatis menampilkan <strong>nama</strong>, <strong>hubungan</strong>, dan <strong>alamat/meja</strong> Anda secara transparan.
            </p>
          </div>
        </div>

        {/* Messages List */}
        {chatMessages.map((msg: ChatMessage) => {
          const isMe = msg.isMyMessage || (guestIdentity?.name && msg.senderName === guestIdentity.name);

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {/* Left Avatar for other guests */}
              {!isMe && (
                <div
                  className={`w-8 h-8 rounded-full ${getAvatarBg(
                    msg.senderName
                  )} flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0 mt-0.5`}
                  title={msg.senderName}
                >
                  {msg.senderInitials || getGuestInitials(msg.senderName)}
                </div>
              )}

              {/* Message Bubble Card */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-2.5 sm:p-3 shadow-xs border transition-all ${
                  isMe
                    ? 'bg-gradient-to-br from-primary-container/45 to-surface-container-high border-primary/25 rounded-tr-xs text-on-surface'
                    : 'bg-surface rounded-tl-xs border-outline-variant/30 text-on-surface'
                }`}
              >
                {/* Sender Identity Block (Nama, Status, Alamat) */}
                <div className="pb-1 mb-1 border-b border-outline-variant/20 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-bold truncate ${
                        isMe ? 'text-primary' : 'text-primary'
                      }`}
                    >
                      {isMe ? 'Anda (Saya)' : msg.senderName}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-tertiary font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    {/* Status / Hubungan Chip */}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[9px] sm:text-[10px]">
                      <span className="material-symbols-outlined text-[10px]">favorite</span>
                      <span>{msg.relationship}</span>
                    </span>

                    {/* Alamat / Nomor Meja Chip */}
                    {msg.address && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[9px] sm:text-[10px]">
                        <span className="material-symbols-outlined text-[10px]">location_on</span>
                        <span className="truncate max-w-[130px]">{msg.address}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-[13px] sm:text-sm font-body-md text-on-surface leading-relaxed break-words whitespace-pre-wrap select-text">
                  {msg.message}
                </p>

                {/* Footer Reactions & WhatsApp-style Double Check */}
                <div className="flex items-center justify-between gap-2 mt-1.5 pt-0.5">
                  {/* Reaction Badges */}
                  <div className="flex flex-wrap items-center gap-1">
                    {msg.reactions &&
                      Object.entries(msg.reactions).map(([emoji, count]) =>
                        count > 0 ? (
                          <button
                            key={emoji}
                            onClick={() => addChatReaction(msg.id, emoji)}
                            className="px-1.5 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/40 text-[11px] flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
                          >
                            <span>{emoji}</span>
                            <span className="font-semibold text-on-surface text-[10px]">
                              {count}
                            </span>
                          </button>
                        ) : null
                      )}

                    {/* Quick Add Reaction Button */}
                    <button
                      onClick={() => addChatReaction(msg.id, '❤️')}
                      className="px-1 py-0.5 rounded-full text-on-surface-variant hover:text-primary transition-colors text-[12px] opacity-70 hover:opacity-100"
                      title="Beri reaksi cinta"
                    >
                      ❤️+
                    </button>
                  </div>

                  {/* Read Receipt Status */}
                  <div className="flex items-center text-primary text-[14px]">
                    <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      done_all
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Avatar for user */}
              {isMe && (
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0 mt-0.5">
                  {guestIdentity?.name ? getGuestInitials(guestIdentity.name) : 'ME'}
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Identity Notice Bar (if guest identity not yet completed) */}
      {!guestIdentity?.name && (
        <div className="bg-primary-container/40 border-t border-primary/20 px-3 py-1.5 flex items-center justify-between gap-2 text-xs text-primary flex-shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-[17px]">badge</span>
            <span className="truncate text-[11px]">
              Lengkapi nama & alamat untuk mengirim pesan.
            </span>
          </div>
          <button
            onClick={() => setIsIdentityModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-bold text-[11px] whitespace-nowrap active:scale-95 transition-transform shadow-2xs"
          >
            Isi Sekarang
          </button>
        </div>
      )}

      {/* 4. Quick Greetings Chips Bar */}
      <div className="bg-surface-container-high/70 px-2.5 py-1.5 border-t border-outline-variant/20 flex-shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        <span className="text-[9px] uppercase font-bold text-tertiary flex-shrink-0 tracking-wider">
          Ucapan:
        </span>
        {QUICK_GREETINGS.map((greeting, idx) => (
          <div
            key={idx}
            className="inline-flex items-center rounded-full bg-surface hover:bg-surface-container border border-outline-variant/30 text-[11px] text-on-surface-variant shadow-2xs flex-shrink-0 transition-colors"
          >
            <button
              type="button"
              onClick={() => handleQuickGreeting(greeting, false)}
              className="pl-2.5 pr-1.5 py-1 hover:text-on-surface whitespace-nowrap"
              title="Isi teks ucapan"
            >
              {greeting}
            </button>
            <button
              type="button"
              onClick={() => handleQuickGreeting(greeting, true)}
              className="pr-2 pl-0.5 py-1 text-primary hover:text-primary-container font-bold text-[11px]"
              title="Kirim ucapan ini sekarang"
            >
              ⚡
            </button>
          </div>
        ))}
      </div>

      {/* 5. Input Bar (WhatsApp Style Dock) */}
      <form
        onSubmit={handleSend}
        className="bg-surface p-2 sm:px-3 border-t border-outline-variant/30 flex items-center gap-2 flex-shrink-0"
      >
        {/* Quick Emoji Picker Buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {EMOJI_PALETTE.slice(0, 4).map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setInputText((prev) => prev + emoji)}
              className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-[16px] transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Text Input */}
        <div className="flex-1 relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onFocus={handleInputFocus}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              guestIdentity?.name
                ? `Kirim ucapan sebagai ${guestIdentity.name}...`
                : 'Ketik ucapan atau pesan ke grup tamu...'
            }
            className="w-full pl-3.5 pr-10 py-2 sm:py-2.5 rounded-full bg-surface-container border border-outline-variant/40 focus:border-primary focus:bg-surface text-on-surface placeholder:text-outline/60 text-sm focus:outline-none transition-colors"
          />

          <button
            type="button"
            onClick={() => setInputText((prev) => prev + ' ❤️')}
            className="absolute right-3 text-[16px] opacity-70 hover:opacity-100"
            title="Tambah Hati"
          >
            ❤️
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 flex-shrink-0 ${
            inputText.trim()
              ? 'bg-primary text-on-primary hover:opacity-95'
              : 'bg-surface-container text-outline cursor-not-allowed opacity-60'
          }`}
          title="Kirim Pesan"
        >
          <span className="material-symbols-outlined text-[19px] sm:text-[20px]">send</span>
        </button>
      </form>
    </div>
  );
};
