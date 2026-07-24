"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import type { InventoryMovementItem, InventoryMovementsResponse } from "@/types";

export type InventoryMovementsCopy = {
  title: string;
  description: string;
  close: string;
  loading: string;
  refreshing: string;
  retry: string;
  loadFailed: string;
  emptyTitle: string;
  emptyDescription: string;
  unknownActor: string;
  deletedProduct: string;
  filters: {
    sku: string;
    skuPlaceholder: string;
    product: string;
    productPlaceholder: string;
    location: string;
    locationPlaceholder: string;
    from: string;
    to: string;
    apply: string;
    clear: string;
    invalidRange: string;
  };
  table: {
    createdAt: string;
    sku: string;
    product: string;
    location: string;
    quantityBefore: string;
    delta: string;
    quantityAfter: string;
    reason: string;
    actor: string;
  };
  pagination: {
    previous: string;
    next: string;
    page: string;
    of: string;
    results: string;
  };
  dateLocale: string;
};

type InventoryMovementsDialogProps = {
  copy: InventoryMovementsCopy;
  onClose: () => void;
};

type FilterValues = {
  sku: string;
  product: string;
  location: string;
  from: string;
  to: string;
};

const PAGE_SIZE = 25;
const emptyFilters: FilterValues = {
  sku: "",
  product: "",
  location: "",
  from: "",
  to: "",
};

function toStartOfDayIso(value: string) {
  return value ? new Date(`${value}T00:00:00.000`).toISOString() : "";
}

function toEndOfDayIso(value: string) {
  return value ? new Date(`${value}T23:59:59.999`).toISOString() : "";
}

