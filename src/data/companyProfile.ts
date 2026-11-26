export interface CorridorRoute {
  id: string;
  route: string;
  origin: string;
  destination: string;
  terminal: string;
  pricingStatus: string;
  pricingTone: 'binding' | 'feasibility';
  wagons: number;
  typicalTrainTonnes: number;
  minerals: string[];
  corridorNote: string;
}

export interface GalleryPhotoSlot {
  key:
    | 'chromeRail1'
    | 'chromeRail2'
    | 'chromeRail3'
    | 'chromeRail4'
    | 'chromeRail5'
    | 'chromeRail6'
    | 'chromeRail7'
    | 'chromeRail8';
  alt: string;
}

export const CREDENTIALS_STRIP = [
  { label: 'Level 1', detail: 'B-BBEE contributor' },
  { label: 'Youth-led', detail: '100% black-owned' },
  { label: '9+ years', detail: 'Logistics and supply chain' },
  { label: 'Rail + road', detail: 'Mine → Rail → Port' },
];

export const WHO_WE_ARE_PILLARS = [
  {
    title: 'Rail and road',
    description: 'Trucks for the first mile, trains for the long haul.',
  },
  {
    title: 'Aggregation',
    description: 'Several producers, one full train.',
  },
  {
    title: '2 export corridors',
    description: 'Richards Bay and Maputo.',
  },
  {
    title: 'B-BBEE Level 1',
    description: '100% black-owned and youth-owned.',
  },
];

export const GALLERY_PHOTOS: GalleryPhotoSlot[] = [
  { key: 'chromeRail1', alt: 'Aerial view of chrome stockpile and electrified rail siding' },
  { key: 'chromeRail2', alt: 'Rail siding turnout and mainline junction' },
  { key: 'chromeRail3', alt: 'Bulk mineral wagons staged beside chrome stockpiles' },
  { key: 'chromeRail4', alt: 'Bulk mineral export vessel loading at port berth' },
  { key: 'chromeRail5', alt: 'Loaded mineral hopper wagons alongside chrome ore yard' },
  { key: 'chromeRail6', alt: 'Richards Bay bulk export port terminal and shiploaders' },
  { key: 'chromeRail7', alt: 'Wheel loader handling chrome concentrate at rail siding' },
  { key: 'chromeRail8', alt: 'Long bulk freight train crossing South African rail corridor' },
];

export const CAPABILITIES = [
  {
    title: 'Trucking',
    description: 'Vetted, professional hauliers from mine or wash plant to siding or port.',
  },
  {
    title: 'Rail',
    description: 'Rail accounts, Transnet price offers and train capacity with public and private operators.',
  },
  {
    title: 'Siding management',
    description: 'Siding selection, loading set-up and wagon turnaround within free time.',
  },
  {
    title: 'Port management',
    description: 'Terminal access, stockpiling and loading onto the vessel (FOB) at Richards Bay and Maputo.',
  },
];

export const AGGREGATION_BENEFITS = [
  {
    title: 'Rail economics',
    description: 'Smaller producers move on rail rates instead of road rates.',
  },
  {
    title: 'Full trains',
    description: 'Pooled tonnage fills every train, avoiding wagon non-use charges.',
  },
  {
    title: 'One partner',
    description: 'One contact and one rate per ton from mine to port.',
  },
];

export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Assess',
    description: 'Tonnage, grade, location and the target port or buyer.',
  },
  {
    step: '02',
    title: 'Design',
    description: 'Build the route: trucks, siding, rail and port, priced per ton.',
  },
  {
    step: '03',
    title: 'Secure',
    description: 'Rail account, train capacity and terminal space confirmed.',
  },
  {
    step: '04',
    title: 'First train',
    description: 'Loading set-up and the first train managed from mine to port.',
  },
  {
    step: '05',
    title: 'Run and report',
    description: 'Trains run to the vessel, every consignment reported.',
  },
];

