// src/components/LevelSelector.tsx

interface LevelSelectorProps {
  currentLevel: number;
  totalLevels: number;
  onChange: (levelId: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function LevelSelector({
  currentLevel,
  totalLevels,
  onChange,
  onPrev,
  onNext
}: LevelSelectorProps) {
  return (
    <div className="flex justify-center items-center gap-4 mb-5">
      <button
        className="game-button disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onPrev}
        disabled={currentLevel <= 1}
      >
        ← 上一关
      </button>

      <select
        className="px-4 py-2 bg-slate-800 text-white rounded border-2 border-slate-600 cursor-pointer"
        value={currentLevel}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {Array.from({ length: totalLevels }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            第 {i + 1} 关
          </option>
        ))}
      </select>

      <button
        className="game-button disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onNext}
        disabled={currentLevel >= totalLevels}
      >
        下一关 →
      </button>
    </div>
  );
}
