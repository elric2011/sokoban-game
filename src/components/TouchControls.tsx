// src/components/TouchControls.tsx
import type { Direction } from '../types/game';

interface TouchControlsProps {
  onDirection: (dir: Direction) => void;
  onUndo: () => void;
  onRestart: () => void;
  visible: boolean;
}

export function TouchControls({ onDirection, onUndo, onRestart, visible }: TouchControlsProps) {
  if (!visible) return null;

  const btnClass = "w-14 h-14 text-2xl bg-game-wall text-white rounded-lg border-2 border-slate-500 active:bg-slate-600 flex items-center justify-center select-none touch-manipulation";

  return (
    <div className="mt-5">
      <div className="flex justify-center gap-2 my-2">
        <button className={btnClass} onClick={() => onDirection('UP')}>↑</button>
      </div>
      <div className="flex justify-center gap-2 my-2">
        <button className={btnClass} onClick={() => onDirection('LEFT')}>←</button>
        <button className={btnClass} onClick={() => onDirection('DOWN')}>↓</button>
        <button className={btnClass} onClick={() => onDirection('RIGHT')}>→</button>
      </div>
      <div className="flex justify-center gap-3 mt-5">
        <button className="game-button" onClick={onUndo}>撤销</button>
        <button className="game-button" onClick={onRestart}>重置</button>
      </div>
    </div>
  );
}
