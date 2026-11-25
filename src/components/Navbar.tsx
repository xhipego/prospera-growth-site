import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { MediaMap } from '../lib/mediaStore';

export type PageId = 'home' | 'corridors';

interface NavbarProps {
  activePage: PageId;
  onNavigate: (page: PageId, sectionId?: string) => void;
  media: MediaMap;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate, media }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLink = (page: PageId, sectionId?: string) => {
    setMobileOpen(false);
    onNavigate(page, sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F6F4EF]/95 backdrop-blur-md border-b border-[#DED9CC]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 h-[84px] flex items-center justify-between gap-8">
        {/* Zone 1: Standalone Company Logo (bigger, no duplicate text label) */}
        <button
          type="button"
          onClick={() => handleLink('home')}
          className="flex items-center text-left shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#163A22] cursor-pointer"
          aria-label="Prospera Growth Home"
        >
          <img
            src={media.companyLogo.url}
            alt="Prospera Growth"
            referrerPolicy="no-referrer"
            className="h-14 w-auto max-w-[230px] object-contain"
          />
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#3D4A41]">
          <button
            type="button"
            onClick={() => handleLink('home')}
            className={`py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
              activePage === 'home'
                ? 'text-[#142119] border-[#B38D3B]'
                : 'border-transparent hover:text-[#142119] hover:border-[#DED9CC]'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => handleLink('home', 'operations-gallery')}
            className="py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 border-transparent hover:text-[#142119] hover:border-[#DED9CC]"
          >
            Operations
          </button>
          <button
            type="button"
            onClick={() => handleLink('corridors')}
            className={`py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
              activePage === 'corridors'
                ? 'text-[#142119] border-[#B38D3B]'
                : 'border-transparent hover:text-[#142119] hover:border-[#DED9CC]'
            }`}
          >
            Corridors &amp; Proof
          </button>
          <button
            type="button"
            onClick={() => handleLink('corridors', 'leadership')}
            className="py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 border-transparent hover:text-[#142119] hover:border-[#DED9CC]"
          >
            Leadership
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLink('corridors', 'contact')}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold tracking-wide bg-[#163A22] text-[#F6F4EF] rounded-lg hover:bg-[#1E4D2E] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163A22]"
          >
            Request Quote
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#142119] hover:bg-[#EAE5D9] transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#F6F4EF] border-t border-[#DED9CC] px-5 py-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleLink('home')}
            className="text-left py-2.5 px-3 rounded-lg text-sm font-medium text-[#142119] hover:bg-[#EFECE3]"
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => handleLink('home', 'operations-gallery')}
            className="text-left py-2.5 px-3 rounded-lg text-sm font-medium text-[#3D4A41] hover:bg-[#EFECE3]"
          >
            Operations &amp; Rail
          </button>
          <button
            type="button"
            onClick={() => handleLink('corridors')}
            className="text-left py-2.5 px-3 rounded-lg text-sm font-medium text-[#142119] hover:bg-[#EFECE3]"
          >
            Corridors &amp; Track Record
          </button>
          <button
            type="button"
            onClick={() => handleLink('corridors', 'leadership')}
            className="text-left py-2.5 px-3 rounded-lg text-sm font-medium text-[#3D4A41] hover:bg-[#EFECE3]"
          >
            Leadership
          </button>
          <button
            type="button"
            onClick={() => handleLink('corridors', 'contact')}
            className="mt-2 py-3 px-4 rounded-lg text-sm font-semibold text-center bg-[#163A22] text-[#F6F4EF]"
          >
            Request Quote
          </button>
        </div>
      )}
    </header>
  );
};
