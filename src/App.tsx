// src/App.tsx
import { useEffect, useCallback, useState } from 'react';
import { useSokoban } from './hooks/useSokoban';
import { useIsMobile } from './utils/responsive';
import { GameCanvas } from './components/GameCanvas';
import { TouchControls } from './components/TouchControls';
import { LevelSelector } from './components/LevelSelector';
import { StatsPanel } from './components/StatsPanel';
import { DeadlockModal } from './components/DeadlockModal';
import { LevelComplete } from './components/LevelComplete';
import { AISolver } from './components/AISolver';

function App() {
  const {
    state,
    levels,
    currentLevelId,
    totalLevels,
    move,
    undo,
    restart,
    loadLevel,
    prevLevel,
    nextLevel,
    isLoading,
    error,
  } = useSokoban();

  const isMobile = useIsMobile();
  const [isSolving, setIsSolving] = useState(false);
  const [isSolverOpen, setIsSolverOpen] = useState(false);

  // 获取当前关卡数据
  const currentLevelData = levels.find(l => l.id === currentLevelId) || null;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!state) return;

    // AI求解快捷键 (P键)
    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      if (!isSolverOpen && !isSolving) {
        setIsSolverOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        move('UP');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        move('DOWN');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        move('LEFT');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        move('RIGHT');
        break;
      case 'z':
      case 'Z':
        e.preventDefault();
        undo();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        restart();
        break;
    }
  }, [state, move, undo, restart]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-400 border-t-transparent mb-4"></div>
          <p className="text-sky-400 text-xl">加载关卡中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="bg-red-900/50 border border-red-500 rounded-xl p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-3">加载失败</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  if (!state) {
    return <div className="text-center p-10 text-sky-400 text-xl">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center py-5">
      <h1 className="text-3xl md:text-4xl font-bold mb-5 text-sky-400 text-center">
        推箱子 Sokoban
      </h1>

      <LevelSelector
        currentLevel={currentLevelId}
        totalLevels={totalLevels}
        onChange={loadLevel}
        onPrev={prevLevel}
        onNext={nextLevel}
      />

      <StatsPanel moves={state.current.moves} pushes={state.current.pushes} />

      <GameCanvas gameState={state.current} />

      <TouchControls
        onDirection={move}
        onUndo={undo}
        onRestart={restart}
        onAISolve={() => setIsSolverOpen(true)}
        visible={isMobile}
      />

      <DeadlockModal
        isOpen={state.isDeadlocked}
        onUndo={undo}
        onRestart={restart}
      />

      <LevelComplete
        isOpen={state.isCompleted}
        moves={state.current.moves}
        pushes={state.current.pushes}
        isLastLevel={currentLevelId >= totalLevels}
        onNext={nextLevel}
        onReplay={restart}
      />

      <AISolver
        levelData={currentLevelData}
        onMove={move}
        onRestart={restart}
        isSolving={isSolving}
        setIsSolving={setIsSolving}
        isOpen={isSolverOpen}
        onClose={() => setIsSolverOpen(false)}
      />

      <div className="mt-5 text-center text-sm text-gray-500">
        <p>键盘：方向键/WASD 移动，Z 撤销，R 重置，P AI通关</p>
        {isMobile && <p>移动端：点击下方按钮控制</p>}
      </div>
    </div>
  );
}

export default App;
