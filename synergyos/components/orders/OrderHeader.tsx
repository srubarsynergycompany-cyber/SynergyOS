import Link from "next/link";

type OrderHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  backLabel: string;
  locale: string;
};

export function OrderHeader({ eyebrow, title, subtitle, backLabel, locale }: OrderHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/${locale}/orders`} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
