"use client";

import { useState } from "react";
import Link from "next/link";
import type { Order } from "@/lib/orders/mockData";
import { OrderHeader } from "@/components/orders/OrderHeader";

type OrderDetailViewProps = {
  initialOrder: Order;
  locale: string;
  dictionary: any;
};

type WorkspaceStatus =
  | "New"
  | "Ready for Picking"
  | "Picking"
  | "Packed"
  | "Ready to Ship"
  | "Shipped"
  | "Cancelled";

type ItemWorkspaceState = {
  sku: string;
  name: string;
  location: string;
  requiredQuantity: number;
  pickedQuantity: number;
  picked: boolean;
  packed: boolean;
};

type HistoryRecord = {
  id: string;
  label: string;
  timestamp: string;
};

type PackingChecklistState = {
  productVerified: boolean;
  quantityVerified: boolean;
  packageClosed: boolean;
  shippingLabelAttached: boolean;
};

type PackageInfoState = {
  weight: string;
  length: string;
  width: string;
  height: string;
};

type ShippingChecklistState = {
  packageSealed: boolean;
  shippingLabelAttached: boolean;
  carrierSelected: boolean;
  trackingAssigned: boolean;
};

function mapInitialStatus(status: Order["status"]): WorkspaceStatus {
  if (status === "new") return "New";
  if (status === "picking") return "Picking";
  if (status === "packed") return "Packed";
  if (status === "shipped" || status === "delivered") return "Shipped";
  return "New";
}

