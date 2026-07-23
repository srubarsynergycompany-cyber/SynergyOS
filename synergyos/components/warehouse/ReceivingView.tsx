"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { WarehousePageHeader } from "@/components/warehouse/WarehousePageHeader";
import { WarehouseStatusPill } from "@/components/warehouse/WarehouseStatusPill";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { warehouseService } from '@/services/warehouse.service';
import { detectLocaleFromPath } from '@/utils/navigation';

export function ReceivingView() {
  const pathname = usePathname();
  const locale = useMemo(() => detectLocaleFromPath(pathname), [pathname]);
  const dictionary = useMemo(() => getDictionary(locale ?? 'cs'), [locale]);
  const copy = dictionary.modules.warehouse.receiving;
  const receivingTasks = warehouseService.listReceivingTasks();

  function getPriorityLabel(priority: "High" | "Medium" | "Low") {
    if (priority === "High") return copy.priority.high;
    if (priority === "Medium") return copy.priority.medium;
    return copy.priority.low;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <WarehousePageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          subtitle={copy.subtitle}
          action={<button className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">{copy.action}</button>}
        />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <h2 className="text-xl font-semibold text-white">{copy.queueTitle}</h2>
            <div className="mt-4 space-y-3">
              {receivingTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{task.product}</p>
                      <p className="text-sm text-slate-400">{task.poNumber} · {task.sku}</p>
                    </div>
                    <WarehouseStatusPill label={getPriorityLabel(task.priority)} tone={task.priority === "High" ? "amber" : task.priority === "Medium" ? "cyan" : "emerald"} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                    <span>{copy.qtyLabel} {task.quantity}</span>
                    <span>{task.location}</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${task.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h2 className="text-xl font-semibold text-white">{copy.dockActionsTitle}</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">{copy.dockAction1}</div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">{copy.dockAction2}</div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">{copy.dockAction3}</div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h2 className="text-xl font-semibold text-white">{copy.summaryTitle}</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3"><span>{copy.openTasks}</span><span className="font-semibold text-white">3</span></div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3"><span>{copy.awaitingLocation}</span><span className="font-semibold text-white">1</span></div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3"><span>{copy.readyToConfirm}</span><span className="font-semibold text-white">1</span></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
