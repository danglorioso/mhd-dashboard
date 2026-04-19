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
  linesChangedLastHour: number;
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
  const windowStart = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  // Fetch events (all branches) and today's default-branch commits in parallel
  const [events, todayCommits] = await Promise.all([
    ghFetch<{ type: string; created_at: string; payload: { commits?: { sha: string }[] } }[]>(
      `/events?per_page=100`,
      token,
    ),
    ghFetch<{ sha: string }[]>(`/commits?since=${since}&per_page=30`, token),
  ]);

  // SHAs pushed to ANY branch in the last 10 minutes
  const windowShas = new Set<string>();
  for (const e of events) {
    if (e.type === 'PushEvent' && e.created_at >= windowStart) {
      for (const c of e.payload.commits ?? []) windowShas.add(c.sha);
    }
  }

  // Fetch stats for window SHAs + today's commits (deduped, capped at 40)
  const allShas = [...new Set([...windowShas, ...todayCommits.map((c) => c.sha)])].slice(0, 40);
  const statsResults = await Promise.all(
    allShas.map((sha) =>
      ghFetch<{ stats: { additions: number; deletions: number } }>(`/commits/${sha}`, token).catch(
        () => ({ stats: { additions: 0, deletions: 0 } }),
      ),
    ),
  );
  const statsMap = new Map(allShas.map((sha, i) => [sha, statsResults[i].stats]));

  let linesAdded = 0, linesDeleted = 0;
  for (const c of todayCommits) {
    const s = statsMap.get(c.sha);
    if (s) { linesAdded += s.additions; linesDeleted += s.deletions; }
  }

  let linesChangedLastHour = 0;
  for (const sha of windowShas) {
    const s = statsMap.get(sha);
    if (s) linesChangedLastHour += s.additions + s.deletions;
  }

  return { linesAdded, linesDeleted, linesChangedLastHour };
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
