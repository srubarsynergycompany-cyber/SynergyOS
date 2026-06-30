"use client";

import { useState } from "react";
import type { Order } from "@/lib/orders/mockData";
import { canTransition, getNextStatus, transitionOrder } from "@/lib/orders/stateMachine";
import { CustomerCard } from "@/components/orders/CustomerCard";
import { NotesPanel } from "@/components/orders/NotesPanel";
import { OperationsPanel } from "@/components/orders/OperationsPanel";
import { OrderHeader } from "@/components/orders/OrderHeader";
import { ProductsTable } from "@/components/orders/ProductsTable";
import { Timeline } from "@/components/orders/Timeline";

type OrderDetailViewProps = {
  initialOrder: Order;
  locale: string;
  dictionary: any;
};

export function OrderDetailView({ initialOrder, locale, dictionary }: OrderDetailViewProps) {
  const [order, setOrder] = useState(initialOrder);

  const nextStatus = getNextStatus(order.status);
  const timelineSteps = [
    { label: dictionary.orders.detail.timeline.created, done: true },
    { label: dictionary.orders.detail.timeline.payment, done: true },
    { label: dictionary.orders.detail.timeline.picking, done: order.status === "picking" || order.status === "packed" || order.status === "shipped" || order.status === "delivered" },
    { label: dictionary.orders.detail.timeline.packed, done: order.status === "packed" || order.status === "shipped" || order.status === "delivered" },
    { label: dictionary.orders.detail.timeline.shipped, done: order.status === "shipped" || order.status === "delivered" },
  ];

  const getActionLabel = () => {
    if (nextStatus === "picking") return dictionary.orders.detail.operations.startPicking;
    if (nextStatus === "packed") return dictionary.orders.detail.operations.markPacked;
    if (nextStatus === "shipped") return dictionary.orders.detail.operations.markShipped;
    if (nextStatus === "delivered") return dictionary.orders.detail.operations.markDelivered;
    return dictionary.orders.detail.operations.completed;
  };

  const handleAdvance = () => {
    if (!nextStatus || !canTransition(order.status, nextStatus)) {
      return;
    }

    setOrder((current) => transitionOrder(current, nextStatus));
  };

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-white">{order.orderNumber}</h2>
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300">
                  {dictionary.orders.statuses[order.status]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>{dictionary.orders.detail.created} {new Date(order.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "cs-CZ")}</span>
                <span>{dictionary.orders.detail.salesChannel} {order.salesChannel}</span>
                <span>{dictionary.orders.detail.carrier} {order.carrier}</span>
                <span>{dictionary.orders.detail.paymentStatus} {order.paymentStatus}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-800 pt-3 text-sm text-slate-400">
                {order.pickerName ? <span>{dictionary.orders.detail.workflow.picker} {order.pickerName}</span> : null}
                {order.pickedAt ? <span>{dictionary.orders.detail.workflow.pickedAt} {new Date(order.pickedAt).toLocaleString(locale === "en" ? "en-US" : "cs-CZ")}</span> : null}
                {order.packedAt ? <span>{dictionary.orders.detail.workflow.packedAt} {new Date(order.packedAt).toLocaleString(locale === "en" ? "en-US" : "cs-CZ")}</span> : null}
                {order.shippedAt ? <span>{dictionary.orders.detail.workflow.shippedAt} {new Date(order.shippedAt).toLocaleString(locale === "en" ? "en-US" : "cs-CZ")}</span> : null}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
              <p className="text-slate-400">{dictionary.orders.detail.priority}</p>
              <p className="mt-1 font-semibold text-white">{order.priority}</p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <CustomerCard
              title={dictionary.orders.detail.customerCard.title}
              customer={order}
              labels={{
                name: dictionary.orders.detail.customerCard.name,
                contact: dictionary.orders.detail.customerCard.contact,
                billing: dictionary.orders.detail.customerCard.billing,
                shipping: dictionary.orders.detail.customerCard.shipping,
              }}
            />

            <ProductsTable
              title={dictionary.orders.detail.products.title}
              products={order.products}
              shop={order.shop}
              labels={{
                image: dictionary.orders.detail.products.image,
                sku: dictionary.orders.detail.products.sku,
                name: dictionary.orders.detail.products.name,
                quantity: dictionary.orders.detail.products.quantity,
                location: dictionary.orders.detail.products.location,
                availability: dictionary.orders.detail.products.availability,
                inStock: dictionary.orders.detail.products.inStock,
                outOfStock: dictionary.orders.detail.products.outOfStock,
              }}
            />

            <NotesPanel
              title={dictionary.orders.detail.notes.title}
              value={order.notes}
              placeholder={dictionary.orders.detail.notes.placeholder}
              saveLabel={dictionary.orders.detail.notes.save}
            />
          </div>

          <aside className="space-y-6">
            <Timeline
              title={dictionary.orders.detail.timeline.title}
              steps={timelineSteps}
              doneLabel={dictionary.orders.detail.timeline.done}
              pendingLabel={dictionary.orders.detail.timeline.pending}
            />

            <OperationsPanel
              title={dictionary.orders.detail.operations.title}
              actions={[
                {
                  key: nextStatus ?? "completed",
                  label: getActionLabel(),
                  primary: Boolean(nextStatus),
                  disabled: !nextStatus,
                  onClick: handleAdvance,
                },
              ]}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
