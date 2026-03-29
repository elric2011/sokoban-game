import { describe, it, expect, beforeEach } from 'vitest';
import { gameReducer, initState } from '../engine/reducer';
import { CHAR } from '../engine/constants';
import type { LevelData, State } from '../types/game';

describe('gameReducer', () => {
  let initialState: State;

  beforeEach(() => {
    const levelData: LevelData = {
      id: 1,
      width: 7,
      height: 5,
      map: [
        [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
        [CHAR.WALL, CHAR.PLAYER, CHAR.EMPTY, CHAR.BOX, CHAR.EMPTY, CHAR.EMPTY, CHAR.WALL],
        [CHAR.WALL, CHAR.EMPTY, CHAR.EMPTY, CHAR.TARGET, CHAR.EMPTY, CHAR.EMPTY, CHAR.WALL],
        [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
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
      expect(state.current.playerPos).toEqual({ x: 1, y: 1 });
      expect(state.current.moves).toBe(0);
    });

    it('玩家不应能移出边界', () => {
      const state = gameReducer(initialState, { type: 'MOVE', direction: 'UP' });
      expect(state.current.playerPos).toEqual({ x: 1, y: 1 });
    });

    it('玩家应能推动箱子', () => {
      // 向右推箱子：玩家-空-箱子-空
      initialState.current.map[1] = [CHAR.WALL, CHAR.PLAYER, CHAR.EMPTY, CHAR.BOX, CHAR.EMPTY, CHAR.EMPTY, CHAR.WALL];
      const state = gameReducer(initialState, { type: 'MOVE', direction: 'RIGHT' });
      // 玩家移动两次才能推到箱子
      const afterFirst = gameReducer(state, { type: 'MOVE', direction: 'RIGHT' });
      expect(afterFirst.current.playerPos).toEqual({ x: 3, y: 1 });
      expect(afterFirst.current.map[1][4]).toBe(CHAR.BOX);
      expect(afterFirst.current.pushes).toBe(1);
    });

    it('玩家不应能推动两个箱子', () => {
      initialState.current.map[1] = [CHAR.WALL, CHAR.PLAYER, CHAR.BOX, CHAR.BOX, CHAR.WALL];
      const state = gameReducer(initialState, { type: 'MOVE', direction: 'RIGHT' });
      expect(state.current.playerPos).toEqual({ x: 1, y: 1 });
    });

    it('箱子推到目标点应变为 BOX_ON_TARGET', () => {
      initialState.current.map[1] = [CHAR.WALL, CHAR.PLAYER, CHAR.BOX, CHAR.TARGET, CHAR.WALL];
      const state = gameReducer(initialState, { type: 'MOVE', direction: 'RIGHT' });
      expect(state.current.map[1][3]).toBe(CHAR.BOX_ON_TARGET);
    });

    it('推动应增加历史记录', () => {
      const state = gameReducer(initialState, { type: 'MOVE', direction: 'DOWN' });
      expect(state.history.length).toBe(1);
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
      const state = gameReducer(initialState, { type: 'UNDO' });
      expect(state.isDeadlocked).toBe(false);
    });

    it('撤销后应重置通关状态', () => {
      const state = gameReducer(initialState, { type: 'UNDO' });
      expect(state.isCompleted).toBe(false);
    });
  });

  describe('RESTART', () => {
    it('应重置到初始状态', () => {
      const afterMove = gameReducer(initialState, { type: 'MOVE', direction: 'DOWN' });
      const afterRestart = gameReducer(afterMove, { type: 'RESTART' });
      expect(afterRestart.current.playerPos).toEqual(initialState.initial.playerPos);
      expect(afterRestart.history.length).toBe(0);
      expect(afterRestart.isCompleted).toBe(false);
      expect(afterRestart.isDeadlocked).toBe(false);
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

    it('未完成的关卡不应标记通关', () => {
      expect(initialState.isCompleted).toBe(false);
    });
  });

  describe('死锁检测', () => {
    it('箱子进入死角应标记死锁', () => {
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
      const afterPush = gameReducer(state, { type: 'MOVE', direction: 'RIGHT' });
      expect(afterPush.isDeadlocked).toBe(true);
    });

    it('正常位置不应标记死锁', () => {
      expect(initialState.isDeadlocked).toBe(false);
    });
  });
});
