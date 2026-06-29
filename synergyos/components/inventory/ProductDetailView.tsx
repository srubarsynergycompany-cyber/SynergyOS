"use client";

import Link from "next/link";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import type { InventoryItem } from "@/lib/inventory/mockData";

type ProductDetailViewProps = {
  item: InventoryItem;
};

export function ProductDetailView({ item }: ProductDetailViewProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">Inventory detail</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{item.name}</h1>
            <p className="mt-2 text-sm text-slate-400">{item.sku} · {item.category}</p>
          </div>
          <Link href="/inventory" className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white">
            Back to inventory
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm text-slate-400">Product information</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{item.name}</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-400">{item.description}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Status</span>
                <InventoryStatusBadge status={item.status} />
              </div>
              <div className="mt-3 flex gap-6 text-sm">
                <div>
                  <p className="text-slate-400">Barcode</p>
                  <p className="font-semibold text-white">{item.barcode}</p>
                </div>
                <div>
                  <p className="text-slate-400">Location</p>
                  <p className="font-semibold text-white">{item.warehouseLocation}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">Warehouse locations</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Primary location</p>
                  <p className="mt-2 text-lg font-semibold text-white">{item.warehouseLocation}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Availability</p>
                  <p className="mt-2 text-lg font-semibold text-white">{item.availableStock} available</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">Batch numbers</h3>
              <div className="mt-4 space-y-3">
                {item.batchNumbers.map((batch) => (
                  <div key={batch.batch} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                    <div>
                      <p className="font-semibold text-white">{batch.batch}</p>
                      <p className="text-sm text-slate-400">Expiry: {batch.expiryDate}</p>
                    </div>
                    <span className="text-sm font-medium text-cyan-300">Qty {batch.quantity}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">Stock summary</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span>Current stock</span>
                  <span className="font-semibold text-white">{item.currentStock}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span>Reserved quantity</span>
                  <span className="font-semibold text-white">{item.reservedStock}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span>Available quantity</span>
                  <span className="font-semibold text-white">{item.availableStock}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span>Minimum stock</span>
                  <span className="font-semibold text-white">{item.minimumStock}</span>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">Movement history</h3>
              <div className="mt-4 space-y-3">
                {item.movements.map((movement) => (
                  <div key={movement.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{movement.type}</p>
                      <span className="text-sm text-cyan-300">{movement.quantity}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{movement.reference} · {movement.user}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{new Date(movement.timestamp).toLocaleString("en-US")}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
