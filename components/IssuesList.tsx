import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Issue } from '@/lib/github';

interface Props {
  openIssues: Issue[];
  closedToday: Issue[];
}

function labelStyle(color: string) {
  const hex = color.length === 6 ? color : '6e7681';
  return {
    backgroundColor: `#${hex}33`,
    borderColor: `#${hex}88`,
    color: `#${hex}`,
  };
}

function IssueRow({ issue, closed }: { issue: Issue; closed?: boolean }) {
  return (
    <a
      href={issue.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
    >
      {closed ? (
        <CheckCircle2 size={15} className="text-green-400 mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={15} className="text-slate-500 mt-0.5 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 text-xs font-mono">#{issue.number}</span>
          <span className="text-sm text-slate-200 group-hover:text-white transition-colors truncate">
            {issue.title}
          </span>
        </div>
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {issue.labels.slice(0, 4).map((l) => (
              <span
                key={l.name}
                className="text-[10px] px-1.5 py-0.5 rounded border font-medium"
                style={labelStyle(l.color)}
              >
                {l.name}
              </span>
            ))}
          </div>
        )}
      </div>
      {issue.assignees.length > 0 && (
        <div className="flex -space-x-1.5 shrink-0">
          {issue.assignees.slice(0, 3).map((a) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={a.login}
              src={a.avatar_url}
              alt={a.login}
              title={a.login}
              className="w-5 h-5 rounded-full border border-slate-700"
            />
          ))}
        </div>
      )}
    </a>
  );
}

export default function IssuesList({ openIssues, closedToday }: Props) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="bg-[#111827] border border-white/10 rounded-2xl flex flex-col overflow-hidden flex-1 min-h-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="font-semibold text-white text-sm">Open Issues</span>
          </div>
          <span className="text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 rounded-full px-2.5 py-0.5">
            {openIssues.length}
          </span>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
          {openIssues.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">No open issues 🎉</div>
          ) : (
            openIssues.map((i) => <IssueRow key={i.id} issue={i} />)
          )}
        </div>
      </div>

      <div className="bg-[#111827] border border-white/10 rounded-2xl flex flex-col overflow-hidden" style={{ maxHeight: '280px' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="font-semibold text-white text-sm">Closed Today</span>
          </div>
          <span className="text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-2.5 py-0.5">
            {closedToday.length}
          </span>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
          {closedToday.length === 0 ? (
            <div className="text-center text-slate-500 py-4 text-sm">None yet — let&apos;s go!</div>
          ) : (
            closedToday.map((i) => <IssueRow key={i.id} issue={i} closed />)
          )}
        </div>
      </div>
    </div>
  );
}
