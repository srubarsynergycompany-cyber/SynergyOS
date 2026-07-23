"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { OrderHeader } from "@/components/orders/OrderHeader";
import type { Dictionary } from "@/lib/i18n/types";
import type { Order } from "@/lib/orders/mockData";
import { getNextStatus } from "@/lib/orders/stateMachine";

type OrderDetailViewProps = {
  initialOrder: Order;
  locale: string;
  dictionary: Dictionary;
};

type WorkspaceStatus =
  | "new"
  | "ready_for_picking"
  | "picking"
  | "packed"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "cancelled";

type WorkspaceMode = "overview" | "picking" | "packing";

type ItemState = {
  sku: string;
  name: string;
  location: string;
  requiredQuantity: number;
  pickedQuantity: number;
  picked: boolean;
  packed: boolean;
};

type TimelineEntry = {
  id: string;
  label: string;
  timestamp: string;
};

type PackingChecklist = {
  productsVerified: boolean;
  quantitiesVerified: boolean;
  packageClosed: boolean;
  shippingLabelPrepared: boolean;
};

function mapInitialStatus(status: Order["status"]): WorkspaceStatus {
  if (status === "picking") return "picking";
  if (status === "packed") return "packed";
  if (status === "shipped") return "shipped";
  if (status === "delivered") return "delivered";
  return "new";
}

function statusBadgeClasses(status: WorkspaceStatus) {
  if (status === "cancelled") return "border border-rose-500/40 bg-rose-500/10 text-rose-300";
  if (status === "shipped" || status === "delivered") return "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  if (status === "packed" || status === "ready_to_ship") return "border border-cyan-500/40 bg-cyan-500/10 text-cyan-300";
  if (status === "picking" || status === "ready_for_picking") return "border border-amber-500/40 bg-amber-500/10 text-amber-300";
  return "border border-slate-600 bg-slate-700/30 text-slate-200";
}

function priorityBadgeClasses(priority: Order["priority"]) {
  if (priority === "High") return "border border-rose-500/40 bg-rose-500/10 text-rose-300";
  if (priority === "Normal") return "border border-amber-500/40 bg-amber-500/10 text-amber-300";
  return "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
}

function salesChannelBadgeClasses(channel: Order["salesChannel"]) {
  return channel === "Shopify"
    ? "border border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
    : "border border-indigo-500/40 bg-indigo-500/10 text-indigo-300";
}

function toItemState(product: Order["products"][number], initialStatus: WorkspaceStatus): ItemState {
  const pickedByDefault =
    initialStatus === "packed" ||
    initialStatus === "ready_to_ship" ||
    initialStatus === "shipped" ||
    initialStatus === "delivered";

  return {
    sku: product.sku,
    name: product.name,
    location: product.location,
    requiredQuantity: product.quantity,
    pickedQuantity: pickedByDefault ? product.quantity : 0,
    picked: pickedByDefault,
    packed:
      initialStatus === "packed" ||
      initialStatus === "ready_to_ship" ||
      initialStatus === "shipped" ||
      initialStatus === "delivered",
  };
}

