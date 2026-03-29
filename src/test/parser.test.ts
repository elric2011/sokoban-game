import { describe, it, expect } from 'vitest';
import { parseLevel, parseAllLevels, findPlayerPosition, cloneMap, createInitialState } from '../engine/parser';
import { CHAR } from '../engine/constants';
import type { LevelData } from '../types/game';

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
    expect(level.width).toBe(16);
    expect(level.height).toBe(16);
    expect(level.id).toBe(1);
  });

  it('应补齐不足的列', () => {
    const lines = ['###'];
    const level = parseLevel(lines, 1);
    expect(level.map[0].length).toBe(16);
  });
});

describe('parseAllLevels', () => {
  it('应解析所有关卡', () => {
    const rawText = `
[level]
0000
0@ 0
0000

[level]
0000
0.$0
0000
`;
    const levels = parseAllLevels(rawText);
    expect(levels.length).toBe(2);
    expect(levels[0].id).toBe(1);
    expect(levels[1].id).toBe(2);
  });

  it('应忽略注释行', () => {
    const rawText = `
# This is a comment
[level]
0000
0@ 0
0000
`;
    const levels = parseAllLevels(rawText);
    expect(levels.length).toBe(1);
  });
});

describe('findPlayerPosition', () => {
  it('应找到玩家位置', () => {
    const map = [
      [CHAR.WALL, CHAR.WALL, CHAR.WALL],
      [CHAR.WALL, CHAR.PLAYER, CHAR.EMPTY],
      [CHAR.WALL, CHAR.WALL, CHAR.WALL]
    ];
    const pos = findPlayerPosition(map);
    expect(pos).toEqual({ x: 1, y: 1 });
  });

  it('应找到玩家在目标上的位置', () => {
    const map = [
      [CHAR.WALL, CHAR.WALL, CHAR.WALL],
      [CHAR.WALL, CHAR.PLAYER_ON_TARGET, CHAR.EMPTY],
      [CHAR.WALL, CHAR.WALL, CHAR.WALL]
    ];
    const pos = findPlayerPosition(map);
    expect(pos).toEqual({ x: 1, y: 1 });
  });

  it('找不到玩家时返回默认值', () => {
    const map = [
      [CHAR.WALL, CHAR.WALL],
      [CHAR.WALL, CHAR.WALL]
    ];
    const pos = findPlayerPosition(map);
    expect(pos).toEqual({ x: 0, y: 0 });
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

describe('createInitialState', () => {
  it('应创建初始游戏状态', () => {
    const levelData: LevelData = {
      id: 1,
      width: 3,
      height: 3,
      map: [
        [CHAR.WALL, CHAR.WALL, CHAR.WALL],
        [CHAR.WALL, CHAR.PLAYER, CHAR.EMPTY],
        [CHAR.WALL, CHAR.WALL, CHAR.WALL]
      ]
    };
    const state = createInitialState(levelData);
    expect(state.level).toBe(1);
    expect(state.moves).toBe(0);
    expect(state.pushes).toBe(0);
    expect(state.playerPos).toEqual({ x: 1, y: 1 });
  });
});
