import { WarehousePageHeader } from "@/components/warehouse/WarehousePageHeader";
import { WarehouseStatusPill } from "@/components/warehouse/WarehouseStatusPill";
import { countingTasks } from "@/lib/warehouse/mockData";

export function CountingView() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <WarehousePageHeader
          eyebrow="Cycle counting"
          title="Cycle count review"
          subtitle="Count products, compare expected versus counted quantities, highlight differences, and approve adjustments."
          action={<button className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">Approve adjustments</button>}
        />

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
          <h2 className="text-xl font-semibold text-white">Count comparison</h2>
          <div className="mt-4 space-y-3">
            {countingTasks.map((task) => {
              const isDifference = task.difference !== 0;
              return (
                <div key={task.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{task.product}</p>
                      <p className="text-sm text-slate-400">{task.sku}</p>
                    </div>
                    <WarehouseStatusPill label={task.status} tone={task.status === "Needs review" ? "amber" : "emerald"} />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-slate-300">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                      <p className="text-slate-400">Expected</p>
                      <p className="mt-1 font-semibold text-white">{task.expected}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                      <p className="text-slate-400">Counted</p>
                      <p className="mt-1 font-semibold text-white">{task.counted}</p>
                    </div>
                    <div className={`rounded-2xl border p-3 ${isDifference ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-slate-800 bg-slate-900/70 text-slate-300"}`}>
                      <p className="text-slate-400">Difference</p>
                      <p className="mt-1 font-semibold">{task.difference}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
