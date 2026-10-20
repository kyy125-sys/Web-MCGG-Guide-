import { useEffect, useState } from 'react';
import { tierApi } from '../api/tiers';
import { heroApi } from '../api/heroes';
import { commanderApi } from '../api/commanders';
import { synergyApi } from '../api/synergies';
import { useAuthStore } from '../store/authStore';
import type { Hero, Commander, Synergy, TierEntry } from '../types';
import { TrendingUp, Crown, Sword, Zap, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

const TIERS: ('S' | 'A' | 'B' | 'C' | 'D')[] = ['S', 'A', 'B', 'C', 'D'];

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  S: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' },
  A: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' },
  B: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  C: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500' },
  D: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' },
};

export function TierList() {
  const { isAdmin } = useAuthStore();
  const [tab, setTab] = useState<'heroes' | 'commanders' | 'synergies'>('heroes');
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [commanders, setCommanders] = useState<Commander[]>([]);
  const [synergies, setSynergies] = useState<Synergy[]>([]);
  const [tiers, setTiers] = useState<TierEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit tier modal state
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; type: string; currentTier: string } | null>(null);
  const [newTier, setNewTier] = useState<'S' | 'A' | 'B' | 'C' | 'D'>('A');

  useEffect(() => {
    Promise.all([
      heroApi.getAll({ limit: 100 }),
      commanderApi.getAll(),
      synergyApi.getAll(),
      tierApi.getAll().catch(() => ({ data: [] })),
    ])
      .then(([h, c, s, t]) => {
        setHeroes(h.data?.heroes || (Array.isArray(h.data) ? h.data : []));
        setCommanders(Array.isArray(c.data) ? c.data : []);
        setSynergies(Array.isArray(s.data) ? s.data : []);
        setTiers(Array.isArray(t.data) ? t.data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const getTierForEntity = (entityId: string, defaultTier: 'S' | 'A' | 'B' | 'C' | 'D'): 'S' | 'A' | 'B' | 'C' | 'D' => {
    const found = tiers.find((t) => t.entityId === entityId);
    return found ? found.tier : defaultTier;
  };

  const handleUpdateTier = async () => {
    if (!editingItem) return;
    try {
      await tierApi.upsert({
        entityId: editingItem.id,
        entityType: editingItem.type,
        tier: newTier,
      });
      setTiers((prev) => {
        const filtered = prev.filter((t) => t.entityId !== editingItem.id);
        return [...filtered, { id: Date.now().toString(), entityId: editingItem.id, entityType: editingItem.type, tier: newTier }];
      });
      toast.success(`Updated ${editingItem.name} to Tier ${newTier}`);
      setEditingItem(null);
    } catch (e) {
      toast.error('Failed to update tier');
    }
  };

  // Assign default tiers if not in backend database
  const getHeroDefaultTier = (hero: Hero): 'S' | 'A' | 'B' | 'C' | 'D' => {
    if (hero.cost >= 5) return 'S';
    if (hero.cost === 4) return 'A';
    if (hero.cost === 3) return 'B';
    if (hero.cost === 2) return 'C';
    return 'D';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <TrendingUp className="text-mcgg-gold" /> Tier List
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Meta tier rankings for current competitive meta. Categorized by impact and viability.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-mcgg-card border border-mcgg-border p-1 rounded-xl">
          <button
            onClick={() => setTab('heroes')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'heroes' ? 'bg-mcgg-gold text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sword size={16} /> Heroes
          </button>
          <button
            onClick={() => setTab('commanders')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'commanders' ? 'bg-mcgg-gold text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Crown size={16} /> Commanders
          </button>
          <button
            onClick={() => setTab('synergies')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'synergies' ? 'bg-mcgg-gold text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap size={16} /> Synergies
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading tier data...</div>
      ) : (
        <div className="space-y-3">
          {TIERS.map((tier) => {
            const color = TIER_COLORS[tier];

            let itemsInTier: any[] = [];
            if (tab === 'heroes') {
              itemsInTier = heroes.filter((h) => getTierForEntity(h.id, getHeroDefaultTier(h)) === tier);
            } else if (tab === 'commanders') {
              itemsInTier = commanders.filter((c, idx) => {
                const defaultT: ('S' | 'A' | 'B' | 'C' | 'D') = idx % 5 === 0 ? 'S' : idx % 5 === 1 ? 'A' : idx % 5 === 2 ? 'B' : idx % 5 === 3 ? 'C' : 'D';
                return getTierForEntity(c.id, defaultT) === tier;
              });
            } else if (tab === 'synergies') {
              itemsInTier = synergies.filter((s, idx) => {
                const defaultT: ('S' | 'A' | 'B' | 'C' | 'D') = idx % 4 === 0 ? 'S' : idx % 4 === 1 ? 'A' : idx % 4 === 2 ? 'B' : 'C';
                return getTierForEntity(s.id, defaultT) === tier;
              });
            }

            return (
              <div
                key={tier}
                className="flex flex-col sm:flex-row bg-mcgg-card border border-mcgg-border rounded-xl overflow-hidden min-h-[90px]"
              >
                {/* Tier Label */}
                <div
                  className={`w-full sm:w-24 ${color.bg} ${color.text} flex items-center justify-center font-black text-3xl border-b sm:border-b-0 sm:border-r ${color.border} py-3 sm:py-0 flex-shrink-0`}
                >
                  {tier}
                </div>

                {/* Items in this tier */}
                <div className="flex-1 p-3 flex flex-wrap gap-2.5 items-center bg-gray-950/40">
                  {itemsInTier.map((item) => (
                    <div
                      key={item.id}
                      className="group relative bg-gray-900 border border-mcgg-border hover:border-mcgg-gold rounded-lg p-1.5 flex items-center gap-2 transition-all cursor-pointer"
                      onClick={() => {
                        if (isAdmin) {
                          setEditingItem({
                            id: item.id,
                            name: item.name,
                            type: tab.slice(0, -1),
                            currentTier: tier,
                          });
                          setNewTier(tier);
                        }
                      }}
                    >
                      <div className="w-9 h-9 rounded bg-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {item.imageUrl || item.iconUrl ? (
                          <img
                            src={item.imageUrl || item.iconUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : tab === 'commanders' ? (
                          <Crown size={16} className="text-mcgg-gold" />
                        ) : tab === 'synergies' ? (
                          <Zap size={16} className="text-blue-400" />
                        ) : (
                          <Sword size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div className="pr-1">
                        <p className="text-xs font-semibold text-gray-200 truncate max-w-[90px]">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {tab === 'heroes' ? `${item.cost}💎` : tab === 'commanders' ? item.playstyle || 'Tactician' : 'Synergy'}
                        </p>
                      </div>

                      {isAdmin && (
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 p-0.5 rounded">
                          <Edit3 size={10} className="text-mcgg-gold" />
                        </div>
                      )}
                    </div>
                  ))}
                  {itemsInTier.length === 0 && (
                    <span className="text-xs text-gray-600 italic px-2">No entries in this tier</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Edit Tier Modal */}
      {editingItem && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="card max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-100 mb-2">Edit Tier for {editingItem.name}</h3>
            <p className="text-xs text-gray-400 mb-4">Select the tier rating for this {editingItem.type}:</p>
            <div className="flex gap-2 mb-6">
              {TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setNewTier(t)}
                  className={`flex-1 py-2 rounded-lg font-bold text-lg border ${
                    newTier === t ? `${TIER_COLORS[t].bg} ${TIER_COLORS[t].text} ${TIER_COLORS[t].border}` : 'border-mcgg-border text-gray-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingItem(null)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button onClick={handleUpdateTier} className="btn-primary text-sm">
                Save Tier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
