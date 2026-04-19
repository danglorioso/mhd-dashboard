import { TrendingUp, TrendingDown, Code2 } from 'lucide-react';
import { LinesData } from '@/lib/github';

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

export default function LinesBanner({ data }: { data: LinesData | undefined }) {
  const added = data?.linesAdded ?? 0;
  const deleted = data?.linesDeleted ?? 0;
  const net = added - deleted;

  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl px-8 py-3 flex items-center justify-center gap-12 shrink-0">
      <div className="flex items-center gap-3">
        <TrendingUp size={18} className="text-green-400" />
        <span className="text-2xl font-bold tabular-nums text-green-300">+{fmt(added)}</span>
        <span className="text-sm text-slate-500 uppercase tracking-wide">lines added</span>
      </div>

      <div className="w-px h-6 bg-white/10" />

      <div className="flex items-center gap-3">
        <TrendingDown size={18} className="text-red-400" />
        <span className="text-2xl font-bold tabular-nums text-red-300">−{fmt(deleted)}</span>
        <span className="text-sm text-slate-500 uppercase tracking-wide">lines removed</span>
      </div>

      <div className="w-px h-6 bg-white/10" />

      <div className="flex items-center gap-3">
        <Code2 size={18} className="text-slate-400" />
        <span className={`text-2xl font-bold tabular-nums ${net >= 0 ? 'text-slate-200' : 'text-amber-300'}`}>
          {net >= 0 ? '+' : ''}{fmt(net)}
        </span>
        <span className="text-sm text-slate-500 uppercase tracking-wide">net change</span>
      </div>
    </div>
  );
}
