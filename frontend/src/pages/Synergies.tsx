import { useEffect, useState, useMemo } from 'react';
import { synergyApi } from '../api/synergies';
import type { Synergy } from '../types';
import { Search, Zap } from 'lucide-react';

const FACTION_NAMES = new Set([
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
]);

export function Synergies() {
  const [synergies, setSynergies] = useState<Synergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'FACTION' | 'ROLE'>('ALL');

  useEffect(() => {
    synergyApi
      .getAll()
      .then((r) => setSynergies(Array.isArray(r.data) ? r.data : []))
      .catch((err) => console.warn('Error loading synergies:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredSynergies = useMemo(() => {
    return synergies.filter((s) => {
      const isFaction = FACTION_NAMES.has(s.name);
      if (activeTab === 'FACTION' && !isFaction) return false;
      if (activeTab === 'ROLE' && isFaction) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchHero = s.heroSynergies?.some((hs) =>
        hs.hero?.name?.toLowerCase().includes(q)
      );

      return matchName || matchDesc || matchHero;
    });
  }, [synergies, search, activeTab]);

  const getCostBadgeColor = (cost?: number) => {
    switch (cost) {
      case 1:
        return 'bg-gray-800 text-gray-300 border-gray-700';
      case 2:
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50';
      case 3:
        return 'bg-blue-950/60 text-blue-300 border-blue-700/50';
      case 4:
        return 'bg-purple-950/60 text-purple-300 border-purple-700/50';
      case 5:
        return 'bg-amber-950/60 text-amber-300 border-amber-600/50';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <span>⚡ Synergy Database</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mcgg-gold/20 text-mcgg-gold border border-mcgg-gold/30">
              {synergies.length} Sinergi
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Data sinergi Faction & Role lengkap patch Chrono Echoes
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari sinergi / hero..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-900 border border-mcgg-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-mcgg-gold w-48 sm:w-60"
            />
          </div>

          <div className="flex rounded-lg bg-gray-900 border border-mcgg-border p-0.5 text-xs font-semibold">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'FACTION', label: 'Faction' },
              { id: 'ROLE', label: 'Role' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === tab.id
                    ? 'bg-mcgg-gold text-gray-950 shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcgg-gold mr-3" />
          Loading synergies...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSynergies.map((s) => {
            const isFaction = FACTION_NAMES.has(s.name);
            return (
              <div
                key={s.id}
                className="card hover:border-mcgg-gold/50 transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-900/90 border border-gray-700/80 p-1 flex items-center justify-center flex-shrink-0 group-hover:border-mcgg-gold/60 transition-colors">
                      {s.iconUrl ? (
                        <img
                          src={s.iconUrl}
                          alt={s.name}
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Zap size={22} className="text-mcgg-gold" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-100 text-base truncate">{s.name}</h3>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            isFaction
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {isFaction ? 'FACTION' : 'ROLE'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {s.heroSynergies?.length || 0} Hero terkait
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-300 mb-3 leading-relaxed">
                    {s.description}
                  </p>

                  <div className="space-y-1.5">
                    {s.thresholds?.map((t, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 bg-gray-900/80 border border-gray-800 rounded px-2.5 py-1.5"
                      >
                        <span className="badge bg-mcgg-gold/20 text-mcgg-gold text-xs font-bold flex-shrink-0">
                          ({t.count})
                        </span>
                        <p className="text-xs text-gray-300 leading-snug">{t.bonus}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {s.heroSynergies && s.heroSynergies.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-800/80">
                    <p className="text-[11px] text-gray-400 mb-1.5 font-medium">Hero Sinergi:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.heroSynergies.map((hs, idx) => (
                        <span
                          key={hs.hero?.id || idx}
                          className={`text-[11px] px-2 py-0.5 rounded border font-medium transition-colors ${getCostBadgeColor(
                            hs.hero?.cost
                          )}`}
                          title={`Cost: ${hs.hero?.cost || 1} Gold`}
                        >
                          {hs.hero?.name}
                          {hs.hero?.cost ? (
                            <span className="ml-1 text-[10px] opacity-80">
                              🪙{hs.hero.cost}
                            </span>
                          ) : null}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filteredSynergies.length === 0 && (
            <p className="text-gray-500 py-12 col-span-full text-center">
              Tidak ada sinergi yang cocok dengan pencarian.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

