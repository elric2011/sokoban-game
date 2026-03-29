// src/components/LevelComplete.tsx

interface LevelCompleteProps {
  isOpen: boolean;
  moves: number;
  pushes: number;
  isLastLevel: boolean;
  onNext: () => void;
  onReplay: () => void;
}

export function LevelComplete({
  isOpen,
  moves,
  pushes,
  isLastLevel,
  onNext,
  onReplay
}: LevelCompleteProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-sm">
        <h2 className="text-3xl mb-5 text-green-400 font-bold">🎉 恭喜通关！</h2>
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">步数</div>
            <div className="text-2xl font-bold text-sky-400">{moves}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">推箱子</div>
            <div className="text-2xl font-bold text-orange-400">{pushes}</div>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          {!isLastLevel && (
            <button
              className="px-6 py-3 bg-green-400 text-white rounded-lg font-medium hover:bg-green-500 transition"
              onClick={onNext}
            >
              下一关
            </button>
          )}
          <button
            className="px-6 py-3 bg-sky-400 text-white rounded-lg font-medium hover:bg-sky-500 transition"
            onClick={onReplay}
          >
            再玩一次
          </button>
        </div>
      </div>
    </div>
  );
}
