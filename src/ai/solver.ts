// src/ai/solver.ts
import type { LevelData, Position, Direction } from '../types/game';
import { CHAR } from '../engine/constants';
import { detectDeadlock } from '../engine/deadlockDetector';

// AI求解器状态（精简表示）
export interface SolverState {
  player: Position;
  boxes: Position[];
}

// 求解结果
export interface Solution {
  moves: Direction[];
  steps: number;
  pushes: number;
}

// 创建精简状态（用于哈希和队列）
export function createSolverState(
  map: string[][],
  playerPos: Position
): SolverState {
  const boxes: Position[] = [];

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const char = map[y][x];
      if (char === CHAR.BOX || char === CHAR.BOX_ON_TARGET) {
        boxes.push({ x, y });
      }
    }
  }

  return {
    player: { ...playerPos },
    boxes: boxes.sort((a, b) => a.y - b.y || a.x - b.x)
  };
}

// 状态哈希（用于visited集合）
export function hashState(state: SolverState): string {
  const boxes = state.boxes
    .slice()
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map(b => `${b.x},${b.y}`)
    .join('|');
  return `${state.player.x},${state.player.y}:${boxes}`;
}

// 检查是否通关
export function isComplete(state: SolverState, targetCount: number): boolean {
  // 实际检查需要地图信息，这里简化处理
  return false; // 由调用者提供目标位置检查
}

// 方向偏移
const DIRECTION_OFFSET: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

// 获取地图中的目标点位置
function getTargets(map: string[][]): Position[] {
  const targets: Position[] = [];
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const char = map[y][x];
      if (char === CHAR.TARGET || char === CHAR.BOX_ON_TARGET || char === CHAR.PLAYER_ON_TARGET) {
        targets.push({ x, y });
      }
    }
  }
  return targets;
}

// 检查位置是否是墙
function isWall(map: string[][], x: number, y: number): boolean {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) {
    return true;
  }
  return map[y][x] === CHAR.WALL;
}

// 检查是否通关（所有箱子都在目标上）
function checkComplete(boxes: Position[], targets: Position[]): boolean {
  if (boxes.length !== targets.length) return false;

  const boxSet = new Set(boxes.map(b => `${b.x},${b.y}`));
  return targets.every(t => boxSet.has(`${t.x},${t.y}`));
}

// 执行移动，返回新状态（如果有效）
function executeMove(
  state: SolverState,
  map: string[][],
  direction: Direction
): SolverState | null {
  const offset = DIRECTION_OFFSET[direction];
  const newPos = {
    x: state.player.x + offset.x,
    y: state.player.y + offset.y
  };

  // 检查边界和墙
  if (isWall(map, newPos.x, newPos.y)) {
    return null;
  }

  // 检查是否是箱子
  const boxIndex = state.boxes.findIndex(
    b => b.x === newPos.x && b.y === newPos.y
  );

  if (boxIndex === -1) {
    // 普通移动
    return {
      player: newPos,
      boxes: [...state.boxes]
    };
  }

  // 推动箱子
  const boxNewPos = {
    x: newPos.x + offset.x,
    y: newPos.y + offset.y
  };

  // 检查箱子新位置
  if (isWall(map, boxNewPos.x, boxNewPos.y)) {
    return null;
  }

  // 检查是否撞到其他箱子
  const hitOtherBox = state.boxes.some(
    (b, i) => i !== boxIndex && b.x === boxNewPos.x && b.y === boxNewPos.y
  );
  if (hitOtherBox) {
    return null;
  }

  // 创建新箱子列表
  const newBoxes = [...state.boxes];
  newBoxes[boxIndex] = boxNewPos;
  newBoxes.sort((a, b) => a.y - b.y || a.x - b.x);

  return {
    player: newPos,
    boxes: newBoxes
  };
}

// 死锁检测（用于剪枝）
function checkDeadlock(state: SolverState, map: string[][]): boolean {
  // 构建临时地图
  const tempMap = map.map(row => [...row]);

  // 清空箱子和玩家，但保留目标点
  for (let y = 0; y < tempMap.length; y++) {
    for (let x = 0; x < tempMap[y].length; x++) {
      const char = tempMap[y][x];
      // 保留目标点，清空其他动态元素
      if (char === CHAR.BOX || char === CHAR.PLAYER) {
        tempMap[y][x] = CHAR.EMPTY;
      } else if (char === CHAR.BOX_ON_TARGET || char === CHAR.PLAYER_ON_TARGET) {
        tempMap[y][x] = CHAR.TARGET;
      }
      // CHAR.TARGET 和 CHAR.EMPTY 保持不变
    }
  }

  // 放置箱子
  for (const box of state.boxes) {
    // 检查目标点
    const currentChar = tempMap[box.y][box.x];
    tempMap[box.y][box.x] = currentChar === CHAR.TARGET ? CHAR.BOX_ON_TARGET : CHAR.BOX;
  }

  // 放置玩家
  const playerChar = tempMap[state.player.y][state.player.x];
  tempMap[state.player.y][state.player.x] = playerChar === CHAR.TARGET ? CHAR.PLAYER_ON_TARGET : CHAR.PLAYER;

  return detectDeadlock(tempMap);
}

// BFS求解器
export function solveLevel(levelData: LevelData): Solution | null {
  const initialState = createSolverState(levelData.map,
    findPlayerPosition(levelData.map)
  );
  const targets = getTargets(levelData.map);

  // 检查箱子数是否等于目标数
  if (initialState.boxes.length !== targets.length) {
    console.error('箱子数与目标数不匹配');
    return null;
  }

  const queue: [SolverState, Direction[], number][] = [[initialState, [], 0]];
  const visited = new Set<string>();
  visited.add(hashState(initialState));

  while (queue.length > 0) {
    const [state, path, pushes] = queue.shift()!;

    // 检查通关
    if (checkComplete(state.boxes, targets)) {
      return {
        moves: path,
        steps: path.length,
        pushes: pushes
      };
    }

    // 尝试四个方向
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

    for (const dir of directions) {
      const nextState = executeMove(state, levelData.map, dir);

      if (!nextState) continue;

      // 死锁剪枝
      if (checkDeadlock(nextState, levelData.map)) continue;

      const hash = hashState(nextState);
      if (visited.has(hash)) continue;

      visited.add(hash);

      // 检查是否是推箱子操作
      const boxSet1 = new Set(state.boxes.map(b => `${b.x},${b.y}`));
      const boxSet2 = new Set(nextState.boxes.map(b => `${b.x},${b.y}`));
      const isPush = !state.boxes.every(b => boxSet2.has(`${b.x},${b.y}`));

      queue.push([nextState, [...path, dir], isPush ? pushes + 1 : pushes]);
    }
  }

  return null; // 无解
}

// 从地图查找玩家位置
function findPlayerPosition(map: string[][]): Position {
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

// 演示用：按步骤执行移动
export async function playSolution(
  moves: Direction[],
  onMove: (dir: Direction) => void,
  delay: number = 300
): Promise<void> {
  for (const dir of moves) {
    onMove(dir);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
