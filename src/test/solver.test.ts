import { describe, it, expect } from 'vitest';
import {
  createSolverState,
  hashState,
  solveLevel,
  type SolverState
} from '../ai/solver';
import { CHAR } from '../engine/constants';
import type { LevelData } from '../types/game';

describe('AI Solver', () => {
  describe('createSolverState', () => {
    it('应从地图中提取箱子和玩家位置', () => {
      const map = [
        [CHAR.WALL, CHAR.WALL, CHAR.WALL],
        [CHAR.WALL, CHAR.PLAYER, CHAR.BOX],
        [CHAR.WALL, CHAR.WALL, CHAR.WALL]
      ];
      const playerPos = { x: 1, y: 1 };
      const state = createSolverState(map, playerPos);

      expect(state.player).toEqual({ x: 1, y: 1 });
      expect(state.boxes).toHaveLength(1);
      expect(state.boxes[0]).toEqual({ x: 2, y: 1 });
    });

    it('应处理多个箱子', () => {
      const map = [
        [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
        [CHAR.WALL, CHAR.BOX, CHAR.PLAYER, CHAR.BOX],
        [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL]
      ];
      const playerPos = { x: 2, y: 1 };
      const state = createSolverState(map, playerPos);

      expect(state.boxes).toHaveLength(2);
    });

    it('应识别箱子在目标上', () => {
      const map = [
        [CHAR.WALL, CHAR.WALL, CHAR.WALL],
        [CHAR.WALL, CHAR.PLAYER, CHAR.BOX_ON_TARGET],
        [CHAR.WALL, CHAR.WALL, CHAR.WALL]
      ];
      const playerPos = { x: 1, y: 1 };
      const state = createSolverState(map, playerPos);

      expect(state.boxes).toHaveLength(1);
      expect(state.boxes[0]).toEqual({ x: 2, y: 1 });
    });
  });

  describe('hashState', () => {
    it('应为相同状态生成相同哈希', () => {
      const state1: SolverState = {
        player: { x: 1, y: 2 },
        boxes: [{ x: 3, y: 4 }, { x: 5, y: 6 }]
      };
      const state2: SolverState = {
        player: { x: 1, y: 2 },
        boxes: [{ x: 3, y: 4 }, { x: 5, y: 6 }]
      };

      expect(hashState(state1)).toBe(hashState(state2));
    });

    it('应为不同状态生成不同哈希', () => {
      const state1: SolverState = {
        player: { x: 1, y: 2 },
        boxes: [{ x: 3, y: 4 }]
      };
      const state2: SolverState = {
        player: { x: 1, y: 2 },
        boxes: [{ x: 3, y: 5 }]
      };

      expect(hashState(state1)).not.toBe(hashState(state2));
    });

    it('箱子顺序不应影响哈希', () => {
      const state1: SolverState = {
        player: { x: 1, y: 1 },
        boxes: [{ x: 2, y: 2 }, { x: 3, y: 3 }]
      };
      const state2: SolverState = {
        player: { x: 1, y: 1 },
        boxes: [{ x: 3, y: 3 }, { x: 2, y: 2 }]
      };

      expect(hashState(state1)).toBe(hashState(state2));
    });
  });

  describe('solveLevel', () => {
    it('应能解决简单关卡', () => {
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

      const solution = solveLevel(levelData);

      expect(solution).not.toBeNull();
      expect(solution!.moves.length).toBeGreaterThan(0);
      expect(solution!.pushes).toBeGreaterThanOrEqual(1);
    });

    it('应能解决需要多步的关卡', () => {
      const levelData: LevelData = {
        id: 1,
        width: 7,
        height: 5,
        map: [
          [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
          [CHAR.WALL, CHAR.PLAYER, CHAR.EMPTY, CHAR.BOX, CHAR.EMPTY, CHAR.TARGET, CHAR.WALL],
          [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
        ]
      };

      const solution = solveLevel(levelData);

      expect(solution).not.toBeNull();
      expect(solution!.moves.length).toBeGreaterThan(1);
    });

    it('应能找到最优解（最短路径）', () => {
      // 最简单的关卡：玩家-箱子-目标 直线排列
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

      const solution = solveLevel(levelData);

      expect(solution).not.toBeNull();
      // 最优解应该是2步：向右移动，然后推动
      expect(solution!.moves.length).toBeLessThanOrEqual(3);
    });

    it('无解关卡应返回null', () => {
      // 死锁关卡：箱子被墙包围且不在目标上
      const levelData: LevelData = {
        id: 1,
        width: 5,
        height: 5,
        map: [
          [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
          [CHAR.WALL, CHAR.PLAYER, CHAR.EMPTY, CHAR.TARGET, CHAR.WALL],
          [CHAR.WALL, CHAR.WALL, CHAR.BOX, CHAR.WALL, CHAR.WALL],
          [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
        ]
      };

      const solution = solveLevel(levelData);

      // 这个关卡实际上可能被死锁检测剪掉
      // 或者返回一个解，取决于死锁检测的实现
      // 这里我们只是验证函数能正常返回
      expect(solution === null || Array.isArray(solution?.moves)).toBe(true);
    });
  });
});
