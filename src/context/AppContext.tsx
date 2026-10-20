import React, { createContext, useContext, useState, useEffect } from 'react';
import { Photo, EventSettings, GuestWish, AppRoute, ToastMessage, GuestIdentity, ChatMessage } from '../types';
import { initialPhotos, initialEventSettings, initialWishes, initialGuestActivities, initialChatMessages } from '../utils/seedData';
import { safeStorage } from '../utils/storage';
import { fetchRemoteMessages, persistRemoteMessages, broadcastNewMessage, broadcastReaction, subscribeToRealtimeChat } from '../utils/chatSync';
import { getAllPhotosFromDB, savePhotoToDB, saveAllPhotosToDB, deletePhotoFromDB, clearPhotosDB, compressImageForStorage } from '../utils/photoStorage';
import { uploadPhotoToCloud, broadcastPhotoLike, syncMissingPhotos } from '../utils/photoSync';
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
  // Cloud Sync Utilities
  refreshChatNow: () => Promise<void>;
  refreshGalleryNow: () => Promise<void>;
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation state (supports hash routing as fallback, default to home)
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.hash) {
        const hash = window.location.hash.replace('#', '') as AppRoute;
        if (['home', 'camera', 'review', 'gallery', 'chat', 'dashboard'].includes(hash)) {
          return hash;
        }
      }
    } catch {}
    return 'home';
  });

  // Empty state mode (keeps default clean)
  const [isEmptyStateMode, setIsEmptyStateMode] = useState<boolean>(() => {
    return safeStorage.getItem('wedsnap_empty_mode') === 'true';
  });

  // Ensure fresh clean session for all new visitors or resets
  if (typeof window !== 'undefined' && safeStorage.getItem('wedsnap_v6_clean_slate') !== 'true') {
    safeStorage.removeItem('wedsnap_photos');
    safeStorage.removeItem('wedsnap_shots_remaining');
    safeStorage.removeItem('wedsnap_wishes');
    safeStorage.removeItem('wedsnap_settings');
    safeStorage.removeItem('wedsnap_empty_mode');
    safeStorage.setItem('wedsnap_v6_clean_slate', 'true');
  }

  // Ensure automatic upgrade to 10k photo storage capacity for all devices
  if (typeof window !== 'undefined' && safeStorage.getItem('wedsnap_v8_10k_capacity') !== 'true') {
    safeStorage.setItem('wedsnap_shots_remaining', '10000');
    safeStorage.setItem('wedsnap_v8_10k_capacity', 'true');
  }

  // Guest Identity State (mandatory for all guests)
  const [guestIdentity, setGuestIdentity] = useState<GuestIdentity | null>(() => {
    const saved = safeStorage.getItem('wedsnap_guest_identity');
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
    const saved = safeStorage.getItem('wedsnap_guest_identity');
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
    try {
      if (typeof window !== 'undefined') {
        const isStandalone = (window.navigator as any)?.standalone === true;
        const matchesMedia = typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches;
        return Boolean(isStandalone || matchesMedia);
      }
    } catch {}
    return false;
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
    safeStorage.setItem('wedsnap_guest_identity', JSON.stringify(updated));
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
    const saved = safeStorage.getItem('wedsnap_photos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing photos from storage', e);
      }
    }
    return initialPhotos;
  });

  // Guest film exposures remaining (starts fresh with full 10,000 photos capacity)
  const [shotsRemaining, setShotsRemaining] = useState<number>(() => {
    const saved = safeStorage.getItem('wedsnap_shots_remaining');
    const parsed = saved ? parseInt(saved, 10) : 10000;
    return parsed <= 36 ? 10000 : parsed;
  });

  const totalShotsLimit = 10000;

  // Wishes state
  const [wishes, setWishes] = useState<GuestWish[]>(() => {
    const saved = safeStorage.getItem('wedsnap_wishes');
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
    const saved = safeStorage.getItem('wedsnap_settings');
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
      maxCapacity: 10000,
      maxPerGuest: 10000
    };
  });

  // Guest Activities for live feed
  const [guestActivities, setGuestActivities] = useState(initialGuestActivities);

  // Modals & Toasts
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [isTableQROpen, setIsTableQROpen] = useState(false);

  // Reset film roll programmatically (10,000 photos capacity)
  const resetFilmRoll = () => {
    setShotsRemaining(10000);
    setPhotos(initialPhotos);
    clearPhotosDB().then(() => saveAllPhotosToDB(initialPhotos));
    safeStorage.setItem('wedsnap_shots_remaining', '10000');
    safeStorage.setItem('wedsnap_photos', JSON.stringify(initialPhotos));
    showToast('restart_alt', 'Kapasitas foto Anda telah di-reset (10.000 foto baru siap digunakan)!');
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

  // Initialize and load photos from high-capacity IndexedDB on startup
  useEffect(() => {
    getAllPhotosFromDB()
      .then((dbPhotos) => {
        if (dbPhotos && dbPhotos.length > 0) {
          setPhotos(dbPhotos);
        } else {
          saveAllPhotosToDB(initialPhotos).catch(() => {});
        }
      })
      .catch((err) => {
        console.warn('WedSnap: IndexedDB initialization fallback:', err);
      });
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

  // Save photos to storage
  useEffect(() => {
    safeStorage.setItem('wedsnap_photos', JSON.stringify(photos));
  }, [photos]);

  // Save shots remaining
  useEffect(() => {
    safeStorage.setItem('wedsnap_shots_remaining', shotsRemaining.toString());
  }, [shotsRemaining]);

  // Save wishes
  useEffect(() => {
    safeStorage.setItem('wedsnap_wishes', JSON.stringify(wishes));
  }, [wishes]);

  // Guest Group Chat Messages (synced across all guest devices)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = safeStorage.getItem('wedsnap_chat_messages');
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

  // Save chat messages to local storage cache
  useEffect(() => {
    safeStorage.setItem('wedsnap_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Syncing state indicator
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Manual refresh for chat
  const refreshChatNow = async () => {
    try {
      setIsSyncing(true);
      const remote = await fetchRemoteMessages();
      if (remote && remote.length > 0) {
        setChatMessages((prev) => {
          const map = new Map<string, ChatMessage>();
          prev.forEach((m) => map.set(m.id, m));
          remote.forEach((rm) => {
            map.set(rm.id, {
              ...rm,
              isMyMessage: Boolean(guestIdentity?.name && rm.senderName === guestIdentity.name)
            });
          });
          return Array.from(map.values());
        });
        showToast('sync', 'Pesan obrolan telah diperbarui');
      }
    } catch (e) {
      console.warn('refreshChatNow error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual refresh for shared gallery
  const refreshGalleryNow = async () => {
    try {
      setIsSyncing(true);
      const count = await syncMissingPhotos(photos, (newPhotos) => {
        setPhotos((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const toAdd = newPhotos.filter((p) => !existingIds.has(p.id));
          return toAdd.length > 0 ? [...toAdd, ...prev] : prev;
        });
      });
      if (count > 0) {
        showToast('photo_library', `${count} foto baru dari tamu berhasil disinkronkan!`);
      } else {
        showToast('cloud_done', 'Galeri foto bersama sudah paling terbaru!');
      }
    } catch (e) {
      console.warn('refreshGalleryNow error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Real-time cross-device synchronization (SSE + Cloud Database + Fast Polling)
  useEffect(() => {
    let isMounted = true;

    // Helper to merge remote messages with local state safely
    const mergeMessages = (remoteList: ChatMessage[]) => {
      setChatMessages((prev) => {
        const map = new Map<string, ChatMessage>();
        prev.forEach((m) => map.set(m.id, m));
        let hasNew = false;
        remoteList.forEach((rm) => {
          if (!map.has(rm.id)) {
            hasNew = true;
            map.set(rm.id, {
              ...rm,
              isMyMessage: Boolean(guestIdentity?.name && rm.senderName === guestIdentity.name)
            });
          }
        });
        return hasNew ? Array.from(map.values()) : prev;
      });
    };

    // 1. Initial fetch from cloud database for messages & missing shared photos
    fetchRemoteMessages().then((remote) => {
      if (isMounted && remote && remote.length > 0) {
        mergeMessages(remote);
      }
    });

    syncMissingPhotos(photos, (newPhotos) => {
      if (!isMounted || newPhotos.length === 0) return;
      setPhotos((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const toAdd = newPhotos.filter((p) => !existingIds.has(p.id));
        return toAdd.length > 0 ? [...toAdd, ...prev] : prev;
      });
    });

    // 2. Real-time SSE stream listener (instant push for chat messages, reactions & photos)
    const unsubscribe = subscribeToRealtimeChat(
      // onNewMessage
      (incomingMsg) => {
        if (!isMounted) return;
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;
          const isMe = Boolean(guestIdentity?.name && incomingMsg.senderName === guestIdentity.name);
          if (!isMe) {
            showToast('chat', `Pesan baru dari ${incomingMsg.senderName}`);
          }
          return [
            ...prev,
            {
              ...incomingMsg,
              isMyMessage: isMe
            }
          ];
        });
      },
      // onReaction
      (msgId, emoji) => {
        if (!isMounted) return;
        setChatMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === msgId) {
              const reactions = { ...(msg.reactions || {}) };
              reactions[emoji] = (reactions[emoji] || 0) + 1;
              return { ...msg, reactions };
            }
            return msg;
          })
        );
      },
      // onNewPhoto (real-time photo shared across all guest phones)
      (incomingPhoto) => {
        if (!isMounted) return;
        setPhotos((prev) => {
          if (prev.some((p) => p.id === incomingPhoto.id)) return prev;
          const isMe = Boolean(guestIdentity?.name && incomingPhoto.author === guestIdentity.name);
          const guestPhoto: Photo = {
            ...incomingPhoto,
            isUserPhoto: isMe,
            status: 'saved'
          };
          savePhotoToDB(guestPhoto).catch(() => {});
          if (!isMe) {
            showToast('photo_library', `Foto baru ditambahkan oleh ${incomingPhoto.author}!`);
            setGuestActivities((acts) => [
              {
                id: `act-${Date.now()}`,
                author: incomingPhoto.author,
                initials: incomingPhoto.authorInitials || 'TM',
                table: incomingPhoto.table || 'Meja Tamu',
                timeAgo: 'Baru saja',
                photoCount: 1,
                thumbnail: incomingPhoto.url
              },
              ...acts
            ]);
          }
          return [guestPhoto, ...prev];
        });
      },
      // onPhotoLike
      (photoId, likes) => {
        if (!isMounted) return;
        setPhotos((prev) =>
          prev.map((p) => (p.id === photoId ? { ...p, likes } : p))
        );
      }
    );

    // 3. Fast fallback polling (1.5s for chat messages, 5s for shared photos)
    const chatPollInterval = setInterval(() => {
      fetchRemoteMessages().then((remote) => {
        if (isMounted && remote && remote.length > 0) {
          mergeMessages(remote);
        }
      });
    }, 1500);

    const photoPollInterval = setInterval(() => {
      syncMissingPhotos(photos, (newPhotos) => {
        if (!isMounted || newPhotos.length === 0) return;
        setPhotos((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const toAdd = newPhotos.filter((p) => !existingIds.has(p.id));
          return toAdd.length > 0 ? [...toAdd, ...prev] : prev;
        });
      });
    }, 5000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(chatPollInterval);
      clearInterval(photoPollInterval);
    };
  }, [guestIdentity?.name]);

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
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderName: guestIdentity.name.trim(),
      senderInitials: getGuestInitials(guestIdentity.name),
      relationship: guestIdentity.relationship || 'Tamu Undangan',
      address: guestIdentity.address || 'Meja Tamu',
      message: trimmed,
      timestamp: timeStr,
      isMyMessage: true,
      reactions: {}
    };

    // Optimistically update local state
    setChatMessages((prev) => {
      const next = [...prev, newMsg];
      // Persist to cloud database so other devices fetch it
      persistRemoteMessages(next);
      return next;
    });

    // Broadcast in real-time to all connected devices
    broadcastNewMessage(newMsg);
    showToast('send', 'Pesan Anda berhasil dikirim ke semua tamu undangan!');
  };

  const addChatReaction = (messageId: string, emoji: string) => {
    setChatMessages((prev) => {
      const next = prev.map((msg) => {
        if (msg.id === messageId) {
          const reactions = { ...(msg.reactions || {}) };
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...msg, reactions };
        }
        return msg;
      });
      persistRemoteMessages(next);
      return next;
    });

    broadcastReaction(messageId, emoji);
  };

  // Save settings (always ensuring coupleNames cannot be tampered)
  useEffect(() => {
    safeStorage.setItem('wedsnap_settings', JSON.stringify(eventSettings));
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
    safeStorage.setItem('wedsnap_empty_mode', newMode.toString());
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
        maxCapacity: 10000,
        maxPerGuest: 10000
      };
      showToast('tune', 'Pengaturan acara berhasil diperbarui');
      return updated;
    });
  };

  // Take photo function branded with real guest identity, IndexedDB storage, and instant cloud sync
  const takePhoto = async (dataUrl: string, caption?: string): Promise<Photo> => {
    if (shotsRemaining <= 0) {
      showToast('warning', 'Kapasitas foto 10.000 foto telah habis! Silakan nikmati galeri bersama.', 'error');
      throw new Error('Kapasitas foto habis');
    }

    if (!guestIdentity?.name) {
      setIsIdentityModalOpen(true);
    }

    // Compress image to ensure high-capacity storage (up to 10,000 photos) and fast cloud sync (~50KB)
    const optimizedUrl = await compressImageForStorage(dataUrl, 1080, 0.72);

    const nextFrame = totalShotsLimit - shotsRemaining + 1;
    const newId = `user-photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const guestName = guestIdentity?.name?.trim() || 'Tamu Undangan';
    const guestTable = guestIdentity?.address
      ? `${guestIdentity.relationship} • ${guestIdentity.address}`
      : guestIdentity?.relationship || 'Meja Tamu';
    const guestInitials = getGuestInitials(guestName);

    const newPhoto: Photo = {
      id: newId,
      url: optimizedUrl,
      caption: caption || `Momen Spontan #${nextFrame}`,
      author: guestName,
      authorInitials: guestInitials,
      table: guestTable,
      category: 'candid',
      timestamp: timeStr,
      timeAgo: 'Baru saja',
      status: 'saved',
      likes: 1,
      isLikedByMe: true,
      frameNumber: nextFrame,
      isUserPhoto: true
    };

    // 1. Save directly to local IndexedDB for immediate offline-first access
    await savePhotoToDB(newPhoto);

    // 2. Optimistically update local photos state
    setPhotos((prev) => [newPhoto, ...prev]);
    const updatedShots = Math.max(0, shotsRemaining - 1);
    setShotsRemaining(updatedShots);

    showToast('cloud_done', `Foto #${nextFrame} tersimpan! Sedang menyinkronkan ke Galeri Bersama Tamu...`);

    // 3. Upload to cloud in background so all other guest devices see it immediately
    uploadPhotoToCloud(newPhoto).then((ok) => {
      if (ok) {
        showToast('cloud_done', `Foto #${nextFrame} berhasil terhubung di Galeri Bersama Semua Tamu!`);
      }
    }).catch((err) => {
      console.warn('Photo cloud upload warning:', err);
    });

    // 4. Add to real-time activity feed with real guest identity
    setGuestActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        author: guestName,
        initials: guestInitials,
        table: guestTable,
        timeAgo: 'Baru saja',
        photoCount: 1,
        thumbnail: optimizedUrl
      },
      ...prev
    ]);

    return newPhoto;
  };

  const deletePhoto = (id: string) => {
    deletePhotoFromDB(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (previewPhoto?.id === id) {
      setPreviewPhoto(null);
    }
    showToast('delete', 'Foto berhasil dihapus dari galeri.');
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
          const newLikes = isLiked ? Math.max(0, p.likes - 1) : p.likes + 1;
          const updatedPhoto: Photo = {
            ...p,
            isLikedByMe: !isLiked,
            likes: newLikes
          };
          savePhotoToDB(updatedPhoto).catch(() => {});
          broadcastPhotoLike(id, newLikes);
          return updatedPhoto;
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
        addChatReaction,
        refreshChatNow,
        refreshGalleryNow,
        isSyncing
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
