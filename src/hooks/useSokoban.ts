// src/hooks/useSokoban.ts
import { useState, useEffect, useCallback } from 'react';
import type { State, Direction, LevelData } from '../types/game';
import { gameReducer, initState } from '../engine/reducer';
import { parseAllLevels } from '../engine/parser';

interface UseSokobanReturn {
  state: State | null;
  levels: LevelData[];
  currentLevelId: number;
  totalLevels: number;
  isLoading: boolean;
  error: string | null;
  move: (direction: Direction) => void;
  undo: () => void;
  restart: () => void;
  loadLevel: (levelId: number) => void;
  prevLevel: () => void;
  nextLevel: () => void;
  clearError: () => void;
}

export function useSokoban(): UseSokobanReturn {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [state, setState] = useState<State | null>(null);
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch('/maps.txt')
      .then(res => {
        if (!res.ok) {
          throw new Error('无法加载关卡文件');
        }
        return res.text();
      })
      .then(text => {
        const parsed = parseAllLevels(text);
        if (parsed.length === 0) {
          throw new Error('未找到有效关卡数据');
        }
        setLevels(parsed);
        const initialState = initState(parsed[0]);
        setState(initialState);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load levels:', err);
        setError(err instanceof Error ? err.message : '加载失败，请刷新页面重试');
        setIsLoading(false);
      });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadLevel = useCallback((levelId: number) => {
    if (levelId < 1 || levelId > levels.length || !levels[levelId - 1]) {
      setError('无效的关卡 ID');
      return;
    }
    const levelData = levels[levelId - 1];
    const newState = initState(levelData);
    setState(newState);
    setCurrentLevelId(levelId);
    setError(null);
  }, [levels]);

  const dispatchAction = useCallback((action: { type: string; [key: string]: any }) => {
    setState(prevState => {
      if (!prevState) return null;
      return gameReducer(prevState, action as any);
    });
  }, []);

  const move = useCallback((direction: Direction) => {
    dispatchAction({ type: 'MOVE', direction });
  }, [dispatchAction]);

  const undo = useCallback(() => {
    dispatchAction({ type: 'UNDO' });
  }, [dispatchAction]);

  const restart = useCallback(() => {
    dispatchAction({ type: 'RESTART' });
  }, [dispatchAction]);

  const prevLevel = useCallback(() => {
    if (currentLevelId > 1) loadLevel(currentLevelId - 1);
  }, [currentLevelId, loadLevel]);

  const nextLevel = useCallback(() => {
    if (currentLevelId < levels.length) loadLevel(currentLevelId + 1);
  }, [currentLevelId, levels.length, loadLevel]);

  return {
    state,
    levels,
    currentLevelId,
    totalLevels: levels.length,
    isLoading,
    error,
    move,
    undo,
    restart,
    loadLevel,
    prevLevel,
    nextLevel,
    clearError,
  };
}