function statusBadgeClasses(status: WorkspaceStatus) {
  if (status === "Cancelled") return "border border-rose-500/40 bg-rose-500/10 text-rose-300";
  if (status === "Shipped") return "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  if (status === "Packed" || status === "Ready to Ship") return "border border-cyan-500/40 bg-cyan-500/10 text-cyan-300";
  if (status === "Picking" || status === "Ready for Picking") return "border border-amber-500/40 bg-amber-500/10 text-amber-300";
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
  const [isPickingWorkspaceOpen, setIsPickingWorkspaceOpen] = useState(false);
  const [isPackingWorkspaceOpen, setIsPackingWorkspaceOpen] = useState(false);
  const [isShippingWorkspaceOpen, setIsShippingWorkspaceOpen] = useState(false);
  const [isPackingCompleted, setIsPackingCompleted] = useState(false);
  const [isShipmentCompleted, setIsShipmentCompleted] = useState(false);
  const [shipmentStatus, setShipmentStatus] = useState<"Ready" | "Shipped">("Ready");
  const [packageCount, setPackageCount] = useState("1");
  const [selectedCarrier, setSelectedCarrier] = useState(order.carrier);
  const [shippingService, setShippingService] = useState(order.carrier);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
  const [shippingChecklist, setShippingChecklist] = useState<ShippingChecklistState>({
    packageSealed: false,
    shippingLabelAttached: false,
    carrierSelected: Boolean(order.carrier),
    trackingAssigned: Boolean(order.trackingNumber),
  });
  const [packingChecklist, setPackingChecklist] = useState<PackingChecklistState>({
    productVerified: false,
    quantityVerified: false,
    packageClosed: false,
    shippingLabelAttached: false,
  });
  const [packageInfo, setPackageInfo] = useState<PackageInfoState>({
    weight: "",
    length: "",
    width: "",
    height: "",
  });
  const [workspaceStatus, setWorkspaceStatus] = useState<WorkspaceStatus>(() => mapInitialStatus(initialOrder.status));
  const [itemStates, setItemStates] = useState<ItemWorkspaceState[]>(() => {
    const status = mapInitialStatus(initialOrder.status);
    const picked = status === "Picking" || status === "Packed" || status === "Ready to Ship" || status === "Shipped";
    const packed = status === "Packed" || status === "Ready to Ship" || status === "Shipped";

    return initialOrder.products.map((product) => ({
      sku: product.sku,
      name: product.name,
      location: product.location,
      requiredQuantity: product.quantity,
      pickedQuantity: picked ? product.quantity : 0,
      picked,
      packed,
    }));
  });
  const [history, setHistory] = useState<HistoryRecord[]>([
    { id: "created", label: dictionary.orders.detail.timeline.created, timestamp: order.createdAt },
    { id: "updated", label: dictionary.orders.detail.timeline.updated, timestamp: order.updatedAt },
    { id: "payment", label: dictionary.orders.detail.timeline.payment, timestamp: order.updatedAt },
  ]);

  const statusOptions: WorkspaceStatus[] = [
    "New",
    "Ready for Picking",
    "Picking",
    "Packed",
    "Ready to Ship",
    "Shipped",
    "Cancelled",
  ];

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(locale === "en" ? "en-US" : "cs-CZ");

  const statusLabelMap: Record<WorkspaceStatus, string> = {
    New: dictionary.orders.statuses.new,
    "Ready for Picking": locale === "cs" ? "Připraveno ke sběru" : "Ready for Picking",
    Picking: dictionary.orders.statuses.picking,
    Packed: dictionary.orders.statuses.packed,
    "Ready to Ship": locale === "cs" ? "Připraveno k odeslání" : "Ready to Ship",
    Shipped: dictionary.orders.statuses.shipped,
    Cancelled: locale === "cs" ? "Zrušeno" : "Cancelled",
  };

  const pickedItemsCount = itemStates.filter((item) => item.picked).length;
  const totalItemsCount = itemStates.length;
  const progressPercent = totalItemsCount === 0 ? 0 : Math.round((pickedItemsCount / totalItemsCount) * 100);
  const allItemsPicked = totalItemsCount > 0 && pickedItemsCount === totalItemsCount;
  const packingChecklistEntries = [
    { key: "productVerified" as const, label: locale === "cs" ? "Produkt ověřen" : "Product verified" },
    { key: "quantityVerified" as const, label: locale === "cs" ? "Množství ověřeno" : "Quantity verified" },
    { key: "packageClosed" as const, label: locale === "cs" ? "Balík uzavřen" : "Package closed" },
    { key: "shippingLabelAttached" as const, label: locale === "cs" ? "Přepravní štítek připojen" : "Shipping label attached" },
  ];
  const completedChecklistItems = packingChecklistEntries.filter((entry) => packingChecklist[entry.key]).length;
  const packingProgressPercent = Math.round((completedChecklistItems / packingChecklistEntries.length) * 100);
  const canCompletePacking = completedChecklistItems === packingChecklistEntries.length;
  const carrierOptions = ["Zasilkovna", "DPD", "PPL", "GLS", "DHL"];
  const shippingChecklistEntries = [
    { key: "packageSealed" as const, label: locale === "cs" ? "Balík zapečetěn" : "Package sealed" },
    { key: "shippingLabelAttached" as const, label: locale === "cs" ? "Přepravní štítek připojen" : "Shipping label attached" },
    { key: "carrierSelected" as const, label: locale === "cs" ? "Dopravce vybrán" : "Carrier selected" },
    { key: "trackingAssigned" as const, label: locale === "cs" ? "Tracking přiřazen" : "Tracking assigned" },
  ];
  const completedShippingChecklistItems = shippingChecklistEntries.filter((entry) => shippingChecklist[entry.key]).length;
  const shippingProgressPercent = Math.round((completedShippingChecklistItems / shippingChecklistEntries.length) * 100);
  const canShipOrder = completedShippingChecklistItems === shippingChecklistEntries.length;

  function pushHistory(label: string) {
    setHistory((current) => [
      { id: `hist-${Date.now()}-${current.length}`, label, timestamp: new Date().toISOString() },
      ...current,
    ]);
  }

  function handleStatusChange(nextStatus: WorkspaceStatus) {
    setWorkspaceStatus(nextStatus);
    pushHistory(`${locale === "cs" ? "Změna stavu" : "Status changed"}: ${statusLabelMap[nextStatus]}`);
  }

  function handleStartPicking() {
    setIsShippingWorkspaceOpen(false);
    setIsPackingWorkspaceOpen(false);
    setWorkspaceStatus("Picking");
    setIsPickingWorkspaceOpen(true);
    pushHistory(dictionary.orders.detail.operations.startPicking);
  }

  function handleOpenPackingWorkspace() {
    if (!allItemsPicked) {
      return;
    }

    setIsShippingWorkspaceOpen(false);
    setIsPickingWorkspaceOpen(false);
    setIsPackingWorkspaceOpen(true);
    setIsPackingCompleted(false);
    pushHistory(locale === "cs" ? "Workspace balení otevřen" : "Packing workspace opened");
  }

  function createMockTrackingNumber(carrier: string) {
    const normalized = carrier.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "TRK";
    const randomPart = Math.floor(100000 + Math.random() * 900000).toString();
    return `${normalized}-${Date.now().toString().slice(-6)}-${randomPart}`;
  }

  function resolveShippingService(carrier: string) {
    if (carrier === "DPD") return "DPD Home";
    if (carrier === "PPL") return "PPL Parcel";
    if (carrier === "GLS") return "GLS Business";
    if (carrier === "DHL") return "DHL Express";
    return "Zasilkovna Standard";
  }

  function handleOpenShippingWorkspace() {
    if (!isPackingCompleted && workspaceStatus !== "Packed" && !isShipmentCompleted) {
      return;
    }

    const nextTracking = trackingNumber || createMockTrackingNumber(selectedCarrier);
    setTrackingNumber(nextTracking);
    setShippingService(resolveShippingService(selectedCarrier));
    setShippingChecklist((current) => ({
      ...current,
      carrierSelected: Boolean(selectedCarrier),
      trackingAssigned: Boolean(nextTracking),
    }));
    setIsPickingWorkspaceOpen(false);
    setIsPackingWorkspaceOpen(false);
    setIsShippingWorkspaceOpen(true);
    pushHistory(locale === "cs" ? "Workspace expedice otevřen" : "Shipping workspace opened");
  }

  function handleCompletePacking() {
    if (!canCompletePacking) {
      return;
    }

    setWorkspaceStatus("Packed");
    setItemStates((current) => current.map((item) => ({ ...item, picked: true, packed: true })));
    setIsPackingCompleted(true);
    pushHistory(locale === "cs" ? "Balení dokončeno" : "Packing completed");
  }

  function handleShipOrder() {
    if (!canShipOrder || isShipmentCompleted) {
      return;
    }

    setIsShipmentCompleted(true);
    setShipmentStatus("Shipped");
    setWorkspaceStatus("Shipped");
    pushHistory(locale === "cs" ? "Objednávka odeslána" : "Order shipped");
  }

  async function handleCopyTrackingNumber() {
    if (!trackingNumber) {
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(trackingNumber);
      pushHistory(locale === "cs" ? "Tracking zkopírován" : "Tracking copied");
    }
  }

  function handleMockPrint(actionLabel: string) {
    pushHistory(actionLabel);
  }

  function handleConfirmItemPicked(sku: string) {
    setItemStates((current) =>
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

    const target = itemStates.find((item) => item.sku === sku);
    if (target && !target.picked) {
      pushHistory(`${locale === "cs" ? "Položka vyskladněna" : "Item picked"}: ${target.sku}`);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <OrderHeader
          eyebrow={dictionary.orders.detail.eyebrow}
          title={order.orderNumber}
          subtitle={dictionary.orders.detail.subtitle}
          backLabel={dictionary.orders.detail.back}
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
                  {dictionary.orders.detail.priority}: {order.priority}
                </span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${salesChannelBadgeClasses(order.salesChannel)}`}>
                  {dictionary.orders.detail.salesChannel}: {order.salesChannel}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>{dictionary.orders.detail.created} {formatDateTime(order.createdAt)}</span>
                <span>{dictionary.orders.detail.promiseDate} {order.promiseDate}</span>
                <span>{dictionary.orders.detail.paymentStatus} {order.paymentStatus}</span>
                <span>{dictionary.orders.detail.carrier} {order.carrier}</span>
              </div>
            </div>

            <div className="min-w-[260px] rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {dictionary.orders.statusLabel}
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

        {isShippingWorkspaceOpen ? (
          <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-400">
                  {locale === "cs" ? "Workspace expedice" : "Shipping Workspace"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{order.orderNumber}</h3>
                <p className="mt-1 text-sm text-slate-400">{dictionary.orders.table.customer}: {order.customer}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${shipmentStatus === "Shipped" ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border border-amber-500/40 bg-amber-500/10 text-amber-300"}`}>
                {shipmentStatus === "Shipped" ? (locale === "cs" ? "Odesláno" : "Shipped") : (locale === "cs" ? "Připraveno" : "Ready")}
              </span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                <p className="text-slate-500">{dictionary.orders.detail.carrier}</p>
                <p className="mt-1 font-medium text-white">{selectedCarrier}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                <p className="text-slate-500">{locale === "cs" ? "Služba dopravy" : "Shipping service"}</p>
                <p className="mt-1 font-medium text-white">{shippingService}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                <p className="text-slate-500">{dictionary.orders.detail.fulfillment.tracking}</p>
                <p className="mt-1 font-medium text-white">{trackingNumber || "-"}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                <p className="text-slate-500">{locale === "cs" ? "Balíky / Hmotnost" : "Packages / Total weight"}</p>
                <p className="mt-1 font-medium text-white">{packageCount || "1"} / {packageInfo.weight || "-"}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
              <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {locale === "cs" ? "Kontrola zásilky" : "Shipment verification"}
                </h4>
                <div className="mt-4 space-y-3">
                  {shippingChecklistEntries.map((entry) => (
                    <label key={entry.key} className="flex items-center gap-3 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        disabled={isShipmentCompleted}
                        checked={shippingChecklist[entry.key]}
                        onChange={(event) =>
                          setShippingChecklist((current) => ({
                            ...current,
                            [entry.key]: event.target.checked,
                          }))
                        }
                      />
                      {entry.label}
                    </label>
                  ))}
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${shippingProgressPercent}%` }} />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {locale === "cs" ? "Souhrn zásilky" : "Shipment summary"}
                </h4>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p><span className="text-slate-500">{dictionary.orders.detail.carrier}:</span> {selectedCarrier}</p>
                  <p><span className="text-slate-500">{locale === "cs" ? "Služba" : "Service"}:</span> {shippingService}</p>
                  <p><span className="text-slate-500">{dictionary.orders.detail.fulfillment.tracking}:</span> {trackingNumber || "-"}</p>
                  <p><span className="text-slate-500">{locale === "cs" ? "Balíky" : "Packages"}:</span> {packageCount || "1"}</p>
                  <p><span className="text-slate-500">{locale === "cs" ? "Hmotnost" : "Weight"}:</span> {packageInfo.weight || "-"}</p>
                </div>
              </section>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr]">
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block">{dictionary.orders.detail.carrier}</span>
                <select
                  value={selectedCarrier}
                  disabled={isShipmentCompleted}
                  onChange={(event) => {
                    const nextCarrier = event.target.value;
                    setSelectedCarrier(nextCarrier);
                    setShippingService(resolveShippingService(nextCarrier));
                    setShippingChecklist((current) => ({ ...current, carrierSelected: Boolean(nextCarrier) }));
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100"
                >
                  {carrierOptions.map((carrier) => (
                    <option key={carrier} value={carrier}>{carrier}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block">{dictionary.orders.detail.fulfillment.tracking}</span>
                <div className="flex gap-2">
                  <input
                    value={trackingNumber}
                    disabled={isShipmentCompleted}
                    onChange={(event) => {
                      const value = event.target.value;
                      setTrackingNumber(value);
                      setShippingChecklist((current) => ({ ...current, trackingAssigned: Boolean(value.trim()) }));
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100"
                  />
                  <button
                    onClick={() => {
                      const nextTracking = createMockTrackingNumber(selectedCarrier);
                      setTrackingNumber(nextTracking);
                      setShippingChecklist((current) => ({ ...current, trackingAssigned: true }));
                    }}
                    disabled={isShipmentCompleted}
                    className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {locale === "cs" ? "Generovat" : "Generate"}
                  </button>
                </div>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setIsShippingWorkspaceOpen(false);
                  setIsPackingWorkspaceOpen(true);
                }}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                {locale === "cs" ? "Zpět na balení" : "Back to Packing"}
              </button>
              <button
                onClick={() => handleMockPrint(locale === "cs" ? "Tisk štítku" : "Print Shipping Label")}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                {locale === "cs" ? "Tisk štítku" : "Print Shipping Label"}
              </button>
              <button
                onClick={() => void handleCopyTrackingNumber()}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                {locale === "cs" ? "Kopírovat tracking" : "Copy Tracking Number"}
              </button>
              <button
                onClick={handleShipOrder}
                disabled={!canShipOrder || isShipmentCompleted}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${canShipOrder && !isShipmentCompleted ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" : "cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500"}`}
              >
                {locale === "cs" ? "Odeslat objednávku" : "Ship Order"}
              </button>
            </div>

            {isShipmentCompleted ? (
              <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
                <p className="text-sm font-medium text-emerald-300">
                  {locale === "cs" ? "Zásilka byla úspěšně dokončena" : "Shipment completed successfully"}
                </p>
              </div>
            ) : null}
          </section>
        ) : isPackingWorkspaceOpen ? (
          <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-400">
                  {locale === "cs" ? "Workspace balení" : "Packing Workspace"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{order.orderNumber}</h3>
                <p className="mt-1 text-sm text-slate-400">{dictionary.orders.table.customer}: {order.customer}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setIsPackingWorkspaceOpen(false);
                    setIsPickingWorkspaceOpen(true);
                  }}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {locale === "cs" ? "Zpět na sběr" : "Back to Picking"}
                </button>
                <button
                  onClick={() => handleMockPrint(locale === "cs" ? "Tisk pick listu" : "Print Picking List")}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {locale === "cs" ? "Tisk pick listu" : "Print Picking List"}
                </button>
                <button
                  onClick={() => handleMockPrint(locale === "cs" ? "Tisk štítku" : "Print Shipping Label")}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {locale === "cs" ? "Tisk štítku" : "Print Shipping Label"}
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                <p><span className="text-slate-500">{dictionary.orders.detail.carrier}:</span> {order.carrier}</p>
                <p className="mt-2"><span className="text-slate-500">{locale === "cs" ? "Služba" : "Shipping service"}:</span> {shippingService}</p>
                <p className="mt-2"><span className="text-slate-500">{locale === "cs" ? "Počet balíků" : "Package count"}:</span></p>
                <input
                  type="number"
                  min={1}
                  value={packageCount}
                  onChange={(event) => setPackageCount(event.target.value)}
                  className="mt-2 w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 lg:col-span-2">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{locale === "cs" ? "Průběh balení" : "Packing progress"}</span>
                  <span>{completedChecklistItems} / {packingChecklistEntries.length} ({packingProgressPercent}%)</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${packingProgressPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-950/80 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">{dictionary.orders.detail.products.sku}</th>
                    <th className="px-4 py-3">{dictionary.orders.detail.products.name}</th>
                    <th className="px-4 py-3">{dictionary.orders.detail.products.quantity}</th>
                    <th className="px-4 py-3">{locale === "cs" ? "Vyskladněno" : "Picked status"}</th>
                  </tr>
                </thead>
                <tbody>
                  {itemStates.map((item) => (
                    <tr key={item.sku} className="border-t border-slate-800 bg-slate-900/60">
                      <td className="px-4 py-3 font-medium text-slate-100">{item.sku}</td>
                      <td className="px-4 py-3 text-slate-200">{item.name}</td>
                      <td className="px-4 py-3 text-slate-300">{item.requiredQuantity}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.picked ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-700/50 text-slate-300"}`}>
                          {item.picked ? (locale === "cs" ? "Ano" : "Yes") : (locale === "cs" ? "Ne" : "No")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
              <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {locale === "cs" ? "Checklist balení" : "Packing checklist"}
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

              <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {locale === "cs" ? "Informace o balíku" : "Package information"}
                </h4>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm text-slate-300">
                    <span className="mb-1 block">{locale === "cs" ? "Hmotnost" : "Weight"}</span>
                    <input
                      value={packageInfo.weight}
                      onChange={(event) => setPackageInfo((state) => ({ ...state, weight: event.target.value }))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                    />
                  </label>
                  <label className="text-sm text-slate-300">
                    <span className="mb-1 block">{locale === "cs" ? "Délka" : "Length"}</span>
                    <input
                      value={packageInfo.length}
                      onChange={(event) => setPackageInfo((state) => ({ ...state, length: event.target.value }))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                    />
                  </label>
                  <label className="text-sm text-slate-300">
                    <span className="mb-1 block">{locale === "cs" ? "Šířka" : "Width"}</span>
                    <input
                      value={packageInfo.width}
                      onChange={(event) => setPackageInfo((state) => ({ ...state, width: event.target.value }))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                    />
                  </label>
                  <label className="text-sm text-slate-300">
                    <span className="mb-1 block">{locale === "cs" ? "Výška" : "Height"}</span>
                    <input
                      value={packageInfo.height}
                      onChange={(event) => setPackageInfo((state) => ({ ...state, height: event.target.value }))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                    />
                  </label>
                </div>
              </section>
            </div>

            <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                {locale === "cs" ? "Souhrn zásilky" : "Shipment summary"}
              </h4>
              <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
                <p><span className="text-slate-500">{dictionary.orders.table.order}:</span> {order.orderNumber}</p>
                <p><span className="text-slate-500">{dictionary.orders.table.customer}:</span> {order.customer}</p>
                <p><span className="text-slate-500">{locale === "cs" ? "Balíky" : "Packages"}:</span> {packageCount || "1"}</p>
                <p><span className="text-slate-500">{dictionary.orders.detail.carrier}:</span> {order.carrier}</p>
                <p><span className="text-slate-500">{locale === "cs" ? "Hmotnost" : "Weight"}:</span> {packageInfo.weight || "-"}</p>
                <p><span className="text-slate-500">L × W × H:</span> {packageInfo.length || "-"} × {packageInfo.width || "-"} × {packageInfo.height || "-"}</p>
              </div>
            </section>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleCompletePacking}
                disabled={!canCompletePacking}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${canCompletePacking ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" : "cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500"}`}
              >
                {locale === "cs" ? "Dokončit balení" : "Complete Packing"}
              </button>
            </div>

            {isPackingCompleted ? (
              <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
                <p className="text-sm font-medium text-emerald-300">
                  {locale === "cs" ? "Balení úspěšně dokončeno" : "Packing completed successfully"}
                </p>
                <button
                  onClick={() => handleMockPrint(locale === "cs" ? "Tisk štítku" : "Print Shipping Label")}
                  className="mt-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                >
                  {locale === "cs" ? "Tisk štítku" : "Print Shipping Label"} →
                </button>
              </div>
            ) : null}
          </section>
        ) : isPickingWorkspaceOpen ? (
          <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-400">
                  {locale === "cs" ? "Workspace sběru" : "Picking Workspace"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{order.orderNumber}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {dictionary.orders.table.customer}: {order.customer}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIsPickingWorkspaceOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {locale === "cs" ? "Zpět na objednávku" : "Back to Order"}
                </button>
                <button
                  onClick={() => handleMockPrint(locale === "cs" ? "Tisk pick listu" : "Print Picking List")}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {locale === "cs" ? "Tisk pick listu" : "Print Picking List"}
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>
                  {pickedItemsCount} / {totalItemsCount} {locale === "cs" ? "položek vyskladněno" : "items picked"} ({progressPercent}%)
                </span>
                <span className="text-slate-500">{locale === "cs" ? "Průběh" : "Progress"}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-950/80 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">{dictionary.orders.detail.products.sku}</th>
                    <th className="px-4 py-3">{dictionary.orders.detail.products.name}</th>
                    <th className="px-4 py-3">{dictionary.orders.detail.products.location}</th>
                    <th className="px-4 py-3">{locale === "cs" ? "Požadované množství" : "Required quantity"}</th>
                    <th className="px-4 py-3">{locale === "cs" ? "Vyskladněné množství" : "Picked quantity"}</th>
                    <th className="px-4 py-3">{locale === "cs" ? "Stav" : "Progress"}</th>
                    <th className="px-4 py-3">{locale === "cs" ? "Akce" : "Action"}</th>
                  </tr>
                </thead>
                <tbody>
                  {itemStates.map((item) => (
                    <tr key={item.sku} className={`border-t border-slate-800 ${item.picked ? "bg-emerald-500/5" : "bg-slate-900/60"}`}>
                      <td className="px-4 py-3 font-medium text-slate-100">{item.sku}</td>
                      <td className="px-4 py-3 text-slate-200">{item.name}</td>
                      <td className="px-4 py-3 text-slate-300">{item.location}</td>
                      <td className="px-4 py-3 text-slate-300">{item.requiredQuantity}</td>
                      <td className="px-4 py-3 text-slate-300">{item.pickedQuantity}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.picked ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>
                          {item.picked ? (locale === "cs" ? "Dokončeno" : "Completed") : (locale === "cs" ? "Čeká" : "Pending")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.picked ? (
                          <span className="text-xs text-emerald-300">{locale === "cs" ? "Hotovo" : "Done"}</span>
                        ) : (
                          <button
                            onClick={() => handleConfirmItemPicked(item.sku)}
                            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
                          >
                            {locale === "cs" ? "Označit jako vyskladněno" : "Mark as Picked"}
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
                onClick={handleOpenPackingWorkspace}
                disabled={!allItemsPicked}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${allItemsPicked ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" : "cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500"}`}
              >
                {locale === "cs" ? "Zahájit balení" : "Start Packing"}
              </button>
            </div>

            {allItemsPicked ? (
              <button
                onClick={handleOpenPackingWorkspace}
                className="mt-4 w-full rounded-2xl border border-cyan-500/40 bg-cyan-500/15 px-5 py-4 text-lg font-semibold text-cyan-200 transition hover:bg-cyan-500/25"
              >
                {locale === "cs" ? "Zahájit balení" : "Start Packing"} →
              </button>
            ) : null}
          </section>
        ) : (
        <>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <h3 className="text-xl font-semibold text-white">{dictionary.orders.detail.summary}</h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <p><span className="text-slate-500">{dictionary.orders.table.order}:</span> {order.orderNumber}</p>
              <p><span className="text-slate-500">{dictionary.orders.table.items}:</span> {order.items}</p>
              <p><span className="text-slate-500">{dictionary.orders.table.total}:</span> {order.total}</p>
              <p><span className="text-slate-500">{dictionary.orders.detail.promiseDate}:</span> {order.promiseDate}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <h3 className="text-xl font-semibold text-white">{dictionary.orders.detail.customer}</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p className="font-semibold text-white">{order.customer}</p>
              <p>{order.company}</p>
              <p>{order.phone}</p>
              <p>{order.email}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <h3 className="text-xl font-semibold text-white">{dictionary.orders.detail.customerCard.shipping}</h3>
            <p className="mt-4 text-sm text-slate-300">{order.shippingAddress}</p>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <h3 className="text-xl font-semibold text-white">{dictionary.orders.detail.customerCard.billing}</h3>
            <p className="mt-4 text-sm text-slate-300">{order.billingAddress}</p>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
          <h3 className="text-xl font-semibold text-white">{dictionary.orders.detail.products.title}</h3>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400">
                <tr>
                  <th className="px-4 py-3">{dictionary.orders.detail.products.sku}</th>
                  <th className="px-4 py-3">{dictionary.orders.detail.products.name}</th>
                  <th className="px-4 py-3">{dictionary.orders.detail.products.quantity}</th>
                  <th className="px-4 py-3">{locale === "cs" ? "Vyskladněno" : "Picked"}</th>
                  <th className="px-4 py-3">{locale === "cs" ? "Zabaleno" : "Packed"}</th>
                </tr>
              </thead>
              <tbody>
                {itemStates.map((item) => (
                  <tr key={item.sku} className="border-t border-slate-800 bg-slate-900/60">
                    <td className="px-4 py-3 font-medium text-slate-100">{item.sku}</td>
                    <td className="px-4 py-3 text-slate-200">{item.name}</td>
                    <td className="px-4 py-3 text-slate-300">{item.requiredQuantity}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.picked ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-700/50 text-slate-300"}`}>
                        {item.picked ? (locale === "cs" ? "Ano" : "Yes") : (locale === "cs" ? "Ne" : "No")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.packed ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-700/50 text-slate-300"}`}>
                        {item.packed ? (locale === "cs" ? "Ano" : "Yes") : (locale === "cs" ? "Ne" : "No")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <h3 className="text-xl font-semibold text-white">{locale === "cs" ? "Informace o zásilce" : "Shipping information"}</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">{dictionary.orders.detail.carrier}:</span> {order.carrier}</p>
              <p><span className="text-slate-500">{dictionary.orders.detail.fulfillment.tracking}:</span> {order.trackingNumber ?? "-"}</p>
              <p><span className="text-slate-500">{dictionary.orders.detail.fulfillment.slot}:</span> {order.warehouseSlot}</p>
              <p><span className="text-slate-500">{dictionary.orders.detail.paymentStatus}:</span> {order.paymentStatus}</p>
              <p><span className="text-slate-500">{dictionary.orders.detail.notesLabel}:</span> {order.notes || "-"}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <h3 className="text-xl font-semibold text-white">{dictionary.orders.detail.timeline.title}</h3>
            <div className="mt-4 space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <p className="text-sm font-medium text-slate-100">{entry.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(entry.timestamp)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
          <h3 className="text-xl font-semibold text-white">{dictionary.orders.detail.warehouse.title}</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleStartPicking}
              className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
            >
              {locale === "cs" ? "Zahájit sběr" : "Start Picking"}
            </button>
            <button
              onClick={handleOpenPackingWorkspace}
              disabled={!allItemsPicked}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${allItemsPicked ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" : "cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500"}`}
            >
              {locale === "cs" ? "Zahájit balení" : "Start Packing"}
            </button>
            <button
              onClick={() => handleMockPrint(locale === "cs" ? "Tisk pick listu" : "Print Picking List")}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              {locale === "cs" ? "Tisk pick listu" : "Print Picking List"}
            </button>
            <button
              onClick={() => handleMockPrint(dictionary.orders.detail.printLabel)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              {locale === "cs" ? "Tisk štítku" : "Print Shipping Label"}
            </button>
            <Link href={`/${locale}/orders`} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
              {dictionary.orders.detail.back}
            </Link>
          </div>
        </section>
        </>
        )}
      </div>
    </main>
  );
}
