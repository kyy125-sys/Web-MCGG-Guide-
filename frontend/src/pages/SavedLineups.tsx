import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lineupApi } from '../api/lineups';
import { useLineupStore } from '../store/lineupStore';
import type { Lineup } from '../types';
import { Bookmark, Star, Trash2, Copy, Play, Crown, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export function SavedLineups() {
  const navigate = useNavigate();
  const { resetBoard, addHero, setCommander, setStars } = useLineupStore();

  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterFav, setFilterFav] = useState(false);

  const fetchLineups = () => {
    setLoading(true);
    lineupApi
      .getAll()
      .then((res) => setLineups(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.warn('Error fetching lineups:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLineups();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await lineupApi.delete(id);
      setLineups((prev) => prev.filter((l) => l.id !== id));
      toast.success('Lineup deleted');
    } catch (e) {
      toast.error('Failed to delete lineup');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await lineupApi.duplicate(id);
      toast.success('Lineup duplicated');
      fetchLineups();
    } catch (e) {
      toast.error('Failed to duplicate lineup');
    }
  };

  const handleLoad = (lineup: Lineup) => {
    resetBoard();
    if (lineup.commander) {
      setCommander(lineup.commander);
    }
    lineup.heroes?.forEach((lh) => {
      if (lh.hero) {
        addHero(lh.hero, lh.position || { row: 0, col: 0 });
        if (lh.star) {
          // Set star after adding
        }
      }
    });
    toast.success(`Loaded "${lineup.name}" into builder!`);
    navigate('/lineup-builder');
  };

  const handleToggleFavorite = async (lineup: Lineup) => {
    try {
      await lineupApi.update(lineup.id, { isFavorite: !lineup.isFavorite });
      setLineups((prev) =>
        prev.map((l) => (l.id === lineup.id ? { ...l, isFavorite: !l.isFavorite } : l))
      );
    } catch (e) {
      toast.error('Failed to update favorite status');
    }
  };

  const filtered = lineups.filter((l) => {
    if (filterFav && !l.isFavorite) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Bookmark className="text-mcgg-gold" /> Saved Formations
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Access your custom tactical blueprints, saved synergies, and strategic formations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 text-sm w-44"
              placeholder="Search formations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setFilterFav(!filterFav)}
            className={`btn-secondary text-sm ${filterFav ? 'border-mcgg-gold text-mcgg-gold' : ''}`}
          >
            <Star size={16} fill={filterFav ? '#F0C040' : 'none'} />
            Favorites
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading saved lineups...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((lineup) => (
            <div key={lineup.id} className="card flex flex-col justify-between hover:border-mcgg-border/90 transition-colors">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-100 text-lg flex items-center gap-2">
                      {lineup.name}
                      <button
                        onClick={() => handleToggleFavorite(lineup)}
                        className="text-gray-500 hover:text-mcgg-gold transition-colors"
                      >
                        <Star
                          size={16}
                          fill={lineup.isFavorite ? '#F0C040' : 'none'}
                          stroke={lineup.isFavorite ? '#F0C040' : 'currentColor'}
                        />
                      </button>
                    </h3>
                    {lineup.commander && (
                      <p className="text-xs text-mcgg-gold flex items-center gap-1 mt-0.5">
                        <Crown size={12} /> Commander: {lineup.commander.name}
                      </p>
                    )}
                  </div>

                  <span className="text-xs text-gray-500">
                    {new Date(lineup.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Hero thumbnails */}
                <div className="flex flex-wrap gap-1.5 mb-4 bg-gray-950 p-2.5 rounded-xl border border-mcgg-border min-h-[50px] items-center">
                  {lineup.heroes && lineup.heroes.length > 0 ? (
                    lineup.heroes.map((lh, i) => (
                      <div
                        key={lh.id || i}
                        className="w-9 h-9 rounded-lg bg-gray-800 overflow-hidden relative border border-gray-700 flex items-center justify-center"
                        title={lh.hero?.name}
                      >
                        {lh.hero?.imageUrl ? (
                          <img
                            src={lh.hero.imageUrl}
                            alt={lh.hero?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs">⚔️</span>
                        )}
                        {lh.star > 1 && (
                          <span className="absolute bottom-0 right-0 text-[9px] bg-black/80 text-mcgg-gold font-bold px-0.5 rounded">
                            {lh.star}★
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-600">No heroes placed</span>
                  )}
                </div>

                {/* Synergy Snapshot */}
                {lineup.synergySnapshot && lineup.synergySnapshot.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {lineup.synergySnapshot.map((syn: any, i: number) => (
                      <span
                        key={i}
                        className="badge bg-mcgg-blue/20 text-blue-300 text-xs"
                      >
                        {syn.synergy?.name || syn.name} ({syn.count})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-mcgg-border mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDuplicate(lineup.id)}
                    title="Duplicate Lineup"
                    className="btn-secondary text-xs px-2.5 py-1.5"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(lineup.id, lineup.name)}
                    title="Delete Lineup"
                    className="btn-secondary text-xs px-2.5 py-1.5 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <button
                  onClick={() => handleLoad(lineup)}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  <Play size={13} /> Open in Builder
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 col-span-full">
              No saved lineups found. Build a formation and click "Save Lineup"!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
