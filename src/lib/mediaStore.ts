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
  durationSeconds?: number;
  updatedAt: number;
}

export interface MediaAssetState {
  url: string;
  isCustom: boolean;
  fileName?: string;
}

export type MediaMap = Record<MediaSlotKey, MediaAssetState>;

export const DEFAULT_MEDIA_URLS: Record<MediaSlotKey, string> = {
  heroVideo: '',
  companyLogo: '/assets/media/company_logo.png',
  mdPortrait: '/assets/media/md_portrait.jpg',
  chromeRail1: '/assets/media/chrome_rail_1.jpg',
  chromeRail2: '/assets/media/chrome_rail_2.jpg',
  chromeRail3: '/assets/media/chrome_rail_3.jpg',
  chromeRail4: '/assets/media/chrome_rail_4.jpg',
  chromeRail5: '/src/assets/images/rail_wagons_chrome_5_1795550000523.jpg',
  chromeRail6: '/src/assets/images/port_bulk_terminal_6_1795550000307.jpg',
  chromeRail7: '/src/assets/images/chrome_stockpile_loader_7_1795550000451.jpg',
  chromeRail8: '/src/assets/images/freight_rail_corridor_8_1795550000814.jpg',
};

const DB_NAME = 'prospera-growth-media-v1';
const STORE_NAME = 'media_assets';

function isSafeLocalAssetPath(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    (value === '' || value.startsWith('/assets/') || value.startsWith('/src/assets/'))
  );
}

export async function fetchMediaConfig(): Promise<Record<MediaSlotKey, string>> {
  const resolved: Record<MediaSlotKey, string> = { ...DEFAULT_MEDIA_URLS };
  try {
    const resp = await fetch('/assets/media/media-config.json', { cache: 'no-store' });
    if (!resp.ok) return resolved;
    const data = await resp.json();
    if (!data || typeof data !== 'object') return resolved;

    (Object.keys(DEFAULT_MEDIA_URLS) as MediaSlotKey[]).forEach((key) => {
      if (isSafeLocalAssetPath(data[key])) {
        resolved[key] = data[key];
      }
    });
  } catch {
    // Fall back silently to defaults
  }
  return resolved;
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
    // Ignore storage cleanup errors
  }
}
