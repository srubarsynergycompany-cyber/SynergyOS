type InventoryStatusBadgeProps = {
  status: string;
  labels?: {
    inStock: string;
    lowStock: string;
    critical: string;
    reserved: string;
  };
};

export function InventoryStatusBadge({ status, labels }: InventoryStatusBadgeProps) {
  const styles = {
    "In stock": "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    "Low stock": "border-amber-500/30 bg-amber-500/10 text-amber-300",
    Critical: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    Reserved: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  } as const;

  const fallbackLabels = {
    inStock: 'In stock',
    lowStock: 'Low stock',
    critical: 'Critical',
    reserved: 'Reserved',
  };

  const localized = labels ?? fallbackLabels;
  const statusLabelMap: Record<string, string> = {
    'In stock': localized.inStock,
    'Low stock': localized.lowStock,
    Critical: localized.critical,
    Reserved: localized.reserved,
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[status as keyof typeof styles] ?? "border-slate-700 bg-slate-800 text-slate-300"}`}>
      {statusLabelMap[status] ?? status}
    </span>
  );
}
