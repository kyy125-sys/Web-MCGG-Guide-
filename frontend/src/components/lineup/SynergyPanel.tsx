import type { ActiveSynergy } from '../../types';

interface Props {
  activeSynergies: ActiveSynergy[];
}

const LEVEL_COLORS = ['', 'text-green-400', 'text-blue-400', 'text-mcgg-gold', 'text-purple-400'];

export function SynergyPanel({ activeSynergies }: Props) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-200 mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span>⚡</span> Active Synergies
        </span>
        <span className="badge bg-mcgg-gold/20 text-mcgg-gold">{activeSynergies.length}</span>
      </h3>
      {activeSynergies.length === 0 ? (
        <p className="text-gray-500 text-sm py-4 text-center">Place heroes to see synergies</p>
      ) : (
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {activeSynergies.map(({ synergy, count, level, activeBonus }) => (
            <div
              key={synergy.id}
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-900 border border-mcgg-border hover:border-gray-700 transition-colors"
            >
              {synergy.iconUrl ? (
                <img src={synergy.iconUrl} alt={synergy.name} className="w-7 h-7 rounded object-cover" />
              ) : (
                <span className="text-xl">⚡</span>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold truncate ${
                      LEVEL_COLORS[level] || LEVEL_COLORS[1]
                    }`}
                  >
                    {synergy.name}
                  </span>
                  <span className="badge bg-gray-700 text-gray-300 text-xs">
                    {count} hero{count > 1 ? 'es' : ''}
                  </span>
                  <span className="badge bg-mcgg-gold/20 text-mcgg-gold text-xs">Lv{level}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {activeBonus}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
