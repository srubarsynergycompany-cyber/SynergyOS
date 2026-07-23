import Link from "next/link";
import { WarehouseMetricCard } from "@/components/warehouse/WarehouseMetricCard";
import { WarehousePageHeader } from "@/components/warehouse/WarehousePageHeader";
import { warehouseService } from '@/services/warehouse.service';
import { localizeHref } from '@/utils/navigation';
import type { Locale } from '@/lib/i18n/types';

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
  eyebrow: 'Skladové operace',
  title: 'Řídicí centrum skladu',
  subtitle: 'Koordinujte příjem, přesuny, doplňování a inventury z jednoho pracovního prostoru.',
  links: {
    receiving: 'Příjem',
    transfers: 'Přesuny',
  },
  metrics: {
    activePickers: 'Aktivní pickeři',
    activePickersDetail: '2 na trase',
    ordersWaiting: 'Čekající objednávky',
    ordersWaitingDetail: '4 prioritní',
    receivingTasks: 'Úkoly příjmu',
    receivingTasksDetail: '1 připraven k potvrzení',
    transferTasks: 'Úkoly přesunu',
    transferTasksDetail: '2 čekají na sken',
    inventoryAlerts: 'Skladová upozornění',
    inventoryAlertsDetail: '3 kritická',
    lowStockAlerts: 'Nízké zásoby',
    lowStockAlertsDetail: 'Pick lokace',
  },
  sections: {
    operationalFocus: 'Provozní fokus',
    focus1: 'Přijímejte nákupní objednávky a potvrzujte lokace v jednom toku.',
    focus2: 'Sledujte přesuny a potvrzení skenem pro rychlý pohyb mezi zónami.',
    focus3: 'Doplňujte nízké picking lokace a kontrolujte rozdíly inventur před schválením.',
    quickActions: 'Rychlé akce',
    receivePo: 'Přijmout PO',
    startTransfer: 'Zahájit přesun',
    replenish: 'Doplnit',
    countStock: 'Inventura',
  },
};

export function WarehouseDashboardView({ copy = defaultCopy, locale = null }: { copy?: WarehouseDashboardCopy; locale?: Locale | null }) {
  const metricValues = warehouseService.listDashboardMetrics().map((metric) => metric.value);
  const receivingHref = localizeHref('/warehouse/receiving', locale);
  const transfersHref = localizeHref('/warehouse/transfers', locale);
  const replenishmentHref = localizeHref('/warehouse/replenishment', locale);
  const countingHref = localizeHref('/warehouse/counting', locale);
  const metrics = [
    { title: copy.metrics.activePickers, value: metricValues[0] ?? '6', detail: copy.metrics.activePickersDetail },
    { title: copy.metrics.ordersWaiting, value: metricValues[1] ?? '14', detail: copy.metrics.ordersWaitingDetail },
    { title: copy.metrics.receivingTasks, value: metricValues[2] ?? '3', detail: copy.metrics.receivingTasksDetail },
    { title: copy.metrics.transferTasks, value: metricValues[3] ?? '5', detail: copy.metrics.transferTasksDetail },
    { title: copy.metrics.inventoryAlerts, value: metricValues[4] ?? '9', detail: copy.metrics.inventoryAlertsDetail },
    { title: copy.metrics.lowStockAlerts, value: metricValues[5] ?? '2', detail: copy.metrics.lowStockAlertsDetail },
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
              <Link href={receivingHref} className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">{copy.links.receiving}</Link>
              <Link href={transfersHref} className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">{copy.links.transfers}</Link>
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
              <Link href={receivingHref} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">{copy.sections.receivePo}</Link>
              <Link href={transfersHref} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">{copy.sections.startTransfer}</Link>
              <Link href={replenishmentHref} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">{copy.sections.replenish}</Link>
              <Link href={countingHref} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">{copy.sections.countStock}</Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
