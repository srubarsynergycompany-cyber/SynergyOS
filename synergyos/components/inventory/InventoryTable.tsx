import Link from "next/link";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import type { InventoryItem } from "@/lib/inventory/mockData";

type InventoryTableProps = {
  items: InventoryItem[];
};

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-slate-950/40">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
          <thead className="bg-slate-950/70 text-xs uppercase tracking-[0.24em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Current</th>
              <th className="px-4 py-3">Reserved</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Minimum</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {items.map((item) => (
              <tr key={item.sku} className="transition hover:bg-slate-800/70">
                <td className="px-4 py-4">
                  <Link href={`/inventory/${item.sku}`} className="block">
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="mt-1 text-xs text-slate-400">{item.sku} · {item.barcode}</div>
                  </Link>
                </td>
                <td className="px-4 py-4">{item.warehouseLocation}</td>
                <td className="px-4 py-4">{item.currentStock}</td>
                <td className="px-4 py-4">{item.reservedStock}</td>
                <td className="px-4 py-4">{item.availableStock}</td>
                <td className="px-4 py-4">{item.minimumStock}</td>
                <td className="px-4 py-4">
                  <InventoryStatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
