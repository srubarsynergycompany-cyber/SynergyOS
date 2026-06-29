type ProductCardProps = {
  productName: string;
  sku: string;
  location: string;
  requiredQuantity: number;
  pickedQuantity: number;
  isSuccess: boolean;
  isError: boolean;
};

export function ProductCard({ productName, sku, location, requiredQuantity, pickedQuantity, isSuccess, isError }: ProductCardProps) {
  const flashClass = isSuccess ? "border-emerald-500/60 bg-emerald-500/10" : isError ? "border-rose-500/60 bg-rose-500/10" : "border-slate-800 bg-slate-900/70";

  return (
    <div className={`rounded-3xl border p-6 shadow-2xl shadow-slate-950/40 transition-all duration-300 ${flashClass}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">Current product</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{productName}</h2>
          <p className="mt-2 text-sm text-slate-400">SKU: {sku}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Location</p>
          <p className="mt-1 font-semibold text-slate-100">{location}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Required quantity</p>
          <p className="mt-2 text-3xl font-semibold text-white">{requiredQuantity}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Picked quantity</p>
          <p className="mt-2 text-3xl font-semibold text-white">{pickedQuantity}</p>
        </div>
      </div>
    </div>
  );
}
