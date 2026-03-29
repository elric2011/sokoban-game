// src/components/AISolver.tsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { solveLevel, playSolution, type Solution } from '../ai/solver';
import type { LevelData, Direction } from '../types/game';

interface AISolverProps {
  levelData: LevelData | null;
  onMove: (dir: Direction) => void;
  onRestart: () => void;
  isSolving: boolean;
  setIsSolving: (solving: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AISolver({
  levelData,
  onMove,
  onRestart,
  isSolving,
  setIsSolving,
  isOpen,
  onClose
}: AISolverProps) {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [solveTime, setSolveTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  // 切换关卡时重置状态
  useEffect(() => {
    setSolution(null);
    setError(null);
    setIsCalculating(false);
    setIsSolving(false);
    setSolveTime(0);
    abortRef.current = false;
  }, [levelData?.id, setIsSolving]);

  // 关闭时重置
  const handleClose = useCallback(() => {
    if (isCalculating) {
      abortRef.current = true;
    }
    setIsCalculating(false);
    onClose();
  }, [isCalculating, onClose]);

  const handleSolve = useCallback(async () => {
    if (!levelData || isCalculating) return;

    setIsCalculating(true);
    setError(null);
    setSolution(null);
    setSolveTime(0);
    abortRef.current = false;

    const startTime = performance.now();

    // 使用setTimeout让UI有机会更新
    setTimeout(() => {
      try {
        if (abortRef.current) {
          setIsCalculating(false);
          return;
        }

        const result = solveLevel(levelData);
        const endTime = performance.now();

        if (abortRef.current) {
          setIsCalculating(false);
          return;
        }

        if (result) {
          setSolution(result);
          setSolveTime((endTime - startTime) / 1000);
        } else {
          setError('无法找到解决方案');
        }
      } catch (err) {
        if (!abortRef.current) {
          setError('计算过程中出错');
          console.error(err);
        }
      } finally {
        setIsCalculating(false);
      }
    }, 100);
  }, [levelData, isCalculating]);

  const handlePlay = useCallback(async () => {
    if (!solution || isSolving) return;

    onClose(); // 隐藏弹窗
    setIsSolving(true);

    // 先重置到初始状态
    onRestart();
    await new Promise(resolve => setTimeout(resolve, 50));

    // 演示速率：400ms（比原来200ms慢一倍）
    await playSolution(solution.moves, onMove, 400);
    setIsSolving(false);
  }, [solution, isSolving, onMove, onRestart, onClose, setIsSolving]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-600 p-6 max-w-sm w-full shadow-2xl">
        {/* 求解中状态 */}
        {isCalculating && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-sky-400 border-t-transparent mb-4"></div>
            <h3 className="text-xl font-bold text-sky-400 mb-2">AI求解中...</h3>
            <p className="text-gray-400 text-sm mb-4">正在寻找最优路径</p>
            <button
              onClick={handleClose}
              className="game-button bg-red-600 hover:bg-red-700"
            >
              取消
            </button>
          </div>
        )}

        {/* 求解结果 */}
        {!isCalculating && solution && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-400 mb-4">✓ 求解成功</h3>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-xs text-gray-400">步数</div>
                <div className="text-xl font-bold text-sky-400">{solution.steps}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-xs text-gray-400">推箱子</div>
                <div className="text-xl font-bold text-orange-400">{solution.pushes}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-xs text-gray-400">耗时</div>
                <div className="text-xl font-bold text-purple-400">{solveTime.toFixed(2)}s</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePlay}
                disabled={isSolving}
                className="game-button flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSolving ? '演示中...' : '自动演示'}
              </button>
              <button
                onClick={handleClose}
                className="game-button"
              >
                关闭
              </button>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {!isCalculating && error && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-red-400 mb-4">求解失败</h3>
            <p className="text-orange-400 mb-4">{error}</p>
            <button onClick={handleClose} className="game-button">
              关闭
            </button>
          </div>
        )}

        {/* 初始状态 - 点击开始求解 */}
        {!isCalculating && !solution && !error && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-sky-400 mb-4">AI通关</h3>
            <p className="text-gray-400 text-sm mb-6">
              AI将自动寻找本关的最优解法
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSolve}
                className="game-button flex-1 bg-purple-600 hover:bg-purple-700"
              >
                开始求解
              </button>
              <button
                onClick={handleClose}
                className="game-button"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
