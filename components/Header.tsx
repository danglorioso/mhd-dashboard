'use client';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface Props {
  lastUpdated: string | null;
  refreshIn: number;
  isLoading: boolean;
}

export default function Header({ lastUpdated, refreshIn, isLoading }: Props) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
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
