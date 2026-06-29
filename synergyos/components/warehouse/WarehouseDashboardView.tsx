import Link from "next/link";
import { WarehouseMetricCard } from "@/components/warehouse/WarehouseMetricCard";
import { WarehousePageHeader } from "@/components/warehouse/WarehousePageHeader";

type WarehouseDashboardCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  links: {
    receiving: string;
    transfers: string;
  };
  metrics: {
    activePickers: string;
    activePickersDetail: string;
    ordersWaiting: string;
    ordersWaitingDetail: string;
    receivingTasks: string;
    receivingTasksDetail: string;
    transferTasks: string;
    transferTasksDetail: string;
    inventoryAlerts: string;
    inventoryAlertsDetail: string;
    lowStockAlerts: string;
    lowStockAlertsDetail: string;
  };
  sections: {
    operationalFocus: string;
    focus1: string;
    focus2: string;
    focus3: string;
    quickActions: string;
    receivePo: string;
    startTransfer: string;
    replenish: string;
    countStock: string;
  };
};

const defaultCopy: WarehouseDashboardCopy = {
  eyebrow: 'Warehouse operations',
  title: 'Warehouse control center',
  subtitle: 'Coordinate receiving, transfers, replenishment, and cycle counts from one streamlined workspace.',
  links: {
    receiving: 'Receiving',
    transfers: 'Transfers',
  },
  metrics: {
    activePickers: 'Active pickers',
    activePickersDetail: '2 on route',
    ordersWaiting: 'Orders waiting',
    ordersWaitingDetail: '4 priority',
    receivingTasks: 'Receiving tasks',
    receivingTasksDetail: '1 ready to confirm',
    transferTasks: 'Transfer tasks',
    transferTasksDetail: '2 awaiting scan',
    inventoryAlerts: 'Inventory alerts',
    inventoryAlertsDetail: '3 critical',
    lowStockAlerts: 'Low stock alerts',
    lowStockAlertsDetail: 'Pick locations',
  },
  sections: {
    operationalFocus: 'Operational focus',
    focus1: 'Receive purchase orders and confirm locations in a single flow.',
    focus2: 'Track transfer tasks and scan-barcode confirmation for fast movement between zones.',
    focus3: 'Replenish low picking locations and review cycle-count differences before approvals.',
    quickActions: 'Quick actions',
    receivePo: 'Receive PO',
    startTransfer: 'Start transfer',
    replenish: 'Replenish',
    countStock: 'Count stock',
  },
};

export function WarehouseDashboardView({ copy = defaultCopy }: { copy?: WarehouseDashboardCopy }) {
  const metrics = [
    { title: copy.metrics.activePickers, value: '6', detail: copy.metrics.activePickersDetail },
    { title: copy.metrics.ordersWaiting, value: '14', detail: copy.metrics.ordersWaitingDetail },
    { title: copy.metrics.receivingTasks, value: '3', detail: copy.metrics.receivingTasksDetail },
    { title: copy.metrics.transferTasks, value: '5', detail: copy.metrics.transferTasksDetail },
    { title: copy.metrics.inventoryAlerts, value: '9', detail: copy.metrics.inventoryAlertsDetail },
    { title: copy.metrics.lowStockAlerts, value: '2', detail: copy.metrics.lowStockAlertsDetail },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <WarehousePageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          subtitle={copy.subtitle}
          action={
            <div className="flex flex-wrap gap-3">
              <Link href="/warehouse/receiving" className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">{copy.links.receiving}</Link>
              <Link href="/warehouse/transfers" className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">{copy.links.transfers}</Link>
            </div>
          }
        />

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <WarehouseMetricCard key={metric.title} title={metric.title} value={metric.value} detail={metric.detail} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <h2 className="text-xl font-semibold text-white">{copy.sections.operationalFocus}</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">{copy.sections.focus1}</div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">{copy.sections.focus2}</div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">{copy.sections.focus3}</div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <h2 className="text-xl font-semibold text-white">{copy.sections.quickActions}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/warehouse/receiving" className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">{copy.sections.receivePo}</Link>
              <Link href="/warehouse/transfers" className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">{copy.sections.startTransfer}</Link>
              <Link href="/warehouse/replenishment" className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">{copy.sections.replenish}</Link>
              <Link href="/warehouse/counting" className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">{copy.sections.countStock}</Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
