"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type InventoryRecord = {
  id: string;
  sku: string;
  productName: string;
  location: string;
  quantity: number;
  minimumStock: number;
};

type StockMovement = {
  id: string;
  sku: string;
  productName: string;
  movementType: "Stock In" | "Stock Out";
  quantity: number;
  reason: string;
  createdAt: string;
};

type StockFormState = {
  sku: string;
  quantity: string;
  reason: string;
};

const initialInventory: InventoryRecord[] = [
  { id: "inv-001", sku: "SKU-1001", productName: "Eco Tote Bag", location: "A-12-03", quantity: 48, minimumStock: 20 },
  { id: "inv-002", sku: "SKU-1002", productName: "Ceramic Mug", location: "B-04-01", quantity: 12, minimumStock: 15 },
  { id: "inv-003", sku: "SKU-1003", productName: "Wireless Charger", location: "C-07-02", quantity: 4, minimumStock: 10 },
  { id: "inv-004", sku: "SKU-1004", productName: "Notebook Set", location: "A-09-08", quantity: 0, minimumStock: 30 },
  { id: "inv-005", sku: "SKU-1005", productName: "Shipping Labels", location: "D-02-04", quantity: 120, minimumStock: 40 },
];

const initialMovements: StockMovement[] = [
  {
    id: "mov-9001",
    sku: "SKU-1001",
    productName: "Eco Tote Bag",
    movementType: "Stock In",
    quantity: 30,
    reason: "Purchase Order",
    createdAt: "2026-06-28T09:15:00.000Z",
  },
  {
    id: "mov-9002",
    sku: "SKU-1002",
    productName: "Ceramic Mug",
    movementType: "Stock Out",
    quantity: 5,
    reason: "Customer Order",
    createdAt: "2026-06-28T13:45:00.000Z",
  },
  {
    id: "mov-9003",
    sku: "SKU-1003",
    productName: "Wireless Charger",
    movementType: "Stock Out",
    quantity: 2,
    reason: "Damaged",
    createdAt: "2026-06-29T08:10:00.000Z",
  },
];

const stockInReasons = ["Purchase Order", "Return", "Adjustment"];
const stockOutReasons = ["Customer Order", "Damaged", "Internal Use", "Adjustment"];

function normalizeSku(rawSku: string) {
  return rawSku.trim().toUpperCase();
}

function getStockStatus(item: InventoryRecord): "In Stock" | "Low Stock" | "Out of Stock" {
  if (item.quantity <= 0) {
    return "Out of Stock";
  }
  if (item.quantity <= item.minimumStock) {
    return "Low Stock";
  }
  return "In Stock";
}

function statusClasses(status: "In Stock" | "Low Stock" | "Out of Stock") {
  if (status === "Out of Stock") {
    return "border border-rose-500/40 bg-rose-500/10 text-rose-300";
  }
  if (status === "Low Stock") {
    return "border border-amber-500/40 bg-amber-500/10 text-amber-300";
  }
  return "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
}

