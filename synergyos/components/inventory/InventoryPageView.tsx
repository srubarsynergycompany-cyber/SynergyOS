"use client";

import { useMemo, useState } from "react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryToolbar } from "@/components/inventory/InventoryToolbar";
import { mockInventoryItems } from "@/lib/inventory/mockData";

type InventoryPageCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  toolbar: {
    newProduct: string;
    stockIn: string;
    stockOut: string;
    transfer: string;
    history: string;
  };
  filters: {
    searchLabel: string;
    searchPlaceholder: string;
    barcodeLabel: string;
    barcodePlaceholder: string;
  };
  stats: {
    warehouseLocations: string;
    lowStockItems: string;
    reservedToday: string;
  };
  table: {
    product: string;
    location: string;
    current: string;
    reserved: string;
    available: string;
    minimum: string;
    status: string;
  };
  statuses: {
    inStock: string;
    lowStock: string;
    critical: string;
    reserved: string;
  };
};

const defaultCopy: InventoryPageCopy = {
  eyebrow: 'Skladový modul',
  title: 'Přehled zásob',
  subtitle: 'Sledujte stav zásob, rezervovaná množství a pohyby napříč skladovými lokacemi.',
  toolbar: {
    newProduct: 'Nový produkt',
    stockIn: 'Příjem',
    stockOut: 'Výdej',
    transfer: 'Přesun',
    history: 'Historie zásob',
  },
  filters: {
    searchLabel: 'Vyhledat ve skladu',
    searchPlaceholder: 'Hledat podle názvu, SKU, kategorie nebo lokace',
    barcodeLabel: 'Vyhledání čárovým kódem',
    barcodePlaceholder: 'Naskenujte nebo zadejte čárový kód',
  },
  stats: {
    warehouseLocations: 'Skladové lokace',
    lowStockItems: 'Položky s nízkou zásobou',
    reservedToday: 'Dnes rezervováno',
  },
  table: {
    product: 'Produkt',
    location: 'Lokace',
    current: 'Aktuálně',
    reserved: 'Rezervováno',
    available: 'Dostupné',
    minimum: 'Minimum',
    status: 'Stav',
  },
  statuses: {
    inStock: 'Skladem',
    lowStock: 'Nízká zásoba',
    critical: 'Kritické',
    reserved: 'Rezervováno',
  },
};

export function InventoryPageView({ copy = defaultCopy }: { copy?: InventoryPageCopy }) {
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
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">{copy.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{copy.title}</h1>
            <p className="mt-2 text-sm text-slate-400">{copy.subtitle}</p>
          </div>
          <InventoryToolbar buttons={[
            { label: copy.toolbar.newProduct },
            { label: copy.toolbar.stockIn },
            { label: copy.toolbar.stockOut },
            { label: copy.toolbar.transfer },
            { label: copy.toolbar.history },
          ]} />
        </div>

        <section className="mb-6 grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 lg:grid-cols-[1.2fr_0.8fr]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">{copy.filters.searchLabel}</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={copy.filters.searchPlaceholder}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">{copy.filters.barcodeLabel}</span>
            <input
              value={barcodeSearch}
              onChange={(event) => setBarcodeSearch(event.target.value)}
              placeholder={copy.filters.barcodePlaceholder}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400"
            />
          </label>
        </section>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40">
            <p className="text-sm text-slate-400">{copy.stats.warehouseLocations}</p>
            <p className="mt-2 text-3xl font-semibold text-white">4</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40">
            <p className="text-sm text-slate-400">{copy.stats.lowStockItems}</p>
            <p className="mt-2 text-3xl font-semibold text-white">2</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40">
            <p className="text-sm text-slate-400">{copy.stats.reservedToday}</p>
            <p className="mt-2 text-3xl font-semibold text-white">39</p>
          </div>
        </div>

        <InventoryTable items={filteredItems} labels={{ headers: copy.table, statuses: copy.statuses }} />
      </div>
    </main>
  );
}
