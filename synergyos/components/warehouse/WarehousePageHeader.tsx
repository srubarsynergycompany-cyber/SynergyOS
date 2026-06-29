import type { ReactNode } from "react";

type WarehousePageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
};

export function WarehousePageHeader({ eyebrow, title, subtitle, action }: WarehousePageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
