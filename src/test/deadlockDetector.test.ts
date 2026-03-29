import { describe, it, expect } from 'vitest';
import { detectDeadlock } from '../engine/deadlockDetector';
import { CHAR } from '../engine/constants';

describe('detectDeadlock', () => {
  it('应检测到角落死锁（左上墙角）', () => {
    const map = [
      [CHAR.WALL, CHAR.WALL, CHAR.WALL],
      [CHAR.WALL, CHAR.BOX, CHAR.EMPTY],
      [CHAR.WALL, CHAR.EMPTY, CHAR.EMPTY]
    ];
    expect(detectDeadlock(map)).toBe(true);
  });

  it('应检测到角落死锁（右上墙角）', () => {
    const map = [
      [CHAR.WALL, CHAR.WALL, CHAR.WALL],
      [CHAR.EMPTY, CHAR.BOX, CHAR.WALL],
      [CHAR.EMPTY, CHAR.EMPTY, CHAR.WALL]
    ];
    expect(detectDeadlock(map)).toBe(true);
  });

  it('应检测到角落死锁（左下墙角）', () => {
    const map = [
      [CHAR.WALL, CHAR.EMPTY, CHAR.EMPTY],
      [CHAR.WALL, CHAR.BOX, CHAR.EMPTY],
      [CHAR.WALL, CHAR.WALL, CHAR.WALL]
    ];
    expect(detectDeadlock(map)).toBe(true);
  });

  it('应检测到角落死锁（右下墙角）', () => {
    const map = [
      [CHAR.EMPTY, CHAR.EMPTY, CHAR.WALL],
      [CHAR.EMPTY, CHAR.BOX, CHAR.WALL],
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
    // 箱子在中央，四周都有空间
    const map = [
      [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL],
      [CHAR.WALL, CHAR.EMPTY, CHAR.EMPTY, CHAR.EMPTY, CHAR.EMPTY, CHAR.EMPTY, CHAR.WALL],
      [CHAR.WALL, CHAR.EMPTY, CHAR.BOX, CHAR.EMPTY, CHAR.EMPTY, CHAR.EMPTY, CHAR.WALL],
      [CHAR.WALL, CHAR.EMPTY, CHAR.EMPTY, CHAR.EMPTY, CHAR.EMPTY, CHAR.EMPTY, CHAR.WALL],
      [CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL, CHAR.WALL]
    ];
    expect(detectDeadlock(map)).toBe(false);
  });

  it('空地图不应有死锁', () => {
    const map: string[][] = [];
    expect(detectDeadlock(map)).toBe(false);
  });

  it('无箱子的地图不应有死锁', () => {
    const map = [
      [CHAR.WALL, CHAR.WALL],
      [CHAR.WALL, CHAR.PLAYER]
    ];
    expect(detectDeadlock(map)).toBe(false);
  });
});
