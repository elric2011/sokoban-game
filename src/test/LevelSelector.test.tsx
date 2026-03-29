import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LevelSelector } from '../components/LevelSelector';

describe('LevelSelector', () => {
  const mockHandlers = {
    onChange: vi.fn(),
    onPrev: vi.fn(),
    onNext: vi.fn(),
  };

  it('应渲染关卡选择器', () => {
    render(<LevelSelector currentLevel={1} totalLevels={18} {...mockHandlers} />);
    expect(screen.getByText('← 上一关')).toBeInTheDocument();
    expect(screen.getByText('下一关 →')).toBeInTheDocument();
  });

  it('第一关时上一关按钮应禁用', () => {
    render(<LevelSelector currentLevel={1} totalLevels={18} {...mockHandlers} />);
    expect(screen.getByText('← 上一关')).toBeDisabled();
  });

  it('最后一关时下一关按钮应禁用', () => {
    render(<LevelSelector currentLevel={18} totalLevels={18} {...mockHandlers} />);
    expect(screen.getByText('下一关 →')).toBeDisabled();
  });

  it('点击上一关应触发 onPrev', () => {
    render(<LevelSelector currentLevel={5} totalLevels={18} {...mockHandlers} />);
    fireEvent.click(screen.getByText('← 上一关'));
    expect(mockHandlers.onPrev).toHaveBeenCalled();
  });

  it('点击下一关应触发 onNext', () => {
    render(<LevelSelector currentLevel={5} totalLevels={18} {...mockHandlers} />);
    fireEvent.click(screen.getByText('下一关 →'));
    expect(mockHandlers.onNext).toHaveBeenCalled();
  });

  it('选择关卡应触发 onChange', () => {
    render(<LevelSelector currentLevel={1} totalLevels={18} {...mockHandlers} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '5' } });
    expect(mockHandlers.onChange).toHaveBeenCalledWith(5);
  });
});
