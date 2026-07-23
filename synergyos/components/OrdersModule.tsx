"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LanguageSwitcher from "@/lib/i18n/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/types";
import type { Dictionary } from "@/lib/i18n/types";
import { mockOrders, type Order, type OrderStatus } from "@/lib/orders/mockData";

type OrdersModuleProps = {
  dictionary: Dictionary;
  locale: Locale;
};

const PAGE_SIZE = 5;
const statusOrder: OrderStatus[] = ["new", "picking", "packed", "shipped", "delivered"];

type ApiOrderListItem = Partial<Order> & {
  id: string;
  orderNumber: string;
  customerId?: string;
  totalAmount?: number;
  currency?: string;
};

function parseOrderStatus(status: string | undefined): OrderStatus {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "new" || normalized === "picking" || normalized === "packed" || normalized === "shipped" || normalized === "delivered") {
    return normalized;
  }
  return "new";
}

function parsePriority(priority: string | undefined): Order["priority"] {
  if (priority === "High" || priority === "Normal" || priority === "Low") {
    return priority;
  }
  return "Normal";
}

function mapApiOrderToViewModel(item: ApiOrderListItem): Order {
  const nowIso = new Date().toISOString();
  const customerLabel = item.customer?.trim() || item.customerId?.trim() || "Unknown customer";
  const createdAt = item.createdAt ?? nowIso;

  return {
    id: item.id,
    orderNumber: item.orderNumber,
    customer: customerLabel,
    company: item.company ?? customerLabel,
    phone: item.phone ?? "",
    email: item.email ?? "",
    shop: item.shop ?? item.salesChannel ?? "SynergyOS",
    status: parseOrderStatus(item.status),
    carrier: item.carrier ?? "-",
    createdAt,
    updatedAt: item.updatedAt ?? createdAt,
    items: item.items ?? item.products?.reduce((total, product) => total + product.quantity, 0) ?? 0,
    total: item.total ?? (typeof item.totalAmount === "number" ? `${item.totalAmount.toFixed(2)} ${item.currency ?? "USD"}` : "$0.00"),
    address: item.address ?? item.shippingAddress ?? "",
    shippingAddress: item.shippingAddress ?? "",
    billingAddress: item.billingAddress ?? "",
    priority: parsePriority(item.priority),
    trackingNumber: item.trackingNumber,
    notes: item.notes ?? "",
    warehouseSlot: item.warehouseSlot ?? "TBD",
    promiseDate: item.promiseDate ?? createdAt.split("T")[0],
    salesChannel: item.salesChannel ?? "Shopify",
    paymentStatus: item.paymentStatus ?? "Pending",
    pickerName: item.pickerName,
    pickedAt: item.pickedAt,
    packedAt: item.packedAt,
    shippedAt: item.shippedAt,
    products: item.products ?? [],
  };
}

