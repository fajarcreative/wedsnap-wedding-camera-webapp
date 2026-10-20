import { Photo } from '../types';
import { safeStorage } from './storage';

const DB_NAME = 'WedSnapPhotoDB_v1';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

/**
 * Open or initialize IndexedDB for high-capacity photo storage (supporting 10,000+ photos)
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this browser'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('isUserPhoto', 'isUserPhoto', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Retrieve all photos from IndexedDB
 */
export async function getAllPhotosFromDB(): Promise<Photo[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve((request.result as Photo[]) || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn('getAllPhotosFromDB fallback to safeStorage:', err);
    // Fallback to safeStorage if IndexedDB fails
    const saved = safeStorage.getItem('wedsnap_photos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  }
}

/**
 * Save a single photo to IndexedDB
 */
export async function savePhotoToDB(photo: Photo): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(photo);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('savePhotoToDB error:', err);
  }
}

/**
 * Save or sync entire array of photos to IndexedDB
 */
export async function saveAllPhotosToDB(photos: Photo[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      photos.forEach((photo) => {
        store.put(photo);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('saveAllPhotosToDB error:', err);
    // Fallback save lightweight copy to safeStorage (omitting ultra-heavy base64 if quota reached)
    try {
      safeStorage.setItem('wedsnap_photos', JSON.stringify(photos.slice(0, 50)));
    } catch {
      // safeStorage handles try-catch internally
    }
  }
}

/**
 * Delete a photo by ID from IndexedDB
 */
export async function deletePhotoFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('deletePhotoFromDB error:', err);
  }
}

/**
 * Clear all photos in IndexedDB
 */
export async function clearPhotosDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('clearPhotosDB error:', err);
  }
}

/**
 * Optimize / Compress image before storage to ensure up to 10,000 photos fit cleanly
 */
export function compressImageForStorage(
  dataUrl: string,
  maxDimension = 1280,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    // If not a dataUrl or already small svg/remote, return as-is
    if (!dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

