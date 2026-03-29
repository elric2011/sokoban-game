# Sokoban 推箱子游戏测试方案

## 1. 测试概述

### 测试目标
确保游戏的各个功能模块正常工作，包括关卡解析、游戏逻辑、UI交互、响应式适配等。

### 测试范围
- 单元测试：核心算法和逻辑
- 集成测试：组件交互和状态管理
- 端到端测试：用户操作流程
- 手动测试：UI/UX 和边界情况

### 测试工具
- **单元测试**: Vitest + @testing-library/react
- **E2E测试**: Playwright
- **手动测试**: 浏览器开发者工具

---

## 2. 单元测试

### 2.1 关卡解析器测试 (parser.test.ts)

```typescript
import { describe, it, expect } from 'vitest';
import { parseLevel, parseAllLevels, findPlayerPosition, cloneMap } from './parser';
import { CHAR } from './constants';

describe('parseLevel', () => {
  it('应将 0 转换为空格', () => {
    const lines = ['0000', '0#@0', '0000'];
    const level = parseLevel(lines, 1);
    expect(level.map[1][1]).toBe(CHAR.WALL);
    expect(level.map[1][2]).toBe(CHAR.PLAYER);
    expect(level.map[0][0]).toBe(CHAR.EMPTY);
  });

  it('应正确解析完整关卡', () => {
    const lines = [
      '####',
      '#@ #',
      '#.$#',
      '####'
    ];
    const level = parseLevel(lines, 1);
    expect(level.width).toBe(16); // 固定尺寸
    expect(level.height).toBe(16);
    expect(level.id).toBe(1);
  });
});

describe('parseAllLevels', () => {
  it('应解析所有 18 个关卡', () => {
    const rawText = fs.readFileSync('public/maps.txt', 'utf-8');
    const levels = parseAllLevels(rawText);
    expect(levels.length).toBe(18);
  });

  it('每个关卡应有玩家起始位置', () => {
    const levels = parseAllLevels(rawText);
    levels.forEach(level => {
      const pos = findPlayerPosition(level.map);
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.y).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('cloneMap', () => {
  it('应创建地图的深拷贝', () => {
    const original = [['#', '@'], [' ', '$']];
    const cloned = cloneMap(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    cloned[0][0] = 'X';
    expect(original[0][0]).toBe('#');
  });
});
```

### 2.2 死锁检测测试 (deadlockDetector.test.ts)

```typescript
import { describe, it, expect } from 'vitest';
import { detectDeadlock } from './deadlockDetector';
import { CHAR } from './constants';

describe('detectDeadlock', () => {
  it('应检测到角落死锁', () => {
    const map = [
      [CHAR.WALL, CHAR.WALL, CHAR.WALL],
      [CHAR.WALL, CHAR.BOX, CHAR.WALL],  // 箱子在角落
      [CHAR.WALL, CHAR.WALL, CHAR.WALL]
    ];
    expect(detectDeadlock(map)).toBe(true);
  });

  it('不应检测目标点上的箱子为死锁', () => {
    const map = [
      [CHAR.WALL, CHAR.WALL, CHAR.WALL],
      [CHAR.WALL, CHAR.BOX_ON_TARGET, CHAR.WALL],
      [CHAR.WALL, CHAR.WALL, CHAR.WALL]
    ];
    expect(detectDeadlock(map)).toBe(false);
  });

  it('不应检测正常位置的箱子为死锁', () => {
    const map = [
      [CHAR.WALL, CHAR.WALL, CHAR.WALL],
      [CHAR.WALL, CHAR.BOX, CHAR.EMPTY],  // 右边是空的
      [CHAR.WALL, CHAR.EMPTY, CHAR.EMPTY]
    ];
    expect(detectDeadlock(map)).toBe(false);
  });

  it('应检测 L 形墙角死锁', () => {
    const map = [
      [CHAR.WALL, CHAR.WALL, CHAR.EMPTY],
      [CHAR.WALL, CHAR.BOX, CHAR.EMPTY],  // 左上都是墙
      [CHAR.EMPTY, CHAR.EMPTY, CHAR.EMPTY]
    ];
    expect(detectDeadlock(map)).toBe(true);
  });
});
```

