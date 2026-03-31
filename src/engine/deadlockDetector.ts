// src/engine/deadlockDetector.ts
import { CHAR } from './constants';

function isWall(map: string[][], x: number, y: number): boolean {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return true;
  return map[y][x] === CHAR.WALL;
}

function isBox(map: string[][], x: number, y: number): boolean {
  const char = map[y]?.[x];
  return char === CHAR.BOX || char === CHAR.BOX_ON_TARGET;
}

function isBoxOnTarget(map: string[][], x: number, y: number): boolean {
  return map[y]?.[x] === CHAR.BOX_ON_TARGET;
}

// 检查角落死锁：箱子卡在角落且角落不是目标点
function isCornerDeadlock(map: string[][], x: number, y: number): boolean {
  if (isBoxOnTarget(map, x, y)) return false;

  const up = isWall(map, x, y - 1);
  const down = isWall(map, x, y + 1);
  const left = isWall(map, x - 1, y);
  const right = isWall(map, x + 1, y);

  // 角落：两个相邻方向是墙
  return (up && left) || (up && right) || (down && left) || (down && right);
}

// 检查边线死锁：箱子在墙边且墙不是目标，且对面也是墙或箱子
function isWallDeadlock(map: string[][], x: number, y: number): boolean {
  if (isBoxOnTarget(map, x, y)) return false;

  const up = isWall(map, x, y - 1);
  const down = isWall(map, x, y + 1);
  const left = isWall(map, x - 1, y);
  const right = isWall(map, x + 1, y);
  const upBox = isBox(map, x, y - 1);
  const downBox = isBox(map, x, y + 1);
  const leftBox = isBox(map, x - 1, y);
  const rightBox = isBox(map, x + 1, y);

  // 水平墙边死锁：上下都是墙或箱子
  if ((up || upBox) && (down || downBox)) return true;
  // 垂直墙边死锁：左右都是墙或箱子
  if ((left || leftBox) && (right || rightBox)) return true;

  return false;
}

// 检查双箱死锁：两个箱子并排卡在墙边
function isDoubleBoxDeadlock(map: string[][], x: number, y: number): boolean {
  if (isBoxOnTarget(map, x, y)) return false;

  // 检查水平相邻箱子
  if (isBox(map, x + 1, y) && !isBoxOnTarget(map, x + 1, y)) {
    const up1 = isWall(map, x, y - 1);
    const up2 = isWall(map, x + 1, y - 1);
    const down1 = isWall(map, x, y + 1);
    const down2 = isWall(map, x + 1, y + 1);

    // 两个箱子上方或下方都是墙，形成死锁
    if ((up1 && up2) || (down1 && down2)) return true;
  }

  // 检查垂直相邻箱子
  if (isBox(map, x, y + 1) && !isBoxOnTarget(map, x, y + 1)) {
    const left1 = isWall(map, x - 1, y);
    const left2 = isWall(map, x - 1, y + 1);
    const right1 = isWall(map, x + 1, y);
    const right2 = isWall(map, x + 1, y + 1);

    // 两个箱子左方或右方都是墙，形成死锁
    if ((left1 && left2) || (right1 && right2)) return true;
  }

  return false;
}

export function detectDeadlock(map: string[][]): boolean {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const char = map[y][x];
      if (char === CHAR.BOX || char === CHAR.BOX_ON_TARGET) {
        // 检查角落死锁
        if (isCornerDeadlock(map, x, y)) return true;
        // 检查边线死锁
        if (isWallDeadlock(map, x, y)) return true;
        // 检查双箱死锁
        if (isDoubleBoxDeadlock(map, x, y)) return true;
      }
    }
  }
  return false;
}
