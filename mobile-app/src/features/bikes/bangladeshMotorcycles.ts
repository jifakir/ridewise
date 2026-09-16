export const OTHER_BRAND = 'Others';

export type MotorcycleCatalogEntry = {
  name: string;
  models: string[];
};

/** Brands and models commonly sold in Bangladesh. Ordered by recent market presence. */
export const BANGLADESH_MOTORCYCLES: MotorcycleCatalogEntry[] = [
  {
    name: 'Yamaha',
    models: ['FZS', 'FZ-X', 'R15 V3', 'R15 V4', 'MT-15', 'Saluto', 'Fazer', 'Ray ZR', 'SZ-RR', 'YBR 125'],
  },
  {
    name: 'Suzuki',
    models: ['Gixxer', 'Gixxer SF', 'Hayate', 'Access 125', 'Burgman Street', 'Intruder 150', 'Avenis'],
  },
  {
    name: 'Honda',
    models: [
      'Dream 110',
      'Shine 100',
      'Shine 100 DX',
      'SP 125',
      'Livo',
      'CB Hornet 160R',
      'X-Blade',
      'CB150R',
      'CBR150R',
      'Dio',
    ],
  },
  {
    name: 'Hero',
    models: [
      'Splendor Plus',
      'HF Deluxe',
      'Passion Plus',
      'Glamour',
      'Xtreme 160R',
      'Thriller 160R',
      'Pleasure',
      'Maestro Edge',
      'Hunk',
    ],
  },
  {
    name: 'Bajaj',
    models: [
      'Pulsar 150',
      'Pulsar N160',
      'Pulsar NS160',
      'Pulsar 220F',
      'Discover 125',
      'Platina',
      'CT 100',
      'Avenger',
      'Dominar 250',
    ],
  },
  {
    name: 'TVS',
    models: ['Apache RTR 160', 'Apache 160 4V', 'Apache 200 4V', 'Raider 125', 'Metro Plus', 'Jupiter', 'Ntorq', 'Max'],
  },
  {
    name: 'Runner',
    models: ['AD 80 Deluxe', 'Bolt 150', 'Kite', 'Knight Rider', 'Turbo 125', 'Cheetah', 'F110', 'Royal Plus'],
  },
  {
    name: 'Royal Enfield',
    models: ['Classic 350', 'Hunter 350', 'Meteor 350', 'Bullet 350', 'Himalayan', 'Super Meteor 650'],
  },
  {
    name: 'Walton',
    models: ['Fusion', 'Fusion Plus', 'Xplore', 'Cruize', 'Ranger', 'Discover'],
  },
  {
    name: 'Lifan',
    models: ['KPR 165', 'KPR 150', 'KP Mini', 'LF150'],
  },
  {
    name: 'Keeway',
    models: ['RKV 125', 'Superlight 150', 'RKS 125', 'Target 125'],
  },
  {
    name: 'KTM',
    models: ['Duke 125', 'Duke 200', 'Duke 250', 'Duke 390', 'RC 125', 'RC 200'],
  },
  {
    name: 'CFMoto',
    models: ['250NK', '300NK', '450NK', '300SR'],
  },
  {
    name: 'Haojue',
    models: ['KA150', 'DR160', 'TZ125'],
  },
  {
    name: 'Dayang',
    models: ['DY150', 'CBP 150', 'DY110'],
  },
  {
    name: 'PHP',
    models: ['Zebra', 'Storm', 'One'],
  },
  {
    name: 'Roadmaster',
    models: ['RM150', 'Cruiser', 'Turbo'],
  },
  {
    name: 'Mahindra',
    models: ['Centuro', 'Mojo', 'Rodeo'],
  },
  {
    name: 'Vespa',
    models: ['VXL 125', 'VXL 150', 'ZX 125', 'SXL 150'],
  },
  {
    name: 'Benelli',
    models: ['TNT 150', '180S', '302S', 'Imperiale 400'],
  },
];

export const BRAND_NAMES = [...BANGLADESH_MOTORCYCLES.map((entry) => entry.name), OTHER_BRAND];

export function modelsForBrand(brand: string): string[] {
  const entry = BANGLADESH_MOTORCYCLES.find((item) => item.name === brand);
  if (!entry) return [OTHER_BRAND];
  return [...entry.models, OTHER_BRAND];
}
