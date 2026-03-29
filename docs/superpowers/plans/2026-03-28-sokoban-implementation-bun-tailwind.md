# Sokoban H5 推箱子游戏实施计划 (Bun + Tailwind CSS)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个基于 React + Canvas 的 H5 推箱子游戏，使用 Bun 作为运行时/包管理器，Tailwind CSS 作为样式方案。

**Architecture:** useReducer 集中式状态管理，Tailwind 处理所有 UI 样式，Canvas 纯渲染。

**Tech Stack:** React 18 + TypeScript + Vite + Bun + Tailwind CSS + HTML5 Canvas

---

## 文件结构规划

```
project-root/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js      # Tailwind 配置
├── postcss.config.js       # PostCSS 配置
├── bun.lockb               # Bun 锁文件
├── public/
│   └── maps.txt
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css            # Tailwind 入口 + 自定义样式
│   ├── types/
│   │   └── game.ts
│   ├── engine/
│   │   ├── constants.ts
│   │   ├── parser.ts
│   │   ├── reducer.ts
│   │   └── deadlockDetector.ts
│   ├── hooks/
│   │   └── useSokoban.ts
│   ├── components/
│   │   ├── GameCanvas.tsx
│   │   ├── TouchControls.tsx
│   │   ├── LevelSelector.tsx
│   │   ├── StatsPanel.tsx
│   │   ├── DeadlockModal.tsx
│   │   └── LevelComplete.tsx
│   └── utils/
│       └── responsive.ts
```

---

