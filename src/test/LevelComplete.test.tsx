import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LevelComplete } from '../components/LevelComplete';

describe('LevelComplete', () => {
  it('isOpen=false 时不应渲染', () => {
    const { container } = render(
      <LevelComplete isOpen={false} moves={42} pushes={10} isLastLevel={false} onNext={vi.fn()} onReplay={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('应显示通关信息和统计数据', () => {
    render(
      <LevelComplete isOpen={true} moves={42} pushes={10} isLastLevel={false} onNext={vi.fn()} onReplay={vi.fn()} />
    );
    expect(screen.getByText('🎉 恭喜通关！')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('非最后一关应显示下一关按钮', () => {
    render(
      <LevelComplete isOpen={true} moves={42} pushes={10} isLastLevel={false} onNext={vi.fn()} onReplay={vi.fn()} />
    );
    expect(screen.getByText('下一关')).toBeInTheDocument();
    expect(screen.getByText('再玩一次')).toBeInTheDocument();
  });

  it('最后一关不应显示下一关按钮', () => {
    render(
      <LevelComplete isOpen={true} moves={42} pushes={10} isLastLevel={true} onNext={vi.fn()} onReplay={vi.fn()} />
    );
    expect(screen.queryByText('下一关')).not.toBeInTheDocument();
    expect(screen.getByText('再玩一次')).toBeInTheDocument();
  });

  it('点击下一关应触发 onNext', () => {
    const onNext = vi.fn();
    render(
      <LevelComplete isOpen={true} moves={42} pushes={10} isLastLevel={false} onNext={onNext} onReplay={vi.fn()} />
    );
    fireEvent.click(screen.getByText('下一关'));
    expect(onNext).toHaveBeenCalled();
  });

  it('点击再玩一次应触发 onReplay', () => {
    const onReplay = vi.fn();
    render(
      <LevelComplete isOpen={true} moves={42} pushes={10} isLastLevel={false} onNext={vi.fn()} onReplay={onReplay} />
    );
    fireEvent.click(screen.getByText('再玩一次'));
    expect(onReplay).toHaveBeenCalled();
  });
});
