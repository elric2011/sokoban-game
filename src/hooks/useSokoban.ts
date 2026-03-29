// src/hooks/useSokoban.ts
import { useState, useEffect, useCallback } from 'react';
import type { State, Direction, LevelData } from '../types/game';
import { gameReducer, initState } from '../engine/reducer';
import { parseAllLevels } from '../engine/parser';

export function useSokoban() {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [state, setState] = useState<State | null>(null);
  const [currentLevelId, setCurrentLevelId] = useState(1);

  useEffect(() => {
    fetch('/maps.txt')
      .then(res => res.text())
      .then(text => {
        const parsed = parseAllLevels(text);
        setLevels(parsed);
        if (parsed.length > 0) {
          const initialState = initState(parsed[0]);
          setState(initialState);
        }
      })
      .catch(err => console.error('Failed to load levels:', err));
  }, []);

  const loadLevel = useCallback((levelId: number) => {
    if (levelId < 1 || levelId > levels.length || !levels[levelId - 1]) return;
    const levelData = levels[levelId - 1];
    const newState = initState(levelData);
    setState(newState);
    setCurrentLevelId(levelId);
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
    move,
    undo,
    restart,
    loadLevel,
    prevLevel,
    nextLevel,
  };
}