export function OrderDetailView({ initialOrder, locale, dictionary }: OrderDetailViewProps) {
  const [order, setOrder] = useState(initialOrder);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusActionError, setStatusActionError] = useState<string | null>(null);
  const [isStartingPicking, setIsStartingPicking] = useState(false);
  const [isOpeningPacking, setIsOpeningPacking] = useState(false);
  const [mode, setMode] = useState<WorkspaceMode>("overview");
  const [workspaceStatus, setWorkspaceStatus] = useState<WorkspaceStatus>(() => mapInitialStatus(initialOrder.status));
  const [items, setItems] = useState<ItemState[]>(() => {
    const initialStatus = mapInitialStatus(initialOrder.status);
    return initialOrder.products.map((product) => toItemState(product, initialStatus));
  });
  const [packingChecklist, setPackingChecklist] = useState<PackingChecklist>({
    productsVerified: false,
    quantitiesVerified: false,
    packageClosed: false,
    shippingLabelPrepared: false,
  });
  const [timeline, setTimeline] = useState<TimelineEntry[]>([
    {
      id: "created",
      label: dictionary?.orders?.detail?.timeline?.created ?? "Objednavka vytvorena",
      timestamp: order.createdAt,
    },
    {
      id: "updated",
      label: dictionary?.orders?.detail?.timeline?.updated ?? "Objednavka aktualizovana",
      timestamp: order.updatedAt,
    },
    {
      id: "payment",
      label: dictionary?.orders?.detail?.timeline?.payment ?? "Platba potvrzena",
      timestamp: order.updatedAt,
    },
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadOrderDetail() {
      try {
        setLoadError(null);
        const response = await fetch(`/api/orders/${encodeURIComponent(initialOrder.id)}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load order detail from API.");
        }

        const payload = (await response.json()) as Order;
        if (!cancelled) {
          const nextStatus = mapInitialStatus(payload.status);
          setOrder(payload);
          setWorkspaceStatus(nextStatus);
          setItems(payload.products.map((product) => toItemState(product, nextStatus)));
        }
      } catch {
        if (!cancelled) {
          setOrder(initialOrder);
          setLoadError("Orders API detail is unavailable. Showing fallback data.");
        }
      }
    }

    void loadOrderDetail();

    return () => {
      cancelled = true;
    };
  }, [initialOrder]);

  const nextStatus = getNextStatus(order.status);
  const statusOptions: Order["status"][] = nextStatus ? [order.status, nextStatus] : [order.status];

  function getPriorityDisplay(value: Order["priority"]) {
    if (value === "High") return dictionary?.orders?.detail?.valueLabels?.priority?.high ?? "High";
    if (value === "Normal") return dictionary?.orders?.detail?.valueLabels?.priority?.normal ?? "Normal";
    if (value === "Low") return dictionary?.orders?.detail?.valueLabels?.priority?.low ?? "Low";
    return value;
  }

  function getPaymentStatusDisplay(value: Order["paymentStatus"] | "Unpaid") {
    if (value === "Paid") return dictionary?.orders?.detail?.valueLabels?.paymentStatus?.paid ?? "Paid";
    if (value === "Unpaid") return dictionary?.orders?.detail?.valueLabels?.paymentStatus?.unpaid ?? "Unpaid";
    if (value === "Pending") return dictionary?.orders?.detail?.valueLabels?.paymentStatus?.pending ?? "Pending";
    if (value === "Awaiting") return dictionary?.orders?.detail?.valueLabels?.paymentStatus?.awaiting ?? "Awaiting";
    return value;
  }

  function getOrderStatusDisplay(value: WorkspaceStatus) {
    if (value === "new") return dictionary?.orders?.detail?.valueLabels?.status?.new ?? dictionary?.orders?.statuses?.new ?? "New";
    if (value === "ready_for_picking") return dictionary?.orders?.detail?.valueLabels?.status?.ready_for_picking ?? "Ready for picking";
    if (value === "picking") return dictionary?.orders?.detail?.valueLabels?.status?.picking ?? dictionary?.orders?.statuses?.picking ?? "Picking";
    if (value === "packed") return dictionary?.orders?.detail?.valueLabels?.status?.packed ?? dictionary?.orders?.statuses?.packed ?? "Packed";
    if (value === "ready_to_ship") return dictionary?.orders?.detail?.valueLabels?.status?.ready_to_ship ?? "Ready to ship";
    if (value === "shipped") return dictionary?.orders?.detail?.valueLabels?.status?.shipped ?? dictionary?.orders?.statuses?.shipped ?? "Shipped";
    if (value === "delivered") return dictionary?.orders?.statuses?.delivered ?? "Delivered";
    if (value === "cancelled") return dictionary?.orders?.detail?.valueLabels?.status?.cancelled ?? "Cancelled";
    return value;
  }

  const packingChecklistEntries = [
    { key: "productsVerified" as const, label: "Produkty overeny" },
    { key: "quantitiesVerified" as const, label: "Mnozstvi overeno" },
    { key: "packageClosed" as const, label: "Balik uzavren" },
    { key: "shippingLabelPrepared" as const, label: "Stitek pripraven" },
  ];

  const pickedItemsCount = useMemo(() => items.filter((item) => item.picked).length, [items]);
  const totalItemsCount = items.length;
  const pickingProgressPercent = totalItemsCount === 0 ? 0 : Math.round((pickedItemsCount / totalItemsCount) * 100);
  const isPickingComplete = totalItemsCount > 0 && pickedItemsCount === totalItemsCount;
  const isStatusRequestPending = isStartingPicking || isOpeningPacking;
  const canStartPicking = order.status === "new" && !isStatusRequestPending;
  const canOpenPacking = order.status === "picking" && isPickingComplete && !isStatusRequestPending;

  const completedPackingChecks = packingChecklistEntries.filter((entry) => packingChecklist[entry.key]).length;
  const packingProgressPercent = Math.round((completedPackingChecks / packingChecklistEntries.length) * 100);
  const canCompletePacking = completedPackingChecks === packingChecklistEntries.length;

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(locale === "cs" ? "cs-CZ" : "en-US");

  function pushTimeline(label: string) {
    setTimeline((current) => [
      {
        id: `event-${Date.now()}-${current.length}`,
        label,
        timestamp: new Date().toISOString(),
      },
      ...current,
    ]);
  }

  async function handleStatusChange(next: Order["status"]) {
    if (next === order.status || isStartingPicking) {
      return;
    }

    try {
      setStatusActionError(null);
      setIsStartingPicking(true);

      const response = await fetch(`/api/orders/${encodeURIComponent(order.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nextStatus: next }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Failed to update order status.");
      }

      const payload = (await response.json()) as Order;
      const nextWorkspaceStatus = mapInitialStatus(payload.status);

      setOrder(payload);
      setWorkspaceStatus(nextWorkspaceStatus);
      setItems(payload.products.map((product) => toItemState(product, nextWorkspaceStatus)));
      pushTimeline(`Zmena stavu: ${getOrderStatusDisplay(nextWorkspaceStatus)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update order status.";
      setStatusActionError(message);
    } finally {
      setIsStartingPicking(false);
    }
  }

  async function handleStartPicking() {
    if (order.status !== "new" || isStatusRequestPending) {
      return;
    }

    try {
      setStatusActionError(null);
      setIsStartingPicking(true);

      const response = await fetch(`/api/orders/${encodeURIComponent(order.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nextStatus: "picking" }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Failed to update order status.");
      }

      const payload = (await response.json()) as Order;
      const nextStatus = mapInitialStatus(payload.status);

      setOrder(payload);
      setWorkspaceStatus(nextStatus);
      setItems(payload.products.map((product) => toItemState(product, nextStatus)));
      setMode("picking");
      pushTimeline(dictionary?.orders?.detail?.timeline?.picking ?? "Sber zahajen");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update order status.";
      setStatusActionError(message);
    } finally {
      setIsStartingPicking(false);
    }
  }

  async function handleOpenPacking() {
    if (order.status !== "picking" || !isPickingComplete || isStatusRequestPending) {
      return;
    }

    try {
      setStatusActionError(null);
      setIsOpeningPacking(true);

      const response = await fetch(`/api/orders/${encodeURIComponent(order.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nextStatus: "packed" }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Failed to update order status.");
      }

      const payload = (await response.json()) as Order;
      const nextStatus = mapInitialStatus(payload.status);

      setOrder(payload);
      setWorkspaceStatus(nextStatus);
      setItems(payload.products.map((product) => toItemState(product, nextStatus)));
      setMode("packing");
      pushTimeline(dictionary?.orders?.detail?.timeline?.packed ?? "Baleni zahajeno");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update order status.";
      setStatusActionError(message);
    } finally {
      setIsOpeningPacking(false);
    }
  }

  function handlePickItem(sku: string) {
    setItems((current) =>
      current.map((item) => {
        if (item.sku !== sku) {
          return item;
        }

        return {
          ...item,
          picked: true,
          pickedQuantity: item.requiredQuantity,
        };
      })
    );

    pushTimeline(`Polozka vyskladnena: ${sku}`);
  }

  function handlePrintPickingList() {
    pushTimeline("Tisk pick listu");
  }

  function handlePrintShippingLabel() {
    pushTimeline("Tisk prepravniho stitku");
  }

  function handleCompletePacking() {
    if (!canCompletePacking) {
      return;
    }

    setWorkspaceStatus("ready_to_ship");
    pushTimeline(dictionary?.orders?.detail?.timeline?.done ?? "Baleni dokonceno");
    setMode("overview");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <OrderHeader
          eyebrow={dictionary?.orders?.detail?.eyebrow ?? "Detail objednavky"}
          title={order.orderNumber}
          subtitle={dictionary?.orders?.detail?.subtitle ?? "Operacni a logisticky prehled objednavky"}
          backLabel={dictionary?.orders?.detail?.back ?? "Zpet na objednavky"}
          locale={locale}
        />

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
          {loadError ? <p className="mb-3 text-sm text-amber-300">{loadError}</p> : null}
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold text-white">{order.orderNumber}</h2>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusBadgeClasses(workspaceStatus)}`}>
                  {getOrderStatusDisplay(workspaceStatus)}
                </span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${priorityBadgeClasses(order.priority)}`}>
                  {(dictionary?.orders?.detail?.priority ?? "Priorita")}: {getPriorityDisplay(order.priority)}
                </span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${salesChannelBadgeClasses(order.salesChannel)}`}>
                  {(dictionary?.orders?.detail?.salesChannel ?? "Prodejni kanal")}: {order.salesChannel}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>{(dictionary?.orders?.detail?.created ?? "Vytvoreno")}: {formatDateTime(order.createdAt)}</span>
                <span>{(dictionary?.orders?.detail?.promiseDate ?? "Slibeny termin")}: {order.promiseDate}</span>
                <span>{(dictionary?.orders?.detail?.paymentStatus ?? "Stav platby")}: {getPaymentStatusDisplay(order.paymentStatus)}</span>
                <span>{(dictionary?.orders?.detail?.carrier ?? "Dopravce")}: {order.carrier}</span>
              </div>
            </div>

            <div className="min-w-[260px] rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {dictionary?.orders?.statusLabel ?? "Stav"}
              </label>
              <select
                value={order.status}
                onChange={(event) => handleStatusChange(event.target.value as Order["status"])}
                disabled={isStartingPicking || !nextStatus}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status} disabled={status === order.status}>
                    {getOrderStatusDisplay(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {mode === "picking" ? (
          <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-400">
                  {dictionary?.orders?.statuses?.picking ?? "Sber"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{order.orderNumber}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMode("overview")}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Zpet na objednavku
                </button>
                <button
                  onClick={handlePrintPickingList}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Tisk pick listu
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{pickedItemsCount} / {totalItemsCount} ({pickingProgressPercent}%)</span>
                <span className="text-slate-500">Prubeh</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${pickingProgressPercent}%` }} />
              </div>
            </div>

            {statusActionError ? <p className="mt-4 text-sm text-rose-300">{statusActionError}</p> : null}

            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-950/80 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.sku ?? "SKU"}</th>
                    <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.name ?? "Nazev"}</th>
                    <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.location ?? "Lokace"}</th>
                    <th className="px-4 py-3">Pozadovane mnozstvi</th>
                    <th className="px-4 py-3">Vyskladnene mnozstvi</th>
                    <th className="px-4 py-3">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.sku} className={`border-t border-slate-800 ${item.picked ? "bg-emerald-500/5" : "bg-slate-900/60"}`}>
                      <td className="px-4 py-3 font-medium text-slate-100">{item.sku}</td>
                      <td className="px-4 py-3 text-slate-200">{item.name}</td>
                      <td className="px-4 py-3 text-slate-300">{item.location}</td>
                      <td className="px-4 py-3 text-slate-300">{item.requiredQuantity}</td>
                      <td className="px-4 py-3 text-slate-300">{item.pickedQuantity}</td>
                      <td className="px-4 py-3">
                        {item.picked ? (
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                            Hotovo
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePickItem(item.sku)}
                            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
                          >
                            Oznacit jako vyskladneno
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleOpenPacking}
                disabled={!canOpenPacking}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${canOpenPacking ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" : "cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500"}`}
              >
                Zahajit baleni
              </button>
            </div>
          </section>
        ) : mode === "packing" ? (
          <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-400">
                  {dictionary?.orders?.statuses?.packed ?? "Baleni"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{order.orderNumber}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMode("picking")}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Zpet na sber
                </button>
                <button
                  onClick={handlePrintShippingLabel}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Tisk prepravniho stitku
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{completedPackingChecks} / {packingChecklistEntries.length} ({packingProgressPercent}%)</span>
                <span className="text-slate-500">Prubeh baleni</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${packingProgressPercent}%` }} />
              </div>
            </div>

            <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Checklist baleni
              </h4>
              <div className="mt-4 space-y-3">
                {packingChecklistEntries.map((entry) => (
                  <label key={entry.key} className="flex items-center gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={packingChecklist[entry.key]}
                      onChange={(event) =>
                        setPackingChecklist((current) => ({
                          ...current,
                          [entry.key]: event.target.checked,
                        }))
                      }
                    />
                    {entry.label}
                  </label>
                ))}
              </div>
            </section>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleCompletePacking}
                disabled={!canCompletePacking}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${canCompletePacking ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" : "cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500"}`}
              >
                Dokoncit baleni
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">{dictionary?.orders?.detail?.summary ?? "Souhrn objednavky"}</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{dictionary?.orders?.table?.order ?? "Cislo objednavky"}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{order.orderNumber}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{dictionary?.orders?.table?.items ?? "Polozky"}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{order.items}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{dictionary?.orders?.table?.total ?? "Hodnota"}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{order.total}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{dictionary?.orders?.detail?.promiseDate ?? "Slibeny termin"}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{order.promiseDate}</p>
                </div>
              </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h3 className="text-xl font-semibold text-white">{dictionary?.orders?.detail?.customer ?? "Zakaznik"}</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p className="font-semibold text-white">{order.customer}</p>
                  <p>{order.company}</p>
                  <p>{order.phone}</p>
                  <p>{order.email}</p>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h3 className="text-xl font-semibold text-white">{dictionary?.orders?.detail?.customerCard?.shipping ?? "Dodaci adresa"}</h3>
                <p className="mt-4 text-sm text-slate-300">{order.shippingAddress}</p>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h3 className="text-xl font-semibold text-white">{dictionary?.orders?.detail?.customerCard?.billing ?? "Fakturacni adresa"}</h3>
                <p className="mt-4 text-sm text-slate-300">{order.billingAddress}</p>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h3 className="text-xl font-semibold text-white">{dictionary?.orders?.detail?.notesLabel ?? "Poznamky"}</h3>
                <p className="mt-4 text-sm text-slate-300">{order.notes || "-"}</p>
              </section>
            </div>

            <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">{dictionary?.orders?.detail?.products?.title ?? "Produkty a skladove polozky"}</h3>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-950/80 text-slate-400">
                    <tr>
                      <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.sku ?? "SKU"}</th>
                      <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.name ?? "Nazev"}</th>
                      <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.location ?? "Lokace"}</th>
                      <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.quantity ?? "Mnozstvi"}</th>
                      <th className="px-4 py-3">Vyskladneno</th>
                      <th className="px-4 py-3">Zabaleno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.sku} className="border-t border-slate-800 bg-slate-900/60">
                        <td className="px-4 py-3 font-medium text-slate-100">{item.sku}</td>
                        <td className="px-4 py-3 text-slate-200">{item.name}</td>
                        <td className="px-4 py-3 text-slate-300">{item.location}</td>
                        <td className="px-4 py-3 text-slate-300">{item.requiredQuantity}</td>
                        <td className="px-4 py-3 text-slate-300">{item.picked ? "Ano" : "Ne"}</td>
                        <td className="px-4 py-3 text-slate-300">{item.packed ? "Ano" : "Ne"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h3 className="text-xl font-semibold text-white">{dictionary?.orders?.detail?.fulfillment?.title ?? "Informace o zasilce"}</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p><span className="text-slate-500">{dictionary?.orders?.detail?.carrier ?? "Dopravce"}:</span> {order.carrier}</p>
                  <p><span className="text-slate-500">{dictionary?.orders?.detail?.fulfillment?.tracking ?? "Sledovani"}:</span> {order.trackingNumber ?? "-"}</p>
                  <p><span className="text-slate-500">{dictionary?.orders?.detail?.fulfillment?.slot ?? "Skladova pozice"}:</span> {order.warehouseSlot}</p>
                  <p><span className="text-slate-500">{dictionary?.orders?.detail?.paymentStatus ?? "Stav platby"}:</span> {getPaymentStatusDisplay(order.paymentStatus)}</p>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h3 className="text-xl font-semibold text-white">{dictionary?.orders?.detail?.timeline?.title ?? "Casova osa objednavky"}</h3>
                <div className="mt-4 space-y-3">
                  {timeline.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                      <p className="text-sm font-medium text-slate-100">{entry.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDateTime(entry.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">{dictionary?.orders?.detail?.warehouse?.title ?? "Skladove akce"}</h3>
              {statusActionError ? <p className="mt-4 text-sm text-rose-300">{statusActionError}</p> : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleStartPicking}
                  disabled={!canStartPicking}
                  className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {dictionary?.orders?.detail?.warehouse?.startPicking ?? "Zahajit sber"}
                </button>
                <button
                  onClick={handleOpenPacking}
                  disabled={!canOpenPacking}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${canOpenPacking ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" : "cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500"}`}
                >
                  Zahajit baleni
                </button>
                <button
                  onClick={handlePrintPickingList}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Tisk pick listu
                </button>
                <button
                  onClick={handlePrintShippingLabel}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {dictionary?.orders?.detail?.printLabel ?? "Tisk prepravniho stitku"}
                </button>
                <Link
                  href={`/${locale}/orders`}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {dictionary?.orders?.detail?.back ?? "Zpet na objednavky"}
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
