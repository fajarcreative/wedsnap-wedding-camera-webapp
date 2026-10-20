import { Photo } from '../types';
import { savePhotoToDB } from './photoStorage';

const KVDB_BUCKET = 'Y7gJBLFvpHTuzkV1xqY5gr';
const KVDB_INDEX_ENDPOINT = `https://kvdb.io/${KVDB_BUCKET}/shared_photos_index`;
const KVDB_PHOTO_PREFIX = `https://kvdb.io/${KVDB_BUCKET}/photo_`;

const NTFY_TOPIC = 'wedsnap-fajar-aulia-chat-live';
const NTFY_PUBLISH_URL = `https://ntfy.sh/${NTFY_TOPIC}`;

export interface RemotePhotoMeta {
  id: string;
  author: string;
  authorInitials: string;
  table?: string;
  caption: string;
  category: 'akad' | 'resepsi' | 'candid' | 'photobooth';
  timestamp: string;
  timeAgo: string;
  likes: number;
  frameNumber: number;
  createdAt: number;
}

/**
 * Fetch the shared photo index listing all photos taken by all wedding guests
 */
export async function fetchRemotePhotoIndex(): Promise<RemotePhotoMeta[]> {
  try {
    const res = await fetch(`${KVDB_INDEX_ENDPOINT}?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('fetchRemotePhotoIndex warning:', err);
    return [];
  }
}

/**
 * Fetch full photo details including compressed image url from cloud
 */
export async function fetchFullPhotoFromCloud(photoId: string): Promise<Photo | null> {
  try {
    const res = await fetch(`${KVDB_PHOTO_PREFIX}${photoId}?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) return null;
    const photo = await res.json();
    if (photo && photo.id && photo.url) {
      return photo as Photo;
    }
    return null;
  } catch (err) {
    console.warn(`fetchFullPhotoFromCloud warning for ${photoId}:`, err);
    return null;
  }
}

/**
 * Upload photo to cloud and broadcast to all connected guest phones
 */
export async function uploadPhotoToCloud(photo: Photo): Promise<boolean> {
  try {
    // 1. Store full photo object with image data to individual key
    const photoRes = await fetch(`${KVDB_PHOTO_PREFIX}${photo.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photo)
    });

    if (!photoRes.ok) {
      console.warn('Failed to upload photo details to KVdb:', photoRes.status);
    }

    // 2. Update shared index with new photo metadata
    const currentIndex = await fetchRemotePhotoIndex();
    const meta: RemotePhotoMeta = {
      id: photo.id,
      author: photo.author,
      authorInitials: photo.authorInitials || 'TM',
      table: photo.table,
      caption: photo.caption,
      category: photo.category,
      timestamp: photo.timestamp,
      timeAgo: photo.timeAgo,
      likes: photo.likes || 1,
      frameNumber: photo.frameNumber,
      createdAt: Date.now()
    };

    const updatedIndex = [meta, ...currentIndex.filter((m) => m.id !== photo.id)];
    // Keep up to 500 recent photos in index for performance
    const prunedIndex = updatedIndex.slice(0, 500);

    await fetch(KVDB_INDEX_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prunedIndex)
    });

    // 3. Broadcast real-time event to all other guests via SSE
    try {
      await fetch(NTFY_PUBLISH_URL, {
        method: 'POST',
        body: JSON.stringify({
          type: 'NEW_PHOTO',
          payload: photo
        })
      });
    } catch (e) {
      console.warn('Failed to broadcast photo event:', e);
    }

    return true;
  } catch (err) {
    console.warn('uploadPhotoToCloud error:', err);
    return false;
  }
}

/**
 * Broadcast photo like update in real-time
 */
export async function broadcastPhotoLike(photoId: string, likes: number): Promise<void> {
  try {
    await fetch(NTFY_PUBLISH_URL, {
      method: 'POST',
      body: JSON.stringify({
        type: 'PHOTO_LIKE',
        payload: { photoId, likes }
      })
    });
  } catch (err) {
    console.warn('broadcastPhotoLike warning:', err);
  }
}

/**
 * Synchronize missing remote photos into local IndexedDB and state
 */
export async function syncMissingPhotos(
  existingPhotos: Photo[],
  onNewPhotosLoaded: (newPhotos: Photo[]) => void
): Promise<number> {
  try {
    const remoteIndex = await fetchRemotePhotoIndex();
    if (!remoteIndex || remoteIndex.length === 0) return 0;

    const existingIds = new Set(existingPhotos.map((p) => p.id));
    const missingMetas = remoteIndex.filter((meta) => !existingIds.has(meta.id));

    if (missingMetas.length === 0) return 0;

    // Fetch details for missing photos (limit to 15 at a time to prevent mobile bandwidth overload)
    const toFetch = missingMetas.slice(0, 15);
    const fetchedPhotos: Photo[] = [];

    await Promise.all(
      toFetch.map(async (meta) => {
        const fullPhoto = await fetchFullPhotoFromCloud(meta.id);
        if (fullPhoto) {
          // Mark as not user's own photo on other devices
          const guestPhoto: Photo = {
            ...fullPhoto,
            isUserPhoto: false,
            status: 'saved'
          };
          await savePhotoToDB(guestPhoto);
          fetchedPhotos.push(guestPhoto);
        }
      })
    );

    if (fetchedPhotos.length > 0) {
      onNewPhotosLoaded(fetchedPhotos);
    }

    return fetchedPhotos.length;
  } catch (err) {
    console.warn('syncMissingPhotos error:', err);
    return 0;
  }
}
