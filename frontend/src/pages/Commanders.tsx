import { useEffect, useState, useMemo } from 'react';
import { commanderApi } from '../api/commanders';
import type { Commander } from '../types';
import { Crown, X, Search, Sparkles } from 'lucide-react';

export function Commanders() {
  const [commanders, setCommanders] = useState<Commander[]>([]);
  const [selected, setSelected] = useState<Commander | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');

  useEffect(() => {
    commanderApi
      .getAll()
      .then((r) => setCommanders(Array.isArray(r.data) ? r.data : []))
      .catch((err) => console.warn('Error loading commanders:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCommanders = useMemo(() => {
    return commanders.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.playstyle && c.playstyle.toLowerCase().includes(search.toLowerCase())) ||
        (c.skill && c.skill.toLowerCase().includes(search.toLowerCase()));

      const matchTier = selectedTier === 'ALL' || c.tier === selectedTier;
      return matchSearch && matchTier;
    });
  }, [commanders, search, selectedTier]);

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'S':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'A':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'B':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'C':
        return 'bg-gray-600/30 text-gray-300 border-gray-600/40';
      default:
        return 'bg-gray-700/30 text-gray-400 border-gray-700/40';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <span>👑 Commander Database</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mcgg-gold/20 text-mcgg-gold border border-mcgg-gold/30">
              {commanders.length} Commanders
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Data Commander resmi Magic Chess: Go Go patch Chrono Echoes
          </p>
        </div>

        {/* Search & Tier Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari commander / skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-900 border border-mcgg-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-mcgg-gold w-48 sm:w-60"
            />
          </div>

          <div className="flex rounded-lg bg-gray-900 border border-mcgg-border p-0.5 text-xs font-semibold">
            {['ALL', 'S', 'A', 'B', 'C'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedTier === tier
                    ? 'bg-mcgg-gold text-gray-950 shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcgg-gold mr-3" />
          Loading commanders...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredCommanders.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              className="card cursor-pointer hover:border-mcgg-gold/60 transition-all hover:scale-[1.02] group relative flex flex-col justify-between"
            >
              {c.tier && (
                <div
                  className={`absolute top-2 right-2 z-10 text-[11px] font-black px-1.5 py-0.5 rounded border backdrop-blur-sm shadow ${getTierColor(
                    c.tier
                  )}`}
                >
                  {c.tier} Tier
                </div>
              )}
              <div>
                <div className="w-full aspect-[4/5] bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-gray-800">
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Crown size={40} className="text-mcgg-gold" />
                  )}
                </div>
                <h3 className="font-bold text-gray-100 text-sm truncate">{c.name}</h3>
                <p className="text-xs text-mcgg-gold/90 truncate mt-0.5 font-medium">
                  {c.playstyle || 'Commander'}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                <span className="truncate">{c.skillLevels?.length || 2} Skills</span>
                <span className="text-mcgg-gold group-hover:underline">Detail &rarr;</span>
              </div>
            </div>
          ))}
          {filteredCommanders.length === 0 && (
            <p className="text-gray-500 py-12 col-span-full text-center">
              Tidak ada commander yang cocok dengan filter.
            </p>
          )}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="card max-w-xl w-full max-h-[90vh] overflow-y-auto border-mcgg-gold/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-24 rounded-xl bg-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0 border border-mcgg-border">
                  {selected.imageUrl ? (
                    <img
                      src={selected.imageUrl}
                      alt={selected.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <Crown size={36} className="text-mcgg-gold" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-100">{selected.name}</h2>
                    {selected.tier && (
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded border ${getTierColor(
                          selected.tier
                        )}`}
                      >
                        {selected.tier} TIER
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-mcgg-gold">{selected.playstyle || 'Commander'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-100 p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {selected.description && (
                <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-800 text-sm text-gray-300 leading-relaxed italic">
                  "{selected.description}"
                </div>
              )}

              {/* Main Skill */}
              <div className="bg-gray-900 rounded-lg p-3.5 border border-mcgg-gold/30">
                <h3 className="text-sm font-bold text-mcgg-gold mb-1 flex items-center gap-1.5">
                  <Sparkles size={16} /> Skill Utama
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">{selected.skill}</p>
              </div>

              {/* Skill Levels Progression */}
              {selected.skillLevels?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-200 mb-2">Pilihan / Progresi Skill</h3>
                  <div className="space-y-2.5">
                    {selected.skillLevels.map((sl, i) => (
                      <div
                        key={i}
                        className="bg-gray-900/90 p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="badge bg-mcgg-gold/20 text-mcgg-gold text-[11px] font-bold">
                            Level {sl.level}
                          </span>
                          {sl.name && (
                            <span className="text-xs font-bold text-gray-100">{sl.name}</span>
                          )}
                          {sl.type && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                sl.type.toLowerCase().includes('aktif')
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {sl.type}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed pl-1">{sl.effect}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-900/60 p-3 rounded-lg border border-green-500/20">
                  <h3 className="text-xs font-bold text-green-400 mb-2 uppercase tracking-wide">
                    ✅ Keunggulan
                  </h3>
                  <div className="space-y-1.5">
                    {selected.strengths?.length ? (
                      selected.strengths.map((s, i) => (
                        <p key={i} className="text-xs text-gray-300 leading-snug">
                          • {s}
                        </p>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">Tidak ada data khusus</p>
                    )}
                  </div>
                </div>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-red-500/20">
                  <h3 className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wide">
                    ❌ Kelemahan
                  </h3>
                  <div className="space-y-1.5">
                    {selected.weaknesses?.length ? (
                      selected.weaknesses.map((w, i) => (
                        <p key={i} className="text-xs text-gray-300 leading-snug">
                          • {w}
                        </p>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">Tidak ada data khusus</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

