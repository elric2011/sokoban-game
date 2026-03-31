import { solveLevel, type Solution } from '../src/ai/solver';
import { parseAllLevels } from '../src/engine/parser';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

interface TestResult {
  level: number;
  status: '通过' | '无解' | '超时' | '错误';
  steps: number;
  pushes: number;
  time: number;
  note: string;
}

function generateMarkdownReport(results: TestResult[], passed: number, failed: number) {
  const passedResults = results.filter(r => r.status === '通过');
  const avgTime = passedResults.length > 0
    ? passedResults.reduce((sum, r) => sum + r.time, 0) / passedResults.length
    : 0;
  const maxTime = passedResults.length > 0 ? Math.max(...passedResults.map(r => r.time)) : 0;
  const minTime = passedResults.length > 0 ? Math.min(...passedResults.map(r => r.time)) : 0;

  const markdown = `# AI Solver 测试报告

生成时间：${new Date().toLocaleString('zh-CN')}

## 总览

- **总关卡数**: ${results.length}
- **通过**: ${passed} (${(passed/results.length*100).toFixed(1)}%)
- **失败**: ${failed} (${(failed/results.length*100).toFixed(1)}%)

## 详细结果

| 关卡 | 状态 | 步数 | 推数 | 时间 (ms) | 备注 |
|------|------|------|------|-----------|------|
${results.map(r => `| ${r.level} | ${r.status} | ${r.steps || '-'} | ${r.pushes || '-'} | ${r.time} | ${r.note} |`).join('\n')}

## 统计信息

- 平均求解时间：${avgTime.toFixed(0)}ms
- 最长求解时间：${maxTime}ms
- 最短求解时间：${minTime}ms
`;

  return markdown;
}

async function testAllLevels(options: { outputReport?: boolean } = {}) {
  // 读取关卡文件
  const mapsPath = join(process.cwd(), 'public', 'maps.txt');
  const mapsContent = readFileSync(mapsPath, 'utf-8');
  const levels = parseAllLevels(mapsContent);

  const log = (msg: string) => process.stdout.write(msg + '\n');

  log(`共加载 ${levels.length} 个关卡\n`);
  log('关卡 | 状态 | 步数 | 推数 | 时间 (ms) | 备注');
  log('-----|------|------|------|----------|------');

  let passed = 0;
  let failed = 0;
  const results: TestResult[] = [];

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    // 第 18 关使用 30 秒超时，其他使用 20 秒
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
        log(`${String(i + 1).padStart(4)} | 通过 | ${String(solution.steps).padStart(4)} | ${String(solution.pushes).padStart(4)} | ${String(duration).padStart(8)} |`);
      } else {
        failed++;
        results.push({
          level: i + 1,
          status: '无解',
          steps: 0,
          pushes: 0,
          time: duration,
          note: '返回 null'
        });
        log(`${String(i + 1).padStart(4)} | 无解 |    - |    - | ${String(duration).padStart(8)} | 返回 null`);
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
        log(`${String(i + 1).padStart(4)} | 超时 |    - |    - | ${String(duration).padStart(8)} | 超过${timeoutMs/1000}秒`);
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
        log(`${String(i + 1).padStart(4)} | 错误 |    - |    - | ${String(duration).padStart(8)} | ${error.message}`);
      }
    }
  }

  log('');
  log('-----|------|------|------|----------|------');
  log(`总计 | ${String(passed).padStart(2)}关 | 通过：${passed}, 失败：${failed}`);

  const passedResults = results.filter(r => r.status === '通过');
  const avgTime = passedResults.length > 0
    ? passedResults.reduce((sum, r) => sum + r.time, 0) / passedResults.length
    : 0;
  const maxTime = passedResults.length > 0 ? Math.max(...passedResults.map(r => r.time)) : 0;
  const minTime = passedResults.length > 0 ? Math.min(...passedResults.map(r => r.time)) : 0;

  log(`\n统计信息:`);
  log(`  平均求解时间：${avgTime.toFixed(0)}ms`);
  log(`  最长求解时间：${maxTime}ms`);
  log(`  最短求解时间：${minTime}ms`);

  // 生成 Markdown 报告
  if (options?.outputReport) {
    const reportPath = join(process.cwd(), 'reports', 'ai-solver-report.md');

    try {
      mkdirSync(dirname(reportPath), { recursive: true });
      const markdown = generateMarkdownReport(results, passed, failed);
      writeFileSync(reportPath, markdown);
      log(`\n测试报告已生成：${reportPath}`);
    } catch (e) {
      log('生成报告失败:' + e);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

testAllLevels({ outputReport: process.argv.includes('--report') });
