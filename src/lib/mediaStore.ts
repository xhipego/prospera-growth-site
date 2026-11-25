export type MediaSlotKey =
  | 'heroVideo'
  | 'companyLogo'
  | 'mdPortrait'
  | 'chromeRail1'
  | 'chromeRail2'
  | 'chromeRail3'
  | 'chromeRail4'
  | 'chromeRail5'
  | 'chromeRail6'
  | 'chromeRail7'
  | 'chromeRail8';

export interface StoredMediaEntry {
  key: MediaSlotKey;
  blob: Blob;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  updatedAt: number;
}

export interface MediaAssetState {
  url: string;
  isCustom: boolean;
  fileName?: string;
}

export type MediaMap = Record<MediaSlotKey, MediaAssetState>;

export interface LoadedMediaConfig {
  paths: Record<MediaSlotKey, string>;
  locked: boolean;
}

export const DEFAULT_MEDIA_URLS: Record<MediaSlotKey, string> = {
  heroVideo: '/assets/media/custom_heroVideo.mp4',
  companyLogo: '/assets/media/company_logo.png',
  mdPortrait: '/assets/media/md_portrait.jpg',
  chromeRail1: '/assets/media/custom_chromeRail1.jpg',
  chromeRail2: '/assets/media/custom_chromeRail2.jpg',
  chromeRail3: '/assets/media/chrome_rail_3.jpg',
  chromeRail4: '/assets/media/chrome_rail_4.jpg',
  chromeRail5: '/src/assets/images/rail_wagons_chrome_5_1795550000523.jpg',
  chromeRail6: '/src/assets/images/port_bulk_terminal_6_1795550000307.jpg',
  chromeRail7: '/src/assets/images/chrome_stockpile_loader_7_1795550000451.jpg',
  chromeRail8: '/src/assets/images/freight_rail_corridor_8_1795550000814.jpg',
};

const DB_NAME = 'prospera-growth-media-v1';
const STORE_NAME = 'media_assets';
const CHUNK_SIZE_BYTES = 512 * 1024; // 512 KB raw chunks (~682 KB base64 JSON)

function isSafeLocalAssetPath(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    (value === '' || value.startsWith('/assets/') || value.startsWith('/src/assets/'))
  );
}

export function resolveUploadMimeType(mimeType: string, fileName: string, key: MediaSlotKey): string {
  const clean = (mimeType || '').split(';')[0].trim().toLowerCase();
  if (clean && clean !== 'application/octet-stream') {
    return clean;
  }
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (key === 'heroVideo') {
    if (ext === 'webm') return 'video/webm';
    if (ext === 'mov') return 'video/quicktime';
    return 'video/mp4';
  }
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'avif') return 'image/avif';
  return 'image/jpeg';
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(binary);
}

export async function persistMediaToDisk(
  key: MediaSlotKey,
  blob: Blob,
  fileName: string,
  mimeType?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const resolvedType = resolveUploadMimeType(mimeType || blob.type, fileName, key);
  const totalChunks = Math.max(1, Math.ceil(blob.size / CHUNK_SIZE_BYTES));

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
    const start = chunkIndex * CHUNK_SIZE_BYTES;
    const end = Math.min(blob.size, start + CHUNK_SIZE_BYTES);
    const sliceBuffer = await blob.slice(start, end).arrayBuffer();
    const chunkBase64 = arrayBufferToBase64(sliceBuffer);

    const resp = await fetch('/api/persist-media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slot: key,
        mimeType: resolvedType,
        chunkIndex,
        totalChunks,
        chunkBase64,
      }),
    });

    if (!resp.ok) {
      let msg = `Server returned ${resp.status}`;
      try {
        const errData = await resp.json();
        if (errData?.error) msg = errData.error;
      } catch {
        // Ignore parse error
      }
      throw new Error(msg);
    }

    onProgress?.(Math.round(((chunkIndex + 1) / totalChunks) * 100));

    if (chunkIndex === totalChunks - 1) {
      const data = await resp.json();
      if (data?.ok && isSafeLocalAssetPath(data.path)) {
        return data.path;
      }
      throw new Error('Unexpected response from media save endpoint.');
    }
  }

  throw new Error('Media upload did not complete.');
}

export async function lockMediaOnDisk(): Promise<boolean> {
  const resp = await fetch('/api/lock-media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!resp.ok) {
    throw new Error(`Failed to lock media (${resp.status})`);
  }
  const data = await resp.json();
  return Boolean(data?.ok && data?.locked);
}

export async function fetchMediaConfig(): Promise<LoadedMediaConfig> {
  const paths: Record<MediaSlotKey, string> = { ...DEFAULT_MEDIA_URLS };
  let locked = false;

  try {
    const resp = await fetch(`/assets/media/media-config.json?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!resp.ok) return { paths, locked };
    const data = await resp.json();
    if (!data || typeof data !== 'object') return { paths, locked };

    locked = Boolean(data.locked);
    (Object.keys(DEFAULT_MEDIA_URLS) as MediaSlotKey[]).forEach((key) => {
      if (isSafeLocalAssetPath(data[key])) {
        paths[key] = data[key];
      }
    });
  } catch {
    // Fall back silently to defaults
  }

  return { paths, locked };
}

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaAssetBackup(key: MediaSlotKey, file: File): Promise<void> {
  const entry: StoredMediaEntry = {
    key,
    blob: file,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    updatedAt: Date.now(),
  };

  const db = await openMediaDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(entry);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getAllStoredMedia(): Promise<StoredMediaEntry[]> {
  try {
    const db = await openMediaDb();
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close();
        resolve([]);
        return;
      }
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => {
        db.close();
        resolve((req.result as StoredMediaEntry[]) || []);
      };
      req.onerror = () => {
        db.close();
        resolve([]);
      };
    });
  } catch {
    return [];
  }
}

export async function deleteStoredMediaKey(key: MediaSlotKey): Promise<void> {
  try {
    const db = await openMediaDb();
    await new Promise<void>((resolve) => {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close();
        resolve();
        return;
      }
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    });
  } catch {
    // Ignore cleanup errors
  }
}