## Task 1: 项目初始化 (Bun)

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`

**Goal:** 使用 Bun 初始化 Vite + React + TypeScript 项目

- [ ] **Step 1: 创建 package.json（Bun 版本）**

```json
{
  "name": "sokoban-game",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

- [ ] **Step 2: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>推箱子 Sokoban</title>
  </head>
  <body class="bg-slate-900 text-white min-h-screen flex items-center justify-center">
    <div id="root" class="w-full max-w-xl p-5"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: 复制关卡文件**

```bash
mkdir -p public
cp /Users/juan/develop/workspace/games/maps.txt public/maps.txt
```

- [ ] **Step 7: 使用 Bun 安装依赖**

```bash
bun install
```

Expected: 依赖安装成功，bun.lockb 文件创建

- [ ] **Step 8: 初始化 Git**

```bash
git init
git add .
git commit -m "chore: init project with bun + vite + react + ts"
```

---

## Task 2: Tailwind CSS 配置

**Files:**
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/index.css`

**Goal:** 配置 Tailwind CSS

- [ ] **Step 1: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#1a1a2e',
          wall: '#4a4a6a',
          floor: '#2a2a4a',
          player: '#4fc3f7',
          box: '#ff8a65',
          target: '#81c784',
          boxOnTarget: '#66bb6a',
        }
      }
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 3: 创建 src/index.css（Tailwind 入口）**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
}

@layer components {
  .game-button {
    @apply px-4 py-2 bg-game-wall text-white rounded border-2 border-slate-500
           hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .game-card {
    @apply bg-slate-800 rounded-lg p-4 border border-slate-700;
  }

  .modal-overlay {
    @apply fixed inset-0 bg-black/70 flex items-center justify-center z-50;
  }

  .modal-content {
    @apply bg-slate-800 rounded-xl p-8 text-center max-w-sm border border-slate-700;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js postcss.config.js src/index.css
git commit -m "chore: configure tailwindcss"
```

---

## Task 3: 类型定义

**Files:**
- Create: `src/types/game.ts`

**Goal:** 定义所有 TypeScript 类型

- [ ] **Step 1: 创建类型定义文件**

```typescript
// src/types/game.ts

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export interface LevelData {
  id: number;
  width: number;
  height: number;
  map: string[][];
}

export interface GameState {
  level: number;
  map: string[][];
  playerPos: Position;
  moves: number;
  pushes: number;
}

export interface State {
  current: GameState;
  history: GameState[];
  initial: GameState;
  isCompleted: boolean;
  isDeadlocked: boolean;
}

export type GameAction =
  | { type: 'MOVE'; direction: Direction }
  | { type: 'UNDO' }
  | { type: 'RESTART' }
  | { type: 'LOAD_LEVEL'; levelId: number };

export interface RenderConfig {
  tileSize: number;
  wallColor: string;
  floorColor: string;
  playerColor: string;
  boxColor: string;
  targetColor: string;
  boxOnTargetColor: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/game.ts
git commit -m "feat: add type definitions"
```

---

## Task 4: 游戏常量

**Files:**
- Create: `src/engine/constants.ts`

**Goal:** 定义字符映射和渲染配置

- [ ] **Step 1: 创建常量文件**

```typescript
// src/engine/constants.ts

export const CHAR = {
  EMPTY: ' ',
  WALL: '#',
  TARGET: '.',
  BOX: '$',
  PLAYER: '@',
  BOX_ON_TARGET: '*',
  PLAYER_ON_TARGET: '+',
} as const;

export const RENDER_CONFIG = {
  tileSize: 30,
  wallColor: '#4a4a6a',
  floorColor: '#2a2a4a',
  playerColor: '#4fc3f7',
  boxColor: '#ff8a65',
  targetColor: '#81c784',
  boxOnTargetColor: '#66bb6a',
  playerOnTargetColor: '#29b6f6',
};

export const LEVEL_SIZE = {
  width: 16,
  height: 16,
};

export const TOTAL_LEVELS = 18;
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/constants.ts
git commit -m "feat: add game constants"
```

---

## Task 5: 关卡解析器

**Files:**
- Create: `src/engine/parser.ts`

**Goal:** 解析 maps.txt 关卡数据

- [ ] **Step 1: 创建解析器**

```typescript
// src/engine/parser.ts
import type { LevelData, GameState, Position } from '../types/game';
import { CHAR, LEVEL_SIZE, TOTAL_LEVELS } from './constants';

export function parseLevel(lines: string[], levelId: number): LevelData {
  const map: string[][] = [];

  for (let i = 0; i < LEVEL_SIZE.height; i++) {
    const row = lines[i] || '';
    const parsedRow = row.split('').map(char => char === '0' ? CHAR.EMPTY : char);
    while (parsedRow.length < LEVEL_SIZE.width) {
      parsedRow.push(CHAR.EMPTY);
    }
    map.push(parsedRow.slice(0, LEVEL_SIZE.width));
  }

  return {
    id: levelId,
    width: LEVEL_SIZE.width,
    height: LEVEL_SIZE.height,
    map,
  };
}

export function parseAllLevels(rawText: string): LevelData[] {
  const lines = rawText.split('\n');
  const levels: LevelData[] = [];
  let currentLevelLines: string[] = [];
  let levelId = 1;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '[level]') {
      if (currentLevelLines.length > 0 && levelId <= TOTAL_LEVELS) {
        levels.push(parseLevel(currentLevelLines, levelId));
        levelId++;
      }
      currentLevelLines = [];
    } else if (trimmed && !trimmed.startsWith('#') && levelId <= TOTAL_LEVELS) {
      currentLevelLines.push(trimmed);
    }
  }

  if (currentLevelLines.length > 0 && levelId <= TOTAL_LEVELS) {
    levels.push(parseLevel(currentLevelLines, levelId));
  }

  return levels;
}

export function findPlayerPosition(map: string[][]): Position {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const char = map[y][x];
      if (char === CHAR.PLAYER || char === CHAR.PLAYER_ON_TARGET) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: 0 };
}

export function cloneMap(map: string[][]): string[][] {
  return map.map(row => [...row]);
}

export function createInitialState(levelData: LevelData): GameState {
  return {
    level: levelData.id,
    map: cloneMap(levelData.map),
    playerPos: findPlayerPosition(levelData.map),
    moves: 0,
    pushes: 0,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/parser.ts
git commit -m "feat: add level parser"
```

---

## Task 6: 死锁检测

**Files:**
- Create: `src/engine/deadlockDetector.ts`

**Goal:** 检测箱子死角死锁

- [ ] **Step 1: 创建死锁检测器**

```typescript
// src/engine/deadlockDetector.ts
import { CHAR } from './constants';

function isWall(map: string[][], x: number, y: number): boolean {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return true;
  return map[y][x] === CHAR.WALL;
}

function isBoxOnTarget(map: string[][], x: number, y: number): boolean {
  return map[y]?.[x] === CHAR.BOX_ON_TARGET;
}

function isCornerDeadlock(map: string[][], x: number, y: number): boolean {
  if (isBoxOnTarget(map, x, y)) return false;

  const dirs = [
    { up: true, left: true },
    { up: true, right: true },
    { down: true, left: true },
    { down: true, right: true },
  ];

  for (const dir of dirs) {
    const wallUp = dir.up && isWall(map, x, y - 1);
    const wallDown = dir.down && isWall(map, x, y + 1);
    const wallLeft = dir.left && isWall(map, x - 1, y);
    const wallRight = dir.right && isWall(map, x + 1, y);

    if ((wallUp || wallDown) && (wallLeft || wallRight)) {
      return true;
    }
  }

  return false;
}

export function detectDeadlock(map: string[][]): boolean {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const char = map[y][x];
      if (char === CHAR.BOX || char === CHAR.BOX_ON_TARGET) {
        if (isCornerDeadlock(map, x, y)) return true;
      }
    }
  }
  return false;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/deadlockDetector.ts
git commit -m "feat: add deadlock detection"
```

---

## Task 7: Reducer 核心逻辑

**Files:**
- Create: `src/engine/reducer.ts`

**Goal:** 实现游戏状态管理

- [ ] **Step 1: 创建 reducer**

```typescript
// src/engine/reducer.ts
import type { State, GameAction, Direction, Position, GameState } from '../types/game';
import { CHAR } from './constants';
import { detectDeadlock } from './deadlockDetector';
import { createInitialState, cloneMap } from './parser';
import type { LevelData } from '../types/game';

const DIRECTION_OFFSET: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

function checkComplete(map: string[][]): boolean {
  for (const row of map) {
    for (const char of row) {
      if (char === CHAR.TARGET) return false;
    }
  }
  return true;
}

function processMove(state: State, direction: Direction): State {
  const { current } = state;
  const offset = DIRECTION_OFFSET[direction];
  const newPos = {
    x: current.playerPos.x + offset.x,
    y: current.playerPos.y + offset.y,
  };

  if (newPos.y < 0 || newPos.y >= current.map.length ||
      newPos.x < 0 || newPos.x >= current.map[0].length) {
    return state;
  }

  const targetChar = current.map[newPos.y][newPos.x];

  if (targetChar === CHAR.WALL) return state;

  if (targetChar === CHAR.BOX || targetChar === CHAR.BOX_ON_TARGET) {
    const boxNewPos = {
      x: newPos.x + offset.x,
      y: newPos.y + offset.y,
    };

    if (boxNewPos.y < 0 || boxNewPos.y >= current.map.length ||
        boxNewPos.x < 0 || boxNewPos.x >= current.map[0].length) {
      return state;
    }

    const boxTargetChar = current.map[boxNewPos.y][boxNewPos.x];

    if (boxTargetChar !== CHAR.EMPTY && boxTargetChar !== CHAR.TARGET) {
      return state;
    }

    const newMap = cloneMap(current.map);

    const originalChar = current.map[current.playerPos.y][current.playerPos.x];
    newMap[current.playerPos.y][current.playerPos.x] =
      originalChar === CHAR.PLAYER_ON_TARGET ? CHAR.TARGET : CHAR.EMPTY;

    const boxOriginalChar = current.map[newPos.y][newPos.x];
    newMap[newPos.y][newPos.x] =
      boxOriginalChar === CHAR.BOX_ON_TARGET ? CHAR.PLAYER_ON_TARGET : CHAR.PLAYER;

    newMap[boxNewPos.y][boxNewPos.x] =
      boxTargetChar === CHAR.TARGET ? CHAR.BOX_ON_TARGET : CHAR.BOX;

    const newState: GameState = {
      level: current.level,
      map: newMap,
      playerPos: newPos,
      moves: current.moves + 1,
      pushes: current.pushes + 1,
    };

    return {
      ...state,
      history: [...state.history, current],
      current: newState,
      isDeadlocked: detectDeadlock(newMap),
      isCompleted: checkComplete(newMap),
    };
  }

  const newMap = cloneMap(current.map);

  const originalChar = current.map[current.playerPos.y][current.playerPos.x];
  newMap[current.playerPos.y][current.playerPos.x] =
    originalChar === CHAR.PLAYER_ON_TARGET ? CHAR.TARGET : CHAR.EMPTY;

  newMap[newPos.y][newPos.x] =
    targetChar === CHAR.TARGET ? CHAR.PLAYER_ON_TARGET : CHAR.PLAYER;

  const newState: GameState = {
    level: current.level,
    map: newMap,
    playerPos: newPos,
    moves: current.moves + 1,
    pushes: current.pushes,
  };

  return {
    ...state,
    history: [...state.history, current],
    current: newState,
    isCompleted: checkComplete(newMap),
    isDeadlocked: detectDeadlock(newMap),
  };
}

export function gameReducer(state: State, action: GameAction): State {
  switch (action.type) {
    case 'MOVE':
      return processMove(state, action.direction);

    case 'UNDO':
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        current: prev,
        history: state.history.slice(0, -1),
        isDeadlocked: false,
        isCompleted: false,
      };

    case 'RESTART':
      return {
        current: state.initial,
        initial: state.initial,
        history: [],
        isCompleted: false,
        isDeadlocked: false,
      };

    case 'LOAD_LEVEL':
      return state;

    default:
      return state;
  }
}

export function initState(levelData: LevelData): State {
  const initial = createInitialState(levelData);
  return {
    current: initial,
    initial,
    history: [],
    isCompleted: false,
    isDeadlocked: false,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/reducer.ts
git commit -m "feat: add game reducer"
```

---

## Task 8: useSokoban Hook

**Files:**
- Create: `src/hooks/useSokoban.ts`

**Goal:** 封装 reducer 和关卡加载

- [ ] **Step 1: 创建 hook**

```typescript
// src/hooks/useSokoban.ts
import { useState, useEffect, useCallback } from 'react';
import type { State, Direction, LevelData } from '../types/game';
import { gameReducer, initState } from '../engine/reducer';
import { parseAllLevels } from '../engine/parser';

export function useSokoban() {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [state, setState] = useState<State | null>(null);
  const [currentLevelId, setCurrentLevelId] = useState(1);

  useEffect(() => {
    fetch('/maps.txt')
      .then(res => res.text())
      .then(text => {
        const parsed = parseAllLevels(text);
        setLevels(parsed);
        if (parsed.length > 0) {
          const initialState = initState(parsed[0]);
          setState(initialState);
        }
      })
      .catch(err => console.error('Failed to load levels:', err));
  }, []);

  const loadLevel = useCallback((levelId: number) => {
    if (levelId < 1 || levelId > levels.length || !levels[levelId - 1]) return;
    const levelData = levels[levelId - 1];
    const newState = initState(levelData);
    setState(newState);
    setCurrentLevelId(levelId);
  }, [levels]);

  const dispatchAction = useCallback((action: { type: string; [key: string]: any }) => {
    if (!state) return;
    const newState = gameReducer(state, action as any);
    setState(newState);
  }, [state]);

  const move = useCallback((direction: Direction) => {
    dispatchAction({ type: 'MOVE', direction });
  }, [dispatchAction]);

  const undo = useCallback(() => {
    dispatchAction({ type: 'UNDO' });
  }, [dispatchAction]);

  const restart = useCallback(() => {
    dispatchAction({ type: 'RESTART' });
  }, [dispatchAction]);

  const prevLevel = useCallback(() => {
    if (currentLevelId > 1) loadLevel(currentLevelId - 1);
  }, [currentLevelId, loadLevel]);

  const nextLevel = useCallback(() => {
    if (currentLevelId < levels.length) loadLevel(currentLevelId + 1);
  }, [currentLevelId, levels.length, loadLevel]);

  return {
    state,
    levels,
    currentLevelId,
    totalLevels: levels.length,
    move,
    undo,
    restart,
    loadLevel,
    prevLevel,
    nextLevel,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSokoban.ts
git commit -m "feat: add useSokoban hook"
```

---

## Task 9: Canvas 渲染组件

**Files:**
- Create: `src/components/GameCanvas.tsx`

**Goal:** 渲染游戏画面

- [ ] **Step 1: 创建 Canvas 组件**

```typescript
// src/components/GameCanvas.tsx
import { useEffect, useRef } from 'react';
import type { GameState } from '../types/game';
import { CHAR, RENDER_CONFIG } from '../engine/constants';

interface GameCanvasProps {
  gameState: GameState | null;
}

export function GameCanvas({ gameState }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { tileSize } = RENDER_CONFIG;
    const width = gameState.map[0]?.length || 16;
    const height = gameState.map.length || 16;

    canvas.width = width * tileSize;
    canvas.height = height * tileSize;

    ctx.fillStyle = RENDER_CONFIG.floorColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const char = gameState.map[y]?.[x] || CHAR.EMPTY;
        const posX = x * tileSize;
        const posY = y * tileSize;

        ctx.fillStyle = RENDER_CONFIG.floorColor;
        ctx.fillRect(posX, posY, tileSize, tileSize);
        ctx.strokeStyle = '#3a3a5a';
        ctx.strokeRect(posX, posY, tileSize, tileSize);

        switch (char) {
          case CHAR.WALL:
            ctx.fillStyle = RENDER_CONFIG.wallColor;
            ctx.fillRect(posX + 2, posY + 2, tileSize - 4, tileSize - 4);
            break;

          case CHAR.TARGET:
            ctx.fillStyle = RENDER_CONFIG.targetColor;
            ctx.beginPath();
            ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 6, 0, Math.PI * 2);
            ctx.fill();
            break;

          case CHAR.BOX:
            ctx.fillStyle = RENDER_CONFIG.boxColor;
            ctx.fillRect(posX + 4, posY + 4, tileSize - 8, tileSize - 8);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(posX + 6, posY + 6, tileSize - 12, tileSize - 12);
            break;

          case CHAR.PLAYER:
            ctx.fillStyle = RENDER_CONFIG.playerColor;
            ctx.beginPath();
            ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
            ctx.fill();
            break;

          case CHAR.BOX_ON_TARGET:
            ctx.fillStyle = RENDER_CONFIG.targetColor;
            ctx.beginPath();
            ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = RENDER_CONFIG.boxOnTargetColor;
            ctx.fillRect(posX + 4, posY + 4, tileSize - 8, tileSize - 8);
            break;

          case CHAR.PLAYER_ON_TARGET:
            ctx.fillStyle = RENDER_CONFIG.targetColor;
            ctx.beginPath();
            ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = RENDER_CONFIG.playerOnTargetColor;
            ctx.beginPath();
            ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
      }
    }
  }, [gameState]);

  if (!gameState) {
    return <div className="text-center p-10 text-sky-400 text-xl">Loading...</div>;
  }

  return (
    <canvas
      ref={canvasRef}
      className="block mx-auto border-2 border-slate-600 rounded"
      style={{ maxWidth: '100%' }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GameCanvas.tsx
git commit -m "feat: add GameCanvas component"
```

---

## Task 10: 虚拟按钮组件 (Tailwind)

**Files:**
- Create: `src/components/TouchControls.tsx`

**Goal:** 移动端虚拟方向键，使用 Tailwind 样式

- [ ] **Step 1: 创建虚拟按钮组件**

```typescript
// src/components/TouchControls.tsx
import type { Direction } from '../types/game';

interface TouchControlsProps {
  onDirection: (dir: Direction) => void;
  onUndo: () => void;
  onRestart: () => void;
  visible: boolean;
}

export function TouchControls({ onDirection, onUndo, onRestart, visible }: TouchControlsProps) {
  if (!visible) return null;

  const btnClass = "w-14 h-14 text-2xl bg-game-wall text-white rounded-lg border-2 border-slate-500 active:bg-slate-600 flex items-center justify-center select-none touch-manipulation";

  return (
    <div className="mt-5">
      <div className="flex justify-center gap-2 my-2">
        <button className={btnClass} onClick={() => onDirection('UP')}>↑</button>
      </div>
      <div className="flex justify-center gap-2 my-2">
        <button className={btnClass} onClick={() => onDirection('LEFT')}>←</button>
        <button className={btnClass} onClick={() => onDirection('DOWN')}>↓</button>
        <button className={btnClass} onClick={() => onDirection('RIGHT')}>→</button>
      </div>
      <div className="flex justify-center gap-3 mt-5">
        <button className="game-button" onClick={onUndo}>撤销</button>
        <button className="game-button" onClick={onRestart}>重置</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TouchControls.tsx
git commit -m "feat: add TouchControls with tailwind"
```

---

## Task 11: 关卡选择器 (Tailwind)

**Files:**
- Create: `src/components/LevelSelector.tsx`

**Goal:** 关卡切换 UI

- [ ] **Step 1: 创建关卡选择器**

```typescript
// src/components/LevelSelector.tsx

interface LevelSelectorProps {
  currentLevel: number;
  totalLevels: number;
  onChange: (levelId: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function LevelSelector({
  currentLevel,
  totalLevels,
  onChange,
  onPrev,
  onNext
}: LevelSelectorProps) {
  return (
    <div className="flex justify-center items-center gap-4 mb-5">
      <button
        className="game-button disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onPrev}
        disabled={currentLevel <= 1}
      >
        ← 上一关
      </button>

      <select
        className="px-4 py-2 bg-slate-800 text-white rounded border-2 border-slate-600 cursor-pointer"
        value={currentLevel}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {Array.from({ length: totalLevels }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            第 {i + 1} 关
          </option>
        ))}
      </select>

      <button
        className="game-button disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onNext}
        disabled={currentLevel >= totalLevels}
      >
        下一关 →
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LevelSelector.tsx
git commit -m "feat: add LevelSelector with tailwind"
```

---

## Task 12: 统计面板 (Tailwind)

**Files:**
- Create: `src/components/StatsPanel.tsx`

**Goal:** 显示步数和推箱子次数

- [ ] **Step 1: 创建统计面板**

```typescript
// src/components/StatsPanel.tsx

interface StatsPanelProps {
  moves: number;
  pushes: number;
}

export function StatsPanel({ moves, pushes }: StatsPanelProps) {
  return (
    <div className="flex justify-center gap-8 mb-5 py-3 px-5 bg-slate-800 rounded-lg">
      <div className="text-center">
        <div className="text-xs text-gray-400 mb-1">步数</div>
        <div className="text-2xl font-bold text-sky-400">{moves}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-400 mb-1">推箱子</div>
        <div className="text-2xl font-bold text-orange-400">{pushes}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StatsPanel.tsx
git commit -m "feat: add StatsPanel with tailwind"
```

---

## Task 13: 死锁弹窗 (Tailwind)

**Files:**
- Create: `src/components/DeadlockModal.tsx`

**Goal:** 死锁提示弹窗

- [ ] **Step 1: 创建死锁弹窗**

```typescript
// src/components/DeadlockModal.tsx

interface DeadlockModalProps {
  isOpen: boolean;
  onUndo: () => void;
  onRestart: () => void;
}

export function DeadlockModal({ isOpen, onUndo, onRestart }: DeadlockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-2xl mb-4 text-orange-400 font-bold">游戏结束</h2>
        <p className="text-gray-300 mb-6">箱子被推到死角，无法继续！</p>
        <div className="flex justify-center gap-3">
          <button
            className="px-6 py-3 bg-sky-400 text-white rounded-lg font-medium hover:bg-sky-500 transition"
            onClick={onUndo}
          >
            撤销
          </button>
          <button
            className="px-6 py-3 bg-orange-400 text-white rounded-lg font-medium hover:bg-orange-500 transition"
            onClick={onRestart}
          >
            重置
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DeadlockModal.tsx
git commit -m "feat: add DeadlockModal with tailwind"
```

---

## Task 14: 通关弹窗 (Tailwind)

**Files:**
- Create: `src/components/LevelComplete.tsx`

**Goal:** 通关提示弹窗

- [ ] **Step 1: 创建通关弹窗**

```typescript
// src/components/LevelComplete.tsx

interface LevelCompleteProps {
  isOpen: boolean;
  moves: number;
  pushes: number;
  isLastLevel: boolean;
  onNext: () => void;
  onReplay: () => void;
}

export function LevelComplete({
  isOpen,
  moves,
  pushes,
  isLastLevel,
  onNext,
  onReplay
}: LevelCompleteProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-sm">
        <h2 className="text-3xl mb-5 text-green-400 font-bold">🎉 恭喜通关！</h2>
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">步数</div>
            <div className="text-2xl font-bold text-sky-400">{moves}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">推箱子</div>
            <div className="text-2xl font-bold text-orange-400">{pushes}</div>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          {!isLastLevel && (
            <button
              className="px-6 py-3 bg-green-400 text-white rounded-lg font-medium hover:bg-green-500 transition"
              onClick={onNext}
            >
              下一关
            </button>
          )}
          <button
            className="px-6 py-3 bg-sky-400 text-white rounded-lg font-medium hover:bg-sky-500 transition"
            onClick={onReplay}
          >
            再玩一次
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LevelComplete.tsx
git commit -m "feat: add LevelComplete with tailwind"
```

---

## Task 15: 响应式工具

**Files:**
- Create: `src/utils/responsive.ts`

**Goal:** 检测是否显示触屏控制

- [ ] **Step 1: 创建响应式工具**

```typescript
// src/utils/responsive.ts
import { useState, useEffect } from 'react';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isSmallScreen = window.innerWidth < 768;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isSmallScreen || hasTouch);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/responsive.ts
git commit -m "feat: add responsive detection"
```

---

## Task 16: 主应用组件 (Tailwind)

**Files:**
- Create: `src/App.tsx`

**Goal:** 组装所有组件，实现键盘控制

- [ ] **Step 1: 创建 App.tsx**

```typescript
// src/App.tsx
import { useEffect, useCallback } from 'react';
import { useSokoban } from './hooks/useSokoban';
import { useIsMobile } from './utils/responsive';
import { GameCanvas } from './components/GameCanvas';
import { TouchControls } from './components/TouchControls';
import { LevelSelector } from './components/LevelSelector';
import { StatsPanel } from './components/StatsPanel';
import { DeadlockModal } from './components/DeadlockModal';
import { LevelComplete } from './components/LevelComplete';

function App() {
  const {
    state,
    currentLevelId,
    totalLevels,
    move,
    undo,
    restart,
    loadLevel,
    prevLevel,
    nextLevel,
  } = useSokoban();

  const isMobile = useIsMobile();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!state) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        move('UP');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        move('DOWN');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        move('LEFT');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        move('RIGHT');
        break;
      case 'z':
      case 'Z':
        e.preventDefault();
        undo();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        restart();
        break;
    }
  }, [state, move, undo, restart]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!state) {
    return <div className="text-center p-10 text-sky-400 text-xl">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center py-5">
      <h1 className="text-3xl md:text-4xl font-bold mb-5 text-sky-400 text-center">
        推箱子 Sokoban
      </h1>

      <LevelSelector
        currentLevel={currentLevelId}
        totalLevels={totalLevels}
        onChange={loadLevel}
        onPrev={prevLevel}
        onNext={nextLevel}
      />

      <StatsPanel moves={state.current.moves} pushes={state.current.pushes} />

      <GameCanvas gameState={state.current} />

      <TouchControls
        onDirection={move}
        onUndo={undo}
        onRestart={restart}
        visible={isMobile}
      />

      <DeadlockModal
        isOpen={state.isDeadlocked}
        onUndo={undo}
        onRestart={restart}
      />

      <LevelComplete
        isOpen={state.isCompleted}
        moves={state.current.moves}
        pushes={state.current.pushes}
        isLastLevel={currentLevelId >= totalLevels}
        onNext={nextLevel}
        onReplay={restart}
      />

      <div className="mt-5 text-center text-sm text-gray-500">
        <p>键盘：方向键/WASD 移动，Z 撤销，R 重置</p>
        {isMobile && <p>移动端：点击下方按钮控制</p>}
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add App component with keyboard controls"
```

---

## Task 17: 入口文件

**Files:**
- Create: `src/main.tsx`

**Goal:** 应用入口

- [ ] **Step 1: 创建 main.tsx**

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 2: Commit**

```bash
git add src/main.tsx
git commit -m "feat: add main entry point"
```

---

## Task 18: 使用 Bun 运行测试

**Files:**
- None

**Goal:** 验证游戏运行正常

- [ ] **Step 1: 使用 Bun 启动开发服务器**

```bash
bun run dev
```

Expected: 服务器在 http://localhost:3000 启动

- [ ] **Step 2: 基本功能测试**

手动测试：
1. 游戏画面正确渲染
2. 键盘方向键控制移动
3. 推箱子到目标点
4. Z 键撤销操作
5. R 键重置关卡
6. 关卡切换正常
7. 死锁检测触发提示
8. 通关显示弹窗

- [ ] **Step 3: 移动端测试**

浏览器开发者工具模拟移动设备：
1. 虚拟按钮显示正常
2. 按钮点击控制正常

- [ ] **Step 4: Commit（如需要修复）**

```bash
git add .
git commit -m "fix: address issues found during testing"
```

---

## Task 19: 生产构建 (Bun)

**Files:**
- None

**Goal:** 使用 Bun 构建生产版本

- [ ] **Step 1: 构建**

```bash
bun run build
```

Expected: `dist/` 目录生成

- [ ] **Step 2: 预览**

```bash
bun run preview
```

Expected: 预览服务器启动，游戏功能正常

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: production build"
```

---

## 完成总结

### 技术栈
- **运行时/包管理器**: Bun
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **渲染**: HTML5 Canvas

### 已实现功能
- [x] 18 个预设关卡
- [x] 键盘/触屏双控制
- [x] 完整历史撤销
- [x] 死锁检测
- [x] 关卡切换
- [x] 统计面板

### 构建命令
```bash
bun install    # 安装依赖
bun run dev    # 开发服务器
bun run build  # 生产构建
bun run preview # 预览构建
```
