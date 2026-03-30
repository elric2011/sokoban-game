import { solveLevel, createSolverState, type Solution } from '../src/ai/solver';
import { parseAllLevels } from '../src/engine/parser';
import { readFileSync } from 'fs';
import { join } from 'path';

async function testAllLevels() {
  // 读取关卡文件
  const mapsPath = join(process.cwd(), 'public', 'maps.txt');
  const mapsContent = readFileSync(mapsPath, 'utf-8');
  const levels = parseAllLevels(mapsContent);

  console.log(`共加载 ${levels.length} 个关卡\n`);
  console.log('关卡 | 状态 | 步数 | 推数 | 时间(ms) | 备注');
  console.log('-----|------|------|------|----------|------');

  let passed = 0;
  let failed = 0;
  const results: Array<{
    level: number;
    status: string;
    steps: number;
    pushes: number;
    time: number;
    note: string;
  }> = [];

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    // 第18关使用30秒超时，其他使用20秒
    const timeoutMs = i === 17 ? 30000 : 20000;
    const startTime = Date.now();

    try {
      // 设置超时
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
      });

      const solutionPromise = solveLevel(level);
      const solution = await Promise.race([solutionPromise, timeoutPromise]) as Solution | null;

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (solution) {
        passed++;
        results.push({
          level: i + 1,
          status: '通过',
          steps: solution.steps,
          pushes: solution.pushes,
          time: duration,
          note: ''
        });
        console.log(`${String(i + 1).padStart(4)} | 通过 | ${String(solution.steps).padStart(4)} | ${String(solution.pushes).padStart(4)} | ${String(duration).padStart(8)} |`);
      } else {
        failed++;
        results.push({
          level: i + 1,
          status: '无解',
          steps: 0,
          pushes: 0,
          time: duration,
          note: '返回null'
        });
        console.log(`${String(i + 1).padStart(4)} | 无解 |    - |    - | ${String(duration).padStart(8)} | 返回null`);
      }
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (error.message === 'TIMEOUT') {
        failed++;
        results.push({
          level: i + 1,
          status: '超时',
          steps: 0,
          pushes: 0,
          time: timeoutMs,
          note: `超过${timeoutMs/1000}秒`
        });
        console.log(`${String(i + 1).padStart(4)} | 超时 |    - |    - | ${String(duration).padStart(8)} | 超过${timeoutMs/1000}秒`);
      } else {
        failed++;
        results.push({
          level: i + 1,
          status: '错误',
          steps: 0,
          pushes: 0,
          time: duration,
          note: error.message
        });
        console.log(`${String(i + 1).padStart(4)} | 错误 |    - |    - | ${String(duration).padStart(8)} | ${error.message}`);
      }
    }
  }

  console.log('\n-----|------|------|------|----------|------');
  console.log(`总计 | ${String(passed).padStart(2)}关 | 通过: ${passed}, 失败: ${failed}`);

  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
  const maxTime = Math.max(...results.map(r => r.time));
  const minTime = Math.min(...results.map(r => r.time));

  console.log(`\n统计信息:`);
  console.log(`  平均求解时间: ${avgTime.toFixed(0)}ms`);
  console.log(`  最长求解时间: ${maxTime}ms`);
  console.log(`  最短求解时间: ${minTime}ms`);

  process.exit(failed > 0 ? 1 : 0);
}

testAllLevels();
