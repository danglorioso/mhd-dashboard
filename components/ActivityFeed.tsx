import { Activity, GitCommit, GitPullRequest, MessageSquare, GitMerge, Star } from 'lucide-react';
import { ActivityEvent } from '@/lib/github';

interface Props {
  events: ActivityEvent[];
}

function eventIcon(type: string) {
  switch (type) {
    case 'PushEvent': return <GitCommit size={13} className="text-blue-400" />;
    case 'PullRequestEvent': return <GitPullRequest size={13} className="text-green-400" />;
    case 'IssuesEvent': return <Activity size={13} className="text-red-400" />;
    case 'IssueCommentEvent': return <MessageSquare size={13} className="text-slate-400" />;
    case 'PullRequestReviewEvent': return <GitMerge size={13} className="text-purple-400" />;
    case 'WatchEvent': return <Star size={13} className="text-amber-400" />;
    default: return <Activity size={13} className="text-slate-500" />;
  }
}

function eventDescription(event: ActivityEvent): string {
  const p = event.payload;
  switch (event.type) {
    case 'PushEvent': {
      const commits = (p.commits as unknown[]) ?? [];
      return `pushed ${commits.length} commit${commits.length !== 1 ? 's' : ''}`;
    }
    case 'PullRequestEvent': {
      const action = (p.action as string) ?? '';
      const pr = p.pull_request as { number: number; title: string } | undefined;
      return `${action} PR #${pr?.number ?? '?'}: ${pr?.title?.slice(0, 40) ?? ''}`;
    }
    case 'IssuesEvent': {
      const action = (p.action as string) ?? '';
      const issue = p.issue as { number: number; title: string } | undefined;
      return `${action} issue #${issue?.number ?? '?'}: ${issue?.title?.slice(0, 40) ?? ''}`;
    }
    case 'IssueCommentEvent': {
      const issue = p.issue as { number: number } | undefined;
      return `commented on #${issue?.number ?? '?'}`;
    }
    case 'PullRequestReviewEvent': {
      const pr = p.pull_request as { number: number } | undefined;
      return `reviewed PR #${pr?.number ?? '?'}`;
    }
    default:
      return event.type.replace('Event', '');
  }
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityFeed({ events }: Props) {
  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl flex flex-col overflow-hidden h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 shrink-0">
        <Activity size={16} className="text-teal-400" />
        <span className="font-semibold text-white text-sm">Live Activity</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-medium">LIVE</span>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {events.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-sm">No recent activity</div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="shrink-0">{eventIcon(event.type)}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.actor.avatar_url}
                alt={event.actor.login}
                className="w-5 h-5 rounded-full border border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-indigo-300">{event.actor.login}</span>
                <span className="text-xs text-slate-400"> {eventDescription(event)}</span>
              </div>
              <span className="text-[10px] text-slate-600 shrink-0 tabular-nums">{timeAgo(event.created_at)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
