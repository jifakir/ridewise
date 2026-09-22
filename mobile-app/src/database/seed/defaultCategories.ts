import type { CategoryType } from '@/src/database/schema/types';

export type DefaultCategory = {
  /** Stable across installs so seeding stays idempotent and backups restore cleanly. */
  id: string;
  name: string;
  icon: string;
  type: CategoryType;
  /** Display order within its type. */
  sortOrder: number;
};

type SeedEntry = Omit<DefaultCategory, 'type' | 'sortOrder'>;

const GENERAL: SeedEntry[] = [
  { id: 'general-food', name: 'Food', icon: 'fast-food-outline' },
  { id: 'general-bills', name: 'Bills', icon: 'receipt-outline' },
  { id: 'general-shopping', name: 'Shopping', icon: 'cart-outline' },
  { id: 'general-entertainment', name: 'Entertainment', icon: 'film-outline' },
  { id: 'general-family', name: 'Family', icon: 'people-outline' },
  { id: 'general-mobile-internet', name: 'Mobile & Internet', icon: 'wifi-outline' },
  { id: 'general-education', name: 'Education', icon: 'school-outline' },
  { id: 'general-work', name: 'Work', icon: 'briefcase-outline' },
  { id: 'general-transport', name: 'Transport', icon: 'bus-outline' },
  { id: 'general-health', name: 'Health', icon: 'medkit-outline' },
  { id: 'general-other', name: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const BIKE: SeedEntry[] = [
  { id: 'bike-fuel', name: 'Fuel', icon: 'water-outline' },
  { id: 'bike-service', name: 'Service', icon: 'construct-outline' },
  { id: 'bike-engine-oil', name: 'Engine Oil', icon: 'flask-outline' },
  { id: 'bike-tyres', name: 'Tyres', icon: 'disc-outline' },
  { id: 'bike-parts', name: 'Parts', icon: 'cog-outline' },
  { id: 'bike-parking', name: 'Parking', icon: 'location-outline' },
  { id: 'bike-toll', name: 'Toll', icon: 'trail-sign-outline' },
  { id: 'bike-washing', name: 'Washing', icon: 'sparkles-outline' },
  { id: 'bike-riding-gear', name: 'Riding Gear', icon: 'shirt-outline' },
  { id: 'bike-accessories', name: 'Accessories', icon: 'bag-handle-outline' },
  { id: 'bike-documents-fees', name: 'Documents & Fees', icon: 'document-text-outline' },
  { id: 'bike-other', name: 'Other', icon: 'ellipsis-horizontal-outline' },
];

/** The Fuel category every fuel log is booked against. */
export const FUEL_CATEGORY_ID = 'bike-fuel';

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  ...GENERAL.map((category, index) => ({ ...category, type: 'general' as const, sortOrder: index })),
  ...BIKE.map((category, index) => ({ ...category, type: 'bike' as const, sortOrder: index })),
];
