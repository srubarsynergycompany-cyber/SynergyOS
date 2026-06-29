import Link from "next/link";
import { WarehouseMetricCard } from "@/components/warehouse/WarehouseMetricCard";
import { WarehousePageHeader } from "@/components/warehouse/WarehousePageHeader";
import { warehouseDashboardMetrics } from "@/lib/warehouse/mockData";

export function WarehouseDashboardView() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <WarehousePageHeader
          eyebrow="Warehouse operations"
          title="Warehouse control center"
          subtitle="Coordinate receiving, transfers, replenishment, and cycle counts from one streamlined workspace."
          action={
            <div className="flex flex-wrap gap-3">
              <Link href="/warehouse/receiving" className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">Receiving</Link>
              <Link href="/warehouse/transfers" className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">Transfers</Link>
            </div>
          }
        />

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {warehouseDashboardMetrics.map((metric) => (
            <WarehouseMetricCard key={metric.title} title={metric.title} value={metric.value} detail={metric.detail} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <h2 className="text-xl font-semibold text-white">Operational focus</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">Receive purchase orders and confirm locations in a single flow.</div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">Track transfer tasks and scan-barcode confirmation for fast movement between zones.</div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">Replenish low picking locations and review cycle-count differences before approvals.</div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <h2 className="text-xl font-semibold text-white">Quick actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/warehouse/receiving" className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">Receive PO</Link>
              <Link href="/warehouse/transfers" className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">Start transfer</Link>
              <Link href="/warehouse/replenishment" className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">Replenish</Link>
              <Link href="/warehouse/counting" className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">Count stock</Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
