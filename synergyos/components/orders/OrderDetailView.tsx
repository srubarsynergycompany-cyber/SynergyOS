"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { OrderHeader } from "@/components/orders/OrderHeader";
import type { Order } from "@/lib/orders/mockData";

type OrderDetailViewProps = {
  initialOrder: Order;
  locale: string;
  dictionary: any;
};

type WorkspaceStatus =
  | "new"
  | "ready_for_picking"
  | "picking"
  | "packed"
  | "ready_to_ship"
  | "shipped"
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
  if (status === "shipped" || status === "delivered") return "shipped";
  return "new";
}

function statusBadgeClasses(status: WorkspaceStatus) {
  if (status === "cancelled") return "border border-rose-500/40 bg-rose-500/10 text-rose-300";
  if (status === "shipped") return "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
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

export function OrderDetailView({ initialOrder, locale, dictionary }: OrderDetailViewProps) {
  const [order] = useState(initialOrder);
  const [mode, setMode] = useState<WorkspaceMode>("overview");
  const [workspaceStatus, setWorkspaceStatus] = useState<WorkspaceStatus>(() => mapInitialStatus(initialOrder.status));
  const [items, setItems] = useState<ItemState[]>(() => {
    const initialStatus = mapInitialStatus(initialOrder.status);
    const pickedByDefault = initialStatus === "packed" || initialStatus === "ready_to_ship" || initialStatus === "shipped";
    return initialOrder.products.map((product) => ({
      sku: product.sku,
      name: product.name,
      location: product.location,
      requiredQuantity: product.quantity,
      pickedQuantity: pickedByDefault ? product.quantity : 0,
      picked: pickedByDefault,
      packed: initialStatus === "packed" || initialStatus === "ready_to_ship" || initialStatus === "shipped",
    }));
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
      label: dictionary?.orders?.detail?.timeline?.created ?? "Order created",
      timestamp: order.createdAt,
    },
    {
      id: "updated",
      label: dictionary?.orders?.detail?.timeline?.updated ?? "Order updated",
      timestamp: order.updatedAt,
    },
    {
      id: "payment",
      label: dictionary?.orders?.detail?.timeline?.payment ?? "Payment confirmed",
      timestamp: order.updatedAt,
    },
  ]);

  const statusOptions: WorkspaceStatus[] = [
    "new",
    "ready_for_picking",
    "picking",
    "packed",
    "ready_to_ship",
    "shipped",
    "cancelled",
  ];

  const statusLabelMap: Record<WorkspaceStatus, string> = {
    new: dictionary?.orders?.statuses?.new ?? "New",
    ready_for_picking: locale === "cs" ? "Pripraveno ke sberu" : "Ready for Picking",
    picking: dictionary?.orders?.statuses?.picking ?? "Picking",
    packed: dictionary?.orders?.statuses?.packed ?? "Packed",
    ready_to_ship: locale === "cs" ? "Pripraveno k odeslani" : "Ready to Ship",
    shipped: dictionary?.orders?.statuses?.shipped ?? "Shipped",
    cancelled: locale === "cs" ? "Zruseno" : "Cancelled",
  };

  const packingChecklistEntries = [
    { key: "productsVerified" as const, label: locale === "cs" ? "Produkty overeny" : "Products verified" },
    { key: "quantitiesVerified" as const, label: locale === "cs" ? "Mnozstvi overeno" : "Quantities verified" },
    { key: "packageClosed" as const, label: locale === "cs" ? "Balik uzavren" : "Package closed" },
    { key: "shippingLabelPrepared" as const, label: locale === "cs" ? "Stitek pripraven" : "Shipping label prepared" },
  ];

  const pickedItemsCount = useMemo(() => items.filter((item) => item.picked).length, [items]);
  const totalItemsCount = items.length;
  const pickingProgressPercent = totalItemsCount === 0 ? 0 : Math.round((pickedItemsCount / totalItemsCount) * 100);
  const isPickingComplete = totalItemsCount > 0 && pickedItemsCount === totalItemsCount;

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

  function handleStatusChange(next: WorkspaceStatus) {
    setWorkspaceStatus(next);
    pushTimeline(`${locale === "cs" ? "Zmena stavu" : "Status changed"}: ${statusLabelMap[next]}`);
  }

  function handleStartPicking() {
    setMode("picking");
    setWorkspaceStatus("picking");
    pushTimeline(locale === "cs" ? "Sber zahajen" : "Picking started");
  }

  function handleOpenPacking() {
    if (!isPickingComplete) {
      return;
    }

    setMode("packing");
    setWorkspaceStatus("packed");
    setItems((current) => current.map((item) => ({ ...item, packed: true })));
    pushTimeline(locale === "cs" ? "Baleni zahajeno" : "Packing started");
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

    pushTimeline(`${locale === "cs" ? "Polozka vyskladnena" : "Item picked"}: ${sku}`);
  }

  function handlePrintPickingList() {
    pushTimeline(locale === "cs" ? "Tisk pick listu" : "Print Picking List");
  }

  function handlePrintShippingLabel() {
    pushTimeline(locale === "cs" ? "Tisk stitku" : "Print Shipping Label");
  }

  function handleCompletePacking() {
    if (!canCompletePacking) {
      return;
    }

    setWorkspaceStatus("ready_to_ship");
    pushTimeline(locale === "cs" ? "Baleni dokonceno" : "Packing completed");
    setMode("overview");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <OrderHeader
          eyebrow={dictionary?.orders?.detail?.eyebrow ?? "Order details"}
          title={order.orderNumber}
          subtitle={dictionary?.orders?.detail?.subtitle ?? "Operations and logistics overview."}
          backLabel={dictionary?.orders?.detail?.back ?? "Back to orders"}
          locale={locale}
        />

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold text-white">{order.orderNumber}</h2>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusBadgeClasses(workspaceStatus)}`}>
                  {statusLabelMap[workspaceStatus]}
                </span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${priorityBadgeClasses(order.priority)}`}>
                  {(dictionary?.orders?.detail?.priority ?? "Priority")}: {order.priority}
                </span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${salesChannelBadgeClasses(order.salesChannel)}`}>
                  {(dictionary?.orders?.detail?.salesChannel ?? "Sales channel")}: {order.salesChannel}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>{(dictionary?.orders?.detail?.created ?? "Created")} {formatDateTime(order.createdAt)}</span>
                <span>{(dictionary?.orders?.detail?.promiseDate ?? "Promise date")} {order.promiseDate}</span>
                <span>{(dictionary?.orders?.detail?.paymentStatus ?? "Payment status")} {order.paymentStatus}</span>
                <span>{(dictionary?.orders?.detail?.carrier ?? "Carrier")} {order.carrier}</span>
              </div>
            </div>

            <div className="min-w-[260px] rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {dictionary?.orders?.statusLabel ?? "Status"}
              </label>
              <select
                value={workspaceStatus}
                onChange={(event) => handleStatusChange(event.target.value as WorkspaceStatus)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabelMap[status]}
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
                  {locale === "cs" ? "Workspace sberu" : "Picking Workspace"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{order.orderNumber}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMode("overview")}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {locale === "cs" ? "Zpet na objednavku" : "Back to Order"}
                </button>
                <button
                  onClick={handlePrintPickingList}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {locale === "cs" ? "Print Picking List" : "Print Picking List"}
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{pickedItemsCount} / {totalItemsCount} ({pickingProgressPercent}%)</span>
                <span className="text-slate-500">{locale === "cs" ? "Prubeh" : "Progress"}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${pickingProgressPercent}%` }} />
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-950/80 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.sku ?? "SKU"}</th>
                    <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.name ?? "Name"}</th>
                    <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.location ?? "Location"}</th>
                    <th className="px-4 py-3">{locale === "cs" ? "Pozadovano" : "Required"}</th>
                    <th className="px-4 py-3">{locale === "cs" ? "Vyskladneno" : "Picked"}</th>
                    <th className="px-4 py-3">{locale === "cs" ? "Akce" : "Action"}</th>
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
                            {locale === "cs" ? "Hotovo" : "Done"}
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePickItem(item.sku)}
                            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
                          >
                            {locale === "cs" ? "Oznacit jako vyskladneno" : "Mark as Picked"}
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
                disabled={!isPickingComplete}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${isPickingComplete ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" : "cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500"}`}
              >
                {locale === "cs" ? "Zahajit baleni" : "Start Packing"}
              </button>
            </div>
          </section>
        ) : mode === "packing" ? (
          <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-400">
                  {locale === "cs" ? "Workspace baleni" : "Packing Workspace"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{order.orderNumber}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMode("picking")}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {locale === "cs" ? "Zpet na sber" : "Back to Picking"}
                </button>
                <button
                  onClick={handlePrintShippingLabel}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {locale === "cs" ? "Print Shipping Label" : "Print Shipping Label"}
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{completedPackingChecks} / {packingChecklistEntries.length} ({packingProgressPercent}%)</span>
                <span className="text-slate-500">{locale === "cs" ? "Prubeh baleni" : "Packing progress"}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${packingProgressPercent}%` }} />
              </div>
            </div>

            <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                {locale === "cs" ? "Checklist baleni" : "Packing checklist"}
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
                {locale === "cs" ? "Dokoncit baleni" : "Complete Packing"}
              </button>
            </div>
          </section>
        ) : (
          <>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h3 className="text-xl font-semibold text-white">{dictionary?.orders?.detail?.summary ?? "Order summary"}</h3>
                <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                  <p><span className="text-slate-500">{dictionary?.orders?.table?.order ?? "Order"}:</span> {order.orderNumber}</p>
                  <p><span className="text-slate-500">{dictionary?.orders?.table?.items ?? "Items"}:</span> {order.items}</p>
                  <p><span className="text-slate-500">{dictionary?.orders?.table?.total ?? "Total"}:</span> {order.total}</p>
                  <p><span className="text-slate-500">{dictionary?.orders?.detail?.promiseDate ?? "Promise date"}:</span> {order.promiseDate}</p>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h3 className="text-xl font-semibold text-white">{dictionary?.orders?.detail?.customer ?? "Customer information"}</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p className="font-semibold text-white">{order.customer}</p>
                  <p>{order.company}</p>
                  <p>{order.phone}</p>
                  <p>{order.email}</p>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h3 className="text-xl font-semibold text-white">
                  {dictionary?.orders?.detail?.customerCard?.shipping ?? "Shipping address"}
                </h3>
                <p className="mt-4 text-sm text-slate-300">{order.shippingAddress}</p>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h3 className="text-xl font-semibold text-white">
                  {dictionary?.orders?.detail?.customerCard?.billing ?? "Billing address"}
                </h3>
                <p className="mt-4 text-sm text-slate-300">{order.billingAddress}</p>
              </section>
            </div>

            <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">
                {dictionary?.orders?.detail?.products?.title ?? "Products / warehouse items"}
              </h3>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-950/80 text-slate-400">
                    <tr>
                      <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.sku ?? "SKU"}</th>
                      <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.name ?? "Name"}</th>
                      <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.location ?? "Location"}</th>
                      <th className="px-4 py-3">{dictionary?.orders?.detail?.products?.quantity ?? "Quantity"}</th>
                      <th className="px-4 py-3">{locale === "cs" ? "Vyskladneno" : "Picked"}</th>
                      <th className="px-4 py-3">{locale === "cs" ? "Zabaleno" : "Packed"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.sku} className="border-t border-slate-800 bg-slate-900/60">
                        <td className="px-4 py-3 font-medium text-slate-100">{item.sku}</td>
                        <td className="px-4 py-3 text-slate-200">{item.name}</td>
                        <td className="px-4 py-3 text-slate-300">{item.location}</td>
                        <td className="px-4 py-3 text-slate-300">{item.requiredQuantity}</td>
                        <td className="px-4 py-3 text-slate-300">{item.picked ? (locale === "cs" ? "Ano" : "Yes") : (locale === "cs" ? "Ne" : "No")}</td>
                        <td className="px-4 py-3 text-slate-300">{item.packed ? (locale === "cs" ? "Ano" : "Yes") : (locale === "cs" ? "Ne" : "No")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h3 className="text-xl font-semibold text-white">{locale === "cs" ? "Informace o zasilce" : "Shipment information"}</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p><span className="text-slate-500">{dictionary?.orders?.detail?.carrier ?? "Carrier"}:</span> {order.carrier}</p>
                  <p><span className="text-slate-500">{dictionary?.orders?.detail?.fulfillment?.tracking ?? "Tracking"}:</span> {order.trackingNumber ?? "-"}</p>
                  <p><span className="text-slate-500">{dictionary?.orders?.detail?.fulfillment?.slot ?? "Warehouse slot"}:</span> {order.warehouseSlot}</p>
                  <p><span className="text-slate-500">{dictionary?.orders?.detail?.paymentStatus ?? "Payment status"}:</span> {order.paymentStatus}</p>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h3 className="text-xl font-semibold text-white">{dictionary?.orders?.detail?.timeline?.title ?? "Timeline"}</h3>
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
              <h3 className="text-xl font-semibold text-white">{dictionary?.orders?.detail?.warehouse?.title ?? "Warehouse actions"}</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleStartPicking}
                  className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                >
                  {locale === "cs" ? "Start Picking" : "Start Picking"}
                </button>
                <button
                  onClick={handleOpenPacking}
                  disabled={!isPickingComplete}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${isPickingComplete ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" : "cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500"}`}
                >
                  {locale === "cs" ? "Start Packing" : "Start Packing"}
                </button>
                <button
                  onClick={handlePrintPickingList}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {locale === "cs" ? "Print Picking List" : "Print Picking List"}
                </button>
                <button
                  onClick={handlePrintShippingLabel}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {locale === "cs" ? "Print Shipping Label" : "Print Shipping Label"}
                </button>
                <Link
                  href={`/${locale}/orders`}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {dictionary?.orders?.detail?.back ?? "Back to orders"}
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
