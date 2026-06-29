"use client";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

const sections = ["Dashboard", "Objednávky", "Sklad", "CRM", "Doprava", "Finance", "AI Command Center"];

const orders = [
  { id: "ORD-1001", shop: "Navelly", carrier: "PPL", status: "Nová", priority: "Vysoká", items: 3 },
  { id: "ORD-1002", shop: "Perfektně uklizeno", carrier: "DPD", status: "Balení", priority: "Normální", items: 1 },
  { id: "ORD-1003", shop: "Synergy klient", carrier: "Zásilkovna", status: "Odesláno", priority: "Normální", items: 5 },
  { id: "ORD-1004", shop: "Navelly", carrier: "Balíkovna", status: "Čeká", priority: "Nízká", items: 2 },
];

export default function Home() {
  const [active, setActive] = useState("Dashboard");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold">SynergyOS</h1>
          <p className="mt-2 text-sm text-slate-400">AI Fulfillment Platform</p>

          <nav className="mt-10 space-y-3 text-sm">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setActive(section)}
                className={`w-full rounded-lg px-4 py-3 text-left ${
                  active === section ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {section}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1 p-8">
          {active === "Dashboard" && <Dashboard />}
          {active === "Objednávky" && <Orders />}
          {active !== "Dashboard" && active !== "Objednávky" && <Placeholder active={active} />}
        </section>
      </div>
    </main>
  );
}

function Dashboard() {
  return (
    <>
      <h2 className="text-3xl font-bold">Dashboard</h2>
      <p className="text-slate-400">Přehled dnešního fulfillmentu</p>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <Card title="Dnešní objednávky" value="156" />
        <Card title="K zabalení" value="48" />
        <Card title="Odesláno" value="108" />
        <Card title="Reklamace" value="3" />
      </div>
    </>
  );
}

function Orders() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Objednávky</h2>
          <p className="text-slate-400">První reálný modul pro fulfillment</p>
        </div>
        <button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold">
          + Import z BaseLinkeru
        </button>
      </div>

      <div className="mt-6 flex gap-3">
        <input
          className="w-80 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm"
          placeholder="Vyhledat objednávku..."
        />
        <button className="rounded-lg bg-slate-800 px-4 py-3 text-sm">Nové</button>
        <button className="rounded-lg bg-slate-800 px-4 py-3 text-sm">Balení</button>
        <button className="rounded-lg bg-slate-800 px-4 py-3 text-sm">Odesláno</button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="p-4">Objednávka</th>
              <th className="p-4">E-shop</th>
              <th className="p-4">Dopravce</th>
              <th className="p-4">Stav</th>
              <th className="p-4">Priorita</th>
              <th className="p-4">Položky</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-slate-800 bg-slate-950">
                <td className="p-4 font-semibold">{order.id}</td>
                <td className="p-4">{order.shop}</td>
                <td className="p-4">{order.carrier}</td>
                <td className="p-4">{order.status}</td>
                <td className="p-4">{order.priority}</td>
                <td className="p-4">{order.items}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Placeholder({ active }: { active: string }) {
  return (
    <div>
      <h2 className="text-3xl font-bold">{active}</h2>
      <p className="text-slate-400">Tento modul připravíme jako další.</p>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}