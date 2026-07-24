"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { WarehousePageHeader } from "@/components/warehouse/WarehousePageHeader";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { InventoryItem } from "@/types";
import { detectLocaleFromPath } from "@/utils/navigation";

type FormErrors = {
  product?: string;
  location?: string;
  quantity?: string;
  reference?: string;
};

type ReceivingResult = {
  sku: string;
  productName: string;
  location: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reference: string;
};

type AdjustmentResponse = {
  quantityBefore: number;
  quantityAfter: number;
  message?: string;
};

function createRequestId() {
  return crypto.randomUUID();
}

async function fetchInventory(
  loadFailedMessage: string,
  invalidInventoryMessage: string,
  signal?: AbortSignal,
): Promise<InventoryItem[]> {
  const response = await fetch("/api/inventory", { signal });
  const payload = (await response.json().catch(() => null)) as {
    items?: InventoryItem[];
    message?: string;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? loadFailedMessage);
  }
  if (!Array.isArray(payload?.items)) {
    throw new Error(invalidInventoryMessage);
  }

  return payload.items;
}

export function ReceivingView() {
  const pathname = usePathname();
  const locale = useMemo(() => detectLocaleFromPath(pathname), [pathname]);
  const dictionary = useMemo(() => getDictionary(locale ?? "cs"), [locale]);
  const copy = dictionary.modules.warehouse.receiving;
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSku, setSelectedSku] = useState("");
  const [inventoryId, setInventoryId] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [requestId, setRequestId] = useState(createRequestId);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receivingResult, setReceivingResult] = useState<ReceivingResult | null>(null);
  const submitLockRef = useRef(false);

  const loadInventory = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setLoadError(null);

    try {
      setItems(await fetchInventory(
        copy.errors.loadFailed,
        copy.errors.invalidInventory,
        signal,
      ));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setLoadError(error instanceof Error ? error.message : copy.errors.loadFailed);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [copy.errors.invalidInventory, copy.errors.loadFailed]);

  useEffect(() => {
    const controller = new AbortController();

    void fetchInventory(
      copy.errors.loadFailed,
      copy.errors.invalidInventory,
      controller.signal,
    )
      .then(setItems)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setLoadError(error instanceof Error ? error.message : copy.errors.loadFailed);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [copy.errors.invalidInventory, copy.errors.loadFailed]);

  const products = useMemo(() => {
    const uniqueProducts = new Map<string, { sku: string; name: string }>();
    for (const item of items) {
      if (!uniqueProducts.has(item.sku)) {
        uniqueProducts.set(item.sku, { sku: item.sku, name: item.productName });
      }
    }
    return Array.from(uniqueProducts.values()).sort((a, b) => a.sku.localeCompare(b.sku));
  }, [items]);

  const locations = useMemo(
    () => items.filter((item) => item.sku === selectedSku),
    [items, selectedSku],
  );
  const selectedInventory = useMemo(
    () => locations.find((item) => item.id === inventoryId) ?? null,
    [inventoryId, locations],
  );
  const parsedQuantity = Number(quantityInput);
  const hasPositiveIntegerQuantity =
    quantityInput.trim() !== "" && Number.isInteger(parsedQuantity) && parsedQuantity > 0;
  const resultingQuantity = selectedInventory && hasPositiveIntegerQuantity
    ? selectedInventory.quantity + parsedQuantity
    : null;

  function resetRequestForChangedInput() {
    setRequestId(createRequestId());
    setSubmitError(null);
    setReceivingResult(null);
  }

  function handleProductChange(nextSku: string) {
    const firstLocation = items.find((item) => item.sku === nextSku);
    setSelectedSku(nextSku);
    setInventoryId(firstLocation?.id ?? "");
    setFormErrors((current) => ({
      ...current,
      product: undefined,
      location: undefined,
    }));
    resetRequestForChangedInput();
  }

  function resetFormForNextReceipt() {
    setSelectedSku("");
    setInventoryId("");
    setQuantityInput("");
    setReference("");
    setNote("");
    setFormErrors({});
    setSubmitError(null);
    setRequestId(createRequestId());
  }

  function validate(): FormErrors {
    const errors: FormErrors = {};
    if (!selectedSku) {
      errors.product = copy.errors.productRequired;
    }
    if (!selectedInventory) {
      errors.location = copy.errors.locationRequired;
    }
    if (!hasPositiveIntegerQuantity) {
      errors.quantity = copy.errors.quantityPositiveInteger;
    }
    if (!reference.trim()) {
      errors.reference = copy.errors.referenceRequired;
    }
    return errors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || submitLockRef.current) {
      return;
    }

    const errors = validate();
    setFormErrors(errors);
    setSubmitError(null);
    if (Object.keys(errors).length > 0 || !selectedInventory) {
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    const normalizedReference = reference.trim();
    const normalizedNote = note.trim();
    const reason = normalizedNote
      ? `${copy.reasonPrefix} ${normalizedReference} — ${normalizedNote}`
      : `${copy.reasonPrefix} ${normalizedReference}`;

    try {
      const response = await fetch("/api/inventory/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: selectedInventory.id,
          delta: parsedQuantity,
          reason,
          requestId,
          actorLabel: "SynergyOS receiving",
        }),
      });
      const payload = (await response.json().catch(() => null)) as AdjustmentResponse | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? copy.errors.submitFailed);
      }
      if (
        !payload
        || !Number.isInteger(payload.quantityBefore)
        || !Number.isInteger(payload.quantityAfter)
      ) {
        throw new Error(copy.errors.invalidResponse);
      }

      setReceivingResult({
        sku: selectedInventory.sku,
        productName: selectedInventory.productName,
        location: selectedInventory.locationCode,
        quantity: parsedQuantity,
        quantityBefore: payload.quantityBefore,
        quantityAfter: payload.quantityAfter,
        reference: normalizedReference,
      });
      resetFormForNextReceipt();
      await loadInventory();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : copy.errors.submitFailed);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  const showInitialLoading = isLoading && items.length === 0 && !loadError;
  const showBlockingError = Boolean(loadError) && items.length === 0;
  const showEmptyState = !isLoading && !loadError && items.length === 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <WarehousePageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          subtitle={copy.subtitle}
        />

        {receivingResult ? (
          <section
            className="mb-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5"
            aria-live="polite"
          >
            <h2 className="text-lg font-semibold text-emerald-200">{copy.success.title}</h2>
            <p className="mt-1 text-sm text-emerald-100/80">{copy.success.description}</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-emerald-100/60">{copy.product}</dt>
                <dd className="mt-1 font-medium text-white">
                  {receivingResult.sku} — {receivingResult.productName}
                </dd>
              </div>
              <div>
                <dt className="text-emerald-100/60">{copy.location}</dt>
                <dd className="mt-1 font-medium text-white">{receivingResult.location}</dd>
              </div>
              <div>
                <dt className="text-emerald-100/60">{copy.receivedQuantity}</dt>
                <dd className="mt-1 font-medium text-white">{receivingResult.quantity}</dd>
              </div>
              <div>
                <dt className="text-emerald-100/60">{copy.reference}</dt>
                <dd className="mt-1 font-medium text-white">{receivingResult.reference}</dd>
              </div>
              <div>
                <dt className="text-emerald-100/60">{copy.currentQuantity}</dt>
                <dd className="mt-1 font-medium text-white">{receivingResult.quantityBefore}</dd>
              </div>
              <div>
                <dt className="text-emerald-100/60">{copy.resultingQuantity}</dt>
                <dd className="mt-1 font-medium text-white">{receivingResult.quantityAfter}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {showInitialLoading ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-300">
            {copy.loading}
          </section>
        ) : null}

        {showBlockingError ? (
          <section className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6">
            <p className="text-sm text-rose-200">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadInventory()}
              className="mt-4 rounded-2xl border border-rose-300/30 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-400/10"
            >
              {copy.retry}
            </button>
          </section>
        ) : null}

        {showEmptyState ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
            <h2 className="text-xl font-semibold text-white">{copy.empty.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{copy.empty.description}</p>
          </section>
        ) : null}

        {items.length > 0 ? (
          <>
            {loadError ? (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                <p className="text-sm text-rose-200">{loadError}</p>
                <button
                  type="button"
                  onClick={() => void loadInventory()}
                  className="rounded-xl border border-rose-300/30 px-3 py-1.5 text-sm text-rose-100"
                >
                  {copy.retry}
                </button>
              </div>
            ) : isLoading ? (
              <p className="mb-4 text-sm text-cyan-300" aria-live="polite">{copy.refreshing}</p>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h2 className="text-xl font-semibold text-white">{copy.formTitle}</h2>
                <p className="mt-2 text-sm text-slate-400">{copy.formDescription}</p>

                <form className="mt-6" onSubmit={(event) => void handleSubmit(event)}>
                  <fieldset disabled={isSubmitting} className="grid gap-5">
                    <label className="block text-sm text-slate-300">
                      <span className="mb-2 block">{copy.product}</span>
                      <select
                        value={selectedSku}
                        onChange={(event) => handleProductChange(event.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">{copy.selectProduct}</option>
                        {products.map((product) => (
                          <option key={product.sku} value={product.sku}>
                            {product.sku} — {product.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.product ? (
                        <span className="mt-2 block text-xs text-rose-300">{formErrors.product}</span>
                      ) : null}
                    </label>

                    <label className="block text-sm text-slate-300">
                      <span className="mb-2 block">{copy.location}</span>
                      <select
                        value={inventoryId}
                        onChange={(event) => {
                          setInventoryId(event.target.value);
                          setFormErrors((current) => ({ ...current, location: undefined }));
                          resetRequestForChangedInput();
                        }}
                        disabled={!selectedSku || locations.length === 0}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">{copy.selectLocation}</option>
                        {locations.map((item) => (
                          <option key={item.id} value={item.id}>{item.locationCode}</option>
                        ))}
                      </select>
                      {formErrors.location ? (
                        <span className="mt-2 block text-xs text-rose-300">{formErrors.location}</span>
                      ) : null}
                    </label>

                    <label className="block text-sm text-slate-300">
                      <span className="mb-2 block">{copy.receivedQuantity}</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantityInput}
                        onChange={(event) => {
                          setQuantityInput(event.target.value);
                          setFormErrors((current) => ({ ...current, quantity: undefined }));
                          resetRequestForChangedInput();
                        }}
                        placeholder={copy.quantityPlaceholder}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      />
                      {formErrors.quantity ? (
                        <span className="mt-2 block text-xs text-rose-300">{formErrors.quantity}</span>
                      ) : null}
                    </label>

                    <label className="block text-sm text-slate-300">
                      <span className="mb-2 block">{copy.reference}</span>
                      <input
                        type="text"
                        value={reference}
                        onChange={(event) => {
                          setReference(event.target.value);
                          setFormErrors((current) => ({ ...current, reference: undefined }));
                          resetRequestForChangedInput();
                        }}
                        placeholder={copy.referencePlaceholder}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      />
                      {formErrors.reference ? (
                        <span className="mt-2 block text-xs text-rose-300">{formErrors.reference}</span>
                      ) : null}
                    </label>

                    <label className="block text-sm text-slate-300">
                      <span className="mb-2 block">{copy.note}</span>
                      <textarea
                        rows={3}
                        value={note}
                        onChange={(event) => {
                          setNote(event.target.value);
                          resetRequestForChangedInput();
                        }}
                        placeholder={copy.notePlaceholder}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                  </fieldset>

                  {submitError ? (
                    <p className="mt-4 text-sm text-rose-300" role="alert">{submitError}</p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-6 rounded-2xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? copy.submitting : copy.submit}
                  </button>
                </form>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
                <h2 className="text-xl font-semibold text-white">{copy.previewTitle}</h2>
                <p className="mt-2 text-sm text-slate-400">{copy.previewDescription}</p>
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                    <dt className="text-slate-400">{copy.currentQuantity}</dt>
                    <dd className="font-semibold text-white">{selectedInventory?.quantity ?? "—"}</dd>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                    <dt className="text-slate-400">{copy.receivedQuantity}</dt>
                    <dd className="font-semibold text-cyan-300">
                      {hasPositiveIntegerQuantity ? parsedQuantity : "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                    <dt className="text-slate-400">{copy.resultingQuantity}</dt>
                    <dd className="font-semibold text-emerald-300">{resultingQuantity ?? "—"}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
