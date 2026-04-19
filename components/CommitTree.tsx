'use client';

// Health thresholds: lines changed in the last hour
const THRESHOLDS = {
  thriving:   400,
  healthy:    200,
  wilting:    100,
  struggling:  40,
  dying:        1,
  // 0 → dead
} as const;

type HealthState = 'thriving' | 'healthy' | 'wilting' | 'struggling' | 'dying' | 'dead';

interface Props {
  linesLastHour: number;
}

function getState(lines: number): HealthState {
  if (lines >= THRESHOLDS.thriving)   return 'thriving';
  if (lines >= THRESHOLDS.healthy)    return 'healthy';
  if (lines >= THRESHOLDS.wilting)    return 'wilting';
  if (lines >= THRESHOLDS.struggling) return 'struggling';
  if (lines >= THRESHOLDS.dying)      return 'dying';
  return 'dead';
}

function nextThreshold(state: HealthState): { label: string; lines: number } | null {
  const steps: { state: HealthState; label: string; lines: number }[] = [
    { state: 'dying',      label: 'DYING',      lines: THRESHOLDS.dying      },
    { state: 'struggling', label: 'STRUGGLING', lines: THRESHOLDS.struggling },
    { state: 'wilting',    label: 'WILTING',    lines: THRESHOLDS.wilting    },
    { state: 'healthy',    label: 'HEALTHY',    lines: THRESHOLDS.healthy    },
    { state: 'thriving',   label: 'THRIVING',   lines: THRESHOLDS.thriving   },
  ];
  for (const step of steps) {
    if (state !== step.state && step.lines > (THRESHOLDS[state as keyof typeof THRESHOLDS] ?? 0)) {
      return step;
    }
  }
  return null;
}

const STATE_CFG = {
  thriving:   { label: 'THRIVING',   message: 'Keep it up! 🚀',           border: 'border-green-500/40',  text: 'text-green-300',  bar: 'bg-green-400',  svgAnim: 'sway 4s ease-in-out infinite',    foliage: ['#4ade80','#22c55e','#15803d'] as [string,string,string], trunk: '#78350f', glow: '#4ade80' },
  healthy:    { label: 'HEALTHY',    message: 'Looking good!',             border: 'border-green-500/30',  text: 'text-green-400',  bar: 'bg-green-500',  svgAnim: 'sway 6s ease-in-out infinite',    foliage: ['#22c55e','#16a34a','#14532d'] as [string,string,string], trunk: '#92400e', glow: null      },
  wilting:    { label: 'WILTING',    message: 'Write more code! 😰',       border: 'border-yellow-500/30', text: 'text-yellow-300', bar: 'bg-yellow-400', svgAnim: 'droop 3s ease-in-out infinite',   foliage: ['#d9f99d','#a3e635','#65a30d'] as [string,string,string], trunk: '#a16207', glow: null      },
  struggling: { label: 'STRUGGLING', message: 'Push something! 😱',        border: 'border-orange-500/40', text: 'text-orange-300', bar: 'bg-orange-400', svgAnim: 'shake 0.6s ease-in-out infinite', foliage: ['#fdba74','#f97316','#c2410c'] as [string,string,string], trunk: '#b45309', glow: null      },
  dying:      { label: 'DYING',      message: '🚨 CODE OR THE TREE DIES!', border: 'border-red-500/60',    text: 'text-red-300',    bar: 'bg-red-500',    svgAnim: 'shake 0.2s ease-in-out infinite', foliage: ['#fca5a5','#ef4444','#991b1b'] as [string,string,string], trunk: '#7f1d1d', glow: '#ef4444' },
  dead:       { label: '💀 DEAD',    message: 'RIP. Write code to revive.',border: 'border-slate-600/30',  text: 'text-slate-400',  bar: 'bg-slate-600',  svgAnim: null,                              foliage: ['#374151','#374151','#374151'] as [string,string,string], trunk: '#374151', glow: null      },
};

const LEAVES = [
  { x: 45, y: 30, delay: '0s',   dur: '2.2s' },
  { x: 70, y: 45, delay: '0.6s', dur: '1.8s' },
  { x: 38, y: 55, delay: '1.1s', dur: '2.5s' },
  { x: 78, y: 35, delay: '0.3s', dur: '2.0s' },
  { x: 55, y: 25, delay: '1.5s', dur: '1.6s' },
];

function fmt(n: number) { return n.toLocaleString('en-US'); }

