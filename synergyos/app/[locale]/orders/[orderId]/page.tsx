import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, locales } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/types";
import { mockOrders } from "@/lib/orders/mockData";

type PageProps = {
  params: Promise<{ locale: string; orderId: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) => mockOrders.map((order) => ({ locale, orderId: order.id })));
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { locale, orderId } = await params;
  const safeLocale = locale as Locale;

  if (!locales.includes(safeLocale)) {
    notFound();
  }

  const order = mockOrders.find((item) => item.id === orderId);
  if (!order) {
    notFound();
  }

  const dictionary = getDictionary(safeLocale);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">{dictionary.orders.detail.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-slate-400">{dictionary.orders.detail.subtitle}</p>
          </div>
          <Link href={`/${safeLocale}`} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
            {dictionary.orders.detail.back}
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">{dictionary.orders.detail.summary}</h2>
                <p className="mt-1 text-sm text-slate-400">{order.customer} · {order.shop}</p>
              </div>
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300">
                {dictionary.orders.statuses[order.status]}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-sm text-slate-400">{dictionary.orders.detail.customer}</p>
                <p className="mt-2 font-semibold text-slate-100">{order.customer}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-sm text-slate-400">{dictionary.orders.detail.address}</p>
                <p className="mt-2 font-semibold text-slate-100">{order.address}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-sm text-slate-400">{dictionary.orders.detail.carrier}</p>
                <p className="mt-2 font-semibold text-slate-100">{order.carrier}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-sm text-slate-400">{dictionary.orders.detail.promiseDate}</p>
                <p className="mt-2 font-semibold text-slate-100">{order.promiseDate}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">{dictionary.orders.detail.notes}</p>
              <p className="mt-2 text-sm text-slate-200">{order.notes}</p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h2 className="text-xl font-semibold text-white">{dictionary.orders.detail.timeline.title}</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm font-medium text-slate-100">{dictionary.orders.detail.timeline.created}</p>
                  <p className="mt-1 text-sm text-slate-400">{new Date(order.createdAt).toLocaleString(safeLocale === "en" ? "en-US" : "cs-CZ")}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm font-medium text-slate-100">{dictionary.orders.detail.timeline.updated}</p>
                  <p className="mt-1 text-sm text-slate-400">{new Date(order.updatedAt).toLocaleString(safeLocale === "en" ? "en-US" : "cs-CZ")}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h2 className="text-xl font-semibold text-white">{dictionary.orders.detail.fulfillment.title}</h2>
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span>{dictionary.orders.detail.fulfillment.items}</span>
                  <span className="font-semibold text-slate-100">{order.items}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span>{dictionary.orders.detail.fulfillment.total}</span>
                  <span className="font-semibold text-slate-100">{order.total}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span>{dictionary.orders.detail.fulfillment.slot}</span>
                  <span className="font-semibold text-slate-100">{order.warehouseSlot}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span>{dictionary.orders.detail.fulfillment.tracking}</span>
                  <span className="font-semibold text-slate-100">{order.trackingNumber ?? "—"}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
