// src/engine/reducer.ts
import type { State, GameAction, Direction, Position, GameState } from '../types/game';
import { CHAR } from './constants';
import { detectDeadlock } from './deadlockDetector';
import { createInitialState, cloneMap } from './parser';
import type { LevelData } from '../types/game';

const DIRECTION_OFFSET: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

function checkComplete(map: string[][]): boolean {
  // 通关条件：所有箱子都在目标上（没有不在目标上的箱子）
  for (const row of map) {
    for (const char of row) {
      if (char === CHAR.BOX) return false; // 还有箱子不在目标上
    }
  }
  return true;
}

function processMove(state: State, direction: Direction): State {
  const { current } = state;
  const offset = DIRECTION_OFFSET[direction];
  const newPos = {
    x: current.playerPos.x + offset.x,
    y: current.playerPos.y + offset.y,
  };

  if (newPos.y < 0 || newPos.y >= current.map.length ||
      newPos.x < 0 || newPos.x >= current.map[0].length) {
    return state;
  }

  const targetChar = current.map[newPos.y][newPos.x];

  if (targetChar === CHAR.WALL) return state;

  if (targetChar === CHAR.BOX || targetChar === CHAR.BOX_ON_TARGET) {
    const boxNewPos = {
      x: newPos.x + offset.x,
      y: newPos.y + offset.y,
    };

    if (boxNewPos.y < 0 || boxNewPos.y >= current.map.length ||
        boxNewPos.x < 0 || boxNewPos.x >= current.map[0].length) {
      return state;
    }

    const boxTargetChar = current.map[boxNewPos.y][boxNewPos.x];

    if (boxTargetChar !== CHAR.EMPTY && boxTargetChar !== CHAR.TARGET) {
      return state;
    }

    const newMap = cloneMap(current.map);

    const originalChar = current.map[current.playerPos.y][current.playerPos.x];
    newMap[current.playerPos.y][current.playerPos.x] =
      originalChar === CHAR.PLAYER_ON_TARGET ? CHAR.TARGET : CHAR.EMPTY;

    const boxOriginalChar = current.map[newPos.y][newPos.x];
    newMap[newPos.y][newPos.x] =
      boxOriginalChar === CHAR.BOX_ON_TARGET ? CHAR.PLAYER_ON_TARGET : CHAR.PLAYER;

    newMap[boxNewPos.y][boxNewPos.x] =
      boxTargetChar === CHAR.TARGET ? CHAR.BOX_ON_TARGET : CHAR.BOX;

    const newState: GameState = {
      level: current.level,
      map: newMap,
      playerPos: newPos,
      moves: current.moves + 1,
      pushes: current.pushes + 1,
    };

    return {
      ...state,
      history: [...state.history, current],
      current: newState,
      isDeadlocked: detectDeadlock(newMap),
      isCompleted: checkComplete(newMap),
    };
  }

  const newMap = cloneMap(current.map);

  const originalChar = current.map[current.playerPos.y][current.playerPos.x];
  newMap[current.playerPos.y][current.playerPos.x] =
    originalChar === CHAR.PLAYER_ON_TARGET ? CHAR.TARGET : CHAR.EMPTY;

  newMap[newPos.y][newPos.x] =
    targetChar === CHAR.TARGET ? CHAR.PLAYER_ON_TARGET : CHAR.PLAYER;

  const newState: GameState = {
    level: current.level,
    map: newMap,
    playerPos: newPos,
    moves: current.moves + 1,
    pushes: current.pushes,
  };

  return {
    ...state,
    history: [...state.history, current],
    current: newState,
    isCompleted: checkComplete(newMap),
    isDeadlocked: detectDeadlock(newMap),
  };
}

export function gameReducer(state: State, action: GameAction): State {
  switch (action.type) {
    case 'MOVE':
      return processMove(state, action.direction);

    case 'UNDO':
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        current: prev,
        history: state.history.slice(0, -1),
        isDeadlocked: false,
        isCompleted: false,
      };

    case 'RESTART':
      return {
        current: state.initial,
        initial: state.initial,
        history: [],
        isCompleted: false,
        isDeadlocked: false,
      };

    case 'LOAD_LEVEL':
      return state;

    default:
      return state;
  }
}

export function initState(levelData: LevelData): State {
  const initial = createInitialState(levelData);
  return {
    current: initial,
    initial,
    history: [],
    isCompleted: false,
    isDeadlocked: false,
  };
}
