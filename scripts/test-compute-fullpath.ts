// scripts/test-compute-fullpath.ts
import { solveLevel, createSolverState, findPlayerPosition, type SolverState, type Direction } from '../src/ai/solver';
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

// 模拟 computeFullPath 的逻辑
function simulateComputeFullPath(
  initialState: SolverState,
  pushMoves: Direction[],
  map: string[][]
): { success: boolean; path: Direction[]; error?: string } {
  const fullPath: Direction[] = [];
  let currentPlayer = { ...initialState.player };
  let currentBoxes = [...initialState.boxes];

  console.log('初始状态:');
  console.log('  玩家:', currentPlayer);
  console.log('  箱子:', currentBoxes);
  console.log('  推序列:', pushMoves);

  for (let i = 0; i < pushMoves.length; i++) {
    const pushDir = pushMoves[i];
    const offset = DIRECTION_OFFSET[pushDir];

    // 箱子应该在玩家推的方向上
    const boxPos = {
      x: currentPlayer.x + offset.x,
      y: currentPlayer.y + offset.y
    };

    console.log(`\n步骤 ${i + 1}: 推 ${pushDir}`);
    console.log('  当前玩家:', currentPlayer);
    console.log('  期望箱子在:', boxPos);
    console.log('  当前箱子:', currentBoxes);

    // 找到箱子
    const boxIndex = currentBoxes.findIndex(b =>
      b.x === boxPos.x && b.y === boxPos.y
    );

    if (boxIndex === -1) {
      return {
        success: false,
        path: fullPath,
        error: `步骤 ${i + 1}: 找不到箱子在 (${boxPos.x}, ${boxPos.y})`
      };
    }

    // 执行推箱子
    fullPath.push(pushDir);

    // 更新状态
    const box = currentBoxes[boxIndex];
    const newBoxes = [...currentBoxes];
    newBoxes[boxIndex] = { x: box.x + offset.x, y: box.y + offset.y };
    newBoxes.sort((a, b) => a.y - b.y || a.x - b.x);
    currentPlayer = { x: box.x, y: box.y };
    currentBoxes = newBoxes;

    console.log('  推成功，新玩家位置:', currentPlayer);
    console.log('  新箱子位置:', currentBoxes);
  }

  return { success: true, path: fullPath };
}

async function main() {
  console.log('=== 测试 computeFullPath 逻辑 ===\n');

  const content = readFileSync(join(process.cwd(), 'public', 'maps.txt'), 'utf-8');
  const levels = parseAllLevels(content);
  const level = levels[0];

  console.log('地图:');
  for (let y = 0; y < level.map.length; y++) {
    console.log(y.toString().padStart(2), level.map[y].join(''));
  }

  // 找玩家位置
  let playerPos = { x: 0, y: 0 };
  const boxes: { x: number; y: number }[] = [];
  for (let y = 0; y < level.map.length; y++) {
    for (let x = 0; x < level.map[y].length; x++) {
      const char = level.map[y][x];
      if (char === '@' || char === '+') {
        playerPos = { x, y };
      }
      if (char === '$' || char === '*') {
        boxes.push({ x, y });
      }
    }
  }

  console.log('\n实际地图上的玩家位置:', playerPos);
  console.log('实际地图上的箱子位置:', boxes);

  const initialState = createSolverState(level.map, playerPos);
  console.log('\ncreateSolverState 返回:');
  console.log('  玩家:', initialState.player);
  console.log('  箱子:', initialState.boxes);

  console.log('\n=== 运行求解器 ===');
  const solution = await solveLevel(level);

  if (!solution) {
    console.log('求解失败');
    return;
  }

  console.log('求解成功!');
  console.log('  推箱子方向:', solution.moves);

  console.log('\n=== 测试 computeFullPath 逻辑 ===');
  const result = simulateComputeFullPath(initialState, solution.moves, level.map);

  if (result.success) {
    console.log('\n✓ 路径重构成功!');
    console.log('  完整路径:', result.path);
  } else {
    console.log('\n✗ 路径重构失败:', result.error);
  }
}

main();
