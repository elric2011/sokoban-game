# 推箱子 Sokoban

经典的推箱子游戏，使用 React + TypeScript + Vite 构建。

## 功能特性

- 18 个精心设计的关卡
- 响应式设计，支持移动端和桌面端
- 触摸控制（移动端）
- 撤销/重置功能
- 死锁检测
- AI 自动求解
- 关卡选择器

## 技术栈

| 技术 | 版本 |
|------|------|
| React | 18.2 |
| TypeScript | 5.3 |
| Vite | 5.0 |
| TailwindCSS | 3.4 |
| Vitest | 4.1 |
| Playwright | 1.58 |

## 快速开始

### 环境要求

- Node.js 20+ 或 Bun 1.0+

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 bun
bun install
```

### 开发

```bash
# 启动开发服务器
npm run dev
# 或
bun run dev
```

访问 http://localhost:3000

### 构建

```bash
npm run build
# 或
bun run build
```

### 测试

```bash
# 运行单元测试
npm run test
# 或
bun run test

# 运行 E2E 测试
npm run test:e2e
# 或
bun run test:e2e
```

### 类型检查

```bash
npm run typecheck
# 或
bun run typecheck
```

## 游戏操作

### 桌面端

| 按键 | 功能 |
|------|------|
| 方向键 / WASD | 移动玩家 |
| Z | 撤销 |
| R | 重置 |
| P | AI 求解 |

### 移动端

- 点击屏幕下方的方向按钮控制移动
- 点击"撤销"、"重置"、"AI 通关"按钮执行相应操作

## 游戏规则

1. 玩家推动箱子到目标位置
2. 所有箱子到达目标位置后通关
3. 箱子一旦进入死角将无法移动（死锁）
4. 使用撤销功能回到上一步

## 项目结构

```
src/
├── ai/           # AI 求解器（A*算法）
├── components/   # React 组件
│   ├── GameCanvas.tsx      # 游戏画布
│   ├── LevelSelector.tsx   # 关卡选择器
│   ├── StatsPanel.tsx      # 统计面板
│   ├── TouchControls.tsx   # 触摸控制
│   ├── DeadlockModal.tsx   # 死锁提示
│   ├── LevelComplete.tsx   # 通关提示
│   └── AISolver.tsx        # AI 求解器
├── engine/       # 游戏引擎
│   ├── parser.ts           # 关卡解析器
│   ├── reducer.ts          # 状态管理
│   ├── deadlockDetector.ts # 死锁检测
│   └── constants.ts        # 常量定义
├── hooks/        # React Hooks
│   └── useSokoban.ts       # 游戏逻辑 Hook
├── types/        # TypeScript 类型
│   └── game.ts
├── utils/        # 工具函数
│   └── responsive.ts       # 响应式检测
└── test/         # 单元测试
```

## Docker 部署

```bash
# 构建镜像
docker build -t sokoban .

# 运行容器
docker run -p 8080:80 sokoban
```

访问 http://localhost:8080

## 关卡格式

关卡文件 `maps.txt` 使用以下字符：

| 字符 | 含义 |
|------|------|
| ` ` (空格) | 空地 |
| `#` | 墙壁 |
| `.` | 目标位置 |
| `$` | 箱子 |
| `@` | 玩家 |
| `+` | 玩家在目标上 |
| `*` | 箱子在目标上 |

示例：
```
[level]
  ####
  #@ #
  #.$#
  ####
```

## 许可证

MIT
