import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  AGGREGATION_BENEFITS,
  CAPABILITIES,
  CREDENTIALS_STRIP,
  GALLERY_PHOTOS,
  PROCESS_STEPS,
  WHO_WE_ARE_PILLARS,
} from '../data/companyProfile';
import { MediaMap } from '../lib/mediaStore';
import { PageId } from './Navbar';

interface HomePageProps {
  media: MediaMap;
  onNavigate: (page: PageId, sectionId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  media,
  onNavigate,
}) => {
  const hasHeroVideo = Boolean(media.heroVideo.url);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !media.heroVideo.url) return;

    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const ensurePlaying = () => {
      if (!document.hidden && video.paused) {
        video.muted = true;
        video.play().catch(() => {});
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;
      video.muted = true;
      video.play().catch(() => {});
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        ensurePlaying();
      }
    };

    ensurePlaying();

    video.addEventListener('loadeddata', ensurePlaying);
    video.addEventListener('canplay', ensurePlaying);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('pause', ensurePlaying);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      video.removeEventListener('loadeddata', ensurePlaying);
      video.removeEventListener('canplay', ensurePlaying);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('pause', ensurePlaying);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [media.heroVideo.url]);

  return (
    <div>
      {/* 1. CINEMATIC HERO WITH CONTINUOUS BACKGROUND VIDEO */}
      <section className="px-4 sm:px-6 pt-4 bg-[#F6F4EF]">
        <div className="relative max-w-[1360px] mx-auto min-h-[78vh] rounded-3xl flex items-end bg-[#102618] overflow-hidden">
          <div className="absolute inset-0">
            {hasHeroVideo ? (
              <video
                ref={videoRef}
                key={media.heroVideo.url}
                src={media.heroVideo.url}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={media.chromeRail1.url}
                alt="Aerial view of bulk mineral rail siding and chrome stockpile"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hero-ken-burns"
              />
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0C1D12]/95 via-[#102618]/65 to-[#0C1D12]/35"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#0C1D12]/80 via-[#0C1D12]/35 to-transparent"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 w-full px-6 sm:px-12 lg:px-14 pt-24 pb-10 sm:pb-14">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-[#DFC076] mb-4">
                Chrome · Coal · Vanadium · Magnetite
              </p>
              <h1
                className="font-display text-[#F6F4EF] font-semibold tracking-tight leading-[1.04]"
                style={{ fontSize: 'clamp(2.45rem, 4.6vw, 4.3rem)', textWrap: 'balance' }}
              >
                Get your minerals off trucks and onto trains.
              </h1>
              <p className="mt-5 text-lg sm:text-xl text-[#D8DFDA] max-w-2xl leading-relaxed">
                Small producers. Full trains. Mine-to-port supply chains across Richards Bay and Maputo.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('corridors')}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold bg-[#B38D3B] text-[#111E16] rounded-xl hover:bg-[#C69F49] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6F4EF]"
                >
                  <span>Corridors &amp; Track Record</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('corridors', 'contact')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#F6F4EF] border border-[#F6F4EF]/35 rounded-xl hover:border-[#F6F4EF]/80 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Send Your Tonnage
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CREDENTIALS STRIP */}
      <section className="py-10 bg-[#F6F4EF]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 py-6 border-y border-[#DED9CC]">
            {CREDENTIALS_STRIP.map((item) => (
              <div key={item.label}>
                <p className="font-display text-lg sm:text-xl font-semibold text-[#142119]">
                  {item.label}
                </p>
                <p className="mt-1 text-sm text-[#4A564E]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHO WE ARE & THE GAP WE FILL */}
      <section className="py-12 md:py-20 bg-[#F6F4EF]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between py-2">
              <div>
                <h2
                  className="font-display text-3xl sm:text-4xl font-semibold text-[#142119] tracking-tight leading-tight max-w-xl"
                  style={{ textWrap: 'balance' }}
                >
                  Supply chain solutions for bulk mineral producers
                </h2>
                <div className="mt-6 space-y-4 text-base sm:text-[17px] text-[#354239] leading-relaxed max-w-2xl">
                  <p>
                    Prospera Growth designs and runs mine-to-port supply chains for chrome, coal, vanadium, magnetite and other bulk minerals.
                  </p>
                  <p>
                    We pool smaller producers’ tonnage into full trains, so they get rail economics without needing rail-scale volumes on their own.
                  </p>
                  <p className="font-medium text-[#142119]">
                    Once your product comes out of the ground, or you buy it at the mine gate, we take it all the way to FOB. You put your feet up.
                  </p>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WHO_WE_ARE_PILLARS.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="bg-[#EFECE3] rounded-2xl p-6"
                  >
                    <h3 className="font-display text-base font-semibold text-[#142119]">
                      {pillar.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-[#4A564E] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#B38D3B] text-[#142119] rounded-3xl p-8 sm:p-11 flex flex-col justify-between">
              <div>
                <p className="text-sm font-medium text-[#142119]/75 mb-4">
                  The gap we fill
                </p>
                <h3
                  className="font-display text-3xl sm:text-[2.35rem] font-semibold leading-[1.12] tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  A rail account is the starting line. The real fight is space on the trains.
                </h3>
                <p className="mt-6 text-base sm:text-lg text-[#142119]/90 leading-relaxed">
                  On their own, most producers can’t fill a 75-wagon train, so they go back to trucks. We pool their tonnage, win the train space and run it to port.
                </p>
              </div>

              <div className="mt-10 pt-6 border-t border-[#142119]/20 flex items-center justify-between gap-4">
                <span className="font-mono text-sm font-medium tabular-nums">
                  75 wagons per consist
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('corridors')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4 hover:opacity-80 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Check your tonnage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EIGHT UNLABELLED PHOTOS OF RAILS, SIDINGS & TERMINALS */}
      <section id="operations-gallery" className="py-16 md:py-24 bg-[#EFECE3]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
          <div className="mb-10">
            <h2
              className="font-display text-3xl sm:text-4xl font-semibold text-[#142119] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Rails, sidings and export terminals
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {GALLERY_PHOTOS.map((slot) => {
              const asset = media[slot.key];
              return (
                <div
                  key={slot.key}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#163A22]/10"
                >
                  <img
                    src={asset.url}
                    alt={slot.alt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. WHAT WE DO & AGGREGATION */}
      <section className="py-16 md:py-24 bg-[#F6F4EF]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5">
              <h2
                className="font-display text-3xl sm:text-4xl font-semibold text-[#142119] tracking-tight leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Mine gate to FOB. You put your feet up.
              </h2>
              <p className="mt-4 text-base text-[#4A564E] leading-relaxed">
                Aggregation runs through all four stages: we pool producers’ tonnage so every train leaves full. We work across Transnet and private train operators, so you get the best available slot.
              </p>

              <div className="mt-8 bg-[#163A22] text-[#F6F4EF] rounded-3xl p-7 sm:p-8 space-y-5">
                <h3 className="font-display text-xl font-semibold">
                  Rail economics without rail-scale volumes
                </h3>
                <p className="text-sm text-[#C8D4CC] leading-relaxed">
                  Multiple mines and wash plants feed a shared siding, consolidate into one 75-wagon train, and discharge at Richards Bay or Maputo.
                </p>
                <div className="pt-4 border-t border-white/15 space-y-3">
                  {AGGREGATION_BENEFITS.map((benefit) => (
                    <div key={benefit.title}>
                      <p className="text-sm font-semibold text-[#DFC076]">{benefit.title}</p>
                      <p className="text-sm text-[#E2E8E4]">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E2DDD1] divide-y divide-[#EAE5D9] px-7 sm:px-10 py-3">
              {CAPABILITIES.map((cap, idx) => (
                <div
                  key={cap.title}
                  className="py-7 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8"
                >
                  <span className="font-mono text-sm text-[#82631F] shrink-0">
                    0{idx + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#142119]">
                      {cap.title}
                    </h3>
                    <p className="mt-2 text-base text-[#4A564E] leading-relaxed">
                      {cap.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FIVE-STEP DELIVERY PROCESS */}
      <section className="py-16 md:py-24 bg-[#EFECE3]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2
                className="font-display text-3xl sm:text-4xl font-semibold text-[#142119] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                From mine gate to FOB, in five steps
              </h2>
              <p className="mt-2.5 text-base text-[#4A564E] max-w-xl">
                A clear route from initial tonnage assessment to vessel loading and consignment reporting.
              </p>
            </div>
          </div>

          <div className="relative">
            <div
              className="hidden lg:block absolute top-11 left-12 right-12 h-px bg-[#CBB98A]"
              aria-hidden="true"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 relative z-10">
              {PROCESS_STEPS.map((step, idx) => {
                const isFinal = idx === PROCESS_STEPS.length - 1;
                return (
                  <div
                    key={step.step}
                    className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 ${
                      isFinal
                        ? 'bg-[#B38D3B] text-[#142119]'
                        : 'bg-white text-[#142119] border border-[#DED9CC]'
                    }`}
                  >
                    <div>
                      <span
                        className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl font-display text-base font-semibold tabular-nums ${
                          isFinal
                            ? 'bg-[#142119] text-[#DFC076]'
                            : 'bg-[#163A22] text-[#F6F4EF]'
                        }`}
                      >
                        {step.step}
                      </span>
                      <h3 className="mt-6 font-display text-xl font-semibold">
                        {step.title}
                      </h3>
                      <p
                        className={`mt-2.5 text-sm leading-relaxed ${
                          isFinal ? 'text-[#142119]/90' : 'text-[#4A564E]'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 bg-[#163A22] text-[#F6F4EF] rounded-3xl p-7 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#DFC076]">
                Single rate structure
              </p>
              <p className="mt-1.5 text-lg sm:text-xl font-display font-medium text-[#F6F4EF] max-w-2xl">
                One management fee per ton, priced on the full solution we build for you, from mine gate to FOB.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('corridors')}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold bg-[#B38D3B] text-[#142119] rounded-xl hover:bg-[#C69F49] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Explore Corridors, Proof &amp; Leadership</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
