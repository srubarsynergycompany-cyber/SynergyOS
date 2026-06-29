import type { Order } from "@/lib/orders/mockData";

type ProductsTableProps = {
  title: string;
  products: Order["products"];
  shop: string;
  labels: {
    image: string;
    sku: string;
    name: string;
    quantity: string;
    location: string;
    availability: string;
    inStock: string;
    outOfStock: string;
  };
};

export function ProductsTable({ title, products, shop, labels }: ProductsTableProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-950/80 text-slate-400">
            <tr>
              <th className="px-4 py-3">{labels.image}</th>
              <th className="px-4 py-3">{labels.sku}</th>
              <th className="px-4 py-3">{labels.name}</th>
              <th className="px-4 py-3">{labels.quantity}</th>
              <th className="px-4 py-3">{labels.location}</th>
              <th className="px-4 py-3">{labels.availability}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.sku} className="border-t border-slate-800 bg-slate-900/60">
                <td className="px-4 py-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-xl">
                    {product.image}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-slate-100">{product.sku}</td>
                <td className="px-4 py-3 text-slate-200">
                  <div className="font-medium text-white">{product.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{shop}</div>
                </td>
                <td className="px-4 py-3 text-slate-300">{product.quantity}</td>
                <td className="px-4 py-3 text-slate-300">{product.location}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.inStock ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>
                    {product.inStock ? labels.inStock : labels.outOfStock}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
