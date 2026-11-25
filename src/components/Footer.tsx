import React from 'react';
import { CONTACT_INFO } from '../data/companyProfile';
import { MediaMap } from '../lib/mediaStore';
import { PageId } from './Navbar';

interface FooterProps {
  media: MediaMap;
  onNavigate: (page: PageId, sectionId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ media, onNavigate }) => {
  return (
    <footer className="bg-[#102618] text-[#D8DFDA] border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pb-10 border-b border-white/10">
          <div className="md:col-span-5">
            <div className="inline-flex items-center bg-[#F6F4EF] px-4 py-2.5 rounded-xl">
              <img
                src={media.companyLogo.url}
                alt="Prospera Growth"
                referrerPolicy="no-referrer"
                className="h-14 w-auto max-w-[220px] object-contain"
              />
            </div>
            <p className="mt-4 text-sm text-[#B8C7BD] max-w-sm leading-relaxed">
              Mine-to-port bulk mineral rail aggregation, siding management, and FOB export logistics across Richards Bay and Maputo.
            </p>
          </div>

          <div className="md:col-span-4 space-y-2.5 text-sm">
            <p className="text-xs font-semibold tracking-wide text-[#DFC076] mb-3">
              Navigation
            </p>
            <div>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Overview &amp; Operations
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onNavigate('corridors')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Corridors, Track Record &amp; Leadership
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onNavigate('corridors', 'contact')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Request a FOB Quote
              </button>
            </div>
          </div>

          <div className="md:col-span-3 space-y-2 text-sm">
            <p className="text-xs font-semibold tracking-wide text-[#DFC076] mb-3">
              Office &amp; Direct Contact
            </p>
            <p className="text-xs text-[#B8C7BD] leading-relaxed">{CONTACT_INFO.office}</p>
            <p className="text-xs font-mono text-[#B8C7BD] tabular-nums">{CONTACT_INFO.phone}</p>
            <p className="text-xs text-[#B8C7BD]">
              <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-white transition-colors">
                {CONTACT_INFO.email}
              </a>
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#9FB0A5]">
          <p>{CONTACT_INFO.companyLegal} · Reg {CONTACT_INFO.registration}</p>
          <p>B-BBEE {CONTACT_INFO.bbbee} · SARS {CONTACT_INFO.sars}</p>
        </div>
      </div>
    </footer>
  );
};
