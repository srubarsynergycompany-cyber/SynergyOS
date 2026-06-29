type OperationAction = {
  key: string;
  label: string;
  primary?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

type OperationsPanelProps = {
  title: string;
  actions: OperationAction[];
};

export function OperationsPanel({ title, actions }: OperationsPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="mt-5 grid gap-3">
        {actions.map((action) => (
          <button
            key={action.key}
            disabled={action.disabled}
            onClick={action.onClick}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${action.disabled ? "cursor-not-allowed border-slate-800 bg-slate-950/70 text-slate-600" : action.primary ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" : "border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800"}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}
