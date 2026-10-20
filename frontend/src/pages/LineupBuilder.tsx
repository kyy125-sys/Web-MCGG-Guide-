import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useLineupStore } from '../store/lineupStore';
import { BoardSlot } from '../components/lineup/BoardSlot';
import { SynergyPanel } from '../components/lineup/SynergyPanel';
import { HeroCard } from '../components/heroes/HeroCard';
import { heroApi } from '../api/heroes';
import { commanderApi } from '../api/commanders';
import { synergyApi } from '../api/synergies';
import { lineupApi } from '../api/lineups';
import type { Hero, Commander, Synergy } from '../types';
import { RotateCcw, Undo2, Redo2, Save, Search, Sparkles, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

export function LineupBuilder() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [commanders, setCommanders] = useState<Commander[]>([]);
  const [synergies, setSynergies] = useState<Synergy[]>([]);
  const [activeHero, setActiveHero] = useState<Hero | null>(null);
  const [lineupName, setLineupName] = useState('My Lineup');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [costFilter, setCostFilter] = useState<number | null>(null);

  const {
    boardHeroes,
    boardConfig,
    addHero,
    removeHero,
    setStars,
    selectedCommander,
    setCommander,
    resetBoard,
    undo,
    redo,
    getActiveSynergies,
  } = useLineupStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeSynergies = getActiveSynergies(synergies);

  useEffect(() => {
    Promise.all([heroApi.getAll({ limit: 100 }), commanderApi.getAll(), synergyApi.getAll()])
      .then(([h, c, s]) => {
        setHeroes(h.data?.heroes || (Array.isArray(h.data) ? h.data : []));
        setCommanders(Array.isArray(c.data) ? c.data : []);
        setSynergies(Array.isArray(s.data) ? s.data : []);
      })
      .catch((err) => console.warn('Error loading lineup builder data:', err));
  }, []);

  const handleDragStart = (e: DragStartEvent) => {
    const heroId = String(e.active.id);
    const hero = heroes.find((h) => h.id === heroId);
    if (hero) setActiveHero(hero);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveHero(null);
    if (!e.over) return;
    const slotId = String(e.over.id);
    if (!slotId.startsWith('slot-')) return;
    const [, rowStr, colStr] = slotId.split('-');
    const row = Number(rowStr);
    const col = Number(colStr);
    const heroId = String(e.active.id);
    const hero = heroes.find((h) => h.id === heroId);
    if (hero) {
      addHero(hero, { row, col });
    }
  };

  // Helper to place on board by clicking hero card
  const handleHeroClick = (hero: Hero) => {
    if (boardHeroes.length >= boardConfig.maxHeroes) {
      toast.error(`Maximum heroes on board reached (${boardConfig.maxHeroes})`);
      return;
    }
    // Find first empty cell
    for (let r = 0; r < boardConfig.rows; r++) {
      for (let c = 0; c < boardConfig.cols; c++) {
        const isOccupied = boardHeroes.some(
          (bh) => bh.position.row === r && bh.position.col === c
        );
        if (!isOccupied) {
          addHero(hero, { row: r, col: c });
          toast.success(`Placed ${hero.name} at (${r + 1}, ${c + 1})`);
          return;
        }
      }
    }
  };

  const totalCost = boardHeroes.reduce((sum, bh) => {
    const starMultiplier = bh.star === 3 ? 9 : bh.star === 2 ? 3 : 1;
    return sum + (bh.hero.cost || 1) * starMultiplier;
  }, 0);

  const saveLineup = async () => {
    if (boardHeroes.length === 0) {
      toast.error('Add at least one hero to the board before saving');
      return;
    }
    setSaving(true);
    try {
      await lineupApi.create({
        name: lineupName,
        commanderId: selectedCommander?.id,
        heroes: boardHeroes.map((bh) => ({
          heroId: bh.hero.id,
          position: bh.position,
          star: bh.star,
          items: bh.items,
        })),
        synergySnapshot: activeSynergies,
        formationConfig: boardConfig,
        tags: activeSynergies.map((s) => s.synergy.name),
      });
      toast.success('Lineup saved successfully!');
    } catch (e) {
      toast.error('Failed to save lineup');
    } finally {
      setSaving(false);
    }
  };

  const filteredHeroes = heroes.filter((h) => {
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (costFilter && h.cost !== costFilter) return false;
    return true;
  });

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <Sparkles className="text-mcgg-gold" /> Lineup Builder
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Drag heroes onto the grid or click to place them. Calculate synergies in real-time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              title="Undo"
              className="btn-secondary p-2"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={redo}
              title="Redo"
              className="btn-secondary p-2"
            >
              <Redo2 size={16} />
            </button>
            <button
              onClick={resetBoard}
              title="Reset Board"
              className="btn-secondary p-2 text-red-400 hover:text-red-300"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={saveLineup}
              disabled={saving}
              className="btn-primary"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Lineup'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Board Area */}
          <div className="xl:col-span-2 space-y-4">
            <div className="card">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <input
                  className="input flex-1 min-w-[200px]"
                  value={lineupName}
                  onChange={(e) => setLineupName(e.target.value)}
                  placeholder="Lineup name..."
                />
                <select
                  className="input w-52"
                  value={selectedCommander?.id || ''}
                  onChange={(e) => {
                    const c = commanders.find((cmd) => cmd.id === e.target.value);
                    setCommander(c || null);
                  }}
                >
                  <option value="">No Commander Selected</option>
                  {commanders.map((c) => (
                    <option key={c.id} value={c.id}>
                      👑 {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between px-2 mb-3 text-xs text-gray-400">
                <span>
                  Heroes on board: <b className="text-mcgg-gold">{boardHeroes.length}</b> / {boardConfig.maxHeroes}
                </span>
                <span className="flex items-center gap-1">
                  <Coins size={14} className="text-mcgg-gold" /> Total Cost: <b className="text-white">{totalCost}💎</b>
                </span>
              </div>

              {/* Board grid (4 rows x 7 cols) */}
              <div className="bg-gray-950 p-4 rounded-xl border border-mcgg-border overflow-x-auto">
                <div className="min-w-[500px]">
                  {Array.from({ length: boardConfig.rows }).map((_, row) => (
                    <div key={row} className="flex gap-2 mb-2 justify-center">
                      {Array.from({ length: boardConfig.cols }).map((_, col) => {
                        const bh = boardHeroes.find(
                          (h) => h.position.row === row && h.position.col === col
                        );
                        return (
                          <BoardSlot
                            key={`${row}-${col}`}
                            row={row}
                            col={col}
                            boardHero={bh}
                            onRemove={removeHero}
                            onSetStar={setStars}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <p className="text-center text-[11px] text-gray-500 mt-2">
                  Frontline (Top) · Backline (Bottom)
                </p>
              </div>
            </div>

            {/* Hero Pool Selector */}
            <div className="card">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-semibold text-gray-200">Hero Pool (Click or drag onto board)</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className="input pl-8 py-1 text-xs w-36"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-1">
                    {[null, 1, 2, 3, 4, 5].map((c) => (
                      <button
                        key={c ?? 'all'}
                        onClick={() => setCostFilter(c)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          costFilter === c
                            ? 'bg-mcgg-gold text-black font-semibold'
                            : 'btn-secondary text-xs'
                        }`}
                      >
                        {c === null ? 'All' : `${c}💎`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 max-h-80 overflow-y-auto p-1">
                {filteredHeroes.map((hero) => (
                  <HeroCard
                    key={hero.id}
                    hero={hero}
                    onClick={() => handleHeroClick(hero)}
                    compact
                  />
                ))}
                {filteredHeroes.length === 0 && (
                  <p className="text-gray-500 text-xs py-4 text-center w-full">
                    No heroes match filters
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Synergies and Commander info */}
          <div className="space-y-4">
            <SynergyPanel activeSynergies={activeSynergies} />

            {selectedCommander && (
              <div className="card">
                <div className="flex items-center gap-3 mb-2">
                  {selectedCommander.imageUrl ? (
                    <img
                      src={selectedCommander.imageUrl}
                      alt={selectedCommander.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-2xl">👑</span>
                  )}
                  <div>
                    <h4 className="font-semibold text-mcgg-gold text-sm">{selectedCommander.name}</h4>
                    <p className="text-xs text-gray-400">{selectedCommander.playstyle}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-300 bg-gray-900 p-2 rounded">
                  {selectedCommander.skill}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeHero ? (
          <div className="w-16 h-16 rounded-xl border-2 border-mcgg-gold bg-mcgg-card flex items-center justify-center shadow-2xl">
            {activeHero.imageUrl ? (
              <img
                src={activeHero.imageUrl}
                alt={activeHero.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-2xl">⚔️</span>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
