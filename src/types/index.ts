export type PhotoCategory = 'akad' | 'resepsi' | 'candid' | 'photobooth';

export type PhotoStatus = 'saved' | 'uploading' | 'failed';

export interface Photo {
  id: string;
  url: string;
  caption: string;
  author: string;
  authorInitials?: string;
  table: string;
  category: PhotoCategory;
  timestamp: string;
  timeAgo: string;
  status: PhotoStatus;
  likes: number;
  isLikedByMe?: boolean;
  frameNumber: number;
  isUserPhoto?: boolean;
}

export interface GuestWish {
  id: string;
  author: string;
  message: string;
  table?: string;
  timestamp: string;
}

export interface EventSettings {
  title: string;
  coupleNames: string;
  date: string;
  venue: string;
  maxCapacity: number;
  maxPerGuest: number;
  autoModeration: boolean;
  limit36Photos: boolean;
  guestPrivacy: boolean;
}

export type AppRoute = 'home' | 'camera' | 'review' | 'gallery' | 'chat' | 'dashboard';

export interface ToastMessage {
  id: string;
  icon: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export interface GuestIdentity {
  name: string;
  address: string;
  relationship: string;
  registeredAt?: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderInitials: string;
  relationship: string;
  address: string;
  message: string;
  timestamp: string;
  isMyMessage?: boolean;
  avatarColor?: string;
  reactions?: Record<string, number>;
}

