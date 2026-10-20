export interface Patch {
  id: string;
  version: string;
  releaseDate: string;
  isActive: boolean;
  notes?: string;
  sources: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Synergy {
  id: string;
  name: string;
  iconUrl?: string;
  description: string;
  thresholds: { count: number; bonus: string }[];
  isActive: boolean;
  patchId?: string;
  patch?: Patch;
  dataSource?: string;
  heroSynergies?: { hero: HeroSummary }[];
}

export interface HeroSummary {
  id: string;
  name: string;
  imageUrl?: string;
  cost: number;
}

export interface Hero {
  id: string;
  name: string;
  imageUrl?: string;
  cost: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  role: string[];
  faction?: string[];
  stats: Record<string, number>;
  skills: { name: string; description: string; type: string }[];
  equipments: string[];
  positions: string[];
  strengths: string[];
  weaknesses: string[];
  upgradeNotes?: string;
  isActive: boolean;
  verifiedAt?: string;
  dataSource?: string;
  patchId?: string;
  patch?: Patch;
  synergies: { synergy: Synergy }[];
  createdAt: string;
  updatedAt: string;
}

export interface Commander {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  skill: string;
  skillLevels: { level: number; name?: string; type?: string; effect: string }[];
  playstyle?: string;
  strengths: string[];
  weaknesses: string[];
  tier?: string;
  isActive: boolean;
  patchId?: string;
  patch?: Patch;
  dataSource?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LineupHero {
  id: string;
  heroId: string;
  hero: Hero;
  position: { row: number; col: number };
  star: number;
  items: string[];
}

export interface Lineup {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  isFavorite: boolean;
  commanderId?: string;
  commander?: Commander;
  patchId?: string;
  patch?: Patch;
  formationConfig: Record<string, any>;
  synergySnapshot: any[];
  strategyNotes?: string;
  isPublic: boolean;
  heroes: LineupHero[];
  createdAt: string;
  updatedAt: string;
}

export interface TierEntry {
  id: string;
  entityType: string;
  entityId: string;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  score?: number;
  basis?: string;
  source?: string;
  patchId?: string;
  entity?: any;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
}

export interface ActiveSynergy {
  synergy: Synergy;
  count: number;
  level: number;
  activeBonus: string;
}
