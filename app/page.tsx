'use client';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, GitPullRequest, GitMerge, GitCommit } from 'lucide-react';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import IssuesList from '@/components/IssuesList';
import PRsList from '@/components/PRsList';
import Leaderboard from '@/components/Leaderboard';
import ActivityFeed from '@/components/ActivityFeed';
import ProgressBar from '@/components/ProgressBar';
import CommitTree from '@/components/CommitTree';
import { DashboardData, LinesData } from '@/lib/github';

const REFRESH_INTERVAL = 10;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const { data, error, isValidating } = useSWR<DashboardData>('/api/github', fetcher, {
    refreshInterval: REFRESH_INTERVAL * 1000,
    revalidateOnFocus: false,
  });

  const { data: linesData } = useSWR<LinesData>('/api/github/lines', fetcher, {
    refreshInterval: 90 * 1000,
    revalidateOnFocus: false,
  });

  const [refreshIn, setRefreshIn] = useState(REFRESH_INTERVAL);

  useEffect(() => {
    setRefreshIn(REFRESH_INTERVAL);
    const id = setInterval(() => {
      setRefreshIn((s) => (s <= 1 ? REFRESH_INTERVAL : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [data]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="text-red-400 mx-auto mb-3" size={40} />
          <h2 className="text-white font-bold text-lg mb-2">Failed to load data</h2>
          <p className="text-slate-400 text-sm">{error.message ?? 'Check your GITHUB_TOKEN env var.'}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0e1a] flex flex-col text-white overflow-hidden">
      <Header
        lastUpdated={data.lastUpdated}
        refreshIn={refreshIn}
        isLoading={isValidating}
        linesData={linesData}
      />

      <main className="flex-1 flex flex-col gap-3 p-4 min-h-0">
        {/* Stat Cards */}
        <div className="grid grid-cols-5 gap-3 shrink-0">
          <StatCard
            label="Open Issues"
            value={data.openIssues.length}
            icon={AlertCircle}
            color="red"
            subtitle="need attention"
          />
          <StatCard
            label="Closed Today"
            value={data.closedToday.length}
            icon={CheckCircle2}
            color="green"
            subtitle="issues resolved"
          />
          <StatCard
            label="Open PRs"
            value={data.openPRs.length}
            icon={GitPullRequest}
            color="blue"
            subtitle="awaiting review/merge"
          />
          <StatCard
            label="Merged Today"
            value={data.mergedToday.length}
            icon={GitMerge}
            color="purple"
            subtitle="PRs landed"
          />
          <StatCard
            label="Commits Today"
            value={data.commitsToday}
            icon={GitCommit}
            color="amber"
            subtitle="pushed to all branches"
          />
        </div>

        {/* Progress Bar */}
        <div className="shrink-0">
          <ProgressBar
            closedToday={data.closedToday.length}
            openIssues={data.openIssues.length}
          />
        </div>

        {/* Main 3-column grid — fills all remaining height */}
        <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
          <ActivityFeed events={data.activity} />
          <PRsList
            openPRs={data.openPRs}
            mergedToday={data.mergedToday}
          />
          {/* Right column: tree / leaderboard / issues */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="min-h-0" style={{ flex: '33' }}>
              <CommitTree linesLastHour={linesData?.linesChangedLastHour ?? 0} />
            </div>
            <div className="min-h-0" style={{ flex: '37' }}>
              <Leaderboard
                leaderboard={data.todayLeaderboard}
                commitsToday={data.commitsToday}
              />
            </div>
            <div className="min-h-0" style={{ flex: '30' }}>
              <IssuesList
                openIssues={data.openIssues}
                closedToday={data.closedToday}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
