// src/engine/deadlockDetector.ts
import { CHAR } from './constants';

function isWall(map: string[][], x: number, y: number): boolean {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return true;
  return map[y][x] === CHAR.WALL;
}

function isBoxOnTarget(map: string[][], x: number, y: number): boolean {
  return map[y]?.[x] === CHAR.BOX_ON_TARGET;
}

function isCornerDeadlock(map: string[][], x: number, y: number): boolean {
  if (isBoxOnTarget(map, x, y)) return false;

  const dirs = [
    { up: true, left: true },
    { up: true, right: true },
    { down: true, left: true },
    { down: true, right: true },
  ];

  for (const dir of dirs) {
    const wallUp = dir.up && isWall(map, x, y - 1);
    const wallDown = dir.down && isWall(map, x, y + 1);
    const wallLeft = dir.left && isWall(map, x - 1, y);
    const wallRight = dir.right && isWall(map, x + 1, y);

    if ((wallUp || wallDown) && (wallLeft || wallRight)) {
      return true;
    }
  }

  return false;
}

export function detectDeadlock(map: string[][]): boolean {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const char = map[y][x];
      if (char === CHAR.BOX || char === CHAR.BOX_ON_TARGET) {
        if (isCornerDeadlock(map, x, y)) return true;
      }
    }
  }
  return false;
}
