/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CorridorsLeadershipPage } from './components/CorridorsLeadershipPage';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { Navbar, PageId } from './components/Navbar';
import {
  DEFAULT_MEDIA_URLS,
  deleteStoredMediaKey,
  fetchMediaConfig,
  getAllStoredMedia,
  MediaMap,
  MediaSlotKey,
} from './lib/mediaStore';

function buildMediaMapFromPaths(paths: Record<MediaSlotKey, string>): MediaMap {
  return {
    heroVideo: { url: paths.heroVideo, isCustom: Boolean(paths.heroVideo) },
    companyLogo: { url: paths.companyLogo, isCustom: false },
    mdPortrait: { url: paths.mdPortrait, isCustom: false },
    chromeRail1: { url: paths.chromeRail1, isCustom: false },
    chromeRail2: { url: paths.chromeRail2, isCustom: false },
    chromeRail3: { url: paths.chromeRail3, isCustom: false },
    chromeRail4: { url: paths.chromeRail4, isCustom: false },
    chromeRail5: { url: paths.chromeRail5, isCustom: false },
    chromeRail6: { url: paths.chromeRail6, isCustom: false },
    chromeRail7: { url: paths.chromeRail7, isCustom: false },
    chromeRail8: { url: paths.chromeRail8, isCustom: false },
  };
}

function resolveUploadMimeType(mimeType: string, fileName: string, key: MediaSlotKey): string {
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
  return 'image/jpeg';
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#corridors') {
      return 'corridors';
    }
    return 'home';
  });
  const [media, setMedia] = useState<MediaMap>(() => buildMediaMapFromPaths(DEFAULT_MEDIA_URLS));
  const objectUrlsRef = useRef<Partial<Record<MediaSlotKey, string>>>({});

  useEffect(() => {
    let cancelled = false;

    async function hydrateAndPersistMedia() {
      const [diskConfig, storedEntries] = await Promise.all([
        fetchMediaConfig(),
        getAllStoredMedia(),
      ]);

      if (cancelled) return;

      const nextMap = buildMediaMapFromPaths(diskConfig);

      for (const entry of storedEntries) {
        const mimeType = resolveUploadMimeType(
          entry.mimeType || entry.blob.type,
          entry.fileName,
          entry.key
        );
        const objectUrl = URL.createObjectURL(entry.blob);
        objectUrlsRef.current[entry.key] = objectUrl;
        nextMap[entry.key] = {
          url: objectUrl,
          isCustom: true,
          fileName: entry.fileName,
        };

        // Migrate browser-stored video/photos onto permanent repo disk for GitHub
        fetch(`/api/persist-media?slot=${encodeURIComponent(entry.key)}`, {
          method: 'POST',
          headers: {
            'Content-Type': mimeType,
            'X-Requested-With': 'ProsperaMediaSync',
          },
          body: entry.blob,
        })
          .then(async (resp) => {
            if (!resp.ok) return;
            const data = await resp.json();
            if (data?.ok && typeof data.path === 'string') {
              await deleteStoredMediaKey(entry.key);
            }
          })
          .catch(() => {
            // Ignore in production static builds where /api/persist-media is inactive
          });
      }

      setMedia(nextMap);
    }

    hydrateAndPersistMedia();

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F4EF] text-[#142119]">
      <Navbar activePage={activePage} onNavigate={handleNavigate} media={media} />

      <main className="flex-1">
        {activePage === 'home' ? (
          <HomePage media={media} onNavigate={handleNavigate} />
        ) : (
          <CorridorsLeadershipPage media={media} onNavigate={handleNavigate} />
        )}
      </main>

      <Footer media={media} onNavigate={handleNavigate} />
    </div>
  );
}
