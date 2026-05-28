'use client';

import { useCallback, useEffect, useState } from 'react';

// ─── IndexedDB image store ──────────────────────────────

const DB_NAME = 'estudio-imagens';
const DB_STORE = 'slides';
const DB_VERSION = 1;

let cachedDB: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (cachedDB) return Promise.resolve(cachedDB);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => {
      cachedDB = req.result;
      cachedDB.onclose = () => { cachedDB = null; };
      resolve(cachedDB);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveImage(key: string, dataUrl: string): Promise<void> {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(dataUrl, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadImage(key: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).get(key);
    req.onsuccess = () => resolve((req.result as string) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteImage(key: string): Promise<void> {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listAllKeys(): Promise<string[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).getAllKeys();
    req.onsuccess = () => resolve((req.result as IDBValidKey[]).map(k => String(k)));
    req.onerror = () => reject(req.error);
  });
}

// ─── Hook: use stored image ─────────────────────────────

export function useSlideImage(slideKey: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    loadImage(slideKey).then(setImageUrl).catch(() => {});
  }, [slideKey]);

  const setImage = useCallback(async (dataUrl: string) => {
    await saveImage(slideKey, dataUrl);
    setImageUrl(dataUrl);
  }, [slideKey]);

  const clearImage = useCallback(async () => {
    await deleteImage(slideKey);
    setImageUrl(null);
  }, [slideKey]);

  return { imageUrl, setImage, clearImage };
}
