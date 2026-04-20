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
  const tz = 'America/New_York';
  const now = new Date();
  // Get today's date in ET (YYYY-MM-DD)
  const etDate = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now);
  const [y, m, d] = etDate.split('-').map(Number);
  // Determine UTC offset for ET right now (4h EDT, 5h EST) — handles DST automatically
  const etHour = +new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).format(now) % 24;
  const offsetH = ((now.getUTCHours() - etHour) + 24) % 24;
  // Midnight ET expressed as UTC
  return new Date(Date.UTC(y, m - 1, d, offsetH, 0, 0)).toISOString();
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
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Fetch all branches alongside today's default-branch commits
  const [branches, todayCommits] = await Promise.all([
    ghFetch<{ name: string }[]>(`/branches?per_page=100`, token),
    ghFetch<{ sha: string; commit: { committer: { date: string } } }[]>(
      `/commits?since=${since}&per_page=30`,
      token,
    ),
  ]);

  // For each branch, fetch commits from the last hour.
  // A 1-hour window is wide enough that GitHub's commit-date filter is reliable —
  // nobody holds local commits for over an hour during a bug bash.
  const perBranch = await Promise.all(
    branches.slice(0, 20).map((b) =>
      ghFetch<{ sha: string; commit: { committer: { date: string } } }[]>(
        `/commits?sha=${encodeURIComponent(b.name)}&since=${oneHourAgo}&per_page=10`,
        token,
      ).catch(() => [] as { sha: string; commit: { committer: { date: string } } }[]),
    ),
  );

  // Deduplicate SHAs from all branches that fall inside the 1-hour window
  const windowShas = new Set<string>();
  for (const commits of perBranch) {
    for (const c of commits) windowShas.add(c.sha);
  }

  // Fetch stats for window SHAs + today's default-branch commits (deduped, capped at 40)
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
