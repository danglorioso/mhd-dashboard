import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: 'red' | 'green' | 'blue' | 'purple' | 'amber' | 'teal';
  subtitle?: string;
}

const colors = {
  red:    { bg: 'bg-red-500/10',    border: 'border-red-500/30',    icon: 'text-red-400',    value: 'text-red-300' },
  green:  { bg: 'bg-green-500/10',  border: 'border-green-500/30',  icon: 'text-green-400',  value: 'text-green-300' },
  blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   icon: 'text-blue-400',   value: 'text-blue-300' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-400', value: 'text-purple-300' },
  amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  icon: 'text-amber-400',  value: 'text-amber-300' },
  teal:   { bg: 'bg-teal-500/10',   border: 'border-teal-500/30',   icon: 'text-teal-400',   value: 'text-teal-300' },
};

export default function StatCard({ label, value, icon: Icon, color, subtitle }: Props) {
  const c = colors[color];
  return (
    <div className={`rounded-2xl border ${c.bg} ${c.border} p-5 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <Icon className={c.icon} size={20} />
      </div>
      <div className={`text-5xl font-bold tabular-nums ${c.value}`}>{value}</div>
      {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
    </div>
  );
}
