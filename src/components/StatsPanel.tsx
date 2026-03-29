// src/components/StatsPanel.tsx

interface StatsPanelProps {
  moves: number;
  pushes: number;
}

export function StatsPanel({ moves, pushes }: StatsPanelProps) {
  return (
    <div className="flex justify-center gap-8 mb-5 py-3 px-5 bg-slate-800 rounded-lg">
      <div className="text-center">
        <div className="text-xs text-gray-400 mb-1">步数</div>
        <div className="text-2xl font-bold text-sky-400">{moves}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-400 mb-1">推箱子</div>
        <div className="text-2xl font-bold text-orange-400">{pushes}</div>
      </div>
    </div>
  );
}
