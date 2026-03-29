// src/engine/parser.ts
import type { LevelData, GameState, Position } from '../types/game';
import { CHAR, LEVEL_SIZE, TOTAL_LEVELS } from './constants';

export function parseLevel(lines: string[], levelId: number): LevelData {
  const map: string[][] = [];

  for (let i = 0; i < LEVEL_SIZE.height; i++) {
    const row = lines[i] || '';
    const parsedRow = row.split('').map(char => char === '0' ? CHAR.EMPTY : char);
    while (parsedRow.length < LEVEL_SIZE.width) {
      parsedRow.push(CHAR.EMPTY);
    }
    map.push(parsedRow.slice(0, LEVEL_SIZE.width));
  }

  return {
    id: levelId,
    width: LEVEL_SIZE.width,
    height: LEVEL_SIZE.height,
    map,
  };
}

export function parseAllLevels(rawText: string): LevelData[] {
  const lines = rawText.split('\n');
  const levels: LevelData[] = [];
  let currentLevelLines: string[] = [];
  let levelId = 1;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '[level]') {
      if (currentLevelLines.length > 0 && levelId <= TOTAL_LEVELS) {
        levels.push(parseLevel(currentLevelLines, levelId));
        levelId++;
      }
      currentLevelLines = [];
    } else if (trimmed && !trimmed.startsWith('#') && levelId <= TOTAL_LEVELS) {
      currentLevelLines.push(trimmed);
    }
  }

  if (currentLevelLines.length > 0 && levelId <= TOTAL_LEVELS) {
    levels.push(parseLevel(currentLevelLines, levelId));
  }

  return levels;
}

export function findPlayerPosition(map: string[][]): Position {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const char = map[y][x];
      if (char === CHAR.PLAYER || char === CHAR.PLAYER_ON_TARGET) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: 0 };
}

export function cloneMap(map: string[][]): string[][] {
  return map.map(row => [...row]);
}

export function createInitialState(levelData: LevelData): GameState {
  return {
    level: levelData.id,
    map: cloneMap(levelData.map),
    playerPos: findPlayerPosition(levelData.map),
    moves: 0,
    pushes: 0,
  };
}
