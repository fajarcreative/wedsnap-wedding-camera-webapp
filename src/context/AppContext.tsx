import React, { createContext, useContext, useState, useEffect } from 'react';
import { Photo, EventSettings, GuestWish, AppRoute, ToastMessage } from '../types';
import { initialPhotos, initialEventSettings, initialWishes, initialGuestActivities } from '../utils/seedData';
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation state (supports hash routing as fallback)
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    const hash = window.location.hash.replace('#', '') as AppRoute;
    if (['camera', 'review', 'gallery', 'dashboard'].includes(hash)) {
      return hash;
    }
    return 'camera';
  });

  // Empty state toggle mode (Rule #12)
  const [isEmptyStateMode, setIsEmptyStateMode] = useState<boolean>(() => {
    return localStorage.getItem('wedsnap_empty_mode') === 'true';
  });

  // Ensure fresh clean session for all new visitors or resets (Rule #12 & User Request)
  if (typeof window !== 'undefined' && localStorage.getItem('wedsnap_v5_clean_slate') !== 'true') {
    localStorage.removeItem('wedsnap_photos');
    localStorage.removeItem('wedsnap_shots_remaining');
    localStorage.removeItem('wedsnap_wishes');
    localStorage.removeItem('wedsnap_settings');
    localStorage.removeItem('wedsnap_empty_mode');
    localStorage.setItem('wedsnap_v5_clean_slate', 'true');
  }

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

  // Guest film exposures remaining (starts fresh with full 36 shots!)
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

  // Event settings - coupleNames, date, venue are immutable and strictly locked for all visitors
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

  // Reset film roll to fresh state (36 exposures, 0 user photos)
  const resetFilmRoll = () => {
    setShotsRemaining(36);
    setPhotos(initialPhotos);
    localStorage.setItem('wedsnap_shots_remaining', '36');
    localStorage.setItem('wedsnap_photos', JSON.stringify(initialPhotos));
    showToast('restart_alt', 'Rol film Anda telah di-reset (36 foto baru siap digunakan)!');
  };

  // Support ?reset=1 URL parameter for instant fresh start
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
      if (['camera', 'review', 'gallery', 'dashboard'].includes(hash)) {
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
    showToast(
      newMode ? 'visibility_off' : 'visibility',
      newMode ? 'Mode Empty State diaktifkan (tanpa data demo)' : 'Mode Data Live/Demo diaktifkan'
    );
  };

  const updateSettings = (partial: Partial<EventSettings>) => {
    setEventSettings((prev) => {
      // Disallow changing coupleNames, title, date, venue from visitors
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

  // Take photo function
  const takePhoto = async (dataUrl: string, caption?: string): Promise<Photo> => {
    if (shotsRemaining <= 0) {
      showToast('warning', 'Rol film Anda telah habis! Silakan nikmati galeri bersama.', 'error');
      throw new Error('Rol film habis');
    }

    const nextFrame = totalShotsLimit - shotsRemaining + 1;
    const newId = `user-photo-${Date.now()}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const newPhoto: Photo = {
      id: newId,
      url: dataUrl,
      caption: caption || `Momen Spontan #${nextFrame}`,
      author: 'Anda (Tamu Undangan)',
      authorInitials: 'Saya',
      table: 'Meja Tamu',
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

    // Add to real-time activity feed
    setGuestActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        author: 'Anda (Tamu Undangan)',
        initials: 'SY',
        table: 'Meja Tamu',
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
    const newWish: GuestWish = {
      id: `wish-${Date.now()}`,
      author: 'Anda (Tamu Undangan)',
      table: 'Meja Tamu',
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
        guestActivities: isEmptyStateMode ? [] : guestActivities
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

