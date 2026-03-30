import { solveLevel, createSolverState } from '../src/ai/solver';
import { parseAllLevels } from '../src/engine/parser';
import { readFileSync } from 'fs';
import { join } from 'path';

async function main() {
  const content = readFileSync(join(process.cwd(), 'public', 'maps.txt'), 'utf-8');
  const levels = parseAllLevels(content);
  const level = levels[0];

  // 模拟 solveLevel 中的初始状态计算
  let playerPos = { x: 0, y: 0 };
  for (let y = 0; y < level.map.length; y++) {
    for (let x = 0; x < level.map[y].length; x++) {
      const char = level.map[y][x];
      if (char === '@' || char === '+') {
        playerPos = { x, y };
      }
    }
  }

  console.log('玩家位置:', playerPos);

  const state = createSolverState(level.map, playerPos);
  console.log('初始状态:', state);

  const solution = await solveLevel(level);
  console.log('解:', solution);
}

main();