async function fetchMovements(
  page: number,
  filters: FilterValues,
  signal: AbortSignal,
): Promise<InventoryMovementsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });
  if (filters.sku.trim()) {
    params.set("sku", filters.sku.trim());
  }
  if (filters.product.trim()) {
    params.set("product", filters.product.trim());
  }
  if (filters.location.trim()) {
    params.set("location", filters.location.trim());
  }
  if (filters.from) {
    params.set("from", toStartOfDayIso(filters.from));
  }
  if (filters.to) {
    params.set("to", toEndOfDayIso(filters.to));
  }

  const response = await fetch(`/api/inventory/movements?${params.toString()}`, {
    cache: "no-store",
    signal,
  });
  const payload = (await response.json().catch(() => null)) as
    | (Partial<InventoryMovementsResponse> & { message?: string })
    | null;

  if (!response.ok) {
    throw new Error(response.status >= 500 ? "" : payload?.message);
  }
  if (
    !Array.isArray(payload?.items)
    || typeof payload.total !== "number"
    || typeof payload.page !== "number"
    || typeof payload.pageSize !== "number"
  ) {
    throw new Error("");
  }

  return payload as InventoryMovementsResponse;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function InventoryMovementsDialog({ copy, onClose }: InventoryMovementsDialogProps) {
  const [draftFilters, setDraftFilters] = useState<FilterValues>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(emptyFilters);
  const [items, setItems] = useState<InventoryMovementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [requestedPage, setRequestedPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const requestController = useRef<AbortController | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasNextPage = page * PAGE_SIZE < total;

  const loadPage = useCallback(async (nextPage: number, filters: FilterValues) => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setRequestedPage(nextPage);
    setIsLoading(true);
    setLoadError(null);

    try {
      const result = await fetchMovements(nextPage, filters, controller.signal);
      setItems(result.items);
      setTotal(result.total);
      setPage(result.page);
      setRequestedPage(result.page);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setLoadError(errorMessage(error, copy.loadFailed));
      }
    } finally {
      if (requestController.current === controller) {
        setIsLoading(false);
      }
    }
  }, [copy.loadFailed]);

  useEffect(() => {
    const controller = new AbortController();
    requestController.current = controller;

    void fetchMovements(1, emptyFilters, controller.signal)
      .then((result) => {
        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
        setRequestedPage(result.page);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setLoadError(errorMessage(error, copy.loadFailed));
        }
      })
      .finally(() => {
        if (requestController.current === controller) {
          setIsLoading(false);
        }
      });

    return () => {
      requestController.current?.abort();
      requestController.current = null;
    };
  }, [copy.loadFailed]);

  const formattedItems = useMemo(
    () => items.map((item) => ({
      ...item,
      formattedDate: new Date(item.createdAt).toLocaleString(copy.dateLocale),
    })),
    [copy.dateLocale, items],
  );

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draftFilters.from && draftFilters.to && draftFilters.from > draftFilters.to) {
      setFilterError(copy.filters.invalidRange);
      return;
    }

    const nextFilters = { ...draftFilters };
    setFilterError(null);
    setAppliedFilters(nextFilters);
    setPage(1);
    void loadPage(1, nextFilters);
  }

  function clearFilters() {
    const nextFilters = { ...emptyFilters };
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setFilterError(null);
    setPage(1);
    void loadPage(1, nextFilters);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
    >
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-7xl overflow-y-auto">
        <Dialog title={copy.title} description={copy.description}>
          <form onSubmit={applyFilters} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.filters.sku}</span>
              <input
                value={draftFilters.sku}
                onChange={(event) => setDraftFilters((current) => ({ ...current, sku: event.target.value }))}
                placeholder={copy.filters.skuPlaceholder}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.filters.product}</span>
              <input
                value={draftFilters.product}
                onChange={(event) => setDraftFilters((current) => ({ ...current, product: event.target.value }))}
                placeholder={copy.filters.productPlaceholder}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.filters.location}</span>
              <input
                value={draftFilters.location}
                onChange={(event) => setDraftFilters((current) => ({ ...current, location: event.target.value }))}
                placeholder={copy.filters.locationPlaceholder}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.filters.from}</span>
              <input
                type="date"
                value={draftFilters.from}
                onChange={(event) => setDraftFilters((current) => ({ ...current, from: event.target.value }))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.filters.to}</span>
              <input
                type="date"
                value={draftFilters.to}
                onChange={(event) => setDraftFilters((current) => ({ ...current, to: event.target.value }))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>
            <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-5">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-2xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {copy.filters.apply}
              </button>
              <button
                type="button"
                onClick={clearFilters}
                disabled={isLoading}
                className="rounded-2xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {copy.filters.clear}
              </button>
            </div>
          </form>

          {filterError ? <p className="mt-4 text-sm text-rose-300">{filterError}</p> : null}
          {loadError ? (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200 sm:flex-row sm:items-center sm:justify-between">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={() => void loadPage(requestedPage, appliedFilters)}
                disabled={isLoading}
                className="rounded-xl border border-rose-400/40 px-4 py-2 font-medium transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {copy.retry}
              </button>
            </div>
          ) : null}

          {isLoading && items.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-slate-300">
              {copy.loading}
            </div>
          ) : (
            <>
              {isLoading ? <p className="mt-4 text-sm text-cyan-300">{copy.refreshing}</p> : null}
              {items.length === 0 && !loadError ? (
                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center">
                  <h4 className="font-semibold text-white">{copy.emptyTitle}</h4>
                  <p className="mt-2 text-sm text-slate-400">{copy.emptyDescription}</p>
                </div>
              ) : items.length > 0 ? (
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
                      <thead className="bg-slate-950/70 text-xs uppercase tracking-[0.18em] text-slate-400">
                        <tr>
                          <th className="px-4 py-3">{copy.table.createdAt}</th>
                          <th className="px-4 py-3">{copy.table.sku}</th>
                          <th className="px-4 py-3">{copy.table.product}</th>
                          <th className="px-4 py-3">{copy.table.location}</th>
                          <th className="px-4 py-3">{copy.table.quantityBefore}</th>
                          <th className="px-4 py-3">{copy.table.delta}</th>
                          <th className="px-4 py-3">{copy.table.quantityAfter}</th>
                          <th className="px-4 py-3">{copy.table.reason}</th>
                          <th className="px-4 py-3">{copy.table.actor}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {formattedItems.map((movement) => (
                          <tr key={movement.id} className="transition hover:bg-slate-900/70">
                            <td className="whitespace-nowrap px-4 py-4 text-slate-400">{movement.formattedDate}</td>
                            <td className="whitespace-nowrap px-4 py-4 font-semibold text-white">{movement.sku}</td>
                            <td className="px-4 py-4">{movement.productId ? movement.productName : copy.deletedProduct}</td>
                            <td className="whitespace-nowrap px-4 py-4">{movement.locationCode}</td>
                            <td className="px-4 py-4">{movement.quantityBefore}</td>
                            <td className={`px-4 py-4 font-semibold ${movement.delta > 0 ? "text-emerald-300" : "text-rose-300"}`}>
                              {movement.delta > 0 ? `+${movement.delta}` : movement.delta}
                            </td>
                            <td className="px-4 py-4">{movement.quantityAfter}</td>
                            <td className="min-w-48 px-4 py-4">{movement.reason}</td>
                            <td className="whitespace-nowrap px-4 py-4">{movement.actorLabel?.trim() || copy.unknownActor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              {copy.pagination.page} {page} {copy.pagination.of} {totalPages} · {total} {copy.pagination.results}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadPage(page - 1, appliedFilters)}
                disabled={isLoading || page <= 1}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.pagination.previous}
              </button>
              <button
                type="button"
                onClick={() => void loadPage(page + 1, appliedFilters)}
                disabled={isLoading || !hasNextPage}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.pagination.next}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                {copy.close}
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
