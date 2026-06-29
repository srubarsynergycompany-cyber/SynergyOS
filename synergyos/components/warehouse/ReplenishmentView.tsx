import { WarehousePageHeader } from "@/components/warehouse/WarehousePageHeader";
import { WarehouseStatusPill } from "@/components/warehouse/WarehouseStatusPill";
import { replenishmentTasks } from "@/lib/warehouse/mockData";

export function ReplenishmentView() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <WarehousePageHeader
          eyebrow="Replenishment"
          title="Picking location replenishment"
          subtitle="Highlight low-stock picking zones, suggest replenishment actions, and confirm movement directly from the floor."
          action={<button className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">Confirm movement</button>}
        />

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
          <h2 className="text-xl font-semibold text-white">Suggested replenishment</h2>
          <div className="mt-4 space-y-3">
            {replenishmentTasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{task.location}</p>
                    <p className="text-sm text-slate-400">{task.sku}</p>
                  </div>
                  <WarehouseStatusPill label={task.priority} tone={task.priority === "High" ? "rose" : task.priority === "Medium" ? "amber" : "emerald"} />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                  <span>Required {task.required}</span>
                  <span>Available {task.available}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
