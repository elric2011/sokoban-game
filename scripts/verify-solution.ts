// scripts/verify-solution.ts
import { solveLevel, createSolverState, findPlayerPosition, type Direction } from '../src/ai/solver';
import { parseAllLevels } from '../src/engine/parser';
import { readFileSync } from 'fs';
import { join } from 'path';

const CHAR = {
  EMPTY: ' ',
  WALL: '#',
  TARGET: '.',
  BOX: '$',
  PLAYER: '@',
  BOX_ON_TARGET: '*',
  PLAYER_ON_TARGET: '+',
};

const DIRECTION_OFFSET: Record<Direction, { x: number; y: number }> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// 模拟执行解决方案
function simulateSolution(
  map: string[][],
  moves: Direction[]
): { success: boolean; error?: string; finalMap?: string[][] } {
  // 深拷贝地图
  let currentMap = map.map(row => [...row]);

  // 找玩家位置
  let playerPos = { x: 0, y: 0 };
  for (let y = 0; y < currentMap.length; y++) {
    for (let x = 0; x < currentMap[y].length; x++) {
      const char = currentMap[y][x];
      if (char === '@' || char === '+') {
        playerPos = { x, y };
      }
    }
  }

  console.log('初始玩家位置:', playerPos);

  for (let i = 0; i < moves.length; i++) {
    const dir = moves[i];
    const offset = DIRECTION_OFFSET[dir];
    const newPos = {
      x: playerPos.x + offset.x,
      y: playerPos.y + offset.y
    };

    console.log(`\n步骤 ${i + 1}: ${dir}`);
    console.log('  玩家:', playerPos, '->', newPos);

    // 检查边界
    if (newPos.y < 0 || newPos.y >= currentMap.length ||
        newPos.x < 0 || newPos.x >= currentMap[0].length) {
      return { success: false, error: `步骤 ${i + 1}: 移出边界` };
    }

    const targetChar = currentMap[newPos.y][newPos.x];
    console.log('  目标位置字符:', targetChar);

    // 检查是否撞墙
    if (targetChar === '#') {
      return { success: false, error: `步骤 ${i + 1}: 撞墙` };
    }

    // 检查是否推箱子
    if (targetChar === '$' || targetChar === '*') {
      const boxNewPos = {
        x: newPos.x + offset.x,
        y: newPos.y + offset.y
      };

      // 检查箱子新位置
      if (boxNewPos.y < 0 || boxNewPos.y >= currentMap.length ||
          boxNewPos.x < 0 || boxNewPos.x >= currentMap[0].length) {
        return { success: false, error: `步骤 ${i + 1}: 箱子移出边界` };
      }

      const boxTargetChar = currentMap[boxNewPos.y][boxNewPos.x];
      console.log('  箱子新位置字符:', boxTargetChar);

      if (boxTargetChar === '#' || boxTargetChar === '$' || boxTargetChar === '*') {
        return { success: false, error: `步骤 ${i + 1}: 无法推箱子` };
      }

      // 移动箱子
      const isTarget = boxTargetChar === '.' || boxTargetChar === '+';
      currentMap[boxNewPos.y][boxNewPos.x] = isTarget ? '*' : '$';

      // 更新原箱子位置
      const wasOnTarget = targetChar === '*';
      currentMap[newPos.y][newPos.x] = wasOnTarget ? '.' : ' ';

      console.log('  推箱子:', newPos, '->', boxNewPos);
    }

    // 移动玩家
    const isTarget = targetChar === '.' || targetChar === '*' || targetChar === '+';

    // 更新原玩家位置
    const playerWasOnTarget = currentMap[playerPos.y][playerPos.x] === '+';
    currentMap[playerPos.y][playerPos.x] = playerWasOnTarget ? '.' : ' ';

    // 更新新玩家位置
    currentMap[newPos.y][newPos.x] = isTarget ? '+' : '@';

    playerPos = newPos;

    // 打印当前状态
    console.log('  地图状态:');
    for (let y = 4; y <= 11; y++) {
      console.log('    ' + currentMap[y].slice(4, 12).join(''));
    }
  }

  // 检查是否完成
  let allBoxesOnTargets = true;
  for (let y = 0; y < currentMap.length; y++) {
    for (let x = 0; x < currentMap[y].length; x++) {
      if (currentMap[y][x] === '$') {
        allBoxesOnTargets = false;
        break;
      }
    }
  }

  return { success: allBoxesOnTargets, finalMap: currentMap };
}

async function main() {
  console.log('=== 验证求解器解决方案 ===\n');

  const content = readFileSync(join(process.cwd(), 'public', 'maps.txt'), 'utf-8');
  const levels = parseAllLevels(content);
  const level = levels[0];

  console.log('原始地图:');
  for (let y = 4; y <= 11; y++) {
    console.log(level.map[y].slice(4, 12).join(''));
  }

  const solution = await solveLevel(level);

  if (!solution) {
    console.log('求解失败');
    return;
  }

  console.log('\n求解成功!');
  console.log('  移动序列:', solution.moves);
  console.log('  总步数:', solution.steps);
  console.log('  推次数:', solution.pushes);

  console.log('\n=== 模拟执行 ===');
  const result = simulateSolution(level.map, solution.moves);

  if (result.success) {
    console.log('\n✓ 解决方案验证成功！');
  } else {
    console.log('\n✗ 解决方案验证失败:', result.error);
  }
}

main();
