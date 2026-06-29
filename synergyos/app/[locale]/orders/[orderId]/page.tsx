import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, locales } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/types";
import { mockOrders } from "@/lib/orders/mockData";

type PageProps = {
  params: Promise<{ locale: string; orderId: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    mockOrders.flatMap((order) => [
      { locale, orderId: order.id },
      { locale, orderId: order.orderNumber },
    ])
  );
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { locale, orderId } = await params;
  const safeLocale = locale as Locale;

  if (!locales.includes(safeLocale)) {
    notFound();
  }

  const normalizedOrderId = orderId.toLowerCase();
  const order = mockOrders.find(
    (item) => item.id.toLowerCase() === normalizedOrderId || item.orderNumber.toLowerCase() === normalizedOrderId
  );

  if (!order) {
    notFound();
  }

  const dictionary = getDictionary(safeLocale);
  const timelineSteps = [
    { label: dictionary.orders.detail.timeline.created, done: true },
    { label: dictionary.orders.detail.timeline.payment, done: true },
    { label: dictionary.orders.detail.timeline.picking, done: order.status === "picking" || order.status === "packed" || order.status === "shipped" || order.status === "delivered" },
    { label: dictionary.orders.detail.timeline.packed, done: order.status === "packed" || order.status === "shipped" || order.status === "delivered" },
    { label: dictionary.orders.detail.timeline.shipped, done: order.status === "shipped" || order.status === "delivered" },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">{dictionary.orders.detail.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-slate-400">{dictionary.orders.detail.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/${safeLocale}/orders`} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
              {dictionary.orders.detail.back}
            </Link>
            <button className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">
              {dictionary.orders.detail.printLabel}
            </button>
            <button className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800">
              {dictionary.orders.detail.printInvoice}
            </button>
          </div>
        </div>

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
                <span>{dictionary.orders.detail.created} {new Date(order.createdAt).toLocaleDateString(safeLocale === "en" ? "en-US" : "cs-CZ")}</span>
                <span>{dictionary.orders.detail.salesChannel} {order.salesChannel}</span>
                <span>{dictionary.orders.detail.carrier} {order.carrier}</span>
                <span>{dictionary.orders.detail.paymentStatus} {order.paymentStatus}</span>
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
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">{dictionary.orders.detail.customerCard.title}</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">{dictionary.orders.detail.customerCard.name}</p>
                  <p className="mt-2 font-semibold text-slate-100">{order.customer}</p>
                  <p className="mt-1 text-sm text-slate-400">{order.company}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">{dictionary.orders.detail.customerCard.contact}</p>
                  <p className="mt-2 text-sm text-slate-200">{order.phone}</p>
                  <p className="mt-1 text-sm text-slate-200">{order.email}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">{dictionary.orders.detail.customerCard.billing}</p>
                  <p className="mt-2 text-sm text-slate-200">{order.billingAddress}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">{dictionary.orders.detail.customerCard.shipping}</p>
                  <p className="mt-2 text-sm text-slate-200">{order.shippingAddress}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">{dictionary.orders.detail.products.title}</h3>
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-950/80 text-slate-400">
                    <tr>
                      <th className="px-4 py-3">{dictionary.orders.detail.products.image}</th>
                      <th className="px-4 py-3">{dictionary.orders.detail.products.sku}</th>
                      <th className="px-4 py-3">{dictionary.orders.detail.products.name}</th>
                      <th className="px-4 py-3">{dictionary.orders.detail.products.quantity}</th>
                      <th className="px-4 py-3">{dictionary.orders.detail.products.location}</th>
                      <th className="px-4 py-3">{dictionary.orders.detail.products.availability}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.products.map((product) => (
                      <tr key={product.sku} className="border-t border-slate-800 bg-slate-900/60">
                        <td className="px-4 py-3 text-xl">{product.image}</td>
                        <td className="px-4 py-3 font-medium text-slate-100">{product.sku}</td>
                        <td className="px-4 py-3 text-slate-200">{product.name}</td>
                        <td className="px-4 py-3 text-slate-300">{product.quantity}</td>
                        <td className="px-4 py-3 text-slate-300">{product.location}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.inStock ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>
                            {product.inStock ? dictionary.orders.detail.products.inStock : dictionary.orders.detail.products.outOfStock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">{dictionary.orders.detail.notes.title}</h3>
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                {order.notes}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">{dictionary.orders.detail.timeline.title}</h3>
              <div className="mt-5 space-y-3">
                {timelineSteps.map((step, index) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full ${step.done ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-500"}`}>
                      {step.done ? "✓" : index + 1}
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 flex-1">
                      <p className="text-sm font-medium text-slate-100">{step.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{step.done ? dictionary.orders.detail.timeline.done : dictionary.orders.detail.timeline.pending}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">{dictionary.orders.detail.warehouse.title}</h3>
              <div className="mt-5 grid gap-3">
                <button className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-left text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">
                  {dictionary.orders.detail.warehouse.startPicking}
                </button>
                <button className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-800">
                  {dictionary.orders.detail.warehouse.markPacked}
                </button>
                <button className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-800">
                  {dictionary.orders.detail.warehouse.markShipped}
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
