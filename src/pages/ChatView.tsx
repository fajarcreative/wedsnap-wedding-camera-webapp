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
    getGuestInitials
  } = useApp();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to latest message on load and when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!guestIdentity?.name) {
      setIsIdentityModalOpen(true);
      return;
    }

    sendChatMessage(inputText);
    setInputText('');

    // Play light celebratory confetti on chat greeting
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.85 },
      colors: ['#c5a059', '#775a19', '#fed65b']
    });
  };

  const handleQuickGreeting = (text: string) => {
    setInputText(text);
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
    <div className="flex flex-col w-full h-[calc(100dvh-4rem-5rem)] max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto bg-surface overflow-hidden border-x border-outline-variant/20 shadow-sm animate-fade-in">
      {/* 1. Group Chat Header (WhatsApp Style) */}
      <div className="bg-surface-container-high/90 backdrop-blur-md px-4 py-3 border-b border-outline-variant/30 flex items-center justify-between shadow-2xs z-10 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center font-serif font-bold text-base shadow-xs flex-shrink-0">
              FA
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-secondary border-2 border-surface"></span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold text-[16px] truncate leading-tight">
                Grup Tamu {eventSettings.coupleNames}
              </h2>
              <span className="material-symbols-outlined text-primary text-[16px]">
                verified
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px] truncate flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              <span className="font-semibold text-emerald-700">Terhubung Langsung Antar Tamu • Real-time</span>
            </p>
          </div>
        </div>

        {/* Identity Pill Trigger */}
        <button
          onClick={() => setIsIdentityModalOpen(true)}
          className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-highest border border-outline-variant/40 flex items-center gap-1.5 text-xs text-on-surface transition-all active:scale-95 flex-shrink-0"
          title="Ubah identitas pengirim Anda"
        >
          <div className="w-5 h-5 rounded-full bg-primary text-on-primary text-[9px] font-bold flex items-center justify-center">
            {guestIdentity?.name ? getGuestInitials(guestIdentity.name) : 'TM'}
          </div>
          <span className="hidden sm:inline font-semibold text-[11px]">
            {guestIdentity?.name ? guestIdentity.name.split(' ')[0] : 'Isi Identitas'}
          </span>
          <span className="material-symbols-outlined text-[13px] text-tertiary">edit</span>
        </button>
      </div>

      {/* 2. Chat Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-low/40">
        {/* System Notice & Date Stamp */}
        <div className="flex flex-col items-center gap-2 my-2">
          <span className="px-3 py-0.5 rounded-full bg-surface-container border border-outline-variant/30 text-[10px] font-mono font-semibold text-tertiary uppercase tracking-wider shadow-2xs">
            HARI INI • {eventSettings.date.toUpperCase()}
          </span>

          <div className="max-w-md bg-primary-container/20 border border-primary/20 rounded-2xl p-3 text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-primary text-xs font-bold mb-1">
              <span className="material-symbols-outlined text-[16px]">celebration</span>
              <span>Ruang Obrolan & Ucapan Selamat</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Selamat datang di grup obrolan pernikahan resmi <strong>{eventSettings.coupleNames}</strong>! Setiap pesan yang Anda kirim akan menampilkan nama, status hubungan dengan mempelai, dan alamat/nomor meja Anda.
            </p>
          </div>
        </div>

        {/* Messages List */}
        {chatMessages.map((msg: ChatMessage) => {
          const isMe = msg.isMyMessage || (guestIdentity?.name && msg.senderName === guestIdentity.name);

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {/* Left Avatar for other guests */}
              {!isMe && (
                <div
                  className={`w-9 h-9 rounded-full ${getAvatarBg(
                    msg.senderName
                  )} flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0 mt-0.5`}
                  title={msg.senderName}
                >
                  {msg.senderInitials || getGuestInitials(msg.senderName)}
                </div>
              )}

              {/* Message Bubble Card */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs border transition-all ${
                  isMe
                    ? 'bg-gradient-to-br from-primary-container/40 to-surface-container-high border-primary/25 rounded-tr-xs text-on-surface'
                    : 'bg-surface rounded-tl-xs border-outline-variant/30 text-on-surface'
                }`}
              >
                {/* Sender Identity Block (Nama, Status, Alamat) */}
                <div className="pb-1.5 mb-1.5 border-b border-outline-variant/20 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-bold truncate ${
                        isMe ? 'text-primary' : 'text-primary'
                      }`}
                    >
                      {isMe ? 'Anda (Saya)' : msg.senderName}
                    </span>
                    <span className="text-[10px] text-tertiary font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Status / Hubungan Chip */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[10px]">
                      <span className="material-symbols-outlined text-[11px]">favorite</span>
                      <span>{msg.relationship}</span>
                    </span>

                    {/* Alamat / Nomor Meja Chip */}
                    {msg.address && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px]">
                        <span className="material-symbols-outlined text-[11px]">location_on</span>
                        <span className="truncate max-w-[140px]">{msg.address}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-sm font-body-md text-on-surface leading-relaxed break-words whitespace-pre-wrap">
                  {msg.message}
                </p>

                {/* Footer Reactions & WhatsApp-style Double Check */}
                <div className="flex items-center justify-between gap-2 mt-2 pt-1">
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
                <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0 mt-0.5">
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
        <div className="bg-primary-container/40 border-t border-primary/20 px-4 py-2 flex items-center justify-between gap-2 text-xs text-primary flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span className="truncate">
              Identitas belum diisi. Nama & status belum dapat tampil pada pesan.
            </span>
          </div>
          <button
            onClick={() => setIsIdentityModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-bold text-[11px] whitespace-nowrap active:scale-95 transition-transform"
          >
            Isi Sekarang
          </button>
        </div>
      )}

      {/* 4. Quick Greetings Chips Bar */}
      <div className="bg-surface-container-high/60 px-3 py-2 border-t border-outline-variant/20 flex-shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold text-tertiary flex-shrink-0 tracking-wider">
          Pilihan Cepat:
        </span>
        {QUICK_GREETINGS.map((greeting, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickGreeting(greeting)}
            className="px-2.5 py-1 rounded-full bg-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30 text-[11px] whitespace-nowrap transition-colors flex-shrink-0 shadow-2xs"
          >
            {greeting}
          </button>
        ))}
      </div>

      {/* 5. Input Bar (WhatsApp Style Dock) */}
      <form
        onSubmit={handleSend}
        className="bg-surface p-2.5 sm:px-4 border-t border-outline-variant/30 flex items-center gap-2 flex-shrink-0"
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
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              guestIdentity?.name
                ? `Kirim ucapan sebagai ${guestIdentity.name}...`
                : 'Ketik ucapan atau pesan ke grup tamu...'
            }
            className="w-full pl-3.5 pr-10 py-2.5 rounded-full bg-surface-container border border-outline-variant/40 focus:border-primary focus:bg-surface text-on-surface placeholder:text-outline/60 text-sm focus:outline-none transition-colors"
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
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 flex-shrink-0 ${
            inputText.trim()
              ? 'bg-primary text-on-primary hover:opacity-95'
              : 'bg-surface-container text-outline cursor-not-allowed opacity-60'
          }`}
          title="Kirim Pesan"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </form>
    </div>
  );
};

