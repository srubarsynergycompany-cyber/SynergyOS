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

const stockInReasons = ["Nákupní objednávka", "Vratka", "Úprava"];
const stockOutReasons = ["Zákaznická objednávka", "Poškozené zboží", "Interní použití", "Úprava"];

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

function getStockStatusLabel(status: "In Stock" | "Low Stock" | "Out of Stock") {
  if (status === "Out of Stock") return "Vyprodáno";
  if (status === "Low Stock") return "Nízká zásoba";
  return "Skladem";
}

function getMovementTypeLabel(type: StockMovement["movementType"]) {
  return type === "Stock In" ? "Příjem" : "Výdej";
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
      setStockInError("SKU je povinné.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setStockInError("Množství musí být kladné celé číslo.");
      return;
    }
    if (!stockInForm.reason) {
      setStockInError("Důvod je povinný.");
      return;
    }

    const inventoryItem = inventoryItems.find((item) => item.sku === normalizedSku);
    if (!inventoryItem) {
      setStockInError("SKU nebylo ve skladu nalezeno.");
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
      setStockOutError("SKU je povinné.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setStockOutError("Množství musí být kladné celé číslo.");
      return;
    }
    if (!stockOutForm.reason) {
      setStockOutError("Důvod je povinný.");
      return;
    }

    const inventoryItem = inventoryItems.find((item) => item.sku === normalizedSku);
    if (!inventoryItem) {
      setStockOutError("SKU nebylo ve skladu nalezeno.");
      return;
    }
    if (quantity > inventoryItem.quantity) {
      setStockOutError("Vydané množství nesmí překročit aktuální zásobu.");
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
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">Skladový modul</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Pracoviště skladové evidence</h1>
          <p className="mt-2 text-sm text-slate-400">Spravujte zásoby, provádějte skladové pohyby a sledujte poslední aktivitu.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card title="Celkem SKU">
            <p className="text-3xl font-semibold text-white">{overview.skuCount}</p>
          </Card>
          <Card title="Celkem kusů">
            <p className="text-3xl font-semibold text-white">{overview.totalUnits}</p>
          </Card>
          <Card title="Nízká zásoba">
            <p className="text-3xl font-semibold text-amber-300">{overview.lowStockCount}</p>
          </Card>
          <Card title="Vyprodáno">
            <p className="text-3xl font-semibold text-rose-300">{overview.outOfStockCount}</p>
          </Card>
        </div>

        <Card title="Skladová tabulka" subtitle="Vyhledávejte podle SKU nebo názvu produktu a sledujte stav zásob.">
          <label className="mb-4 block text-sm text-slate-300">
            <span className="mb-2 block">Vyhledat SKU nebo produkt</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Zadejte SKU nebo název produktu"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </label>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Produkt</th>
                  <th className="px-4 py-3">Lokace</th>
                  <th className="px-4 py-3">Množství</th>
                  <th className="px-4 py-3">Minimum</th>
                  <th className="px-4 py-3">Stav</th>
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
                          {getStockStatusLabel(status)}
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
          <Card title="Příjem zásob" subtitle="Navýšit množství pro existující SKU.">
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
                <span className="mb-2 block">Množství</span>
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
                <span className="mb-2 block">Důvod</span>
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
              <Button type="submit">Potvrdit příjem</Button>
            </form>
          </Card>

          <Card title="Výdej zásob" subtitle="Snížit množství pro existující SKU.">
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
                <span className="mb-2 block">Množství</span>
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
                <span className="mb-2 block">Důvod</span>
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
              <Button type="submit">Potvrdit výdej</Button>
            </form>
          </Card>
        </div>

        <Card title="Poslední skladové pohyby" subtitle="Nejnovější úpravy zásob zaznamenané v této relaci.">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Čas</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Produkt</th>
                  <th className="px-4 py-3">Typ</th>
                  <th className="px-4 py-3">Množství</th>
                  <th className="px-4 py-3">Důvod</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {movements.slice(0, 12).map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-900/70">
                    <td className="px-4 py-4 text-slate-400">{new Date(movement.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-4 font-semibold text-white">{movement.sku}</td>
                    <td className="px-4 py-4">{movement.productName}</td>
                    <td className="px-4 py-4">{getMovementTypeLabel(movement.movementType)}</td>
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
