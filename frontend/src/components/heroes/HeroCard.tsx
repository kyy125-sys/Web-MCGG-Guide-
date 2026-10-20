import type { Hero } from '../../types';

const RARITY_COLORS: Record<string, string> = {
  common: 'border-gray-500 text-gray-400',
  uncommon: 'border-green-500 text-green-400',
  rare: 'border-blue-500 text-blue-400',
  epic: 'border-purple-500 text-purple-400',
  legendary: 'border-mcgg-gold text-mcgg-gold',
};

const COST_COLORS: Record<number, string> = {
  1: 'bg-gray-600',
  2: 'bg-green-700',
  3: 'bg-blue-700',
  4: 'bg-purple-700',
  5: 'bg-yellow-700',
};

interface Props {
  hero: Hero;
  onClick?: () => void;
  compact?: boolean;
  draggable?: boolean;
}

export function HeroCard({ hero, onClick, compact = false, draggable = false }: Props) {
  const rarityClass = RARITY_COLORS[hero.rarity] || 'border-gray-500 text-gray-400';
  const costBg = COST_COLORS[hero.cost] || 'bg-gray-600';

  return (
    <div
      onClick={onClick}
      className={`relative bg-mcgg-card border-2 ${rarityClass} rounded-xl cursor-pointer hover:scale-105 transition-transform select-none ${
        compact ? 'w-16 h-16' : 'w-28'
      } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {/* Image */}
      <div
        className={`${
          compact ? 'w-16 h-16' : 'w-28 h-28'
        } rounded-t-xl overflow-hidden bg-gray-800 flex items-center justify-center`}
      >
        {hero.imageUrl ? (
          <img
            src={hero.imageUrl}
            alt={hero.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-gray-500 text-2xl">⚔️</span>
        )}
      </div>

      {/* Cost badge */}
      <span
        className={`absolute top-1 left-1 ${costBg} text-white text-xs font-bold rounded px-1 shadow`}
      >
        {hero.cost}💎
      </span>

      {!compact && (
        <div className="p-2">
          <p className="text-xs font-semibold text-gray-100 truncate">{hero.name}</p>
          <div className="flex flex-wrap gap-0.5 mt-1">
            {hero.synergies?.slice(0, 3).map((hs, i) => (
              <span
                key={hs.synergy?.id || i}
                className="badge bg-mcgg-blue/20 text-blue-300"
                style={{ fontSize: '9px' }}
              >
                {hs.synergy?.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {!hero.isActive && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
          <span className="text-xs text-gray-400">Inactive</span>
        </div>
      )}
    </div>
  );
}