export function InventoryModule() {
  const [inventoryItems, setInventoryItems] = useState<InventoryRecord[]>(initialInventory);
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockInForm, setStockInForm] = useState<StockFormState>({ sku: "", quantity: "", reason: stockInReasons[0] });
  const [stockOutForm, setStockOutForm] = useState<StockFormState>({ sku: "", quantity: "", reason: stockOutReasons[0] });
  const [stockInError, setStockInError] = useState<string | null>(null);
  const [stockOutError, setStockOutError] = useState<string | null>(null);

  const filteredInventory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return inventoryItems;
    }

    return inventoryItems.filter((item) => {
      return item.sku.toLowerCase().includes(query) || item.productName.toLowerCase().includes(query);
    });
  }, [inventoryItems, searchQuery]);

  const overview = useMemo(() => {
    const outOfStockCount = inventoryItems.filter((item) => item.quantity <= 0).length;
    const lowStockCount = inventoryItems.filter((item) => item.quantity > 0 && item.quantity <= item.minimumStock).length;
    const totalUnits = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      skuCount: inventoryItems.length,
      totalUnits,
      lowStockCount,
      outOfStockCount,
    };
  }, [inventoryItems]);

  function addMovementRecord(nextMovement: Omit<StockMovement, "id" | "createdAt">) {
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...nextMovement,
    };

    setMovements((current) => [movement, ...current]);
  }

  function handleStockInSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStockInError(null);

    const normalizedSku = normalizeSku(stockInForm.sku);
    const quantity = Number(stockInForm.quantity);
    if (!normalizedSku) {
      setStockInError("SKU is required.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setStockInError("Quantity must be a positive whole number.");
      return;
    }
    if (!stockInForm.reason) {
      setStockInError("Reason is required.");
      return;
    }

    const inventoryItem = inventoryItems.find((item) => item.sku === normalizedSku);
    if (!inventoryItem) {
      setStockInError("SKU was not found in inventory.");
      return;
    }

    setInventoryItems((current) => {
      return current.map((item) => {
        if (item.sku !== normalizedSku) {
          return item;
        }
        return { ...item, quantity: item.quantity + quantity };
      });
    });

    addMovementRecord({
      sku: inventoryItem.sku,
      productName: inventoryItem.productName,
      movementType: "Stock In",
      quantity,
      reason: stockInForm.reason,
    });

    setStockInForm({ sku: normalizedSku, quantity: "", reason: stockInReasons[0] });
  }

  function handleStockOutSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStockOutError(null);

    const normalizedSku = normalizeSku(stockOutForm.sku);
    const quantity = Number(stockOutForm.quantity);
    if (!normalizedSku) {
      setStockOutError("SKU is required.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setStockOutError("Quantity must be a positive whole number.");
      return;
    }
    if (!stockOutForm.reason) {
      setStockOutError("Reason is required.");
      return;
    }

    const inventoryItem = inventoryItems.find((item) => item.sku === normalizedSku);
    if (!inventoryItem) {
      setStockOutError("SKU was not found in inventory.");
      return;
    }
    if (quantity > inventoryItem.quantity) {
      setStockOutError("Stock out quantity cannot exceed current quantity.");
      return;
    }

    setInventoryItems((current) => {
      return current.map((item) => {
        if (item.sku !== normalizedSku) {
          return item;
        }
        return { ...item, quantity: item.quantity - quantity };
      });
    });

    addMovementRecord({
      sku: inventoryItem.sku,
      productName: inventoryItem.productName,
      movementType: "Stock Out",
      quantity,
      reason: stockOutForm.reason,
    });

    setStockOutForm({ sku: normalizedSku, quantity: "", reason: stockOutReasons[0] });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">Inventory module</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Warehouse inventory workspace</h1>
          <p className="mt-2 text-sm text-slate-400">Manage stock levels, execute stock movements, and track recent inventory activity.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card title="Total SKUs">
            <p className="text-3xl font-semibold text-white">{overview.skuCount}</p>
          </Card>
          <Card title="Total Units">
            <p className="text-3xl font-semibold text-white">{overview.totalUnits}</p>
          </Card>
          <Card title="Low Stock">
            <p className="text-3xl font-semibold text-amber-300">{overview.lowStockCount}</p>
          </Card>
          <Card title="Out of Stock">
            <p className="text-3xl font-semibold text-rose-300">{overview.outOfStockCount}</p>
          </Card>
        </div>

        <Card title="Inventory table" subtitle="Search by SKU or product name and monitor current stock health.">
          <label className="mb-4 block text-sm text-slate-300">
            <span className="mb-2 block">Search SKU or Product</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Type SKU or product name"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </label>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Minimum</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/70">
                      <td className="px-4 py-4 font-semibold text-white">{item.sku}</td>
                      <td className="px-4 py-4">{item.productName}</td>
                      <td className="px-4 py-4">{item.location}</td>
                      <td className="px-4 py-4">{item.quantity}</td>
                      <td className="px-4 py-4">{item.minimumStock}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(status)}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="Stock In" subtitle="Increase quantity for an existing SKU.">
            <form className="space-y-4" onSubmit={handleStockInSubmit}>
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block">SKU</span>
                <input
                  value={stockInForm.sku}
                  onChange={(event) => setStockInForm((state) => ({ ...state, sku: event.target.value }))}
                  placeholder="e.g. SKU-1001"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block">Quantity</span>
                <input
                  value={stockInForm.quantity}
                  onChange={(event) => setStockInForm((state) => ({ ...state, quantity: event.target.value }))}
                  type="number"
                  min={1}
                  step={1}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block">Reason</span>
                <select
                  value={stockInForm.reason}
                  onChange={(event) => setStockInForm((state) => ({ ...state, reason: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  {stockInReasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </label>
              {stockInError ? <p className="text-sm text-rose-300">{stockInError}</p> : null}
              <Button type="submit">Submit Stock In</Button>
            </form>
          </Card>

          <Card title="Stock Out" subtitle="Decrease quantity for an existing SKU.">
            <form className="space-y-4" onSubmit={handleStockOutSubmit}>
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block">SKU</span>
                <input
                  value={stockOutForm.sku}
                  onChange={(event) => setStockOutForm((state) => ({ ...state, sku: event.target.value }))}
                  placeholder="e.g. SKU-1001"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block">Quantity</span>
                <input
                  value={stockOutForm.quantity}
                  onChange={(event) => setStockOutForm((state) => ({ ...state, quantity: event.target.value }))}
                  type="number"
                  min={1}
                  step={1}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block">Reason</span>
                <select
                  value={stockOutForm.reason}
                  onChange={(event) => setStockOutForm((state) => ({ ...state, reason: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  {stockOutReasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </label>
              {stockOutError ? <p className="text-sm text-rose-300">{stockOutError}</p> : null}
              <Button type="submit">Submit Stock Out</Button>
            </form>
          </Card>
        </div>

        <Card title="Recent stock movements" subtitle="Latest inventory adjustments recorded in this session.">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {movements.slice(0, 12).map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-900/70">
                    <td className="px-4 py-4 text-slate-400">{new Date(movement.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-4 font-semibold text-white">{movement.sku}</td>
                    <td className="px-4 py-4">{movement.productName}</td>
                    <td className="px-4 py-4">{movement.movementType}</td>
                    <td className="px-4 py-4">{movement.quantity}</td>
                    <td className="px-4 py-4">{movement.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
