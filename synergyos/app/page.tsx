"use client";

import Sidebar from "../components/Sidebar";
import { useState } from "react";

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

const kpis = [
  { label: "Orders today", value: "156", change: "+12% vs yesterday", tone: "blue" as const },
  { label: "Ready to pack", value: "48", change: "6 urgent", tone: "amber" as const },
  { label: "Shipped today", value: "108", change: "+8% efficiency", tone: "emerald" as const },
  { label: "Returns", value: "3", change: "1 pending review", tone: "rose" as const },
];

const revenueSeries = [42, 61, 55, 79, 91, 108, 132];
const ordersSeries = [24, 31, 29, 37, 45, 54, 61];
const carriers = [
  { name: "PPL", value: "72%", count: "1,120 parcels", color: "from-cyan-500 to-blue-600" },
  { name: "DPD", value: "64%", count: "980 parcels", color: "from-violet-500 to-fuchsia-600" },
  { name: "Zásilkovna", value: "58%", count: "860 parcels", color: "from-emerald-500 to-teal-600" },
  { name: "Balíkovna", value: "41%", count: "640 parcels", color: "from-amber-500 to-orange-600" },
];

const customers = [
  { name: "Northstar Studio", revenue: "$24.8k", orders: 184, tier: "Platinum" },
  { name: "Lumen Lab", revenue: "$18.2k", orders: 142, tier: "Gold" },
  { name: "Aero Goods", revenue: "$14.6k", orders: 121, tier: "Gold" },
  { name: "Mosaic House", revenue: "$12.1k", orders: 97, tier: "Silver" },
];

const recentOrders = [
  { id: "ORD-1042", customer: "Navelly", carrier: "PPL", status: "Packed", time: "09:14" },
  { id: "ORD-1043", customer: "Perfektně uklizeno", carrier: "DPD", status: "In transit", time: "08:52" },
  { id: "ORD-1044", customer: "Synergy client", carrier: "Zásilkovna", status: "Ready", time: "08:18" },
  { id: "ORD-1045", customer: "Aero Goods", carrier: "Balíkovna", status: "Queued", time: "07:41" },
];

const notifications = [
  { title: "Inventory alert", text: "4 SKUs below reorder point", time: "12 min ago" },
  { title: "Carrier delay", text: "DPD hub congestion in Prague", time: "34 min ago" },
  { title: "New return", text: "One order requires quality review", time: "1h ago" },
];

export default function Home() {
  const [active, setActive] = useState("Dashboard");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar active={active} setActive={setActive} />

        <section className="flex-1 p-4 sm:p-6 lg:p-8">
          {active === "Dashboard" ? <Dashboard /> : <Placeholder active={active} />}
        </section>
      </div>
    </main>
  );
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">Fulfillment command center</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Operational overview</h2>
          <p className="mt-2 text-sm text-slate-400">A clear view of orders, throughput, and carrier health across the network.</p>
        </div>
        <button className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">
          + Create fulfillment run
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_0.95fr]">
        <Panel title="Revenue trend" subtitle="Last 7 days" action={<span className="text-sm text-cyan-400">+18.4% MoM</span>}>
          <div className="mt-4">
            <LineChart data={revenueSeries} color="#38bdf8" />
            <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </Panel>

        <Panel title="Warehouse occupancy" subtitle="Current capacity" action={<span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">Healthy</span>}>
          <div className="mt-6 flex items-center gap-6">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[conic-gradient(#38bdf8_0_78%,_#1e293b_78%)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-xl font-semibold text-white">78%</div>
            </div>
            <div className="space-y-3 text-sm text-slate-400">
              <div>
                <p className="font-medium text-slate-200">2,340 / 3,000 slots</p>
                <p>Picking lanes running at 78% capacity.</p>
              </div>
              <div>
                <p className="font-medium text-slate-200">Peak window</p>
                <p>11:00–14:00 with 2 extra pickers recommended.</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Orders over time" subtitle="Daily throughput">
          <div className="mt-4">
            <LineChart data={ordersSeries} color="#34d399" />
          </div>
        </Panel>

        <Panel title="Carrier stats" subtitle="Preferred shipping mix">
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
          <Panel title="Top customers" subtitle="Highest revenue contributors" action={<span className="text-sm text-slate-400">This quarter</span>}>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Revenue</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3">Tier</th>
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

          <Panel title="Recent orders" subtitle="Latest fulfillment activity">
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Carrier</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-slate-800 bg-slate-950/70">
                      <td className="px-4 py-3 font-medium text-slate-100">{order.id}</td>
                      <td className="px-4 py-3 text-slate-300">{order.customer}</td>
                      <td className="px-4 py-3 text-slate-300">{order.carrier}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300">{order.status}</span>
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
          <Panel title="Quick actions" subtitle="Accelerate daily ops">
            <div className="mt-4 grid gap-3">
              <button className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-800">
                <span className="font-semibold">Batch print labels</span>
                <p className="mt-1 text-xs text-slate-400">Print 24 pending labels in one pass</p>
              </button>
              <button className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-800">
                <span className="font-semibold">Reassign carrier</span>
                <p className="mt-1 text-xs text-slate-400">Optimize late shipments to a faster route</p>
              </button>
              <button className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-800">
                <span className="font-semibold">Approve returns</span>
                <p className="mt-1 text-xs text-slate-400">Review three exceptions before close of day</p>
              </button>
            </div>
          </Panel>

          <Panel title="Notifications" subtitle="Team updates">
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
  );
}

function Placeholder({ active }: { active: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10 shadow-2xl shadow-slate-950/50">
      <h2 className="text-3xl font-semibold text-white">{active}</h2>
      <p className="mt-3 text-sm text-slate-400">This module is ready for the next step in the SynergyOS product roadmap.</p>
    </div>
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