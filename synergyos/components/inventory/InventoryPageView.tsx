"use client";

import { useMemo, useState } from "react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryToolbar } from "@/components/inventory/InventoryToolbar";
import { mockInventoryItems } from "@/lib/inventory/mockData";

export function InventoryPageView() {
  const [search, setSearch] = useState("");
  const [barcodeSearch, setBarcodeSearch] = useState("");

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();
    const barcodeQuery = barcodeSearch.toLowerCase().trim();

    return mockInventoryItems.filter((item) => {
      const matchesSearch = !query || [item.name, item.sku, item.category, item.warehouseLocation].some((value) => value.toLowerCase().includes(query));
      const matchesBarcode = !barcodeQuery || item.barcode.toLowerCase().includes(barcodeQuery);
      return matchesSearch && matchesBarcode;
    });
  }, [barcodeSearch, search]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">Inventory module</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Inventory overview</h1>
            <p className="mt-2 text-sm text-slate-400">Monitor stock health, reserved quantities, and movement activity across warehouse locations.</p>
          </div>
          <InventoryToolbar buttons={[
            { label: "New Product" },
            { label: "Stock In" },
            { label: "Stock Out" },
            { label: "Transfer" },
            { label: "Inventory History" },
          ]} />
        </div>

        <section className="mb-6 grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 lg:grid-cols-[1.2fr_0.8fr]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Search inventory</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, SKU, category, or location"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Barcode search</span>
            <input
              value={barcodeSearch}
              onChange={(event) => setBarcodeSearch(event.target.value)}
              placeholder="Scan or enter barcode"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400"
            />
          </label>
        </section>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40">
            <p className="text-sm text-slate-400">Warehouse locations</p>
            <p className="mt-2 text-3xl font-semibold text-white">4</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40">
            <p className="text-sm text-slate-400">Low stock items</p>
            <p className="mt-2 text-3xl font-semibold text-white">2</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40">
            <p className="text-sm text-slate-400">Reserved today</p>
            <p className="mt-2 text-3xl font-semibold text-white">39</p>
          </div>
        </div>

        <InventoryTable items={filteredItems} />
      </div>
    </main>
  );
}
