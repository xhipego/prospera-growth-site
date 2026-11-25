/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { CorridorsLeadershipPage } from './components/CorridorsLeadershipPage';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { Navbar, PageId } from './components/Navbar';
import { DEFAULT_MEDIA_URLS, MediaMap } from './lib/mediaStore';

const LOCKED_MEDIA: MediaMap = {
  heroVideo: { url: DEFAULT_MEDIA_URLS.heroVideo, isCustom: true },
  companyLogo: { url: DEFAULT_MEDIA_URLS.companyLogo, isCustom: false },
  mdPortrait: { url: DEFAULT_MEDIA_URLS.mdPortrait, isCustom: false },
  chromeRail1: { url: DEFAULT_MEDIA_URLS.chromeRail1, isCustom: true },
  chromeRail2: { url: DEFAULT_MEDIA_URLS.chromeRail2, isCustom: true },
  chromeRail3: { url: DEFAULT_MEDIA_URLS.chromeRail3, isCustom: true },
  chromeRail4: { url: DEFAULT_MEDIA_URLS.chromeRail4, isCustom: true },
  chromeRail5: { url: DEFAULT_MEDIA_URLS.chromeRail5, isCustom: true },
  chromeRail6: { url: DEFAULT_MEDIA_URLS.chromeRail6, isCustom: true },
  chromeRail7: { url: DEFAULT_MEDIA_URLS.chromeRail7, isCustom: true },
  chromeRail8: { url: DEFAULT_MEDIA_URLS.chromeRail8, isCustom: true },
};

export default function App() {
  const [activePage, setActivePage] = useState<PageId>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#corridors') {
      return 'corridors';
    }
    return 'home';
  });

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
      <Navbar activePage={activePage} onNavigate={handleNavigate} media={LOCKED_MEDIA} />

      <main className="flex-1">
        {activePage === 'home' ? (
          <HomePage media={LOCKED_MEDIA} onNavigate={handleNavigate} />
        ) : (
          <CorridorsLeadershipPage media={LOCKED_MEDIA} onNavigate={handleNavigate} />
        )}
      </main>

      <Footer media={LOCKED_MEDIA} onNavigate={handleNavigate} />
    </div>
  );
}
