import { chromium } from '@playwright/test';
import { solveLevel } from '../src/ai/solver';
import { parseAllLevels } from '../src/engine/parser';
import { readFileSync } from 'fs';
import { join } from 'path';

async function captureDemo() {
  console.log('启动浏览器...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    // 读取第一关并求解
    console.log('求解第一关...');
    const mapsPath = join(process.cwd(), 'public', 'maps.txt');
    const mapsContent = readFileSync(mapsPath, 'utf-8');
    const levels = parseAllLevels(mapsContent);
    const level = levels[0];
    // 打印关卡数据
    console.log('关卡地图:');
    for (let y = 0; y < level.map.length; y++) {
      let row = '';
      for (let x = 0; x < level.map[y].length; x++) {
        row += level.map[y][x];
      }
      console.log(y.toString().padStart(2), row);
    }

    // 找玩家位置
    for (let y = 0; y < level.map.length; y++) {
      for (let x = 0; x < level.map[y].length; x++) {
        if (level.map[y][x] === '@' || level.map[y][x] === '+') {
          console.log(`找到玩家 @ 在 (${x}, ${y})`);
        }
      }
    }

    const solution = await solveLevel(level);

    if (!solution) {
      console.log('第一关求解失败');
      await browser.close();
      return;
    }

    console.log('第一关求解成功，步数:', solution.steps);
    console.log('移动序列:', solution.moves.join(', '));

    // 打开游戏页面
    console.log('打开游戏页面...');
    await page.goto('http://localhost:4173'); // 预览模式端口
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 监听浏览器控制台
    page.on('console', msg => console.log('[Browser]', msg.text()));
    page.on('pageerror', err => console.error('[Browser Error]', err));

    // 截图初始状态
    console.log('截图初始状态...');
    await page.screenshot({ path: 'demo-start.png', fullPage: true });

    // 点击AI求解按钮（通过按P键）
    console.log('按P键触发自求解...');
    await page.keyboard.press('p');
    console.log('已按P键');

    // 等待弹窗出现并点击"开始求解"
    console.log('等待弹窗并点击开始求解...');
    await page.waitForTimeout(2000); // 增加等待时间
    await page.click('button:has-text("开始求解")');
    console.log('已点击开始求解');

    // 等待求解完成（求解成功弹窗出现）
    console.log('等待求解完成...');
    await page.waitForSelector('text=求解成功', { timeout: 30000 });
    console.log('求解成功，点击自动演示...');

    // 点击"自动演示"按钮
    await page.click('button:has-text("自动演示")');
    console.log('已点击自动演示');

    // 等待更长时间确保演示完成
    const demoTime = solution.steps * 400 + 5000;
    console.log(`等待演示完成，预计需要 ${demoTime}ms...`);
    await page.waitForTimeout(demoTime);

    // 获取最终步数和推数
    const movesText = await page.locator('text=步数').locator('..').locator('.text-sky-400').textContent().catch(() => 'unknown');
    const pushesText = await page.locator('text=推箱子').locator('..').locator('.text-orange-400').textContent().catch(() => 'unknown');
    console.log(`演示结束 - 步数: ${movesText}, 推数: ${pushesText}`);

    // 截图完成状态
    console.log('截图完成状态...');
    await page.screenshot({ path: 'demo-end.png', fullPage: true });

    console.log('截图已保存: demo-start.png, demo-end.png');

  } catch (error) {
    console.error('测试出错:', error);
    await page.screenshot({ path: 'demo-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

captureDemo();
