// scripts/debug-solver-detailed.ts
import { solveLevel, createSolverState } from '../src/ai/solver';
import { parseAllLevels } from '../src/engine/parser';
import { readFileSync } from 'fs';
import { join } from 'path';

// 重新实现关键函数来调试
const CHAR = {
  EMPTY: ' ',
  WALL: '#',
  TARGET: '.',
  BOX: '$',
  PLAYER: '@',
  BOX_ON_TARGET: '*',
  PLAYER_ON_TARGET: '+',
};

const DIRECTION_OFFSET: Record<string, { x: number; y: number }> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

function isWall(map: string[][], x: number, y: number): boolean {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) {
    return true;
  }
  return map[y][x] === CHAR.WALL;
}

// BFS查找玩家可以到达的所有位置
function findAllReachablePositions(
  playerPos: { x: number; y: number },
  boxes: { x: number; y: number }[],
  map: string[][]
): Set<string> {
  const boxSet = new Set(boxes.map(b => `${b.x},${b.y}`));
  const visited = new Set<string>();
  const queue: { x: number; y: number }[] = [playerPos];
  visited.add(`${playerPos.x},${playerPos.y}`);

  const directions: string[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

  while (queue.length > 0) {
    const pos = queue.shift()!;

    for (const dir of directions) {
      const offset = DIRECTION_OFFSET[dir];
      const newPos = {
        x: pos.x + offset.x,
        y: pos.y + offset.y,
      };

      const key = `${newPos.x},${newPos.y}`;
      if (visited.has(key)) continue;
      if (isWall(map, newPos.x, newPos.y)) continue;
      if (boxSet.has(key)) continue;

      visited.add(key);
      queue.push(newPos);
    }
  }

  return visited;
}

// 查找所有可能的推箱子动作
function findAllPossiblePushesDebug(
  state: { player: { x: number; y: number }; boxes: { x: number; y: number }[] },
  map: string[][]
): Array<{ direction: string; boxIndex: number; boxPos: { x: number; y: number }; pushPos: { x: number; y: number } }> {
  const actions: Array<{ direction: string; boxIndex: number; boxPos: { x: number; y: number }; pushPos: { x: number; y: number } }> = [];
  const directions: string[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

  // 找到玩家可以到达的所有位置
  const reachable = findAllReachablePositions(state.player, state.boxes, map);
  console.log('  玩家可到达位置数:', reachable.size);
  console.log('  玩家可到达位置:', Array.from(reachable).slice(0, 10), '...');

  for (let i = 0; i < state.boxes.length; i++) {
    const box = state.boxes[i];
    console.log(`\n  检查箱子 ${i} 在 (${box.x}, ${box.y})`);

    for (const dir of directions) {
      const offset = DIRECTION_OFFSET[dir];

      // 推箱子需要从箱子反方向的位置推
      const pushPos = {
        x: box.x - offset.x,
        y: box.y - offset.y,
      };

      // 箱子新位置
      const boxNewPos = {
        x: box.x + offset.x,
        y: box.y + offset.y,
      };

      console.log(`    方向 ${dir}: 推位置 (${pushPos.x}, ${pushPos.y}), 箱子新位置 (${boxNewPos.x}, ${boxNewPos.y})`);

      // 检查玩家是否能到达推的位置
      const canReach = reachable.has(`${pushPos.x},${pushPos.y}`);
      console.log(`      玩家能到达推位置? ${canReach}`);
      if (!canReach) continue;

      // 检查箱子新位置是否有效
      const newPosIsWall = isWall(map, boxNewPos.x, boxNewPos.y);
      console.log(`      新位置是墙? ${newPosIsWall}`);
      if (newPosIsWall) continue;

      // 检查是否撞到其他箱子
      const hitOtherBox = state.boxes.some(
        (b, idx) => idx !== i && b.x === boxNewPos.x && b.y === boxNewPos.y
      );
      console.log(`      撞其他箱子? ${hitOtherBox}`);
      if (hitOtherBox) continue;

      console.log(`      -> 有效动作: ${dir}`);
      actions.push({ direction: dir, boxIndex: i, boxPos: box, pushPos });
    }
  }

  return actions;
}

async function main() {
  console.log('=== 详细调试求解器 ===\n');
  const content = readFileSync(join(process.cwd(), 'public', 'maps.txt'), 'utf-8');
  const levels = parseAllLevels(content);
  const level = levels[0];

  console.log('地图:');
  for (let y = 0; y < level.map.length; y++) {
    console.log(y.toString().padStart(2), level.map[y].join(''));
  }

  // 从地图找玩家位置
  let playerPos = { x: 0, y: 0 };
  for (let y = 0; y < level.map.length; y++) {
    for (let x = 0; x < level.map[y].length; x++) {
      const char = level.map[y][x];
      if (char === '@' || char === '+') {
        playerPos = { x, y };
      }
    }
  }

  console.log('\n玩家位置:', playerPos);
  console.log('玩家周围:', {
    up: level.map[playerPos.y - 1][playerPos.x],
    down: level.map[playerPos.y + 1][playerPos.x],
    left: level.map[playerPos.y][playerPos.x - 1],
    right: level.map[playerPos.y][playerPos.x + 1],
  });

  const initialState = createSolverState(level.map, playerPos);
  console.log('\n初始状态:');
  console.log('  玩家:', initialState.player);
  console.log('  箱子:', initialState.boxes);

  console.log('\n=== 查找初始可行动作 ===');
  const actions = findAllPossiblePushesDebug(initialState, level.map);
  console.log('\n=== 初始可行动作 ===');
  console.log(actions);

  console.log('\n=== 求解 ===');
  const solution = await solveLevel(level);
  console.log('解:', solution);
}

main();
