type TimelineStep = {
  label: string;
  done: boolean;
};

type TimelineProps = {
  title: string;
  steps: TimelineStep[];
  doneLabel: string;
  pendingLabel: string;
};

export function Timeline({ title, steps, doneLabel, pendingLabel }: TimelineProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full ${step.done ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-500"}`}>
              {step.done ? "✓" : index + 1}
            </div>
            <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <p className="text-sm font-medium text-slate-100">{step.label}</p>
              <p className="mt-1 text-xs text-slate-500">{step.done ? doneLabel : pendingLabel}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
