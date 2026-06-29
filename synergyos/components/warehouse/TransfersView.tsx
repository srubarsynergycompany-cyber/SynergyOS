import { WarehousePageHeader } from "@/components/warehouse/WarehousePageHeader";
import { transferTasks } from "@/lib/warehouse/mockData";

export function TransfersView() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <WarehousePageHeader
          eyebrow="Transfers"
          title="Warehouse transfers"
          subtitle="Move stock between locations with source, destination, and barcode confirmation built into the flow."
          action={<button className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">Transfer stock</button>}
        />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <h2 className="text-xl font-semibold text-white">Transfer queue</h2>
            <div className="mt-4 space-y-3">
              {transferTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{task.product}</p>
                      <p className="text-sm text-slate-400">{task.barcode}</p>
                    </div>
                    <div className="text-right text-sm text-slate-400">
                      <p>{task.source}</p>
                      <p className="text-cyan-300">→ {task.destination}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">{task.history}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <h2 className="text-xl font-semibold text-white">Transfer controls</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">Select source and destination locations.</div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">Confirm with barcode scan before movement is finalized.</div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">Review movement history after each transfer completes.</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
