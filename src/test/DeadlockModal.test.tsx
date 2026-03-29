import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeadlockModal } from '../components/DeadlockModal';

describe('DeadlockModal', () => {
  it('isOpen=false 时不应渲染', () => {
    const { container } = render(<DeadlockModal isOpen={false} onUndo={vi.fn()} onRestart={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('isOpen=true 时应渲染弹窗', () => {
    render(<DeadlockModal isOpen={true} onUndo={vi.fn()} onRestart={vi.fn()} />);
    expect(screen.getByText('游戏结束')).toBeInTheDocument();
    expect(screen.getByText('箱子被推到死角，无法继续！')).toBeInTheDocument();
    expect(screen.getByText('撤销')).toBeInTheDocument();
    expect(screen.getByText('重置')).toBeInTheDocument();
  });

  it('点击撤销应触发 onUndo', () => {
    const onUndo = vi.fn();
    render(<DeadlockModal isOpen={true} onUndo={onUndo} onRestart={vi.fn()} />);
    fireEvent.click(screen.getByText('撤销'));
    expect(onUndo).toHaveBeenCalled();
  });

  it('点击重置应触发 onRestart', () => {
    const onRestart = vi.fn();
    render(<DeadlockModal isOpen={true} onUndo={vi.fn()} onRestart={onRestart} />);
    fireEvent.click(screen.getByText('重置'));
    expect(onRestart).toHaveBeenCalled();
  });
});
