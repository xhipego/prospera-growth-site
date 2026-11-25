/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { CorridorsLeadershipPage } from './components/CorridorsLeadershipPage';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { Navbar, PageId } from './components/Navbar';
import {
  DEFAULT_MEDIA_URLS,
  deleteStoredMediaKey,
  fetchMediaConfig,
  getAllStoredMedia,
  lockMediaOnDisk,
  MediaMap,
  MediaSlotKey,
  persistMediaToDisk,
  saveMediaAssetBackup,
} from './lib/mediaStore';

function buildMediaMapFromPaths(paths: Record<MediaSlotKey, string>): MediaMap {
  return {
    heroVideo: {
      url: paths.heroVideo,
      isCustom: paths.heroVideo.includes('custom_'),
    },
    companyLogo: {
      url: paths.companyLogo,
      isCustom: paths.companyLogo.includes('custom_'),
    },
    mdPortrait: {
      url: paths.mdPortrait,
      isCustom: paths.mdPortrait.includes('custom_'),
    },
    chromeRail1: {
      url: paths.chromeRail1,
      isCustom: paths.chromeRail1.includes('custom_'),
    },
    chromeRail2: {
      url: paths.chromeRail2,
      isCustom: paths.chromeRail2.includes('custom_'),
    },
    chromeRail3: {
      url: paths.chromeRail3,
      isCustom: paths.chromeRail3.includes('custom_'),
    },
    chromeRail4: {
      url: paths.chromeRail4,
      isCustom: paths.chromeRail4.includes('custom_'),
    },
    chromeRail5: {
      url: paths.chromeRail5,
      isCustom: paths.chromeRail5.includes('custom_'),
    },
    chromeRail6: {
      url: paths.chromeRail6,
      isCustom: paths.chromeRail6.includes('custom_'),
    },
    chromeRail7: {
      url: paths.chromeRail7,
      isCustom: paths.chromeRail7.includes('custom_'),
    },
    chromeRail8: {
      url: paths.chromeRail8,
      isCustom: paths.chromeRail8.includes('custom_'),
    },
  };
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#corridors') {
      return 'corridors';
    }
    return 'home';
  });
  const [media, setMedia] = useState<MediaMap>(() => buildMediaMapFromPaths(DEFAULT_MEDIA_URLS));
  const [isLocked, setIsLocked] = useState<boolean>(!import.meta.env.DEV);
  const [savingSlots, setSavingSlots] = useState<Partial<Record<MediaSlotKey, number | boolean>>>({});
  const [locking, setLocking] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const objectUrlsRef = useRef<Partial<Record<MediaSlotKey, string>>>({});

  useEffect(() => {
    let cancelled = false;

    async function hydrateAndSyncMedia() {
      const [{ paths, locked }, storedEntries] = await Promise.all([
        fetchMediaConfig(),
        getAllStoredMedia(),
      ]);

      if (cancelled) return;

      const effectiveLocked = !import.meta.env.DEV || locked;
      setIsLocked(effectiveLocked);

      const nextMap = buildMediaMapFromPaths(paths);

      // Sync any un-persisted browser backup blobs onto permanent repo disk
      for (const entry of storedEntries) {
        const objectUrl = URL.createObjectURL(entry.blob);
        objectUrlsRef.current[entry.key] = objectUrl;
        nextMap[entry.key] = {
          url: objectUrl,
          isCustom: true,
          fileName: entry.fileName,
        };

        if (import.meta.env.DEV && !locked) {
          persistMediaToDisk(entry.key, entry.blob, entry.fileName, entry.mimeType)
            .then(async (savedPath) => {
              if (cancelled) return;
              await deleteStoredMediaKey(entry.key);
              setMedia((prev) => ({
                ...prev,
                [entry.key]: {
                  url: `${savedPath}?v=${Date.now()}`,
                  isCustom: true,
                  fileName: entry.fileName,
                },
              }));
              URL.revokeObjectURL(objectUrl);
              delete objectUrlsRef.current[entry.key];
            })
            .catch((err) => {
              if (cancelled) return;
              setMediaError(
                err instanceof Error
                  ? `Could not sync ${entry.fileName} to disk: ${err.message}`
                  : `Could not sync ${entry.fileName} to disk.`
              );
            });
        }
      }

      setMedia(nextMap);
    }

    hydrateAndSyncMedia();

    return () => {
      cancelled = true;
      Object.values(objectUrlsRef.current).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#corridors') {
        setActivePage('corridors');
      } else if (hash === '#home' || hash === '') {
        setActivePage('home');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavigate = useCallback((page: PageId, sectionId?: string) => {
    setActivePage(page);
    window.history.replaceState(null, '', page === 'corridors' ? '#corridors' : '#home');

    if (sectionId) {
      setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleUploadMedia = useCallback(async (key: MediaSlotKey, file: File) => {
    setMediaError('');
    const oldUrl = objectUrlsRef.current[key];
    if (oldUrl) URL.revokeObjectURL(oldUrl);

    const previewUrl = URL.createObjectURL(file);
    objectUrlsRef.current[key] = previewUrl;

    setSavingSlots((prev) => ({ ...prev, [key]: 1 }));
    setMedia((prev) => ({
      ...prev,
      [key]: {
        url: previewUrl,
        isCustom: false,
        fileName: file.name,
      },
    }));

    try {
      await saveMediaAssetBackup(key, file).catch(() => {});
      const savedPath = await persistMediaToDisk(key, file, file.name, file.type, (pct) => {
        setSavingSlots((prev) => ({ ...prev, [key]: pct }));
      });
      await deleteStoredMediaKey(key);

      setMedia((prev) => ({
        ...prev,
        [key]: {
          url: `${savedPath}?v=${Date.now()}`,
          isCustom: true,
          fileName: file.name,
        },
      }));
      URL.revokeObjectURL(previewUrl);
      delete objectUrlsRef.current[key];
    } catch (err) {
      setMediaError(
        err instanceof Error
          ? `Could not save ${file.name} permanently: ${err.message}`
          : `Could not save ${file.name} permanently.`
      );
    } finally {
      setSavingSlots((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  const handleLockMedia = useCallback(async () => {
    const anySaving = Object.values(savingSlots).some(Boolean);
    if (anySaving || locking) return;

    setMediaError('');
    setLocking(true);
    try {
      const pending = await getAllStoredMedia();
      for (const entry of pending) {
        const savedPath = await persistMediaToDisk(
          entry.key,
          entry.blob,
          entry.fileName,
          entry.mimeType
        );
        await deleteStoredMediaKey(entry.key);
        setMedia((prev) => ({
          ...prev,
          [entry.key]: {
            url: `${savedPath}?v=${Date.now()}`,
            isCustom: true,
            fileName: entry.fileName,
          },
        }));
      }

      const lockedOk = await lockMediaOnDisk();
      if (lockedOk) {
        setIsLocked(true);
      }
    } catch (err) {
      setMediaError(
        err instanceof Error ? err.message : 'Unable to lock media configuration right now.'
      );
    } finally {
      setLocking(false);
    }
  }, [locking, savingSlots]);

  const canEdit = import.meta.env.DEV && !isLocked;
  const anySaving = Object.values(savingSlots).some(Boolean);
  const customGalleryCount = (
    [
      'chromeRail1',
      'chromeRail2',
      'chromeRail3',
      'chromeRail4',
      'chromeRail5',
      'chromeRail6',
      'chromeRail7',
      'chromeRail8',
    ] as MediaSlotKey[]
  ).filter((k) => media[k].url.startsWith('/assets/media/custom_')).length;
  const videoSavedOnDisk = media.heroVideo.url.startsWith('/assets/media/custom_');

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F4EF] text-[#142119]">
      <Navbar activePage={activePage} onNavigate={handleNavigate} media={media} />

      <main className="flex-1">
        {activePage === 'home' ? (
          <HomePage
            media={media}
            canEdit={canEdit}
            savingSlots={savingSlots}
            onUploadMedia={handleUploadMedia}
            onNavigate={handleNavigate}
          />
        ) : (
          <CorridorsLeadershipPage
            media={media}
            canEdit={canEdit}
            savingSlots={savingSlots}
            onUploadMedia={handleUploadMedia}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      <Footer media={media} onNavigate={handleNavigate} />

      {canEdit && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-[#163A22] text-[#F6F4EF] border border-white/15 rounded-2xl p-4 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="text-xs leading-relaxed">
              <p className="font-semibold text-[#DFC076]">
                Media Setup Mode (Dev Only)
              </p>
              <p className="mt-1 text-[#D8DFDA]">
                Video: {videoSavedOnDisk ? 'Saved on disk' : 'Not saved yet'} · Gallery custom:{' '}
                {customGalleryCount}/8
              </p>
            </div>
          </div>

          {mediaError && (
            <p className="mt-2 text-xs text-[#F6D38D] bg-black/25 rounded-lg p-2">
              {mediaError}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer transition-colors whitespace-nowrap">
              <span>{savingSlots.companyLogo ? 'Saving Logo...' : 'Change Logo'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={Boolean(savingSlots.companyLogo)}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadMedia('companyLogo', file);
                  e.target.value = '';
                }}
              />
            </label>
            <button
              type="button"
              onClick={handleLockMedia}
              disabled={anySaving || locking}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#B38D3B] text-[#142119] rounded-xl hover:bg-[#C69F49] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{locking ? 'Locking...' : 'Save & Lock for GitHub'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
