import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GameCanvas } from '../components/GameCanvas';
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
