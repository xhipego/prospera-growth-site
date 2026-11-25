import React, { useState } from 'react';
import { ArrowLeft, Camera, CheckCircle2, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import {
  CONTACT_INFO,
  CORRIDOR_ROUTES,
  LEADERSHIP_PROFILE,
  TRACK_RECORD,
} from '../data/companyProfile';
import { MediaMap, MediaSlotKey } from '../lib/mediaStore';
import { PageId } from './Navbar';

interface CorridorsLeadershipPageProps {
  media: MediaMap;
  canEdit: boolean;
  savingSlots: Partial<Record<MediaSlotKey, number | boolean>>;
  onUploadMedia: (key: MediaSlotKey, file: File) => Promise<void>;
  onNavigate: (page: PageId, sectionId?: string) => void;
}

const WHATSAPP_DIGITS = CONTACT_INFO.phone.replace(/\D/g, '');

export const CorridorsLeadershipPage: React.FC<CorridorsLeadershipPageProps> = ({
  media,
  canEdit,
  savingSlots,
  onUploadMedia,
  onNavigate,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState(CORRIDOR_ROUTES[0].id);
  const [selectedMineral, setSelectedMineral] = useState('Chrome');
  const [monthlyTonnes, setMonthlyTonnes] = useState(4200);

  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    mineralAndTonnage: '',
    sidingAndPort: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const activeRoute =
    CORRIDOR_ROUTES.find((r) => r.id === selectedRouteId) || CORRIDOR_ROUTES[0];
  const trainCapacity = activeRoute.typicalTrainTonnes;
  const fullTrainsPerMonth = Math.floor(monthlyTonnes / trainCapacity);
  const remainderTonnes = monthlyTonnes % trainCapacity;
  const fillPercent = Math.min(
    100,
    Math.round(((remainderTonnes === 0 && monthlyTonnes > 0 ? trainCapacity : remainderTonnes) / trainCapacity) * 100)
  );

  const prefillInquiryFromPlanner = () => {
    setFormData((prev) => ({
      ...prev,
      mineralAndTonnage: `${selectedMineral} · ${monthlyTonnes.toLocaleString()} tonnes/month`,
      sidingAndPort: `${activeRoute.origin} → ${activeRoute.destination}`,
    }));
    setWhatsappUrl(null);
    const el = document.getElementById('contact');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.fullName.trim() || !formData.mineralAndTonnage.trim()) {
      setFormError('Please provide your full name and mineral tonnage.');
      return;
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setFormError('Please enter a valid email address.');
        return;
      }
    }

    const lines = [
      'Hello Prospera Growth, I would like to request a per-ton FOB rail quote:',
      `Name: ${formData.fullName.trim()}`,
      formData.company.trim() ? `Company: ${formData.company.trim()}` : null,
      formData.phone.trim() ? `Phone: ${formData.phone.trim()}` : null,
      formData.email.trim() ? `Email: ${formData.email.trim()}` : null,
      `Mineral & Tonnage: ${formData.mineralAndTonnage.trim()}`,
      formData.sidingAndPort.trim() ? `Nearest Siding & Port: ${formData.sidingAndPort.trim()}` : null,
      formData.notes.trim() ? `Notes: ${formData.notes.trim()}` : null,
    ].filter(Boolean);

    const url = `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(lines.join('\n'))}`;
    setWhatsappUrl(url);

    // Open WhatsApp cleanly via anchor link without window.open
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* 1. RAIL CORRIDORS & PRICING */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-24 bg-[#F6F4EF]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#4A564E] hover:text-[#142119] transition-colors mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h1
                className="font-display text-3xl sm:text-5xl font-semibold text-[#142119] tracking-tight leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Rail pricing secured on three export routes
              </h1>
              <p className="mt-4 text-base sm:text-lg text-[#354239] max-w-2xl leading-relaxed">
                All routes priced for chrome in 75-wagon trains, carrying several producers’ tonnage across the North East Corridor.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <div className="inline-block text-left bg-[#EFECE3] rounded-2xl px-6 py-4">
                <p className="text-xs text-[#626E65]">Consist Standard</p>
                <p className="mt-0.5 font-display text-2xl font-semibold text-[#142119] tabular-nums">
                  75 Wagons
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#DED9CC] overflow-hidden flex flex-col justify-between">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EFECE3] border-b border-[#DED9CC] text-xs font-semibold text-[#354239]">
                      <th className="py-4 px-6">Route</th>
                      <th className="py-4 px-6">Destination</th>
                      <th className="py-4 px-6">Transnet pricing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE5D9] text-sm">
                    {CORRIDOR_ROUTES.map((item) => {
                      const isSelected = item.id === selectedRouteId;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedRouteId(item.id)}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#F6F4EF]' : 'hover:bg-[#FAF9F6]'
                          }`}
                        >
                          <td className="py-5 px-6 font-semibold text-[#142119]">
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  isSelected ? 'bg-[#B38D3B]' : 'bg-[#D6D0C4]'
                                }`}
                                aria-hidden="true"
                              />
                              <span>{item.route}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6 text-[#354239]">{item.destination}</td>
                          <td className="py-5 px-6 text-sm font-sans tabular-nums text-[#354239] min-w-[240px]">
                            <span
                              className={
                                item.pricingTone === 'binding'
                                  ? 'font-semibold text-[#163A22]'
                                  : 'font-semibold text-[#82631F]'
                              }
                            >
                              {item.pricingStatus.split(',')[0]}
                            </span>
                            {item.pricingStatus.includes(',') && (
                              <span className="text-[#4A564E]">
                                ,{item.pricingStatus.split(',').slice(1).join(',')}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Interactive Consignment & Aggregation Estimator */}
              <div className="p-6 sm:p-8 bg-[#EFECE3]/65 border-t border-[#DED9CC]">
                <h2 className="font-display text-lg font-semibold text-[#142119]">
                  Tonnage &amp; 75-Wagon Pool Estimator
                </h2>
                <p className="text-xs text-[#4A564E] mt-1 mb-5">
                  Preview how your monthly volume slots into {activeRoute.route}.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                  <div>
                    <label
                      htmlFor="planner-mineral"
                      className="block text-xs font-semibold text-[#4A564E] mb-2"
                    >
                      Mineral
                    </label>
                    <select
                      id="planner-mineral"
                      value={selectedMineral}
                      onChange={(e) => setSelectedMineral(e.target.value)}
                      className="w-full h-11 px-3.5 bg-white border border-[#CFC9BA] rounded-xl text-sm font-medium text-[#142119] focus:outline-2 focus:outline-[#163A22]"
                    >
                      <option value="Chrome">Chrome</option>
                      <option value="Coal">Coal</option>
                      <option value="Vanadium">Vanadium</option>
                      <option value="Magnetite">Magnetite</option>
                      <option value="Other bulk mineral">Other bulk mineral</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="planner-tonnes"
                        className="text-xs font-semibold text-[#4A564E]"
                      >
                        Monthly Volume
                      </label>
                      <span className="font-mono text-sm font-semibold text-[#142119] tabular-nums">
                        {monthlyTonnes.toLocaleString()} t
                      </span>
                    </div>
                    <input
                      id="planner-tonnes"
                      type="range"
                      min={1000}
                      max={30000}
                      step={250}
                      value={monthlyTonnes}
                      onChange={(e) => setMonthlyTonnes(Number(e.target.value))}
                      className="w-full accent-[#163A22] h-2 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={prefillInquiryFromPlanner}
                      className="w-full md:w-auto px-5 py-3 text-xs font-semibold bg-[#163A22] text-[#F6F4EF] rounded-xl hover:bg-[#1E4D2E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Use in Quote Request
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#DED9CC] grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-[#4A564E] block">Dedicated 75-Wagon Trains</span>
                    <span className="font-mono font-semibold text-[#142119] tabular-nums">
                      {fullTrainsPerMonth} {fullTrainsPerMonth === 1 ? 'full train' : 'full trains'} / month
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#4A564E] block">Pooled Allocation</span>
                    <span className="font-mono font-semibold text-[#142119] tabular-nums">
                      {remainderTonnes > 0
                        ? `${remainderTonnes.toLocaleString()} t (${fillPercent}% of consist)`
                        : '100% train utilization'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#4A564E] block">Execution Model</span>
                    <span className="font-medium text-[#163A22]">
                      {fullTrainsPerMonth === 0
                        ? 'Pooled via shared siding'
                        : 'Dedicated + pooled balance'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Export Terminal Photo (Curved Frame) */}
            <div className="lg:col-span-4 rounded-3xl overflow-hidden bg-[#102618] relative min-h-[300px]">
              <img
                src={media.chromeRail4.url}
                alt="Bulk mineral vessel loading at export terminal"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"
                aria-hidden="true"
              />
              {canEdit && (
                <label className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#F6F4EF]/95 text-[#142119] rounded-lg hover:bg-[#DFC076] transition-colors cursor-pointer whitespace-nowrap shadow-sm">
                  <Camera className="w-3.5 h-3.5" />
                  <span>
                    {savingSlots.chromeRail4
                      ? 'Saving...'
                      : media.chromeRail4.isCustom
                      ? 'Saved · Replace'
                      : 'Change Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={Boolean(savingSlots.chromeRail4)}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onUploadMedia('chromeRail4', file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              <div className="absolute bottom-5 left-5 right-5 text-[#F6F4EF]">
                <p className="font-display text-xl font-semibold">{activeRoute.terminal}</p>
                <p className="mt-1 text-xs text-[#D8DFDA] leading-relaxed">
                  {activeRoute.corridorNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRACK RECORD — ASYMMETRIC PROOF SHOWCASE */}
      <section className="py-16 md:py-24 bg-[#EFECE3]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2
                className="font-display text-3xl sm:text-4xl font-semibold text-[#142119] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Proof behind every solution
              </h2>
              <p className="mt-2.5 text-base text-[#4A564E] max-w-xl">
                Verified rail accounts, siding tenders, capacity recoveries, and fleet growth delivered across bulk mineral corridors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {TRACK_RECORD.map((item, idx) => {
              const isForestAnchor = idx === 1; // R1.2M a month
              const isGoldAnchor = idx === 4; // 3 Transnet offers
              const colSpan =
                idx === 1
                  ? 'md:col-span-5'
                  : idx === 0
                  ? 'md:col-span-4'
                  : idx === 2
                  ? 'md:col-span-3'
                  : 'md:col-span-4';

              return (
                <div
                  key={item.headline}
                  className={`${colSpan} rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 ${
                    isForestAnchor
                      ? 'bg-[#163A22] text-[#F6F4EF]'
                      : isGoldAnchor
                      ? 'bg-[#B38D3B] text-[#142119]'
                      : 'bg-white text-[#142119] border border-[#DED9CC]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className={`font-semibold ${
                          isForestAnchor
                            ? 'text-[#DFC076]'
                            : isGoldAnchor
                            ? 'text-[#142119]/80'
                            : 'text-[#82631F]'
                        }`}
                      >
                        {item.category}
                      </span>
                      <span
                        className={
                          isForestAnchor
                            ? 'text-[#B8C7BD]'
                            : isGoldAnchor
                            ? 'text-[#142119]/75'
                            : 'text-[#626E65]'
                        }
                      >
                        {item.attribution}
                      </span>
                    </div>

                    <h3
                      className={`mt-5 font-display font-semibold tracking-tight tabular-nums ${
                        isForestAnchor || isGoldAnchor
                          ? 'text-3xl sm:text-4xl'
                          : 'text-2xl sm:text-[1.75rem]'
                      }`}
                    >
                      {item.headline}
                    </h3>
                  </div>

                  <p
                    className={`mt-5 pt-4 border-t text-sm sm:text-base leading-relaxed ${
                      isForestAnchor
                        ? 'border-white/15 text-[#D8DFDA]'
                        : isGoldAnchor
                        ? 'border-[#142119]/15 text-[#142119]/90'
                        : 'border-[#EAE5D9] text-[#4A564E]'
                    }`}
                  >
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. LEADERSHIP SPOTLIGHT */}
      <section id="leadership" className="py-16 md:py-24 bg-[#163A22] text-[#F6F4EF]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5">
              <div className="relative aspect-[3/4] max-h-[560px] w-full rounded-3xl bg-[#0F2817] overflow-hidden">
                <img
                  src={media.mdPortrait.url}
                  alt={`${LEADERSHIP_PROFILE.name}, ${LEADERSHIP_PROFILE.title}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#0D1E13]/75 via-transparent to-transparent"
                  aria-hidden="true"
                />
                {canEdit && (
                  <label className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#F6F4EF]/95 text-[#142119] rounded-lg hover:bg-[#DFC076] transition-colors cursor-pointer whitespace-nowrap shadow-sm">
                    <Camera className="w-3.5 h-3.5" />
                    <span>
                      {savingSlots.mdPortrait
                        ? 'Saving...'
                        : media.mdPortrait.isCustom
                        ? 'Saved · Replace'
                        : 'Change Portrait'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={Boolean(savingSlots.mdPortrait)}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUploadMedia('mdPortrait', file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="font-display text-base font-semibold text-[#F6F4EF]">
                    {LEADERSHIP_PROFILE.name}
                  </p>
                  <p className="text-xs text-[#DFC076]">{LEADERSHIP_PROFILE.title}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F6F4EF] tracking-tight">
                {LEADERSHIP_PROFILE.name}
              </h2>
              <p className="mt-1.5 text-lg font-medium text-[#DFC076]">
                {LEADERSHIP_PROFILE.title}
              </p>
              <p className="mt-6 text-base sm:text-lg text-[#D8DFDA] leading-relaxed max-w-2xl">
                {LEADERSHIP_PROFILE.summary}
              </p>

              <ul className="mt-8 space-y-3.5 border-t border-white/15 pt-7">
                {LEADERSHIP_PROFILE.highlights.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-3 text-sm sm:text-base text-[#E7ECE8] leading-relaxed"
                  >
                    <span
                      className="mt-2 w-1.5 h-1.5 rounded-full bg-[#DFC076] shrink-0"
                      aria-hidden="true"
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-7 pt-6 border-t border-white/15 text-sm text-[#B8C7BD]">
                Education: <span className="text-[#F6F4EF] font-medium">{LEADERSHIP_PROFILE.education}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONTACT & STATUTORY COMPLIANCE */}
      <section id="contact" className="py-16 md:py-24 bg-[#F6F4EF]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <h2
                  className="font-display text-3xl sm:text-4xl font-semibold text-[#142119] tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Let’s get your minerals onto trains.
                </h2>
                <p className="mt-4 text-base text-[#354239] leading-relaxed">
                  Send us your tonnage, grade and nearest siding, and we’ll come back with a full FOB solution and a rate per ton.
                </p>

                <div className="mt-8 space-y-5 border-t border-[#DED9CC] pt-7">
                  <div className="flex items-start gap-3.5">
                    <Phone className="w-4 h-4 text-[#82631F] mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-[#626E65]">Phone &amp; WhatsApp</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, '')}`}
                          className="text-base font-medium text-[#142119] hover:text-[#163A22] font-mono tabular-nums"
                        >
                          {CONTACT_INFO.phone}
                        </a>
                        <a
                          href={`https://wa.me/${WHATSAPP_DIGITS}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#163A22] underline underline-offset-4 hover:opacity-80"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <Mail className="w-4 h-4 text-[#82631F] mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-[#626E65]">Email</p>
                      <a
                        href={`mailto:${CONTACT_INFO.email}`}
                        className="text-base font-medium text-[#142119] hover:text-[#163A22]"
                      >
                        {CONTACT_INFO.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-4 h-4 text-[#82631F] mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-[#626E65]">Office</p>
                      <p className="text-base text-[#142119]">{CONTACT_INFO.office}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3">
                <div className="bg-[#EFECE3] rounded-2xl p-4">
                  <p className="text-[11px] text-[#626E65]">Registration</p>
                  <p className="mt-1 font-mono text-xs font-medium text-[#142119] tabular-nums">
                    {CONTACT_INFO.registration}
                  </p>
                </div>
                <div className="bg-[#EFECE3] rounded-2xl p-4">
                  <p className="text-[11px] text-[#626E65]">B-BBEE</p>
                  <p className="mt-1 text-xs font-semibold text-[#142119]">{CONTACT_INFO.bbbee}</p>
                </div>
                <div className="bg-[#EFECE3] rounded-2xl p-4">
                  <p className="text-[11px] text-[#626E65]">SARS</p>
                  <p className="mt-1 text-xs font-semibold text-[#142119]">{CONTACT_INFO.sars}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#DED9CC] p-7 sm:p-10">
              {whatsappUrl ? (
                <div className="h-full flex flex-col justify-center py-8">
                  <div className="inline-flex items-center gap-2.5 text-[#163A22] mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                    <h3 className="font-display text-2xl font-semibold text-[#142119]">
                      WhatsApp quote ready
                    </h3>
                  </div>

                  <p className="text-base text-[#354239] leading-relaxed max-w-lg">
                    Thank you, {formData.fullName}. Your consignment request for{' '}
                    <span className="font-semibold text-[#142119]">{formData.mineralAndTonnage}</span>{' '}
                    is pre-filled for WhatsApp on{' '}
                    <span className="font-mono font-medium text-[#163A22]">{CONTACT_INFO.phone}</span>.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#163A22] text-[#F6F4EF] rounded-xl hover:bg-[#1E4D2E] transition-colors whitespace-nowrap"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Open WhatsApp ({CONTACT_INFO.phone})</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setWhatsappUrl(null);
                        setFormData({
                          fullName: '',
                          company: '',
                          email: '',
                          phone: '',
                          mineralAndTonnage: '',
                          sidingAndPort: '',
                          notes: '',
                        });
                      }}
                      className="px-5 py-3.5 text-xs font-semibold border border-[#163A22] text-[#163A22] rounded-xl hover:bg-[#163A22] hover:text-[#F6F4EF] transition-colors cursor-pointer"
                    >
                      New Quote Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-5" noValidate>
                  <div className="border-b border-[#EAE5D9] pb-4">
                    <h3 className="font-display text-xl font-semibold text-[#142119]">
                      Request a per-ton FOB solution
                    </h3>
                    <p className="mt-1 text-xs text-[#626E65]">
                      Share your monthly volume, mineral grade, and nearest rail siding to send directly via WhatsApp.
                    </p>
                  </div>

                  {formError && (
                    <div
                      role="alert"
                      className="p-3.5 rounded-xl text-sm bg-[#B38D3B]/15 border border-[#B38D3B] text-[#142119]"
                    >
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="q-name" className="block text-xs font-semibold text-[#354239] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        id="q-name"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Sipho Ndlovu"
                        className="w-full h-11 px-3.5 bg-[#FAF9F6] border border-[#D4CEC0] rounded-xl text-sm text-[#142119] focus:outline-2 focus:outline-[#163A22]"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="q-company" className="block text-xs font-semibold text-[#354239] mb-1.5">
                        Producer / Trading Company
                      </label>
                      <input
                        id="q-company"
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Mine or wash plant name"
                        className="w-full h-11 px-3.5 bg-[#FAF9F6] border border-[#D4CEC0] rounded-xl text-sm text-[#142119] focus:outline-2 focus:outline-[#163A22]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="q-phone" className="block text-xs font-semibold text-[#354239] mb-1.5">
                        Your WhatsApp / Phone Number
                      </label>
                      <input
                        id="q-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+27 ..."
                        className="w-full h-11 px-3.5 bg-[#FAF9F6] border border-[#D4CEC0] rounded-xl text-sm text-[#142119] focus:outline-2 focus:outline-[#163A22]"
                      />
                    </div>
                    <div>
                      <label htmlFor="q-email" className="block text-xs font-semibold text-[#354239] mb-1.5">
                        Email Address (optional)
                      </label>
                      <input
                        id="q-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@company.co.za"
                        className="w-full h-11 px-3.5 bg-[#FAF9F6] border border-[#D4CEC0] rounded-xl text-sm text-[#142119] focus:outline-2 focus:outline-[#163A22]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="q-tonnage" className="block text-xs font-semibold text-[#354239] mb-1.5">
                        Mineral, Grade &amp; Tonnage *
                      </label>
                      <input
                        id="q-tonnage"
                        type="text"
                        value={formData.mineralAndTonnage}
                        onChange={(e) =>
                          setFormData({ ...formData, mineralAndTonnage: e.target.value })
                        }
                        placeholder="e.g. Chrome 42%, 4,500 t/month"
                        className="w-full h-11 px-3.5 bg-[#FAF9F6] border border-[#D4CEC0] rounded-xl text-sm text-[#142119] focus:outline-2 focus:outline-[#163A22]"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="q-siding" className="block text-xs font-semibold text-[#354239] mb-1.5">
                        Nearest Siding &amp; Target Port
                      </label>
                      <input
                        id="q-siding"
                        type="text"
                        value={formData.sidingAndPort}
                        onChange={(e) => setFormData({ ...formData, sidingAndPort: e.target.value })}
                        placeholder="e.g. Pendoring / Forfar to Richards Bay"
                        className="w-full h-11 px-3.5 bg-[#FAF9F6] border border-[#D4CEC0] rounded-xl text-sm text-[#142119] focus:outline-2 focus:outline-[#163A22]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="q-notes" className="block text-xs font-semibold text-[#354239] mb-1.5">
                      Additional Notes
                    </label>
                    <textarea
                      id="q-notes"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Rail account status, trucking distance to siding, or vessel laycan window..."
                      className="w-full p-3.5 bg-[#FAF9F6] border border-[#D4CEC0] rounded-xl text-sm text-[#142119] focus:outline-2 focus:outline-[#163A22]"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className="text-xs text-[#626E65]">
                      WhatsApp to {CONTACT_INFO.phone}
                    </span>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#163A22] text-[#F6F4EF] rounded-xl hover:bg-[#1E4D2E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Quote on WhatsApp</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
