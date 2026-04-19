import { Target } from 'lucide-react';

interface Props {
  closedToday: number;
  openIssues: number;
}

export default function ProgressBar({ closedToday, openIssues }: Props) {
  const total = closedToday + openIssues;
  const pct = total === 0 ? 0 : Math.round((closedToday / total) * 100);

  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-indigo-400" />
          <span className="font-semibold text-white text-sm">Bug Bash Progress</span>
          <span className="text-xs text-slate-500">issues closed today vs remaining open</span>
        </div>
        <span className="text-sm font-bold text-white tabular-nums">
          {closedToday} / {total}
          <span className="ml-2 text-indigo-300">{pct}%</span>
        </span>
      </div>
      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-slate-600">
        <span>{closedToday} closed today</span>
        <span>{openIssues} still open</span>
      </div>
    </div>
  );
}
