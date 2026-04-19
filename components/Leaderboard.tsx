import { Trophy } from 'lucide-react';
import { CommitAuthor } from '@/lib/github';

interface Props {
  leaderboard: CommitAuthor[];
  commitsToday: number;
}

const medalColors = ['text-amber-400', 'text-slate-300', 'text-amber-600'];
const barColors = ['bg-amber-500', 'bg-slate-400', 'bg-amber-700', 'bg-indigo-500', 'bg-teal-500', 'bg-pink-500'];

export default function Leaderboard({ leaderboard, commitsToday }: Props) {
  const max = leaderboard[0]?.count ?? 1;

  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl flex flex-col overflow-hidden h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-amber-400" />
          <span className="font-semibold text-white text-sm">Today&apos;s Leaderboard</span>
        </div>
        <span className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full px-2.5 py-0.5">
          {commitsToday} commits
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-sm">
            No commits yet today — let&apos;s go!
          </div>
        ) : (
          leaderboard.map((author, i) => (
            <div key={author.login} className="flex items-center gap-3">
              <div className="w-6 shrink-0 text-center">
                {i < 3 ? (
                  <Trophy size={14} className={medalColors[i]} />
                ) : (
                  <span className="text-xs text-slate-600 font-mono">{i + 1}</span>
                )}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={author.avatar_url}
                alt={author.login}
                className="w-7 h-7 rounded-full border border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-200 truncate">{author.login}</span>
                  <span className="text-sm font-bold text-white ml-2 tabular-nums">{author.count}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColors[i % barColors.length]}`}
                    style={{ width: `${(author.count / max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
