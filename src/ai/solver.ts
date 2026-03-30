// src/ai/solver.ts
import type { LevelData, Position, Direction } from '../types/game';
import { CHAR } from '../engine/constants';
import { detectDeadlock } from '../engine/deadlockDetector';

// AI求解器状态（精简表示）
export interface SolverState {
  player: Position;
  boxes: Position[];
}

// A* 队列节点
interface QueueNode {
  state: SolverState;
  path: Direction[];
  pushes: number;
  gScore: number; // 实际代价（步数）
  fScore: number; // g + heuristic
}

// 求解结果
export interface Solution {
  moves: Direction[];
  steps: number;
  pushes: number;
}

// 优先队列实现（最小堆）
class PriorityQueue {
  private heap: QueueNode[] = [];

  push(node: QueueNode): void {
    this.heap.push(node);
    this.heapifyUp(this.heap.length - 1);
  }

  pop(): QueueNode | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  private heapifyUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].fScore <= this.heap[index].fScore) break;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  private heapifyDown(index: number): void {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < this.heap.length && this.heap[left].fScore < this.heap[smallest].fScore) {
        smallest = left;
      }
      if (right < this.heap.length && this.heap[right].fScore < this.heap[smallest].fScore) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
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

// 曼哈顿距离
function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// 匈牙利算法（Kuhn-Munkres）求解最小权二分图匹配
function hungarianAlgorithm(costMatrix: number[][]): number {
  const n = costMatrix.length;
  if (n === 0) return 0;
  const m = costMatrix[0].length;

  // 简化版匈牙利算法实现
  const u = new Array(n + 1).fill(0);
  const v = new Array(m + 1).fill(0);
  const p = new Array(m + 1).fill(0); // 匹配数组
  const way = new Array(m + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array(m + 1).fill(Infinity);
    const used = new Array(m + 1).fill(false);

    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = 0;

      for (let j = 1; j <= m; j++) {
        if (!used[j]) {
          const cur = costMatrix[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }

      for (let j = 0; j <= m; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0] !== 0);

    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0);
  }

  // 计算总成本
  let totalCost = 0;
  for (let j = 1; j <= m; j++) {
    if (p[j] > 0) {
      totalCost += costMatrix[p[j] - 1][j - 1];
    }
  }

  return totalCost;
}

