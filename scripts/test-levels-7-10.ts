import { solveLevel, createSolverState } from '../src/ai/solver';
import { parseAllLevels } from '../src/engine/parser';
import { readFileSync } from 'fs';
import { join } from 'path';

async function testLevel(levelNum: number) {
  const mapsPath = join(process.cwd(), 'public', 'maps.txt');
  const mapsContent = readFileSync(mapsPath, 'utf-8');
  const levels = parseAllLevels(mapsContent);

  const level = levels[levelNum - 1];
  console.log(`测试第${levelNum}关...`);
  console.log('地图:');
  for (const row of level.map) {
    console.log(row.join(''));
  }
  console.log('');

  const startTime = Date.now();

  try {
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), 30000);
    });

    const solutionPromise = solveLevel(level);
    const solution = await Promise.race([solutionPromise, timeoutPromise]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (solution) {
      console.log(`求解成功!`);
      console.log(`  时间: ${duration}ms`);
      console.log(`  步数: ${solution.steps}`);
      console.log(`  推数: ${solution.pushes}`);
    } else {
      console.log(`无解 (返回null)`);
    }
  } catch (error: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`超时! 用时: ${duration}ms`);
  }
}

// 测试第7和第10关
testLevel(7);
console.log('\n---\n');
testLevel(10);
