type StatusBadgeProps = {
  label: string;
  tone?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';
};

export function StatusBadge({ label, tone = 'cyan' }: StatusBadgeProps) {
  const styles = {
    cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    rose: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    slate: 'border-slate-700 bg-slate-800 text-slate-300',
  } as const;

  return <span className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[tone]}`}>{label}</span>;
}
