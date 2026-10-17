import React, { createContext, useContext, useState, useEffect } from 'react';
import { Photo, EventSettings, GuestWish, AppRoute, ToastMessage, GuestIdentity, ChatMessage } from '../types';
import { initialPhotos, initialEventSettings, initialWishes, initialGuestActivities, initialChatMessages } from '../utils/seedData';
import confetti from 'canvas-confetti';

interface AppContextType {
  currentRoute: AppRoute;
  navigateTo: (route: AppRoute) => void;
  photos: Photo[];
  shotsRemaining: number;
  totalShotsLimit: number;
  wishes: GuestWish[];
  guestWishInput: string;
  setGuestWishInput: (text: string) => void;
  submitWish: () => void;
  takePhoto: (dataUrl: string, caption?: string) => Promise<Photo>;
  deletePhoto: (id: string) => void;
  retryUpload: (id: string) => void;
  toggleLike: (id: string) => void;
  resetFilmRoll: () => void;
  eventSettings: EventSettings;
  updateSettings: (partial: Partial<EventSettings>) => void;
  toast: ToastMessage | null;
  showToast: (icon: string, message: string, type?: 'success' | 'error' | 'info') => void;
  previewPhoto: Photo | null;
  setPreviewPhoto: (photo: Photo | null) => void;
  isSlideshowOpen: boolean;
  setIsSlideshowOpen: (open: boolean) => void;
  isTableQROpen: boolean;
  setIsTableQROpen: (open: boolean) => void;
  isEmptyStateMode: boolean;
  toggleEmptyStateMode: () => void;
  guestActivities: typeof initialGuestActivities;
  // Guest Identity Onboarding
  guestIdentity: GuestIdentity | null;
  saveGuestIdentity: (identity: GuestIdentity) => void;
  isIdentityModalOpen: boolean;
  setIsIdentityModalOpen: (open: boolean) => void;
  getGuestInitials: (name?: string) => string;
  // PWA Mobile App Installation
  deferredPrompt: any;
  isAppInstalled: boolean;
  isInstallModalOpen: boolean;
  setIsInstallModalOpen: (open: boolean) => void;
  installPWA: () => Promise<void>;
  // Guest Chat Group
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  addChatReaction: (messageId: string, emoji: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation state (supports hash routing as fallback, default to home)
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    const hash = window.location.hash.replace('#', '') as AppRoute;
    if (['home', 'camera', 'review', 'gallery', 'chat', 'dashboard'].includes(hash)) {
      return hash;
    }
    return 'home';
  });

  // Empty state mode (keeps default clean)
  const [isEmptyStateMode, setIsEmptyStateMode] = useState<boolean>(() => {
    return localStorage.getItem('wedsnap_empty_mode') === 'true';
  });

  // Ensure fresh clean session for all new visitors or resets
  if (typeof window !== 'undefined' && localStorage.getItem('wedsnap_v6_clean_slate') !== 'true') {
    localStorage.removeItem('wedsnap_photos');
    localStorage.removeItem('wedsnap_shots_remaining');
    localStorage.removeItem('wedsnap_wishes');
    localStorage.removeItem('wedsnap_settings');
    localStorage.removeItem('wedsnap_empty_mode');
    localStorage.setItem('wedsnap_v6_clean_slate', 'true');
  }

  // Guest Identity State (mandatory for all guests)
  const [guestIdentity, setGuestIdentity] = useState<GuestIdentity | null>(() => {
    const saved = localStorage.getItem('wedsnap_guest_identity');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && parsed.name.trim()) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing guest identity', e);
      }
    }
    return null;
  });

  // If no guest identity is set, prompt modal immediately on open
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('wedsnap_guest_identity');
    if (!saved) return true;
    try {
      const parsed = JSON.parse(saved);
      return !parsed || !parsed.name || !parsed.name.trim();
    } catch {
      return true;
    }
  });

  // PWA Installation states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  });
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  // Helper to extract clean initials from name
  const getGuestInitials = (name?: string): string => {
    if (!name) return 'TM';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'TM';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const saveGuestIdentity = (identity: GuestIdentity) => {
    const updated: GuestIdentity = {
      ...identity,
      registeredAt: identity.registeredAt || new Date().toISOString()
    };
    setGuestIdentity(updated);
    localStorage.setItem('wedsnap_guest_identity', JSON.stringify(updated));
    setIsIdentityModalOpen(false);
    showToast('badge', `Selamat datang, ${updated.name}! Identitas Anda telah aktif.`);
  };

  // PWA beforeinstallprompt and appinstalled event listeners
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      showToast('check_circle', 'Aplikasi WedSnap berhasil dipasang di perangkat Anda!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsAppInstalled(true);
          showToast('download_done', 'Aplikasi WedSnap berhasil dipasang!');
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Error triggering PWA install:', err);
        setIsInstallModalOpen(true);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Photos state
  const [photos, setPhotos] = useState<Photo[]>(() => {
    const saved = localStorage.getItem('wedsnap_photos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing photos from localStorage', e);
      }
    }
    return initialPhotos;
  });

  // Guest film exposures remaining (starts fresh with full 36 shots)
  const [shotsRemaining, setShotsRemaining] = useState<number>(() => {
    const saved = localStorage.getItem('wedsnap_shots_remaining');
    return saved ? parseInt(saved, 10) : 36;
  });

  const totalShotsLimit = 36;

  // Wishes state
  const [wishes, setWishes] = useState<GuestWish[]>(() => {
    const saved = localStorage.getItem('wedsnap_wishes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing wishes', e);
      }
    }
    return initialWishes;
  });

  const [guestWishInput, setGuestWishInput] = useState<string>('');

  // Event settings - coupleNames, date, venue are strictly locked and immutable
  const [eventSettings, setEventSettings] = useState<EventSettings>(() => {
    const saved = localStorage.getItem('wedsnap_settings');
    let parsed: Partial<EventSettings> = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing settings', e);
      }
    }
    return {
      ...initialEventSettings,
      ...parsed,
      title: 'Pernikahan Suci',
      coupleNames: 'Fajar & Aulia',
      date: '25 Oktober 2025',
      venue: 'Sampoerna Strategic Square, Jakarta',
      maxPerGuest: 36
    };
  });

  // Guest Activities for live feed
  const [guestActivities, setGuestActivities] = useState(initialGuestActivities);

  // Modals & Toasts
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [isTableQROpen, setIsTableQROpen] = useState(false);

  // Reset film roll programmatically
  const resetFilmRoll = () => {
    setShotsRemaining(36);
    setPhotos(initialPhotos);
    localStorage.setItem('wedsnap_shots_remaining', '36');
    localStorage.setItem('wedsnap_photos', JSON.stringify(initialPhotos));
    showToast('restart_alt', 'Rol film Anda telah di-reset (36 foto baru siap digunakan)!');
  };

  // Support ?reset=1 URL parameter for instant fresh start if needed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reset') === '1' || params.get('reset') === 'true') {
        resetFilmRoll();
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  // Sync route to window hash
  const navigateTo = (route: AppRoute) => {
    setCurrentRoute(route);
    window.location.hash = `#${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AppRoute;
      if (['home', 'camera', 'review', 'gallery', 'chat', 'dashboard'].includes(hash)) {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save photos to localStorage
  useEffect(() => {
    localStorage.setItem('wedsnap_photos', JSON.stringify(photos));
  }, [photos]);

  // Save shots remaining
  useEffect(() => {
    localStorage.setItem('wedsnap_shots_remaining', shotsRemaining.toString());
  }, [shotsRemaining]);

  // Save wishes
  useEffect(() => {
    localStorage.setItem('wedsnap_wishes', JSON.stringify(wishes));
  }, [wishes]);

  // Guest Group Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('wedsnap_chat_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing chat messages', e);
      }
    }
    return initialChatMessages;
  });

  // Save chat messages to localStorage
  useEffect(() => {
    localStorage.setItem('wedsnap_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const sendChatMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!guestIdentity?.name) {
      setIsIdentityModalOpen(true);
      showToast('info', 'Mohon lengkapi identitas Anda terlebih dahulu untuk mengirim pesan');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      senderName: guestIdentity.name.trim(),
      senderInitials: getGuestInitials(guestIdentity.name),
      relationship: guestIdentity.relationship || 'Tamu Undangan',
      address: guestIdentity.address || 'Meja Tamu',
      message: trimmed,
      timestamp: timeStr,
      isMyMessage: true,
      reactions: {}
    };

    setChatMessages((prev) => [...prev, newMsg]);
    showToast('send', 'Pesan Anda berhasil dikirim ke grup obrolan tamu!');
  };

  const addChatReaction = (messageId: string, emoji: string) => {
    setChatMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const reactions = { ...(msg.reactions || {}) };
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...msg, reactions };
        }
        return msg;
      })
    );
  };

  // Save settings (always ensuring coupleNames cannot be tampered)
  useEffect(() => {
    localStorage.setItem('wedsnap_settings', JSON.stringify(eventSettings));
  }, [eventSettings]);

  const showToast = (icon: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, icon, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3200);
  };

  const toggleEmptyStateMode = () => {
    const newMode = !isEmptyStateMode;
    setIsEmptyStateMode(newMode);
    localStorage.setItem('wedsnap_empty_mode', newMode.toString());
  };

  const updateSettings = (partial: Partial<EventSettings>) => {
    setEventSettings((prev) => {
      const safePartial = { ...partial };
      delete (safePartial as any).coupleNames;
      delete (safePartial as any).title;
      delete (safePartial as any).date;
      delete (safePartial as any).venue;
      delete (safePartial as any).maxPerGuest;

      const updated = {
        ...prev,
        ...safePartial,
        title: 'Pernikahan Suci',
        coupleNames: 'Fajar & Aulia',
        date: '25 Oktober 2025',
        venue: 'Sampoerna Strategic Square, Jakarta',
        maxPerGuest: 36
      };
      showToast('tune', 'Pengaturan acara berhasil diperbarui');
      return updated;
    });
  };

  // Take photo function branded with real guest identity
  const takePhoto = async (dataUrl: string, caption?: string): Promise<Photo> => {
    if (shotsRemaining <= 0) {
      showToast('warning', 'Rol film Anda telah habis! Silakan nikmati galeri bersama.', 'error');
      throw new Error('Rol film habis');
    }

    if (!guestIdentity?.name) {
      setIsIdentityModalOpen(true);
      showToast('info', 'Mohon lengkapi identitas Anda terlebih dahulu');
      throw new Error('Identitas tamu belum diisi');
    }

    const nextFrame = totalShotsLimit - shotsRemaining + 1;
    const newId = `user-photo-${Date.now()}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const guestName = guestIdentity.name.trim();
    const guestTable = guestIdentity.address
      ? `${guestIdentity.relationship} • ${guestIdentity.address}`
      : guestIdentity.relationship || 'Tamu Undangan';
    const guestInitials = getGuestInitials(guestName);

    const newPhoto: Photo = {
      id: newId,
      url: dataUrl,
      caption: caption || `Momen Spontan #${nextFrame}`,
      author: guestName,
      authorInitials: guestInitials,
      table: guestTable,
      category: 'candid',
      timestamp: timeStr,
      timeAgo: 'Baru saja',
      status: 'uploading',
      likes: 1,
      isLikedByMe: true,
      frameNumber: nextFrame,
      isUserPhoto: true
    };

    setPhotos((prev) => [newPhoto, ...prev]);
    const updatedShots = Math.max(0, shotsRemaining - 1);
    setShotsRemaining(updatedShots);

    // Simulate upload delay and status change to 'saved'
    setTimeout(() => {
      setPhotos((prev) =>
        prev.map((p) => (p.id === newId ? { ...p, status: 'saved' } : p))
      );
      showToast('cloud_done', `Foto #${nextFrame} berhasil tersimpan di album kenangan pengantin!`);
    }, 1500);

    // Add to real-time activity feed with real guest identity
    setGuestActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        author: guestName,
        initials: guestInitials,
        table: guestTable,
        timeAgo: 'Baru saja',
        photoCount: 1,
        thumbnail: dataUrl
      },
      ...prev
    ]);

    return newPhoto;
  };

  const deletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (previewPhoto?.id === id) {
      setPreviewPhoto(null);
    }
    showToast('delete', 'Foto berhasil dihapus dari rol film kamu.');
  };

  const retryUpload = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'uploading' } : p))
    );
    showToast('sync', 'Sedang mengunggah ulang foto ke cloud pengantin...');
    setTimeout(() => {
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'saved' } : p))
      );
      showToast('cloud_done', 'Foto berhasil diunggah ke cloud pengantin!');
    }, 1200);
  };

  const toggleLike = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isLiked = p.isLikedByMe;
          return {
            ...p,
            isLikedByMe: !isLiked,
            likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1
          };
        }
        return p;
      })
    );
  };

  const submitWish = () => {
    const text = guestWishInput.trim();
    if (!text) {
      showToast('info', 'Silakan ketik doa atau pesan terlebih dahulu');
      return;
    }

    if (!guestIdentity?.name) {
      setIsIdentityModalOpen(true);
      showToast('info', 'Mohon lengkapi identitas Anda terlebih dahulu');
      return;
    }

    const guestName = guestIdentity.name.trim();
    const guestTable = guestIdentity.address
      ? `${guestIdentity.relationship} • ${guestIdentity.address}`
      : guestIdentity.relationship || 'Tamu Undangan';

    const newWish: GuestWish = {
      id: `wish-${Date.now()}`,
      author: guestName,
      table: guestTable,
      message: text,
      timestamp: 'Baru saja'
    };
    setWishes((prev) => [newWish, ...prev]);
    setGuestWishInput('');
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#c5a059', '#775a19', '#fed65b', '#fbf9f6']
    });
    showToast('celebration', 'Rol film & ucapan hangatmu berhasil dikirim ke pengantin!');
  };

  // Provide empty lists if in empty state mode
  const displayedPhotos = isEmptyStateMode ? photos.filter((p) => p.isUserPhoto && !p.id.startsWith('photo-')) : photos;

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        navigateTo,
        photos: displayedPhotos,
        shotsRemaining,
        totalShotsLimit,
        wishes,
        guestWishInput,
        setGuestWishInput,
        submitWish,
        takePhoto,
        deletePhoto,
        retryUpload,
        toggleLike,
        resetFilmRoll,
        eventSettings,
        updateSettings,
        toast,
        showToast,
        previewPhoto,
        setPreviewPhoto,
        isSlideshowOpen,
        setIsSlideshowOpen,
        isTableQROpen,
        setIsTableQROpen,
        isEmptyStateMode,
        toggleEmptyStateMode,
        guestActivities: isEmptyStateMode ? [] : guestActivities,
        guestIdentity,
        saveGuestIdentity,
        isIdentityModalOpen,
        setIsIdentityModalOpen,
        getGuestInitials,
        deferredPrompt,
        isAppInstalled,
        isInstallModalOpen,
        setIsInstallModalOpen,
        installPWA,
        chatMessages,
        sendChatMessage,
        addChatReaction
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
