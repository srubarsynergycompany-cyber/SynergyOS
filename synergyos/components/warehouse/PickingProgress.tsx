type PickingProgressProps = {
  currentIndex: number;
  totalItems: number;
  completed: boolean;
};

export function PickingProgress({ currentIndex, totalItems, completed }: PickingProgressProps) {
  const progress = totalItems === 0 ? 0 : Math.min(100, Math.round((currentIndex / totalItems) * 100));

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">Progress</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{completed ? "Picking completed" : `${currentIndex} / ${totalItems} products`}</h3>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200">
          {completed ? "Complete" : `${progress}%`}
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-cyan-500 transition-all duration-300" style={{ width: `${completed ? 100 : progress}%` }} />
      </div>
    </div>
  );
}