export const CORRIDOR_ROUTES: CorridorRoute[] = [
  {
    id: 'pendoring-rcb',
    route: 'Pendoring to Richards Bay',
    origin: 'Pendoring',
    destination: 'TPT Richards Bay',
    terminal: 'TPT Richards Bay',
    pricingStatus: 'Binding rate, valid to 31 March 2027',
    pricingTone: 'binding',
    wagons: 75,
    typicalTrainTonnes: 4200,
    minerals: ['Chrome', 'Coal', 'Magnetite'],
    corridorNote: 'Active Transnet binding tariff in Prospera Growth’s name for 75-wagon consists.',
  },
  {
    id: 'forfar-rcb',
    route: 'Forfar to Richards Bay',
    origin: 'Forfar',
    destination: 'TPT Richards Bay',
    terminal: 'TPT Richards Bay',
    pricingStatus: 'Feasibility pricing, November 2026',
    pricingTone: 'feasibility',
    wagons: 75,
    typicalTrainTonnes: 4200,
    minerals: ['Chrome', 'Vanadium', 'Coal'],
    corridorNote: 'North East Corridor siding access feeding Richards Bay dry bulk export berths.',
  },
  {
    id: 'forfar-maputo',
    route: 'Forfar to Maputo',
    origin: 'Forfar',
    destination: 'Maputo, via Ressano Garcia',
    terminal: 'Port of Maputo',
    pricingStatus: 'Feasibility pricing, November 2026',
    pricingTone: 'feasibility',
    wagons: 75,
    typicalTrainTonnes: 4050,
    minerals: ['Chrome', 'Magnetite', 'Coal'],
    corridorNote: 'Cross-border rail transit via Ressano Garcia to Maputo bulk mineral terminal.',
  },
];

export interface TrackRecordItem {
  category: string;
  headline: string;
  detail: string;
}

export const TRACK_RECORD: TrackRecordItem[] = [
  {
    category: 'Prospera today',
    headline: 'First mandate signed',
    detail:
      'Chrome concentrate, Pendoring to Richards Bay. In talks with several junior miners and trading houses to capacitate their exports.',
  },
  {
    category: 'Capacity',
    headline: 'R1.2M a month · R14.4M a year',
    detail:
      'Revenue recovered on a single account by securing and filling idle rail and stockpile capacity at sidings and terminals.',
  },
  {
    category: 'Aggregation',
    headline: 'Shared rail accounts',
    detail: 'Moved several producers’ tonnage on one account, on scheduled trains.',
  },
  {
    category: 'Sidings',
    headline: 'Siding projects',
    detail: 'Structured and submitted rail siding tenders.',
  },
  {
    category: 'Trucking',
    headline: '4× fleet growth',
    detail: 'Grew a bulk trucking fleet fourfold and doubled its revenue.',
  },
];

export const LEADERSHIP_PROFILE = {
  name: 'Thulo Moletsane',
  title: 'Founder, CEO and Managing Director',
  summary:
    'Thulo builds rail routes and stockpile capacity for producers who can’t get onto the trains alone. He has years of hands-on experience with Transnet’s commercial process: rail accounts, capacity applications, sidings and terminal access.',
  education: 'BCom Honours in Economics, University of Cape Town',
  highlights: [
    'Secures rail and stockpile capacity at sidings and terminals for clients',
    'Runs shared rail accounts that move several producers’ tonnage on scheduled trains',
    'Brings hands-on bulk trucking experience to the first mile',
  ],
};

export const CONTACT_INFO = {
  companyLegal: 'Prospera Growth (Pty) Ltd',
  contactPerson: 'Thulo Moletsane, CEO and MD',
  phone: '+27 81 465 9033',
  email: 'thulo@prosperagrowth.co.za',
  office: '36 Woodlands Avenue, Pecanwood Estate, Hartbeespoort',
  registration: '2024/698885/07',
  bbbee: 'Level 1 (EME)',
  sars: 'Tax compliant',
};
