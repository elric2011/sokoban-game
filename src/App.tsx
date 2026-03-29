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
  } = useSokoban();

  const isMobile = useIsMobile();
  const [isSolving, setIsSolving] = useState(false);

  // 获取当前关卡数据
  const currentLevelData = levels.find(l => l.id === currentLevelId) || null;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!state) return;

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
      />

      <div className="mt-5 text-center text-sm text-gray-500">
        <p>键盘：方向键/WASD 移动，Z 撤销，R 重置</p>
        {isMobile && <p>移动端：点击下方按钮控制</p>}
      </div>
    </div>
  );
}

export default App;
