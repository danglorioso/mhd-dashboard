import { GitPullRequest, GitMerge, FileDiff } from 'lucide-react';
import { PullRequest } from '@/lib/github';

interface Props {
  openPRs: PullRequest[];
  mergedToday: PullRequest[];
}

function PRRow({ pr, merged }: { pr: PullRequest; merged?: boolean }) {
  return (
    <a
      href={pr.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
    >
      {merged ? (
        <GitMerge size={15} className="text-purple-400 mt-0.5 shrink-0" />
      ) : (
        <GitPullRequest
          size={15}
          className={pr.draft ? 'text-slate-500 mt-0.5 shrink-0' : 'text-green-400 mt-0.5 shrink-0'}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 text-xs font-mono">#{pr.number}</span>
          <span className="text-sm text-slate-200 group-hover:text-white transition-colors truncate">
            {pr.title}
          </span>
          {pr.draft && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 border border-slate-600 shrink-0">
              Draft
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-slate-500">@{pr.user.login}</span>
          {(pr.additions !== undefined || pr.deletions !== undefined) && (
            <span className="flex items-center gap-1 text-[10px]">
              <FileDiff size={10} className="text-slate-600" />
              <span className="text-green-500">+{pr.additions ?? '?'}</span>
              <span className="text-red-500">-{pr.deletions ?? '?'}</span>
            </span>
          )}
        </div>
      </div>
      {pr.requested_reviewers?.length > 0 && (
        <div className="flex -space-x-1.5 shrink-0">
          {pr.requested_reviewers.slice(0, 2).map((r) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={r.login}
              src={r.avatar_url}
              alt={r.login}
              title={`Review requested: ${r.login}`}
              className="w-5 h-5 rounded-full border border-slate-700 opacity-70"
            />
          ))}
        </div>
      )}
    </a>
  );
}

export default function PRsList({ openPRs, mergedToday }: Props) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="bg-[#111827] border border-white/10 rounded-2xl flex flex-col overflow-hidden flex-1 min-h-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <GitPullRequest size={16} className="text-green-400" />
            <span className="font-semibold text-white text-sm">Open Pull Requests</span>
          </div>
          <span className="text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-2.5 py-0.5">
            {openPRs.length}
          </span>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
          {openPRs.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">No open PRs</div>
          ) : (
            openPRs.map((pr) => <PRRow key={pr.id} pr={pr} />)
          )}
        </div>
      </div>

      <div className="bg-[#111827] border border-white/10 rounded-2xl flex flex-col overflow-hidden" style={{ maxHeight: '220px' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <GitMerge size={16} className="text-purple-400" />
            <span className="font-semibold text-white text-sm">Merged Today</span>
          </div>
          <span className="text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2.5 py-0.5">
            {mergedToday.length}
          </span>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
          {mergedToday.length === 0 ? (
            <div className="text-center text-slate-500 py-4 text-sm">None yet!</div>
          ) : (
            mergedToday.map((pr) => <PRRow key={pr.id} pr={pr} merged />)
          )}
        </div>
      </div>
    </div>
  );
}
