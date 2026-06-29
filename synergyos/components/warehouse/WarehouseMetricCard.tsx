type WarehouseMetricCardProps = {
  title: string;
  value: string;
  detail: string;
};

export function WarehouseMetricCard({ title, value, detail }: WarehouseMetricCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-cyan-300">{detail}</p>
    </div>
  );
}
