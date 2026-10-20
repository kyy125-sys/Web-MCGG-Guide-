import { useEffect, useState } from 'react';
import { heroApi } from '../api/heroes';
import { HeroGrid } from '../components/heroes/HeroGrid';
import type { Hero } from '../types';
import { X } from 'lucide-react';

export function Heroes() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selected, setSelected] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    heroApi
      .getAll({ limit: 100 })
      .then((h) => {
        setHeroes(h.data?.heroes || (Array.isArray(h.data) ? h.data : []));
      })
      .catch((err) => console.warn('Error loading heroes:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-6">⚔️ Hero Database</h1>
      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcgg-gold mr-3" />
          Loading heroes...
        </div>
      ) : (
        <HeroGrid heroes={heroes} onSelect={setSelected} />
      )}

      {/* Hero Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="card max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0">
                  {selected.imageUrl ? (
                    <img
                      src={selected.imageUrl}
                      alt={selected.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="flex items-center justify-center h-full text-3xl">⚔️</span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-100">{selected.name}</h2>
                  <p className="text-sm text-gray-400 capitalize">
                    {selected.rarity} · Cost {selected.cost}💎
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selected.faction?.map((f) => (
                      <span key={f} className="text-xs font-semibold px-2 py-0.5 rounded border bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                        {f}
                      </span>
                    ))}
                    {selected.role?.map((r) => (
                      <span key={r} className="text-xs font-semibold px-2 py-0.5 rounded border bg-emerald-500/20 text-emerald-300 border-emerald-500/30 capitalize">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-100 p-1 rounded-lg hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Synergies */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Synergies</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.synergies && selected.synergies.length > 0 ? (
                    selected.synergies.map((hs, idx) => (
                      <span key={hs.synergy?.id || idx} className="badge bg-purple-500/20 text-purple-300">
                        {hs.synergy?.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">No synergies listed</span>
                  )}
                </div>
              </div>

              {/* Skills */}
              {selected.skills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Skills</h3>
                  <div className="space-y-2">
                    {selected.skills.map((skill: any, i: number) => (
                      <div key={i} className="bg-gray-900 rounded-lg p-3 border border-mcgg-border">
                        <p className="text-sm font-medium text-mcgg-gold">{skill.name}</p>
                        <p className="text-xs text-gray-300 mt-1">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths/Weaknesses */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/60 p-3 rounded-lg border border-mcgg-border">
                  <h3 className="text-sm font-semibold text-green-400 mb-2">✅ Strengths</h3>
                  <ul className="space-y-1">
                    {selected.strengths?.length ? (
                      selected.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-gray-300">• {s}</li>
                      ))
                    ) : (
                      <li className="text-xs text-gray-500">None specified</li>
                    )}
                  </ul>
                </div>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-mcgg-border">
                  <h3 className="text-sm font-semibold text-red-400 mb-2">❌ Weaknesses</h3>
                  <ul className="space-y-1">
                    {selected.weaknesses?.length ? (
                      selected.weaknesses.map((w, i) => (
                        <li key={i} className="text-xs text-gray-300">• {w}</li>
                      ))
                    ) : (
                      <li className="text-xs text-gray-500">None specified</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Stats if available */}
              {selected.stats && Object.keys(selected.stats).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Base Stats</h3>
                  <div className="grid grid-cols-3 gap-2 bg-gray-900 p-3 rounded-lg text-xs">
                    {Object.entries(selected.stats).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-gray-400 capitalize">{k}: </span>
                        <span className="font-semibold text-gray-200">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data source */}
              {selected.dataSource && (
                <p className="text-xs text-gray-500 border-t border-mcgg-border pt-2">
                  Data source: {selected.dataSource}{' '}
                  {selected.verifiedAt
                    ? `· Verified ${new Date(selected.verifiedAt).toLocaleDateString()}`
                    : '(unverified)'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
