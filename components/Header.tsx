'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import Image from 'next/image';
import { LinesData } from '@/lib/github';

interface Props {
  lastUpdated: string | null;
  refreshIn: number;
  isLoading: boolean;
  linesData: LinesData | undefined;
}

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

export default function Header({ lastUpdated, refreshIn, isLoading, linesData }: Props) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tz = 'America/New_York';
      setTime(now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const lastUpdatedFmt = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#0d1117]">
      <Image src="/logo.png" alt="Massachusetts Historical Society" height={64} width={200} className="object-contain object-left" />

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-green-400" />
          <span className="text-xl font-bold tabular-nums text-green-300">+{fmt(linesData?.linesAdded ?? 0)}</span>
          <span className="text-xs text-slate-500 uppercase tracking-wide">added</span>
        </div>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex items-center gap-2">
          <TrendingDown size={16} className="text-red-400" />
          <span className="text-xl font-bold tabular-nums text-red-300">−{fmt(linesData?.linesDeleted ?? 0)}</span>
          <span className="text-xs text-slate-500 uppercase tracking-wide">removed</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-4xl font-mono font-bold text-white tabular-nums">{time}</span>
        <span className="text-xs text-slate-400">{date}</span>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
          <RefreshCw
            size={12}
            className={isLoading ? 'animate-spin text-indigo-400' : 'text-slate-600'}
          />
          <span>
            Updated {lastUpdatedFmt} · refresh in{' '}
            <span className={refreshIn <= 3 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
              {refreshIn}s
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}
