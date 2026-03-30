import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TouchControls } from '../components/TouchControls';

describe('TouchControls', () => {
  const mockHandlers = {
    onDirection: vi.fn(),
    onUndo: vi.fn(),
    onRestart: vi.fn(),
    onAISolve: vi.fn(),
  };

  it('visible=false 时不应渲染', () => {
    const { container } = render(<TouchControls {...mockHandlers} visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('visible=true 时应渲染所有按钮', () => {
    render(<TouchControls {...mockHandlers} visible={true} />);
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('撤销')).toBeInTheDocument();
    expect(screen.getByText('重置')).toBeInTheDocument();
  });

  it('点击方向按钮应触发 onDirection', () => {
    render(<TouchControls {...mockHandlers} visible={true} />);

    fireEvent.click(screen.getByText('↑'));
    expect(mockHandlers.onDirection).toHaveBeenCalledWith('UP');

    fireEvent.click(screen.getByText('↓'));
    expect(mockHandlers.onDirection).toHaveBeenCalledWith('DOWN');

    fireEvent.click(screen.getByText('←'));
    expect(mockHandlers.onDirection).toHaveBeenCalledWith('LEFT');

    fireEvent.click(screen.getByText('→'));
    expect(mockHandlers.onDirection).toHaveBeenCalledWith('RIGHT');
  });

  it('点击撤销应触发 onUndo', () => {
    render(<TouchControls {...mockHandlers} visible={true} />);
    fireEvent.click(screen.getByText('撤销'));
    expect(mockHandlers.onUndo).toHaveBeenCalled();
  });

  it('点击重置应触发 onRestart', () => {
    render(<TouchControls {...mockHandlers} visible={true} />);
    fireEvent.click(screen.getByText('重置'));
    expect(mockHandlers.onRestart).toHaveBeenCalled();
  });
});
