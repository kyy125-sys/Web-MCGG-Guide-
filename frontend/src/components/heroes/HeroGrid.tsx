import { useState } from 'react';
import type { Hero } from '../../types';
import { HeroCard } from './HeroCard';
import { Search } from 'lucide-react';

interface Props {
  heroes: Hero[];
  onSelect?: (hero: Hero) => void;
  showFilters?: boolean;
}

const OFFICIAL_FACTIONS = [
  'Shadeweaver',
  'Astro Power',
  'Echomancer',
  'Dragon Altar',
  'SPECTRE',
  'Dragoncaller',
  'Starbelle',
  'Kishin',
  'Enchanted Tales',
  'Mistbender',
];

const OFFICIAL_ROLES = [
  'Bruiser',
  'Defender',
  'Dauntless',
  'Weapon Master',
  'Marksman',
  'Stargazer',
  'Swiftblade',
  'Mage',
  'Phasewarper',
  'Scavenger',
];

export function HeroGrid({ heroes, onSelect, showFilters = true }: Props) {
  const [search, setSearch] = useState('');
  const [costFilter, setCostFilter] = useState<number | null>(null);
  const [factionFilter, setFactionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filtered = heroes.filter((h) => {
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (costFilter && h.cost !== costFilter) return false;
    if (factionFilter) {
      const hasFaction =
        h.faction?.some((f) => f.toLowerCase() === factionFilter.toLowerCase()) ||
        h.synergies?.some((s) => s.synergy?.name.toLowerCase() === factionFilter.toLowerCase());
      if (!hasFaction) return false;
    }
    if (roleFilter) {
      const hasRole =
        h.role?.some((r) => r.toLowerCase() === roleFilter.toLowerCase()) ||
        h.synergies?.some((s) => s.synergy?.name.toLowerCase() === roleFilter.toLowerCase());
      if (!hasRole) return false;
    }
    return true;
  });

  return (
    <div>
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 w-48 text-sm"
              placeholder="Search hero..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {[null, 1, 2, 3, 4, 5].map((c) => (
              <button
                key={c ?? 'all'}
                onClick={() => setCostFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  costFilter === c ? 'bg-mcgg-gold text-black font-semibold' : 'btn-secondary'
                }`}
              >
                {c === null ? 'All' : `${c}💎`}
              </button>
            ))}
          </div>

          {/* Faction Filter */}
          <select
            className="input w-40 text-sm"
            value={factionFilter}
            onChange={(e) => setFactionFilter(e.target.value)}
          >
            <option value="">Semua Faction</option>
            {OFFICIAL_FACTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            className="input w-40 text-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Semua Role</option>
            {OFFICIAL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {filtered.map((hero) => (
          <HeroCard key={hero.id} hero={hero} onClick={() => onSelect?.(hero)} />
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500 py-8 w-full text-center">No heroes found matching criteria</p>
        )}
      </div>
    </div>
  );
}