export default function CommitTree({ linesLastHour }: Props) {
  const state = getState(linesLastHour);
  const cfg = STATE_CFG[state];
  const next = nextThreshold(state);
  const pct = Math.min(100, Math.round((linesLastHour / THRESHOLDS.thriving) * 100));
  const isDead = state === 'dead';
  const showLeaves = state === 'dying' || state === 'struggling';
  const [f1, f2, f3] = cfg.foliage;

  // Tree grows from 0.4x (dead/0 lines) up to 1.1x (thriving/400+ lines)
  const scale = 0.4 + (Math.min(linesLastHour, THRESHOLDS.thriving) / THRESHOLDS.thriving) * 0.7;

  return (
    <div className={`bg-[#111827] border ${cfg.border} rounded-2xl flex flex-col overflow-hidden h-full`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 shrink-0">
        <span className="text-sm font-semibold text-white">Commit Tree</span>
        <span className={`text-xs font-bold ${cfg.text} uppercase tracking-widest`}>{cfg.label}</span>
      </div>

      {/* Tree SVG */}
      <div className="flex-1 flex items-center justify-center py-2 min-h-0">
        {/* Outer div scales the tree; inner div handles sway/shake animation */}
        <div style={{ transformOrigin: 'bottom center', transform: `scale(${scale})`, transition: 'transform 1.2s ease-out' }}>
        <div style={{ transformOrigin: 'bottom center', animation: cfg.svgAnim ?? undefined }}>
          <svg viewBox="0 0 120 130" width="110" height="110">
            {cfg.glow && (
              <defs>
                <filter id="tree-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
            )}

            {showLeaves && LEAVES.map((l, i) => (
              <circle key={i} cx={l.x} cy={l.y} r="3" fill={f1}
                style={{ animation: `leaf-fall ${l.dur} ${l.delay} ease-in infinite` }} />
            ))}

            {cfg.glow && (
              <ellipse cx="60" cy="60" rx="38" ry="45" fill={cfg.glow} opacity="0.15"
                style={{ animation: 'glow-pulse 1.5s ease-in-out infinite' }} />
            )}

            {isDead ? (
              <g stroke={cfg.trunk} strokeLinecap="round">
                <rect x="52" y="75" width="16" height="48" rx="3" fill={cfg.trunk} stroke="none" />
                <line x1="60" y1="85" x2="28" y2="52" strokeWidth="5" />
                <line x1="28" y1="52" x2="14" y2="42" strokeWidth="3" />
                <line x1="28" y1="52" x2="22" y2="35" strokeWidth="2.5" />
                <line x1="60" y1="78" x2="92" y2="48" strokeWidth="5" />
                <line x1="92" y1="48" x2="105" y2="38" strokeWidth="3" />
                <line x1="92" y1="48" x2="98" y2="32" strokeWidth="2.5" />
                <line x1="60" y1="72" x2="60" y2="38" strokeWidth="4" />
                <line x1="60" y1="50" x2="48" y2="36" strokeWidth="2.5" />
                <line x1="60" y1="50" x2="72" y2="36" strokeWidth="2.5" />
              </g>
            ) : (
              <g filter={cfg.glow ? 'url(#tree-glow)' : undefined}>
                <rect x="52" y="88" width="16" height="38" rx="3" fill={cfg.trunk} />
                <polygon points="60,8 26,58 94,58"  fill={f1} />
                <polygon points="60,26 20,74 100,74" fill={f2} />
                <polygon points="60,46 16,92 104,92" fill={f3} />
              </g>
            )}

            <ellipse cx="60" cy="127" rx="22" ry="4" fill="rgba(0,0,0,0.4)" />
          </svg>
        </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 pt-1 shrink-0 space-y-2">
        <p className={`text-center text-xs font-semibold ${cfg.text}`}>{cfg.message}</p>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>health</span>
            <span className={cfg.text}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex justify-between text-[10px] tabular-nums">
          <span className="text-slate-500">
            last 10 min: <span className="text-slate-200 font-semibold">{fmt(linesLastHour)} lines</span>
          </span>
          {next ? (
            <span className="text-slate-500">
              <span className={cfg.text}>{fmt(next.lines - linesLastHour)} more</span> → {next.label}
            </span>
          ) : (
            <span className="text-green-400 font-semibold">max health!</span>
          )}
        </div>
      </div>
    </div>
  );
}
