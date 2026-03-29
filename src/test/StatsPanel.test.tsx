import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsPanel } from '../components/StatsPanel';

describe('StatsPanel', () => {
  it('应显示步数和推箱子数', () => {
    render(<StatsPanel moves={42} pushes={10} />);
    expect(screen.getByText('步数')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('推箱子')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('应正确显示零值', () => {
    render(<StatsPanel moves={0} pushes={0} />);
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(2);
  });

  it('应正确显示大数值', () => {
    render(<StatsPanel moves={999} pushes={888} />);
    expect(screen.getByText('999')).toBeInTheDocument();
    expect(screen.getByText('888')).toBeInTheDocument();
  });
});
