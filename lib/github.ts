const OWNER = 'JumboCode';
const REPO = 'mhd';
const BASE = 'https://api.github.com';

export interface Issue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  user: { login: string; avatar_url: string };
  labels: { name: string; color: string }[];
  assignees: { login: string; avatar_url: string }[];
  created_at: string;
  closed_at: string | null;
  pull_request?: unknown;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  html_url: string;
  user: { login: string; avatar_url: string };
  state: string;
  draft: boolean;
  merged_at: string | null;
  created_at: string;
  additions: number;
  deletions: number;
  requested_reviewers: { login: string; avatar_url: string }[];
  labels: { name: string; color: string }[];
}

export interface CommitAuthor {
  login: string;
  avatar_url: string;
  count: number;
}

export interface ActivityEvent {
  id: string;
  type: string;
  actor: { login: string; avatar_url: string };
  created_at: string;
  payload: Record<string, unknown>;
}

export interface LinesData {
  linesAdded: number;
  linesDeleted: number;
}

export interface DashboardData {
  openIssues: Issue[];
  closedToday: Issue[];
  openPRs: PullRequest[];
  mergedToday: PullRequest[];
  commitsToday: number;
  todayLeaderboard: CommitAuthor[];
  activity: ActivityEvent[];
  totalIssuesEver: number;
  lastUpdated: string;
}

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function ghFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}/repos/${OWNER}/${REPO}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`GitHub API ${path} → ${res.status}`);
  return res.json();
}

export async function fetchLinesChanged(token: string): Promise<LinesData> {
  const since = todayISO();
  const commits = await ghFetch<{ sha: string }[]>(`/commits?since=${since}&per_page=30`, token);
  const stats = await Promise.all(
    commits.map((c) =>
      ghFetch<{ stats: { additions: number; deletions: number } }>(`/commits/${c.sha}`, token).catch(
        () => ({ stats: { additions: 0, deletions: 0 } }),
      ),
    ),
  );
  return {
    linesAdded: stats.reduce((s, c) => s + c.stats.additions, 0),
    linesDeleted: stats.reduce((s, c) => s + c.stats.deletions, 0),
  };
}

export async function fetchDashboard(token: string): Promise<DashboardData> {
  const since = todayISO();

  const [openIssuesRaw, closedTodayRaw, openPRs, closedPRs, commitsRaw, activity, repoInfo] =
    await Promise.all([
      ghFetch<Issue[]>(`/issues?state=open&per_page=100`, token),
      ghFetch<Issue[]>(`/issues?state=closed&since=${since}&per_page=100`, token),
      ghFetch<PullRequest[]>(`/pulls?state=open&per_page=100&sort=updated&direction=desc`, token),
      ghFetch<PullRequest[]>(`/pulls?state=closed&per_page=100&sort=updated&direction=desc`, token),
      ghFetch<{ author: { login: string; avatar_url: string } | null }[]>(
        `/commits?since=${since}&per_page=100`,
        token,
      ),
      ghFetch<ActivityEvent[]>(`/events?per_page=30`, token),
      ghFetch<{ open_issues_count: number }>(``, token),
    ]);

  // GitHub issues endpoint returns PRs too — filter them out
  const openIssues = openIssuesRaw.filter((i) => !i.pull_request);
  const closedToday = closedTodayRaw.filter((i) => !i.pull_request);

  const mergedToday = closedPRs.filter(
    (pr) => pr.merged_at && pr.merged_at >= since,
  );

  // Build today's leaderboard
  const authorMap = new Map<string, CommitAuthor>();
  for (const c of commitsRaw) {
    if (!c.author) continue;
    const { login, avatar_url } = c.author;
    const existing = authorMap.get(login);
    if (existing) existing.count++;
    else authorMap.set(login, { login, avatar_url, count: 1 });
  }
  const todayLeaderboard = [...authorMap.values()].sort((a, b) => b.count - a.count);

  return {
    openIssues,
    closedToday,
    openPRs,
    mergedToday,
    commitsToday: commitsRaw.length,
    todayLeaderboard,
    activity,
    totalIssuesEver: repoInfo.open_issues_count + closedToday.length,
    lastUpdated: new Date().toISOString(),
  };
}
