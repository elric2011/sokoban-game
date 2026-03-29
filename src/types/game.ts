// src/types/game.ts

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export interface LevelData {
  id: number;
  width: number;
  height: number;
  map: string[][];
}

export interface GameState {
  level: number;
  map: string[][];
  playerPos: Position;
  moves: number;
  pushes: number;
}

export interface State {
  current: GameState;
  history: GameState[];
  initial: GameState;
  isCompleted: boolean;
  isDeadlocked: boolean;
}

export type GameAction =
  | { type: 'MOVE'; direction: Direction }
  | { type: 'UNDO' }
  | { type: 'RESTART' }
  | { type: 'LOAD_LEVEL'; levelId: number };

export interface RenderConfig {
  tileSize: number;
  wallColor: string;
  floorColor: string;
  playerColor: string;
  boxColor: string;
  targetColor: string;
  boxOnTargetColor: string;
}
