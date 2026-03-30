import { solveLevel, createSolverState } from '../src/ai/solver';
import { parseAllLevels } from '../src/engine/parser';
import { readFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('开始调试...');
  const content = readFileSync(join(process.cwd(), 'public', 'maps.txt'), 'utf-8');
  console.log('读取地图文件成功');
  const levels = parseAllLevels(content);
  console.log('解析关卡成功，关卡数:', levels.length);
  const level = levels[0];

  console.log('地图 (带坐标):');
  for (let y = 0; y < level.map.length; y++) {
    const row = level.map[y];
    let display = y.toString().padStart(2) + ' ';
    for (let x = 0; x < row.length; x++) {
      display += row[x];
    }
    console.log(display);
  }

  // 详细检查第7、8、9行
  console.log('\n第7行详细:');
  const row7 = level.map[7];
  for (let x = 0; x < row7.length; x++) {
    if (row7[x] !== ' ') {
      console.log(`  位置 (${x}, 7): '${row7[x]}'`);
    }
  }
  console.log('\n第8行详细:');
  const row8 = level.map[8];
  for (let x = 0; x < row8.length; x++) {
    if (row8[x] !== ' ') {
      console.log(`  位置 (${x}, 8): '${row8[x]}'`);
    }
  }
  console.log('\n第9行详细:');
  const row9 = level.map[9];
  for (let x = 0; x < row9.length; x++) {
    if (row9[x] !== ' ') {
      console.log(`  位置 (${x}, 9): '${row9[x]}'`);
    }
  }

  console.log('\n玩家周围:');
  const px = 8, py = 8;
  console.log(`  上 (${px}, ${py-1}): '${level.map[py-1][px]}'`);
  console.log(`  下 (${px}, ${py+1}): '${level.map[py+1][px]}'`);
  console.log(`  左 (${px-1}, ${py}): '${level.map[py][px-1]}'`);
  console.log(`  右 (${px+1}, ${py}): '${level.map[py][px+1]}'`);
  let playerPos = { x: 0, y: 0 };
  for (let y = 0; y < level.map.length; y++) {
    for (let x = 0; x < level.map[y].length; x++) {
      const char = level.map[y][x];
      if (char === '@' || char === '+') {
        playerPos = { x, y };
        console.log(`找到玩家 @ (${char}) 在 (${x}, ${y})`);
      }
    }
  }

  console.log('创建求解器状态...');
  const initialState = createSolverState(level.map, playerPos);
  console.log('初始状态:');
  console.log('  玩家:', initialState.player);
  console.log('  箱子:', initialState.boxes);

  console.log('开始求解...');
  const solution = await solveLevel(level);
  console.log('解:', solution);
}

main();
console.log('脚本结束');