export default function OrdersModule({ dictionary, locale }: OrdersModuleProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    customer: "",
    salesChannel: "Shopify" as Order["salesChannel"],
    carrier: "PPL",
    priority: "Normal" as Order["priority"],
    notes: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoadError(null);
        const response = await fetch("/api/orders", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load orders from API.");
        }

        const payload = (await response.json()) as { items?: ApiOrderListItem[] };
        const apiItems = Array.isArray(payload.items) ? payload.items : [];
        const mapped = apiItems.map(mapApiOrderToViewModel);

        if (!cancelled) {
          setOrders(mapped);
        }
      } catch {
        if (!cancelled) {
          // Explicit fallback: keep module usable with local fixtures if API is unavailable.
          setOrders(mockOrders);
          setLoadError("Orders API is unavailable. Showing fallback data.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const term = search.toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(term) ||
        order.customer.toLowerCase().includes(term) ||
        order.shop.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const pagedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  const resetPagination = () => setPage(1);

  function resetCreateForm() {
    setCreateForm({
      customer: "",
      salesChannel: "Shopify",
      carrier: "PPL",
      priority: "Normal",
      notes: "",
    });
    setCreateError(null);
  }

  function handleCreateClick() {
    resetCreateForm();
    setIsCreateFormOpen(true);
  }

  function handleCreateCancel() {
    setIsCreateFormOpen(false);
    resetCreateForm();
  }

  function handleCreateSave() {
    const customer = createForm.customer.trim();
    const notes = createForm.notes.trim();

    if (!customer) {
      setCreateError("Customer is required.");
      return;
    }

    const nextOrderNumber = `ORD-${String(1000 + orders.length + 1)}`;
    const now = new Date().toISOString();
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: nextOrderNumber,
      customer,
      company: customer,
      phone: "",
      email: "",
      shop: createForm.salesChannel,
      status: "new",
      carrier: createForm.carrier,
      createdAt: now,
      updatedAt: now,
      items: 0,
      total: "$0.00",
      address: "",
      shippingAddress: "",
      billingAddress: "",
      priority: createForm.priority,
      notes,
      warehouseSlot: "TBD",
      promiseDate: now.split("T")[0],
      salesChannel: createForm.salesChannel,
      paymentStatus: "Pending",
      products: [],
    };

    setOrders((current) => [newOrder, ...current]);
    setPage(1);
    setIsCreateFormOpen(false);
    resetCreateForm();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">{dictionary.orders.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">{dictionary.orders.title}</h2>
          <p className="mt-2 text-sm text-slate-400">{dictionary.orders.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} labels={dictionary.navigation.languageSwitcher} />
          <button
            onClick={handleCreateClick}
            className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
          >
            {dictionary.orders.cta}
          </button>
        </div>
      </div>

      {isCreateFormOpen ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/40">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{dictionary.orders.table.customer}</span>
              <input
                value={createForm.customer}
                onChange={(event) => setCreateForm((state) => ({ ...state, customer: event.target.value }))}
                placeholder={dictionary.orders.table.customer}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none"
              />
            </label>

            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{dictionary.orders.detail.salesChannel}</span>
              <select
                value={createForm.salesChannel}
                onChange={(event) => setCreateForm((state) => ({ ...state, salesChannel: event.target.value as Order["salesChannel"] }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100"
              >
                <option value="Shopify">Shopify</option>
                <option value="Shoptet">Shoptet</option>
              </select>
            </label>

            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{dictionary.orders.table.carrier}</span>
              <select
                value={createForm.carrier}
                onChange={(event) => setCreateForm((state) => ({ ...state, carrier: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100"
              >
                <option value="PPL">PPL</option>
                <option value="DPD">DPD</option>
                <option value="Zasilkovna">Zasilkovna</option>
                <option value="Balikovna">Balikovna</option>
              </select>
            </label>

            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{dictionary.orders.detail.priority}</span>
              <select
                value={createForm.priority}
                onChange={(event) => setCreateForm((state) => ({ ...state, priority: event.target.value as Order["priority"] }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100"
              >
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </label>

            <label className="block text-sm text-slate-300 md:col-span-2">
              <span className="mb-2 block">{dictionary.orders.detail.notesLabel}</span>
              <textarea
                value={createForm.notes}
                onChange={(event) => setCreateForm((state) => ({ ...state, notes: event.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none"
              />
            </label>
          </div>

          {createError ? <p className="mt-3 text-sm text-rose-300">{createError}</p> : null}

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleCreateSave}
              className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
            >
              Save
            </button>
            <button
              onClick={handleCreateCancel}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/40">
        {loadError ? <p className="mb-3 text-sm text-amber-300">{loadError}</p> : null}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <label className="text-sm text-slate-400">{dictionary.orders.searchLabel}</label>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPagination();
              }}
              placeholder={dictionary.orders.searchPlaceholder}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-0"
            />
          </div>
          <div className="min-w-[220px]">
            <label className="text-sm text-slate-400">{dictionary.orders.statusLabel}</label>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                resetPagination();
              }}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100"
            >
              <option value="all">{dictionary.orders.statuses.all}</option>
              {statusOrder.map((status) => (
                <option key={status} value={status}>
                  {dictionary.orders.statuses[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-slate-400">
              <tr>
                <th className="px-4 py-3">{dictionary.orders.table.order}</th>
                <th className="px-4 py-3">{dictionary.orders.table.customer}</th>
                <th className="px-4 py-3">{dictionary.orders.table.status}</th>
                <th className="px-4 py-3">{dictionary.orders.table.carrier}</th>
                <th className="px-4 py-3">{dictionary.orders.table.items}</th>
                <th className="px-4 py-3">{dictionary.orders.table.total}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="border-t border-slate-800 bg-slate-900/60">
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : pagedOrders.map((order) => (
                <tr key={order.id} className="border-t border-slate-800 bg-slate-900/60">
                  <td className="px-4 py-3 font-semibold text-slate-100">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">{order.customer}</div>
                    <div className="text-xs text-slate-500">{order.shop}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
                      {dictionary.orders.statuses[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{order.carrier}</td>
                  <td className="px-4 py-3 text-slate-300">{order.items}</td>
                  <td className="px-4 py-3 text-slate-300">{order.total}</td>
                  <td className="px-4 py-3">
                    <Link href={`/${locale}/orders/${order.id}`} className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
                      {dictionary.orders.table.view}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            {dictionary.orders.pagination.showing} {Math.min((page - 1) * PAGE_SIZE + 1, filteredOrders.length)}-{Math.min(page * PAGE_SIZE, filteredOrders.length)} {dictionary.orders.pagination.of} {filteredOrders.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:opacity-50"
              disabled={page === 1}
            >
              {dictionary.orders.pagination.previous}
            </button>
            <span className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300">
              {page}/{totalPages}
            </span>
            <button
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:opacity-50"
              disabled={page === totalPages}
            >
              {dictionary.orders.pagination.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