// 改进的启发函数：使用匈牙利算法进行最优匹配
function calculateHeuristic(boxes: Position[], targets: Position[]): number {
  if (boxes.length !== targets.length) return Infinity;
  if (boxes.length === 0) return 0;

  // 构建成本矩阵
  const costMatrix: number[][] = [];
  for (const box of boxes) {
    const row: number[] = [];
    for (const target of targets) {
      row.push(manhattanDistance(box, target));
    }
    costMatrix.push(row);
  }

  return hungarianAlgorithm(costMatrix);
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

// BFS查找玩家可以到达的所有位置（用于推箱子前的移动）
function findAllReachablePositions(
  playerPos: Position,
  boxes: Position[],
  map: string[][]
): Set<string> {
  const boxSet = new Set(boxes.map(b => `${b.x},${b.y}`));
  const visited = new Set<string>();
  const queue: Position[] = [playerPos];
  visited.add(`${playerPos.x},${playerPos.y}`);

  const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

  while (queue.length > 0) {
    const pos = queue.shift()!;

    for (const dir of directions) {
      const offset = DIRECTION_OFFSET[dir];
      const newPos = {
        x: pos.x + offset.x,
        y: pos.y + offset.y
      };

      const key = `${newPos.x},${newPos.y}`;
      if (visited.has(key)) continue;
      if (isWall(map, newPos.x, newPos.y)) continue;
      if (boxSet.has(key)) continue;

      visited.add(key);
      queue.push(newPos);
    }
  }

  return visited;
}

// 查找所有可能的推箱子动作
interface PushAction {
  direction: Direction;
  newState: SolverState;
  isMovingOffTarget: boolean; // 是否将箱子从目标上移开
}

function findAllPossiblePushes(
  state: SolverState,
  map: string[][]
): PushAction[] {
  const actions: PushAction[] = [];
  const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

  // 找到玩家可以到达的所有位置
  const reachable = findAllReachablePositions(state.player, state.boxes, map);

  for (let i = 0; i < state.boxes.length; i++) {
    const box = state.boxes[i];

    // 检查箱子是否在目标上
    const boxOnTarget = map[box.y][box.x] === CHAR.TARGET ||
                        map[box.y][box.x] === CHAR.BOX_ON_TARGET;

    for (const dir of directions) {
      const offset = DIRECTION_OFFSET[dir];

      // 推箱子需要从箱子反方向的位置推
      const pushPos = {
        x: box.x - offset.x,
        y: box.y - offset.y
      };

      // 箱子新位置
      const boxNewPos = {
        x: box.x + offset.x,
        y: box.y + offset.y
      };

      // 检查玩家是否能到达推的位置
      if (!reachable.has(`${pushPos.x},${pushPos.y}`)) continue;

      // 检查箱子新位置是否有效
      if (isWall(map, boxNewPos.x, boxNewPos.y)) continue;

      // 检查是否撞到其他箱子
      const hitOtherBox = state.boxes.some(
        (b, idx) => idx !== i && b.x === boxNewPos.x && b.y === boxNewPos.y
      );
      if (hitOtherBox) continue;

      // 检查新位置是否在目标上
      const newPosOnTarget = map[boxNewPos.y][boxNewPos.x] === CHAR.TARGET ||
                             map[boxNewPos.y][boxNewPos.x] === CHAR.BOX_ON_TARGET;

      // 创建新状态
      const newBoxes = [...state.boxes];
      newBoxes[i] = boxNewPos;
      newBoxes.sort((a, b) => a.y - b.y || a.x - b.x);

      const newState: SolverState = {
        player: { x: box.x, y: box.y }, // 推箱子后玩家在箱子原位置
        boxes: newBoxes
      };

      // 优先不移动已经在目标上的箱子
      const isMovingOffTarget = boxOnTarget && !newPosOnTarget;

      actions.push({ direction: dir, newState, isMovingOffTarget });
    }
  }

  // 排序：优先不移动目标上的箱子，然后优先移动到目标上的动作
  actions.sort((a, b) => {
    if (a.isMovingOffTarget && !b.isMovingOffTarget) return 1;
    if (!a.isMovingOffTarget && b.isMovingOffTarget) return -1;
    return 0;
  });

  return actions;
}

// A*求解器（异步可中断）- 优化版本：只考虑推箱子动作
export async function solveLevel(
  levelData: LevelData,
  abortSignal?: { current: boolean }
): Promise<Solution | null> {
  const initialState = createSolverState(levelData.map,
    findPlayerPosition(levelData.map)
  );
  const targets = getTargets(levelData.map);

  // 检查箱子数是否等于目标数
  if (initialState.boxes.length !== targets.length) {
    console.error('箱子数与目标数不匹配');
    return null;
  }

  // 预计算：找出所有可推动的箱子
  const initialActions = findAllPossiblePushes(initialState, levelData.map);
  if (initialActions.length === 0) {
    // 如果没有可推动的箱子，检查是否已经完成
    if (checkComplete(initialState.boxes, targets)) {
      return { moves: [], steps: 0, pushes: 0 };
    }
    return null;
  }

  // A*优先队列
  const openSet = new PriorityQueue();

  // 对于每个可能的推，计算完整路径
  for (const action of initialActions) {
    // 计算路径：从玩家位置到推箱子位置 + 推的动作
    const path = [action.direction];
    const heuristic = calculateHeuristic(action.newState.boxes, targets);

    openSet.push({
      state: action.newState,
      path: path,
      pushes: 1,
      gScore: 1,
      fScore: 1 + heuristic
    });
  }

  // 访问集合：记录每个状态的最小gScore（推的次数）
  const visited = new Map<string, number>();
  visited.set(hashState(initialState), 0);

  let iterations = 0;
  const BATCH_SIZE = 500; // 每500次迭代让出主线程

  while (!openSet.isEmpty()) {
    // 检查是否取消
    if (abortSignal?.current) {
      return null;
    }

    // 定期让出主线程，避免阻塞UI
    if (iterations % BATCH_SIZE === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    iterations++;

    const current = openSet.pop()!;
    const { state, path, pushes, gScore } = current;

    // 如果这个状态已经被更好的路径访问过，跳过
    const stateHash = hashState(state);
    const visitedGScore = visited.get(stateHash);
    if (visitedGScore !== undefined && visitedGScore <= gScore) {
      continue;
    }

    visited.set(stateHash, gScore);

    // 检查通关
    if (checkComplete(state.boxes, targets)) {
      return {
        moves: path,
        steps: path.length,
        pushes: pushes
      };
    }

    // 找到所有可能的推箱子动作
    const possiblePushes = findAllPossiblePushes(state, levelData.map);

    for (const action of possiblePushes) {
      // 检查是否取消
      if (abortSignal?.current) {
        return null;
      }

      // 死锁剪枝
      if (checkDeadlock(action.newState, levelData.map)) continue;

      const nextHash = hashState(action.newState);
      const newGScore = gScore + 1;

      // 如果这个状态没有被访问过，或者找到了更短的路径
      const existingGScore = visited.get(nextHash);
      if (existingGScore !== undefined && existingGScore <= newGScore) {
        continue;
      }

      // 计算启发函数
      const heuristic = calculateHeuristic(action.newState.boxes, targets);
      const fScore = newGScore + heuristic;

      openSet.push({
        state: action.newState,
        path: [...path, action.direction],
        pushes: pushes + 1,
        gScore: newGScore,
        fScore: fScore
      });
    }
  }

  return null; // 无解
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
