type InventoryToolbarProps = {
  buttons: Array<{ label: string; onClick?: () => void }>;
};

export function InventoryToolbar({ buttons }: InventoryToolbarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {buttons.map((button) => (
        <button
          key={button.label}
          type="button"
          onClick={button.onClick}
          className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}
