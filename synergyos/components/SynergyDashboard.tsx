"use client";

import { useState } from "react";
import LanguageSwitcher from "@/lib/i18n/LanguageSwitcher";
import Sidebar from "@/components/Sidebar";
import OrdersModule from "@/components/OrdersModule";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/types";

type StatCardProps = {
  label: string;
  value: string;
  change: string;
  tone: "blue" | "emerald" | "amber" | "rose";
};

type PanelProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

type SynergyDashboardProps = {
  dictionary: Dictionary;
  locale: Locale;
};

const revenueSeries = [42, 61, 55, 79, 91, 108, 132];
const ordersSeries = [24, 31, 29, 37, 45, 54, 61];

export default function SynergyDashboard({ dictionary, locale }: SynergyDashboardProps) {
  const [active, setActive] = useState(dictionary.navigation.sections.dashboard);

  const kpis = [
    {
      label: dictionary.dashboard.kpis.ordersToday.label,
      value: "156",
      change: dictionary.dashboard.kpis.ordersToday.change,
      tone: "blue" as const,
    },
    {
      label: dictionary.dashboard.kpis.readyToPack.label,
      value: "48",
      change: dictionary.dashboard.kpis.readyToPack.change,
      tone: "amber" as const,
    },
    {
      label: dictionary.dashboard.kpis.shippedToday.label,
      value: "108",
      change: dictionary.dashboard.kpis.shippedToday.change,
      tone: "emerald" as const,
    },
    {
      label: dictionary.dashboard.kpis.returns.label,
      value: "3",
      change: dictionary.dashboard.kpis.returns.change,
      tone: "rose" as const,
    },
  ];

  const carriers = [
    { name: "PPL", value: "72%", count: locale === "en" ? "1,120 parcels" : "1 120 zásilek", color: "from-cyan-500 to-blue-600" },
    { name: "DPD", value: "64%", count: locale === "en" ? "980 parcels" : "980 zásilek", color: "from-violet-500 to-fuchsia-600" },
    { name: "Zásilkovna", value: "58%", count: locale === "en" ? "860 parcels" : "860 zásilek", color: "from-emerald-500 to-teal-600" },
    { name: "Balíkovna", value: "41%", count: locale === "en" ? "640 parcels" : "640 zásilek", color: "from-amber-500 to-orange-600" },
  ];

  const customers = [
    { name: "Northstar Studio", revenue: "$24.8k", orders: 184, tier: locale === "en" ? "Platinum" : "Platina" },
    { name: "Lumen Lab", revenue: "$18.2k", orders: 142, tier: locale === "en" ? "Gold" : "Zlato" },
    { name: "Aero Goods", revenue: "$14.6k", orders: 121, tier: locale === "en" ? "Gold" : "Zlato" },
    { name: "Mosaic House", revenue: "$12.1k", orders: 97, tier: locale === "en" ? "Silver" : "Stříbro" },
  ];

  const recentOrders = [
    { id: "ORD-1042", customer: "Navelly", carrier: "PPL", statusKey: "packed", time: "09:14" },
    { id: "ORD-1043", customer: "Perfektně uklizeno", carrier: "DPD", statusKey: "inTransit", time: "08:52" },
    { id: "ORD-1044", customer: "Synergy client", carrier: "Zásilkovna", statusKey: "ready", time: "08:18" },
    { id: "ORD-1045", customer: "Aero Goods", carrier: "Balíkovna", statusKey: "queued", time: "07:41" },
  ];

  const notifications =
    locale === "en"
      ? [
          { title: "Inventory alert", text: "4 SKUs below reorder point", time: "12 min ago" },
          { title: "Carrier delay", text: "DPD hub congestion in Prague", time: "34 min ago" },
          { title: "New return", text: "One order requires quality review", time: "1h ago" },
        ]
      : [
          { title: "Skladové upozornění", text: "4 SKU jsou pod bodem doobjednání", time: "před 12 min" },
          { title: "Zpoždění dopravce", text: "Přetížení DPD depa v Praze", time: "před 34 min" },
          { title: "Nová vratka", text: "Jedna objednávka vyžaduje kontrolu kvality", time: "před 1 h" },
        ];

  const sections = [
    dictionary.navigation.sections.dashboard,
    dictionary.navigation.sections.orders,
    dictionary.navigation.sections.warehouse,
    dictionary.navigation.sections.crm,
    dictionary.navigation.sections.transport,
    dictionary.navigation.sections.finance,
    dictionary.navigation.sections.ai,
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar
          active={active}
          setActive={setActive}
          sections={sections}
          brand={dictionary.navigation.brand}
          subtitle={dictionary.navigation.subtitle}
        />

        <section className="flex-1 p-4 sm:p-6 lg:p-8">
          {active === dictionary.navigation.sections.orders ? (
            <OrdersModule dictionary={dictionary} locale={locale} />
          ) : active === dictionary.navigation.sections.dashboard ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">{dictionary.dashboard.eyebrow}</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">{dictionary.dashboard.title}</h2>
                  <p className="mt-2 text-sm text-slate-400">{dictionary.dashboard.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <LanguageSwitcher locale={locale} labels={dictionary.navigation.languageSwitcher} />
                  <button className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">
                    {dictionary.dashboard.cta}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpis.map((item) => (
                  <StatCard key={item.label} {...item} />
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.65fr_0.95fr]">
                <Panel title={dictionary.dashboard.revenue.title} subtitle={dictionary.dashboard.revenue.subtitle} action={<span className="text-sm text-cyan-400">{dictionary.dashboard.revenue.change}</span>}>
                  <div className="mt-4">
                    <LineChart data={revenueSeries} color="#38bdf8" />
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                      <span>{dictionary.dashboard.chartLabels.mon}</span>
                      <span>{dictionary.dashboard.chartLabels.tue}</span>
                      <span>{dictionary.dashboard.chartLabels.wed}</span>
                      <span>{dictionary.dashboard.chartLabels.thu}</span>
                      <span>{dictionary.dashboard.chartLabels.fri}</span>
                      <span>{dictionary.dashboard.chartLabels.sat}</span>
                      <span>{dictionary.dashboard.chartLabels.sun}</span>
                    </div>
                  </div>
                </Panel>

                <Panel title={dictionary.dashboard.occupancy.title} subtitle={dictionary.dashboard.occupancy.subtitle} action={<span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">{dictionary.dashboard.occupancy.badge}</span>}>
                  <div className="mt-6 flex items-center gap-6">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[conic-gradient(#38bdf8_0_78%,_#1e293b_78%)]">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-xl font-semibold text-white">78%</div>
                    </div>
                    <div className="space-y-3 text-sm text-slate-400">
                      <div>
                        <p className="font-medium text-slate-200">{dictionary.dashboard.occupancy.label}</p>
                        <p>{dictionary.dashboard.occupancy.description}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{dictionary.dashboard.occupancy.peak}</p>
                        <p>{dictionary.dashboard.occupancy.peakDescription}</p>
                      </div>
                    </div>
                  </div>
                </Panel>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Panel title={dictionary.dashboard.ordersOverTime.title} subtitle={dictionary.dashboard.ordersOverTime.subtitle}>
                  <div className="mt-4">
                    <LineChart data={ordersSeries} color="#34d399" />
                  </div>
                </Panel>

                <Panel title={dictionary.dashboard.carrierStats.title} subtitle={dictionary.dashboard.carrierStats.subtitle}>
                  <div className="mt-4 space-y-4">
                    {carriers.map((carrier) => (
                      <div key={carrier.name}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-100">{carrier.name}</span>
                          <span className="text-slate-400">{carrier.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800">
                          <div className={`h-2 rounded-full bg-gradient-to-r ${carrier.color}`} style={{ width: carrier.value }} />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{carrier.count}</p>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="grid gap-6">
                  <Panel title={dictionary.dashboard.topCustomers.title} subtitle={dictionary.dashboard.topCustomers.subtitle} action={<span className="text-sm text-slate-400">{dictionary.dashboard.topCustomers.action}</span>}>
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-900/80 text-slate-400">
                          <tr>
                            <th className="px-4 py-3">{dictionary.dashboard.table.customer}</th>
                            <th className="px-4 py-3">{dictionary.dashboard.table.revenue}</th>
                            <th className="px-4 py-3">{dictionary.dashboard.table.orders}</th>
                            <th className="px-4 py-3">{dictionary.dashboard.table.tier}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customers.map((customer) => (
                            <tr key={customer.name} className="border-t border-slate-800 bg-slate-950/70">
                              <td className="px-4 py-3 font-medium text-slate-100">{customer.name}</td>
                              <td className="px-4 py-3 text-slate-300">{customer.revenue}</td>
                              <td className="px-4 py-3 text-slate-300">{customer.orders}</td>
                              <td className="px-4 py-3">
                                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{customer.tier}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Panel>

                  <Panel title={dictionary.dashboard.recentOrders.title} subtitle={dictionary.dashboard.recentOrders.subtitle}>
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-900/80 text-slate-400">
                          <tr>
                            <th className="px-4 py-3">{dictionary.dashboard.table.order}</th>
                            <th className="px-4 py-3">{dictionary.dashboard.table.customer}</th>
                            <th className="px-4 py-3">{dictionary.dashboard.table.carrier}</th>
                            <th className="px-4 py-3">{dictionary.dashboard.table.status}</th>
                            <th className="px-4 py-3">{dictionary.dashboard.table.time}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order) => (
                            <tr key={order.id} className="border-t border-slate-800 bg-slate-950/70">
                              <td className="px-4 py-3 font-medium text-slate-100">{order.id}</td>
                              <td className="px-4 py-3 text-slate-300">{order.customer}</td>
                              <td className="px-4 py-3 text-slate-300">{order.carrier}</td>
                              <td className="px-4 py-3">
                                <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
                                  {dictionary.dashboard.orderStatuses[order.statusKey as keyof typeof dictionary.dashboard.orderStatuses]}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-400">{order.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Panel>
                </div>

                <div className="space-y-6">
                  <Panel title={dictionary.dashboard.quickActions.title} subtitle={dictionary.dashboard.quickActions.subtitle}>
                    <div className="mt-4 grid gap-3">
                      <button className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-800">
                        <span className="font-semibold">{dictionary.dashboard.quickActions.batchLabels.title}</span>
                        <p className="mt-1 text-xs text-slate-400">{dictionary.dashboard.quickActions.batchLabels.description}</p>
                      </button>
                      <button className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-800">
                        <span className="font-semibold">{dictionary.dashboard.quickActions.reassignCarrier.title}</span>
                        <p className="mt-1 text-xs text-slate-400">{dictionary.dashboard.quickActions.reassignCarrier.description}</p>
                      </button>
                      <button className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-800">
                        <span className="font-semibold">{dictionary.dashboard.quickActions.approveReturns.title}</span>
                        <p className="mt-1 text-xs text-slate-400">{dictionary.dashboard.quickActions.approveReturns.description}</p>
                      </button>
                    </div>
                  </Panel>

                  <Panel title={dictionary.dashboard.notifications.title} subtitle={dictionary.dashboard.notifications.subtitle}>
                    <div className="mt-4 space-y-3">
                      {notifications.map((item) => (
                        <div key={item.title} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                              <p className="mt-1 text-sm text-slate-400">{item.text}</p>
                            </div>
                            <span className="text-xs text-slate-500">{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10 shadow-2xl shadow-slate-950/50">
              <h2 className="text-3xl font-semibold text-white">{active}</h2>
              <p className="mt-3 text-sm text-slate-400">{dictionary.dashboard.placeholder.title}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, change, tone }: StatCardProps) {
  const toneClasses = {
    blue: "from-cyan-500/20 to-blue-500/5 text-cyan-300",
    emerald: "from-emerald-500/20 to-teal-500/5 text-emerald-300",
    amber: "from-amber-500/20 to-orange-500/5 text-amber-300",
    rose: "from-rose-500/20 to-pink-500/5 text-rose-300",
  };

  return (
    <div className={`rounded-2xl border border-slate-800 bg-gradient-to-br ${toneClasses[tone]} p-5 shadow-lg shadow-slate-950/30`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{change}</p>
    </div>
  );
}

function Panel({ title, subtitle, action, children }: PanelProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function LineChart({ data, color }: { data: number[]; color: string }) {
  const width = 520;
  const height = 180;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * (width - 24) + 12;
      const y = height - ((value - min) / (max - min || 1)) * (height - 24) - 12;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${points} ${width - 12},${height - 12} 12,${height - 12}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${areaPoints}`} fill={`url(#gradient-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * (width - 24) + 12;
        const y = height - ((value - min) / (max - min || 1)) * (height - 24) - 12;
        return <circle key={`${value}-${index}`} cx={x} cy={y} r="4" fill={color} />;
      })}
    </svg>
  );
}
