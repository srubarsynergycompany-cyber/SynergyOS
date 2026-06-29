"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Dictionary, Locale } from "@/lib/i18n/types";
import type { Product } from "@/types";

type CustomerOption = {
  id: string;
  name: string;
};

type ProductsModuleProps = {
  dictionary: Dictionary;
  locale: Locale;
  customers: CustomerOption[];
};

type ProductInputForm = {
  sku: string;
  eanBarcode: string;
  name: string;
  description: string;
  customerId: string;
  category: string;
  weight: string;
  width: string;
  height: string;
  length: string;
  minimumStock: string;
  currentStock: string;
  unit: string;
  active: boolean;
};

const PAGE_SIZE = 8;

const emptyForm: ProductInputForm = {
  sku: "",
  eanBarcode: "",
  name: "",
  description: "",
  customerId: "",
  category: "",
  weight: "0",
  width: "0",
  height: "0",
  length: "0",
  minimumStock: "0",
  currentStock: "0",
  unit: "pcs",
  active: true,
};

export default function ProductsModule({ dictionary, locale, customers }: ProductsModuleProps) {
  const copy = dictionary.modules.productsModule;
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formValues, setFormValues] = useState<ProductInputForm>(emptyForm);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedProduct = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function loadProducts(nextPage = page) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(PAGE_SIZE),
      });
      if (search.trim()) {
        params.set("search", search.trim());
      }
      if (category !== "all") {
        params.set("category", category);
      }
      if (activeFilter !== "all") {
        params.set("active", activeFilter);
      }

      const response = await fetch(`/api/products?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load products.");
      }

      const data = (await response.json()) as {
        items: Product[];
        total: number;
        page: number;
        pageSize: number;
        categories: string[];
      };

      setItems(data.items);
      setTotal(data.total);
      setCategories(data.categories ?? []);
      setPage(data.page);
      if (data.items.length > 0 && !selectedId) {
        setSelectedId(data.items[0].id);
      }
      if (data.items.length === 0) {
        setSelectedId(null);
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load products.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, activeFilter]);

  function toFormValues(product: Product): ProductInputForm {
    return {
      sku: product.sku,
      eanBarcode: product.eanBarcode,
      name: product.name,
      description: product.description,
      customerId: product.customerId,
      category: product.category,
      weight: String(product.weight),
      width: String(product.width),
      height: String(product.height),
      length: String(product.length),
      minimumStock: String(product.minimumStock),
      currentStock: String(product.currentStock),
      unit: product.unit,
      active: product.active,
    };
  }

  function validateForm(values: ProductInputForm): string | null {
    if (!values.sku.trim()) return copy.validation.skuRequired;
    if (!values.eanBarcode.trim()) return copy.validation.eanRequired;
    if (!values.name.trim()) return copy.validation.nameRequired;
    if (!values.description.trim()) return copy.validation.descriptionRequired;
    if (!values.customerId.trim()) return copy.validation.customerRequired;
    if (!values.category.trim()) return copy.validation.categoryRequired;
    if (!values.unit.trim()) return copy.validation.unitRequired;
    return null;
  }

  function toPayload(values: ProductInputForm) {
    return {
      sku: values.sku.trim(),
      eanBarcode: values.eanBarcode.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
      customerId: values.customerId.trim(),
      category: values.category.trim(),
      weight: Number(values.weight || 0),
      width: Number(values.width || 0),
      height: Number(values.height || 0),
      length: Number(values.length || 0),
      minimumStock: Number(values.minimumStock || 0),
      currentStock: Number(values.currentStock || 0),
      unit: values.unit.trim(),
      active: values.active,
    };
  }

  async function onSubmitForm() {
    const validationError = validateForm(formValues);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitError(null);
    const payload = toPayload(formValues);
    const url = formMode === "edit" && selectedProduct ? `/api/products/${selectedProduct.id}` : "/api/products";
    const method = formMode === "edit" ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => ({ message: "Failed to save product." }))) as { message?: string };
      setSubmitError(errorBody.message ?? "Failed to save product.");
      return;
    }

    setFormMode(null);
    setFormValues(emptyForm);
    await loadProducts(page);
  }

  async function onDelete(productId: string) {
    const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    if (!response.ok) {
      setSubmitError("Failed to delete product.");
      return;
    }

    if (selectedId === productId) {
      setSelectedId(null);
    }

    await loadProducts(page);
  }

  return (
    <div className="space-y-6">
      <Card title={copy.title} subtitle={copy.subtitle}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">{copy.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{copy.title}</h2>
          </div>
          <Button
            onClick={() => {
              setFormMode("create");
              setSubmitError(null);
              setFormValues({ ...emptyForm, customerId: customers[0]?.id ?? "" });
            }}
          >
            {copy.createButton}
          </Button>
        </div>

        <div className="mt-6 grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-4 lg:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">{copy.searchLabel}</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">{copy.categoryFilter}</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            >
              <option value="all">{copy.categoryAll}</option>
              {categories.map((itemCategory) => (
                <option key={itemCategory} value={itemCategory}>
                  {itemCategory}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">{copy.activeFilter}</span>
            <select
              value={activeFilter}
              onChange={(event) => setActiveFilter(event.target.value as "all" | "true" | "false")}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            >
              <option value="all">{copy.activeAll}</option>
              <option value="true">{copy.activeOnly}</option>
              <option value="false">{copy.inactiveOnly}</option>
            </select>
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        {items.length === 0 && !loading ? (
          <div className="mt-6">
            <EmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
                <thead className="bg-slate-950/70 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">{copy.table.sku}</th>
                    <th className="px-4 py-3">{copy.table.ean}</th>
                    <th className="px-4 py-3">{copy.table.name}</th>
                    <th className="px-4 py-3">{copy.table.customer}</th>
                    <th className="px-4 py-3">{copy.table.category}</th>
                    <th className="px-4 py-3">{copy.table.stock}</th>
                    <th className="px-4 py-3">{copy.table.active}</th>
                    <th className="px-4 py-3">{copy.table.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.map((product) => (
                    <tr key={product.id} className="transition hover:bg-slate-900/70">
                      <td className="px-4 py-4 font-semibold text-white">{product.sku}</td>
                      <td className="px-4 py-4">{product.eanBarcode}</td>
                      <td className="px-4 py-4">{product.name}</td>
                      <td className="px-4 py-4">{product.customerName}</td>
                      <td className="px-4 py-4">{product.category}</td>
                      <td className="px-4 py-4">{product.currentStock} {product.unit}</td>
                      <td className="px-4 py-4">{product.active ? copy.activeOnly : copy.inactiveOnly}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedId(product.id);
                            }}
                          >
                            {copy.table.detail}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedId(product.id);
                              setFormMode("edit");
                              setSubmitError(null);
                              setFormValues(toFormValues(product));
                            }}
                          >
                            {copy.table.edit}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              void onDelete(product.id);
                            }}
                          >
                            {copy.deleteButton}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            {copy.paginationShowing} {Math.min((page - 1) * PAGE_SIZE + 1, total)}-{Math.min(page * PAGE_SIZE, total)} {copy.paginationOf} {total}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const next = Math.max(1, page - 1);
                setPage(next);
                void loadProducts(next);
              }}
              disabled={page <= 1}
            >
              {copy.paginationPrev}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const next = Math.min(totalPages, page + 1);
                setPage(next);
                void loadProducts(next);
              }}
              disabled={page >= totalPages}
            >
              {copy.paginationNext}
            </Button>
          </div>
        </div>
      </Card>

      {selectedProduct ? (
        <Card title={copy.detailTitle} subtitle={selectedProduct.name}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{copy.detail.dimensions}</p>
              <p className="mt-2 text-lg text-white">{selectedProduct.length} x {selectedProduct.width} x {selectedProduct.height}</p>
              <p className="text-sm text-slate-400">{copy.detail.volumeHint}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{copy.detail.stock}</p>
              <p className="mt-2 text-lg text-white">{selectedProduct.currentStock} {selectedProduct.unit}</p>
              <p className="text-sm text-slate-400">{copy.detail.minimumStock}: {selectedProduct.minimumStock}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{copy.detail.createdAt}</p>
              <p className="mt-2 text-sm text-white">{new Date(selectedProduct.createdAt).toLocaleString(locale)}</p>
              <p className="mt-2 text-xs text-slate-400">{copy.detail.updatedAt}: {new Date(selectedProduct.updatedAt).toLocaleString(locale)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{copy.detail.futureTitle}</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                <li>{copy.detail.warehousePositions}: {(selectedProduct.warehousePositions ?? []).length}</li>
                <li>{copy.detail.batches}: {(selectedProduct.batches ?? []).length}</li>
                <li>{copy.detail.expirationDates}: {(selectedProduct.expirationDates ?? []).length}</li>
                <li>{copy.detail.images}: {(selectedProduct.images ?? []).length}</li>
                <li>{copy.detail.attachments}: {(selectedProduct.attachments ?? []).length}</li>
              </ul>
            </div>
          </div>
        </Card>
      ) : null}

      {formMode ? (
        <Dialog title={formMode === "create" ? copy.form.createTitle : copy.form.editTitle}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.form.sku}</span>
              <input value={formValues.sku} onChange={(event) => setFormValues((state) => ({ ...state, sku: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.form.eanBarcode}</span>
              <input value={formValues.eanBarcode} onChange={(event) => setFormValues((state) => ({ ...state, eanBarcode: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            </label>
            <label className="block text-sm text-slate-300 md:col-span-2">
              <span className="mb-2 block">{copy.form.name}</span>
              <input value={formValues.name} onChange={(event) => setFormValues((state) => ({ ...state, name: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            </label>
            <label className="block text-sm text-slate-300 md:col-span-2">
              <span className="mb-2 block">{copy.form.description}</span>
              <textarea value={formValues.description} onChange={(event) => setFormValues((state) => ({ ...state, description: event.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.form.customer}</span>
              <select value={formValues.customerId} onChange={(event) => setFormValues((state) => ({ ...state, customerId: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400">
                <option value="">-</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.form.category}</span>
              <input value={formValues.category} onChange={(event) => setFormValues((state) => ({ ...state, category: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.form.weight}</span>
              <input type="number" step="0.001" value={formValues.weight} onChange={(event) => setFormValues((state) => ({ ...state, weight: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.form.width}</span>
              <input type="number" step="0.01" value={formValues.width} onChange={(event) => setFormValues((state) => ({ ...state, width: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.form.height}</span>
              <input type="number" step="0.01" value={formValues.height} onChange={(event) => setFormValues((state) => ({ ...state, height: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.form.length}</span>
              <input type="number" step="0.01" value={formValues.length} onChange={(event) => setFormValues((state) => ({ ...state, length: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.form.minimumStock}</span>
              <input type="number" value={formValues.minimumStock} onChange={(event) => setFormValues((state) => ({ ...state, minimumStock: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.form.currentStock}</span>
              <input type="number" value={formValues.currentStock} onChange={(event) => setFormValues((state) => ({ ...state, currentStock: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block">{copy.form.unit}</span>
              <input value={formValues.unit} onChange={(event) => setFormValues((state) => ({ ...state, unit: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400" />
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" checked={formValues.active} onChange={(event) => setFormValues((state) => ({ ...state, active: event.target.checked }))} />
              {copy.form.active}
            </label>
          </div>

          {submitError ? <p className="mt-4 text-sm text-rose-300">{submitError}</p> : null}

          <div className="mt-6 flex gap-3">
            <Button onClick={() => void onSubmitForm()}>{copy.form.save}</Button>
            <Button variant="ghost" onClick={() => setFormMode(null)}>{copy.form.cancel}</Button>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