### 2.3 Reducer 测试 (reducer.test.ts)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { gameReducer, initState } from './reducer';
import { CHAR } from './constants';
import type { LevelData, State } from '../types/game';

describe('gameReducer', () => {
  let initialState: State;

  beforeEach(() => {
    const levelData: LevelData = {
      id: 1,
      width: 5,
      height: 5,
      map: [
        [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
        [CHAR.WALL, CHAR.PLAYER, CHAR.EMPTY, CHAR.BOX, CHAR.WALL],
        [CHAR.WALL, CHAR.EMPTY, CHAR.EMPTY, CHAR.TARGET, CHAR.WALL],
        [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
      ]
    };
    initialState = initState(levelData);
  });

  describe('MOVE', () => {
    it('玩家应能移动到空地', () => {
      const state = gameReducer(initialState, { type: 'MOVE', direction: 'DOWN' });
      expect(state.current.playerPos).toEqual({ x: 1, y: 2 });
      expect(state.current.moves).toBe(1);
    });

    it('玩家不应能移动到墙上', () => {
      const state = gameReducer(initialState, { type: 'MOVE', direction: 'LEFT' });
      expect(state.current.playerPos).toEqual({ x: 1, y: 1 }); // 不变
      expect(state.current.moves).toBe(0);
    });

    it('玩家应能推动箱子', () => {
      const state = gameReducer(initialState, { type: 'MOVE', direction: 'RIGHT' });
      expect(state.current.playerPos).toEqual({ x: 2, y: 1 });
      expect(state.current.map[1][3]).toBe(CHAR.BOX); // 箱子被推到右边
      expect(state.current.pushes).toBe(1);
    });

    it('玩家不应能推动两个箱子', () => {
      // 设置地图：玩家-箱子-箱子
      initialState.current.map[1] = [CHAR.WALL, CHAR.PLAYER, CHAR.BOX, CHAR.BOX, CHAR.WALL];
      const state = gameReducer(initialState, { type: 'MOVE', direction: 'RIGHT' });
      expect(state.current.playerPos).toEqual({ x: 1, y: 1 }); // 不变
    });

    it('箱子推到目标点应变为 BOX_ON_TARGET', () => {
      // 玩家右边是箱子，箱子右边是目标点
      initialState.current.map[1] = [CHAR.WALL, CHAR.PLAYER, CHAR.BOX, CHAR.TARGET, CHAR.WALL];
      const state = gameReducer(initialState, { type: 'MOVE', direction: 'RIGHT' });
      expect(state.current.map[1][3]).toBe(CHAR.BOX_ON_TARGET);
    });
  });

  describe('UNDO', () => {
    it('应撤销到上一步', () => {
      const afterMove = gameReducer(initialState, { type: 'MOVE', direction: 'DOWN' });
      const afterUndo = gameReducer(afterMove, { type: 'UNDO' });
      expect(afterUndo.current.playerPos).toEqual(initialState.current.playerPos);
      expect(afterUndo.history.length).toBe(0);
    });

    it('历史为空时不应报错', () => {
      const state = gameReducer(initialState, { type: 'UNDO' });
      expect(state.current).toEqual(initialState.current);
    });

    it('撤销后应重置死锁状态', () => {
      // 制造一个死锁然后撤销
      const state = gameReducer(initialState, { type: 'UNDO' });
      expect(state.isDeadlocked).toBe(false);
    });
  });

  describe('RESTART', () => {
    it('应重置到初始状态', () => {
      const afterMove = gameReducer(initialState, { type: 'MOVE', direction: 'DOWN' });
      const afterRestart = gameReducer(afterMove, { type: 'RESTART' });
      expect(afterRestart.current.playerPos).toEqual(initialState.initial.playerPos);
      expect(afterRestart.history.length).toBe(0);
      expect(afterRestart.isCompleted).toBe(false);
    });
  });

  describe('通关检测', () => {
    it('所有箱子到达目标点应标记通关', () => {
      const levelData: LevelData = {
        id: 1,
        width: 5,
        height: 3,
        map: [
          [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
          [CHAR.WALL, CHAR.PLAYER, CHAR.BOX, CHAR.TARGET, CHAR.WALL],
          [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
        ]
      };
      const state = initState(levelData);
      const afterPush = gameReducer(state, { type: 'MOVE', direction: 'RIGHT' });
      expect(afterPush.isCompleted).toBe(true);
    });
  });

  describe('死锁检测', () => {
    it('箱子进入死角应标记死锁', () => {
      // 制造一个会死锁的地图
      const levelData: LevelData = {
        id: 1,
        width: 5,
        height: 5,
        map: [
          [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
          [CHAR.WALL, CHAR.PLAYER, CHAR.BOX, CHAR.EMPTY, CHAR.WALL],
          [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.EMPTY, CHAR.WALL],
          [CHAR.WALL, CHAR.EMPTY, CHAR.EMPTY, CHAR.EMPTY, CHAR.WALL],
          [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
        ]
      };
      const state = initState(levelData);
      // 玩家向右推箱子，箱子会进入右下角死锁
      const afterPush = gameReducer(state, { type: 'MOVE', direction: 'RIGHT' });
      expect(afterPush.isDeadlocked).toBe(true);
    });
  });
});
```

### 2.4 Hook 测试 (useSokoban.test.tsx)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSokoban } from './useSokoban';

// Mock fetch
global.fetch = vi.fn();

describe('useSokoban', () => {
  const mockMapsText = `
[level]
####
#@ #
#.$#
####
`;

  beforeEach(() => {
    (fetch as any).mockResolvedValue({
      text: () => Promise.resolve(mockMapsText)
    });
  });

  it('应加载关卡文件', async () => {
    const { result } = renderHook(() => useSokoban());

    await waitFor(() => {
      expect(result.current.state).not.toBeNull();
    });

    expect(result.current.totalLevels).toBeGreaterThan(0);
  });

  it('move 应更新状态', async () => {
    const { result } = renderHook(() => useSokoban());

    await waitFor(() => expect(result.current.state).not.toBeNull());

    const initialMoves = result.current.state!.current.moves;

    act(() => {
      result.current.move('DOWN');
    });

    expect(result.current.state!.current.moves).toBe(initialMoves + 1);
  });

  it('undo 应撤销操作', async () => {
    const { result } = renderHook(() => useSokoban());

    await waitFor(() => expect(result.current.state).not.toBeNull());

    const initialPos = result.current.state!.current.playerPos;

    act(() => {
      result.current.move('DOWN');
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.state!.current.playerPos).toEqual(initialPos);
  });

  it('restart 应重置关卡', async () => {
    const { result } = renderHook(() => useSokoban());

    await waitFor(() => expect(result.current.state).not.toBeNull());

    const initialPos = result.current.state!.current.playerPos;

    act(() => {
      result.current.move('DOWN');
      result.current.restart();
    });

    expect(result.current.state!.current.playerPos).toEqual(initialPos);
  });

  it('loadLevel 应切换关卡', async () => {
    const { result } = renderHook(() => useSokoban());

    await waitFor(() => expect(result.current.totalLevels).toBeGreaterThan(1));

    act(() => {
      result.current.loadLevel(2);
    });

    expect(result.current.currentLevelId).toBe(2);
  });

  it('prevLevel 和 nextLevel 应工作', async () => {
    const { result } = renderHook(() => useSokoban());

    await waitFor(() => expect(result.current.totalLevels).toBeGreaterThan(1));

    act(() => {
      result.current.nextLevel();
    });

    expect(result.current.currentLevelId).toBe(2);

    act(() => {
      result.current.prevLevel();
    });

    expect(result.current.currentLevelId).toBe(1);
  });
});
```

---

## 3. 组件测试

### 3.1 GameCanvas 测试 (GameCanvas.test.tsx)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { GameCanvas } from './GameCanvas';
import type { GameState } from '../types/game';
import { CHAR } from '../engine/constants';

describe('GameCanvas', () => {
  const mockGameState: GameState = {
    level: 1,
    map: [
      [CHAR.WALL, CHAR.WALL, CHAR.WALL],
      [CHAR.WALL, CHAR.PLAYER, CHAR.EMPTY],
      [CHAR.WALL, CHAR.WALL, CHAR.WALL],
    ],
    playerPos: { x: 1, y: 1 },
    moves: 0,
    pushes: 0,
  };

  it('应渲染 canvas 元素', () => {
    const { container } = render(<GameCanvas gameState={mockGameState} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('gameState 为 null 时应显示 Loading', () => {
    const { getByText } = render(<GameCanvas gameState={null} />);
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('canvas 应有正确的样式类', () => {
    const { container } = render(<GameCanvas gameState={mockGameState} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveClass('block', 'mx-auto', 'border-2', 'border-slate-600', 'rounded');
  });
});
```

### 3.2 UI 组件测试

```typescript
// TouchControls.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TouchControls } from './TouchControls';

describe('TouchControls', () => {
  const mockHandlers = {
    onDirection: vi.fn(),
    onUndo: vi.fn(),
    onRestart: vi.fn(),
  };

  it('visible=false 时不应渲染', () => {
    const { container } = render(<TouchControls {...mockHandlers} visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('visible=true 时应渲染所有按钮', () => {
    render(<TouchControls {...mockHandlers} visible={true} />);
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('撤销')).toBeInTheDocument();
    expect(screen.getByText('重置')).toBeInTheDocument();
  });

  it('点击方向按钮应触发 onDirection', () => {
    render(<TouchControls {...mockHandlers} visible={true} />);
    fireEvent.click(screen.getByText('↑'));
    expect(mockHandlers.onDirection).toHaveBeenCalledWith('UP');
  });

  it('点击撤销应触发 onUndo', () => {
    render(<TouchControls {...mockHandlers} visible={true} />);
    fireEvent.click(screen.getByText('撤销'));
    expect(mockHandlers.onUndo).toHaveBeenCalled();
  });
});

// LevelSelector.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LevelSelector } from './LevelSelector';

describe('LevelSelector', () => {
  const mockHandlers = {
    onChange: vi.fn(),
    onPrev: vi.fn(),
    onNext: vi.fn(),
  };

  it('应渲染关卡选择器', () => {
    render(<LevelSelector currentLevel={1} totalLevels={18} {...mockHandlers} />);
    expect(screen.getByText('← 上一关')).toBeInTheDocument();
    expect(screen.getByText('下一关 →')).toBeInTheDocument();
  });

  it('第一关时上一关按钮应禁用', () => {
    render(<LevelSelector currentLevel={1} totalLevels={18} {...mockHandlers} />);
    expect(screen.getByText('← 上一关')).toBeDisabled();
  });

  it('最后一关时下一关按钮应禁用', () => {
    render(<LevelSelector currentLevel={18} totalLevels={18} {...mockHandlers} />);
    expect(screen.getByText('下一关 →')).toBeDisabled();
  });

  it('点击按钮应触发对应事件', () => {
    render(<LevelSelector currentLevel={5} totalLevels={18} {...mockHandlers} />);
    fireEvent.click(screen.getByText('下一关 →'));
    expect(mockHandlers.onNext).toHaveBeenCalled();
  });
});

// DeadlockModal.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeadlockModal } from './DeadlockModal';

describe('DeadlockModal', () => {
  it('isOpen=false 时不应渲染', () => {
    const { container } = render(<DeadlockModal isOpen={false} onUndo={vi.fn()} onRestart={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('isOpen=true 时应渲染弹窗', () => {
    render(<DeadlockModal isOpen={true} onUndo={vi.fn()} onRestart={vi.fn()} />);
    expect(screen.getByText('游戏结束')).toBeInTheDocument();
    expect(screen.getByText('箱子被推到死角，无法继续！')).toBeInTheDocument();
  });

  it('点击撤销应触发 onUndo', () => {
    const onUndo = vi.fn();
    render(<DeadlockModal isOpen={true} onUndo={onUndo} onRestart={vi.fn()} />);
    fireEvent.click(screen.getByText('撤销'));
    expect(onUndo).toHaveBeenCalled();
  });
});

// LevelComplete.test.tsx
describe('LevelComplete', () => {
  it('应显示通关信息', () => {
    render(<LevelComplete isOpen={true} moves={42} pushes={10} isLastLevel={false} onNext={vi.fn()} onReplay={vi.fn()} />);
    expect(screen.getByText('🎉 恭喜通关！')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('非最后一关应显示下一关按钮', () => {
    render(<LevelComplete isOpen={true} moves={42} pushes={10} isLastLevel={false} onNext={vi.fn()} onReplay={vi.fn()} />);
    expect(screen.getByText('下一关')).toBeInTheDocument();
  });

  it('最后一关不应显示下一关按钮', () => {
    render(<LevelComplete isOpen={true} moves={42} pushes={10} isLastLevel={true} onNext={vi.fn()} onReplay={vi.fn()} />);
    expect(screen.queryByText('下一关')).not.toBeInTheDocument();
  });
});
```

---

## 4. 端到端测试 (Playwright)

### 4.1 安装和配置

```bash
npm install -D @playwright/test
npx playwright install
```

### 4.2 E2E 测试用例 (e2e/sokoban.spec.ts)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Sokoban Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('页面应正确加载', async ({ page }) => {
    await expect(page).toHaveTitle(/推箱子/);
    await expect(page.locator('h1')).toContainText('推箱子');
  });

  test('游戏应渲染 Canvas', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('键盘方向键应控制玩家移动', async ({ page }) => {
    // 等待游戏加载
    await page.waitForSelector('canvas');

    // 记录初始位置（通过观察 Canvas 或使用测试钩子）
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    // 验证移动（需要添加测试属性或使用截图对比）
  });

  test('Z 键应撤销操作', async ({ page }) => {
    await page.waitForSelector('canvas');

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('KeyZ');
    await page.waitForTimeout(100);

    // 验证回到原位
  });

  test('R 键应重置关卡', async ({ page }) => {
    await page.waitForSelector('canvas');

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('KeyR');
    await page.waitForTimeout(100);

    // 验证回到初始状态
  });

  test('关卡切换应工作', async ({ page }) => {
    await page.waitForSelector('select');

    await page.selectOption('select', '5');
    await page.waitForTimeout(200);

    // 验证第 5 关加载
    await expect(page.locator('select')).toHaveValue('5');
  });

  test('移动端应显示虚拟按钮', async ({ page }) => {
    // 模拟移动设备
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    await expect(page.locator('button:has-text("↑")')).toBeVisible();
    await expect(page.locator('button:has-text("撤销")')).toBeVisible();
  });

  test('通关后应显示通关弹窗', async ({ page }) => {
    // 加载第一关（简单关卡）
    // 执行通关操作
    // 验证弹窗显示
    await expect(page.locator('text=恭喜通关')).toBeVisible();
  });

  test('死锁时应显示死锁弹窗', async ({ page }) => {
    // 加载特定关卡
    // 制造死锁
    // 验证弹窗显示
    await expect(page.locator('text=游戏结束')).toBeVisible();
  });
});
```

---

## 5. 手动测试清单

### 5.1 功能测试

| 功能 | 测试步骤 | 预期结果 |
|------|----------|----------|
| 页面加载 | 打开 http://localhost:3000 | 显示游戏标题、Canvas、关卡选择器 |
| 键盘移动 | 按方向键/WASD | 玩家移动，步数+1 |
| 推箱子 | 玩家面对箱子按方向键 | 箱子被推动，推箱子数+1 |
| 推墙 | 玩家面对墙壁按方向键 | 无反应，步数不变 |
| 推两个箱子 | 尝试推动两个相邻的箱子 | 无反应 |
| 撤销 | 按 Z 键 | 回到上一步状态 |
| 多次撤销 | 连续按 Z 键 | 逐步回退到更早状态 |
| 重置 | 按 R 键 | 回到关卡初始状态，历史清空 |
| 关卡切换 | 选择不同关卡 | 加载对应关卡，状态重置 |
| 上一关/下一关 | 点击箭头按钮 | 切换到相邻关卡 |

### 5.2 死锁测试

| 场景 | 测试关卡 | 预期结果 |
|------|----------|----------|
| 角落死锁 | 将箱子推到墙角 | 显示死锁弹窗 |
| 撤销解除死锁 | 死锁后按撤销 | 弹窗关闭，回到上一步 |
| 重置解除死锁 | 死锁后按重置 | 弹窗关闭，关卡重置 |

### 5.3 通关测试

| 场景 | 测试步骤 | 预期结果 |
|------|----------|----------|
| 正常通关 | 将所有箱子推到目标点 | 显示通关弹窗，显示步数 |
| 下一关 | 通关后点击下一关 | 加载下一关 |
| 重玩 | 通关后点击再玩一次 | 当前关重置 |
| 最后一关 | 通关第 18 关 | 不显示"下一关"按钮 |

### 5.4 响应式测试

| 设备 | 视口尺寸 | 预期结果 |
|------|----------|----------|
| 桌面端 | 1920x1080 | 显示 Canvas、关卡选择、统计，不显示虚拟按钮 |
| 平板 | 768x1024 | 显示虚拟按钮 |
| 手机 | 375x667 | 显示虚拟按钮，布局适配 |

### 5.5 边界情况

| 场景 | 测试步骤 | 预期结果 |
|------|----------|----------|
| 第一关上一关 | 在第 1 关点击上一关 | 按钮禁用，无反应 |
| 最后一关下一关 | 在第 18 关点击下一关 | 按钮禁用，无反应 |
| 快速按键 | 快速连续按键 | 游戏正常响应，无崩溃 |
| 切换关卡时撤销 | 切换关卡后按撤销 | 新关卡无历史，无反应 |

---

## 6. 性能测试

### 6.1 加载性能

```typescript
// performance.test.ts
test('首屏加载时间应小于 3 秒', async ({ page }) => {
  const start = Date.now();
  await page.goto('http://localhost:3000');
  await page.waitForSelector('canvas');
  const loadTime = Date.now() - start;
  expect(loadTime).toBeLessThan(3000);
});
```

### 6.2 渲染性能

- Canvas 渲染帧率应保持在 60fps
- 关卡切换应在 200ms 内完成
- 撤销操作应在 100ms 内响应

---

## 7. 测试运行命令

```bash
# 运行所有单元测试
bun test

# 运行特定测试文件
bun test parser.test.ts

# 运行测试并生成覆盖率报告
bun test --coverage

# 运行 E2E 测试
npx playwright test

# 运行特定 E2E 测试
npx playwright test sokoban.spec.ts

# 以 UI 模式运行 E2E 测试
npx playwright test --ui
```

---

## 8. 持续集成配置

### 8.1 GitHub Actions (.github/workflows/test.yml)

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Run unit tests
        run: bun test

      - name: Build
        run: bun run build

      - name: Install Playwright
        run: npx playwright install

      - name: Start server and run E2E tests
        run: |
          bun run dev &
          sleep 3
          npx playwright test
```

---

## 9. 测试覆盖率目标

| 模块 | 目标覆盖率 |
|------|-----------|
| parser.ts | 90% |
| deadlockDetector.ts | 95% |
| reducer.ts | 90% |
| useSokoban.ts | 80% |
| 组件 | 70% |

---

## 10. Bug 报告模板

发现 Bug 时请按以下格式报告：

```markdown
**Bug 描述**:
**复现步骤**:
1.
2.
3.

**期望结果**:
**实际结果**:
**截图**:
**浏览器/设备**:
**控制台错误**:
```
