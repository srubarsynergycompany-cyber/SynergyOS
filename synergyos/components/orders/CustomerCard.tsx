import type { Order } from "@/lib/orders/mockData";

type CustomerCardProps = {
  title: string;
  customer: Order;
  labels: {
    name: string;
    contact: string;
    billing: string;
    shipping: string;
  };
};

export function CustomerCard({ title, customer, labels }: CustomerCardProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">{labels.name}</p>
          <p className="mt-2 font-semibold text-slate-100">{customer.customer}</p>
          <p className="mt-1 text-sm text-slate-400">{customer.company}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">{labels.contact}</p>
          <p className="mt-2 text-sm text-slate-200">{customer.phone}</p>
          <p className="mt-1 text-sm text-slate-200">{customer.email}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">{labels.billing}</p>
          <p className="mt-2 text-sm text-slate-200">{customer.billingAddress}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">{labels.shipping}</p>
          <p className="mt-2 text-sm text-slate-200">{customer.shippingAddress}</p>
        </div>
      </div>
    </section>
  );
}
