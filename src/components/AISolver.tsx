// src/components/AISolver.tsx
import { useState, useCallback } from 'react';
import { solveLevel, playSolution, type Solution } from '../ai/solver';
import type { LevelData, Direction } from '../types/game';

interface AISolverProps {
  levelData: LevelData | null;
  onMove: (dir: Direction) => void;
  onRestart: () => void;
  isSolving: boolean;
  setIsSolving: (solving: boolean) => void;
}

export function AISolver({ levelData, onMove, onRestart, isSolving, setIsSolving }: AISolverProps) {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = useCallback(async () => {
    if (!levelData || isCalculating) return;

    setIsCalculating(true);
    setError(null);
    setSolution(null);

    // 使用setTimeout让UI有机会更新（显示计算中）
    setTimeout(() => {
      try {
        const result = solveLevel(levelData);

        if (result) {
          setSolution(result);
        } else {
          setError('无法找到解决方案');
        }
      } catch (err) {
        setError('计算过程中出错');
        console.error(err);
      } finally {
        setIsCalculating(false);
      }
    }, 100);
  }, [levelData, isCalculating]);

  const handlePlay = useCallback(async () => {
    if (!solution || isSolving) return;

    setIsSolving(true);
    // 先重置到初始状态，确保求解路径有效
    onRestart();
    // 等待一帧确保状态更新
    await new Promise(resolve => setTimeout(resolve, 50));
    await playSolution(solution.moves, onMove, 200);
    setIsSolving(false);
  }, [solution, isSolving, onMove, onRestart, setIsSolving]);

  const handleClear = useCallback(() => {
    setSolution(null);
    setError(null);
  }, []);

  return (
    <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
      <h3 className="text-lg font-bold text-sky-400 mb-3">AI 求解器</h3>

      {!solution && !error && (
        <div className="flex gap-2">
          <button
            onClick={handleSolve}
            disabled={isCalculating || !levelData}
            className="game-button flex-1"
          >
            {isCalculating ? '计算中...' : '求解关卡'}
          </button>
        </div>
      )}

      {isCalculating && (
        <div className="text-center py-2">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-sky-400 border-t-transparent"></div>
          <p className="text-sm text-gray-400 mt-2">AI正在思考...</p>
        </div>
      )}

      {solution && (
        <div className="space-y-3">
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-gray-400">
              步数: <span className="text-sky-400 font-bold">{solution.steps}</span>
            </span>
            <span className="text-gray-400">
              推箱子: <span className="text-orange-400 font-bold">{solution.pushes}</span>
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePlay}
              disabled={isSolving}
              className="game-button flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSolving ? '演示中...' : '自动演示'}
            </button>
            <button
              onClick={handleClear}
              disabled={isSolving}
              className="game-button"
            >
              清除
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center">
          <p className="text-orange-400 mb-2">{error}</p>
          <button onClick={handleClear} className="game-button">
            重试
          </button>
        </div>
      )}
    </div>
  );
}
