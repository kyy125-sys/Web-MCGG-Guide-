import { useDroppable } from '@dnd-kit/core';
import type { BoardHero } from '../../store/lineupStore';
import { Star, X } from 'lucide-react';

interface Props {
  row: number;
  col: number;
  boardHero?: BoardHero;
  onRemove?: (id: string) => void;
  onSetStar?: (id: string, star: number) => void;
}

export function BoardSlot({ row, col, boardHero, onRemove, onSetStar }: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${row}-${col}`,
    data: { row, col },
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-16 h-16 rounded-xl border-2 relative flex items-center justify-center transition-colors select-none ${
        boardHero
          ? 'border-mcgg-gold/60 bg-mcgg-card'
          : `border-mcgg-border ${
              isOver ? 'border-mcgg-gold bg-mcgg-gold/10 scale-105' : 'bg-gray-900 hover:bg-gray-800'
            }`
      }`}
    >
      {boardHero ? (
        <>
          {boardHero.hero.imageUrl ? (
            <img
              src={boardHero.hero.imageUrl}
              alt={boardHero.hero.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="text-xl">⚔️</span>
              <span className="text-[10px] text-gray-300 truncate max-w-[56px] text-center">
                {boardHero.hero.name}
              </span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(boardHero.id);
            }}
            title="Remove hero"
            className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full p-0.5 hover:bg-red-700 text-white z-10 shadow"
          >
            <X size={12} />
          </button>
          <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5 z-10 bg-black/50 py-0.5 rounded-b-xl">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                size={10}
                fill={s <= boardHero.star ? '#F0C040' : 'none'}
                stroke="#F0C040"
                className="cursor-pointer hover:scale-125 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetStar?.(boardHero.id, s);
                }}
              />
            ))}
          </div>
          <div className="absolute top-0.5 left-0.5 z-10">
            <span
              className="text-[10px] bg-black/80 text-mcgg-gold font-bold px-1 rounded"
            >
              {boardHero.hero.cost}💎
            </span>
          </div>
        </>
      ) : (
        <span className="text-gray-700 text-xl font-bold">+</span>
      )}
    </div>
  );
}
