import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Hero, Commander, ActiveSynergy } from '../types';

export interface BoardHero {
  id: string; // unique board slot id
  hero: Hero;
  position: { row: number; col: number };
  star: number;
  items: string[];
}

interface LineupStore {
  boardHeroes: BoardHero[];
  selectedCommander: Commander | null;
  boardConfig: { rows: number; cols: number; maxHeroes: number };
  history: BoardHero[][];
  historyIndex: number;
  addHero: (hero: Hero, position: { row: number; col: number }) => void;
  removeHero: (id: string) => void;
  moveHero: (id: string, position: { row: number; col: number }) => void;
  setStars: (id: string, star: number) => void;
  setCommander: (commander: Commander | null) => void;
  resetBoard: () => void;
  undo: () => void;
  redo: () => void;
  getActiveSynergies: (allSynergies: any[]) => ActiveSynergy[];
}

export const useLineupStore = create<LineupStore>()(
  persist(
    (set, get) => ({
      boardHeroes: [],
      selectedCommander: null,
      boardConfig: { rows: 4, cols: 7, maxHeroes: 10 },
      history: [],
      historyIndex: -1,

      addHero: (hero, position) => {
        const { boardHeroes, boardConfig } = get();
        if (boardHeroes.length >= boardConfig.maxHeroes) return;
        // Replace if position occupied
        const filtered = boardHeroes.filter(
          (bh) => !(bh.position.row === position.row && bh.position.col === position.col)
        );
        const newBoard = [
          ...filtered,
          { id: `${hero.id}-${Date.now()}`, hero, position, star: 1, items: [] },
        ];
        set((s) => ({
          boardHeroes: newBoard,
          history: [...s.history.slice(0, s.historyIndex + 1), s.boardHeroes],
          historyIndex: s.historyIndex + 1,
        }));
      },

      removeHero: (id) =>
        set((s) => ({
          boardHeroes: s.boardHeroes.filter((bh) => bh.id !== id),
          history: [...s.history.slice(0, s.historyIndex + 1), s.boardHeroes],
          historyIndex: s.historyIndex + 1,
        })),

      moveHero: (id, position) =>
        set((s) => ({
          boardHeroes: s.boardHeroes.map((bh) =>
            bh.id === id ? { ...bh, position } : bh
          ),
        })),

      setStars: (id, star) =>
        set((s) => ({
          boardHeroes: s.boardHeroes.map((bh) =>
            bh.id === id ? { ...bh, star } : bh
          ),
        })),

      setCommander: (commander) => set({ selectedCommander: commander }),

      resetBoard: () =>
        set((s) => ({
          boardHeroes: [],
          history: [...s.history, s.boardHeroes],
          historyIndex: s.historyIndex + 1,
        })),

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) return;
        set({ boardHeroes: history[historyIndex - 1], historyIndex: historyIndex - 1 });
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;
        set({ boardHeroes: history[historyIndex + 1], historyIndex: historyIndex + 1 });
      },

      getActiveSynergies: (allSynergies) => {
        const { boardHeroes } = get();
        // Unique heroes by hero id so duplicates don't double-count synergy
        const uniqueHeroesMap = new Map<string, Hero>();
        boardHeroes.forEach((bh) => {
          if (!uniqueHeroesMap.has(bh.hero.id)) {
            uniqueHeroesMap.set(bh.hero.id, bh.hero);
          }
        });
        const heroes = Array.from(uniqueHeroesMap.values());

        return (allSynergies || [])
          .map((s) => {
            const count = heroes.filter((h) =>
              h.synergies?.some((hs: any) => hs.synergy?.id === s.id || hs.synergyId === s.id)
            ).length;
            const thresholds = (s.thresholds || []) as { count: number; bonus: string }[];
            const active = thresholds.filter((t) => t.count <= count);
            if (active.length === 0) return null;
            return {
              synergy: s,
              count,
              level: active.length,
              activeBonus: active[active.length - 1].bonus,
            };
          })
          .filter(Boolean) as ActiveSynergy[];
      },
    }),
    { name: 'mcgg_lineup' }
  )
);
