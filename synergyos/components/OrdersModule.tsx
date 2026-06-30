"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

export default function OrdersModule({ dictionary, locale }: OrdersModuleProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    const term = search.toLowerCase();

    return mockOrders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(term) ||
        order.customer.toLowerCase().includes(term) ||
        order.shop.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const pagedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  const resetPagination = () => setPage(1);

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
          <button className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">
            {dictionary.orders.cta}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/40">
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
              {pagedOrders.map((order) => (
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
