"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  InventoryAdjustmentDialog,
  type InventoryAdjustmentCopy,
} from "@/components/inventory/InventoryAdjustmentDialog";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryToolbar } from "@/components/inventory/InventoryToolbar";
import type { InventoryItem } from "@/types";

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
    adjustStock: string;
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
  adjustment: InventoryAdjustmentCopy & {
    success: string;
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
    adjustStock: 'Upravit zásobu',
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
  adjustment: {
    title: 'Upravit zásobu',
    description: 'Proveďte bezpečnou ruční změnu množství na konkrétní skladové lokaci.',
    product: 'Produkt',
    selectProduct: 'Vyberte produkt',
    location: 'Lokace',
    selectLocation: 'Vyberte lokaci',
    currentQuantity: 'Aktuální množství',
    delta: 'Změna množství',
    deltaPlaceholder: 'Například 10 nebo -3',
    reason: 'Důvod úpravy',
    reasonPlaceholder: 'Uveďte důvod změny zásoby',
    resultingQuantity: 'Výsledná zásoba',
    cancel: 'Zrušit',
    submit: 'Uložit úpravu',
    submitting: 'Ukládám…',
    noInventory: 'Produkt nemá skladový řádek',
    success: 'Zásoba byla úspěšně upravena.',
    errors: {
      productRequired: 'Vyberte produkt.',
      locationRequired: 'Vyberte lokaci.',
      deltaInteger: 'Změna musí být celé číslo.',
      deltaNonZero: 'Změna nesmí být nula.',
      negativeResult: 'Výsledná zásoba nesmí být záporná.',
      reasonRequired: 'Zadejte důvod úpravy.',
      requestFailed: 'Úpravu zásoby se nepodařilo uložit.',
    },
  },
};

async function fetchInventory(signal?: AbortSignal): Promise<InventoryItem[]> {
  const response = await fetch("/api/inventory", { signal });
  const payload = (await response.json().catch(() => null)) as {
    items?: InventoryItem[];
    message?: string;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? "Inventář se nepodařilo načíst.");
  }
  if (!Array.isArray(payload?.items)) {
    throw new Error("Server vrátil neplatná data inventáře.");
  }

  return payload.items;
}

function getLoadErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Inventář se nepodařilo načíst.";
}

export function InventoryPageView({ copy = defaultCopy }: { copy?: InventoryPageCopy }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [barcodeSearch, setBarcodeSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadInventory = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setLoadError(null);

    try {
      setItems(await fetchInventory(signal));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setLoadError(getLoadErrorMessage(error));
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchInventory(controller.signal)
      .then((loadedItems) => {
        setItems(loadedItems);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setLoadError(getLoadErrorMessage(error));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setSuccessMessage(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const handleAdjustmentSuccess = useCallback(async () => {
    setIsAdjustmentOpen(false);
    setSuccessMessage(copy.adjustment.success);
    await loadInventory();
  }, [copy.adjustment.success, loadInventory]);

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();
    const barcodeQuery = barcodeSearch.toLowerCase().trim();

    return items.filter((item) => {
      const matchesSearch = !query || [item.productName, item.sku, item.locationCode, item.status].some((value) => value.toLowerCase().includes(query));
      const matchesBarcode = !barcodeQuery || item.sku.toLowerCase().includes(barcodeQuery);
      return matchesSearch && matchesBarcode;
    });
  }, [barcodeSearch, items, search]);

  const warehouseLocations = useMemo(
    () => new Set(items.map((item) => item.locationCode)).size,
    [items],
  );
  const lowStockItems = useMemo(
    () => items.filter((item) => item.status === "Low stock" || item.status === "Critical").length,
    [items],
  );
  const reservedToday = useMemo(
    () => items.reduce((total, item) => total + item.reserved, 0),
    [items],
  );

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
            {
              label: copy.toolbar.adjustStock,
              onClick: () => {
                setSuccessMessage(null);
                setIsAdjustmentOpen(true);
              },
            },
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
            <p className="mt-2 text-3xl font-semibold text-white">{warehouseLocations}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40">
            <p className="text-sm text-slate-400">{copy.stats.lowStockItems}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{lowStockItems}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40">
            <p className="text-sm text-slate-400">{copy.stats.reservedToday}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{reservedToday}</p>
          </div>
        </div>

        {successMessage ? (
          <div role="status" className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {successMessage}
          </div>
        ) : null}

        {isLoading && items.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-300">
            Načítám inventář…
          </div>
        ) : (
          <>
            {loadError && (
              <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200 sm:flex-row sm:items-center sm:justify-between">
                <span>{loadError}</span>
                <button
                  type="button"
                  onClick={() => void loadInventory()}
                  disabled={isLoading}
                  className="rounded-xl border border-rose-400/40 px-4 py-2 font-medium transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Načítám…" : "Zkusit znovu"}
                </button>
              </div>
            )}
            {isLoading && (
              <p className="mb-3 text-sm text-cyan-300">Aktualizuji inventář…</p>
            )}
            <InventoryTable items={filteredItems} labels={{ headers: copy.table, statuses: copy.statuses }} />
          </>
        )}
      </div>

      {isAdjustmentOpen ? (
        <InventoryAdjustmentDialog
          items={items}
          copy={copy.adjustment}
          onClose={() => setIsAdjustmentOpen(false)}
          onSuccess={handleAdjustmentSuccess}
        />
      ) : null}
    </main>
  );
}
