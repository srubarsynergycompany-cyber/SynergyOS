"use client";

import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import type { InventoryItem } from "@/types";

export type InventoryAdjustmentCopy = {
  title: string;
  description: string;
  product: string;
  selectProduct: string;
  location: string;
  selectLocation: string;
  currentQuantity: string;
  delta: string;
  deltaPlaceholder: string;
  reason: string;
  reasonPlaceholder: string;
  resultingQuantity: string;
  cancel: string;
  submit: string;
  submitting: string;
  noInventory: string;
  errors: {
    productRequired: string;
    locationRequired: string;
    deltaInteger: string;
    deltaNonZero: string;
    negativeResult: string;
    reasonRequired: string;
    requestFailed: string;
  };
};

type InventoryAdjustmentDialogProps = {
  items: InventoryItem[];
  copy: InventoryAdjustmentCopy;
  onClose: () => void;
  onSuccess: () => Promise<void>;
};

type FormErrors = {
  product?: string;
  location?: string;
  delta?: string;
  reason?: string;
};

function createRequestId() {
  return crypto.randomUUID();
}

export function InventoryAdjustmentDialog({
  items,
  copy,
  onClose,
  onSuccess,
}: InventoryAdjustmentDialogProps) {
  const [selectedSku, setSelectedSku] = useState("");
  const [inventoryId, setInventoryId] = useState("");
  const [deltaInput, setDeltaInput] = useState("");
  const [reason, setReason] = useState("");
  const [requestId, setRequestId] = useState(createRequestId);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const parsedDelta = Number(deltaInput);
  const hasIntegerDelta = deltaInput.trim() !== "" && Number.isInteger(parsedDelta);
  const resultingQuantity = selectedInventory && hasIntegerDelta
    ? selectedInventory.quantity + parsedDelta
    : null;

  function resetRequestForChangedInput() {
    setRequestId(createRequestId());
    setSubmitError(null);
  }

  function handleProductChange(nextSku: string) {
    const firstLocation = items.find((item) => item.sku === nextSku);
    setSelectedSku(nextSku);
    setInventoryId(firstLocation?.id ?? "");
    setFormErrors((current) => ({ ...current, product: undefined, location: undefined }));
    resetRequestForChangedInput();
  }

  function validate(): FormErrors {
    const errors: FormErrors = {};
    if (!selectedSku) {
      errors.product = copy.errors.productRequired;
    }
    if (!selectedInventory) {
      errors.location = copy.errors.locationRequired;
    }
    if (!hasIntegerDelta) {
      errors.delta = copy.errors.deltaInteger;
    } else if (parsedDelta === 0) {
      errors.delta = copy.errors.deltaNonZero;
    } else if (resultingQuantity !== null && resultingQuantity < 0) {
      errors.delta = copy.errors.negativeResult;
    }
    if (!reason.trim()) {
      errors.reason = copy.errors.reasonRequired;
    }
    return errors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const errors = validate();
    setFormErrors(errors);
    setSubmitError(null);
    if (Object.keys(errors).length > 0 || !selectedInventory) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inventory/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: selectedInventory.id,
          delta: parsedDelta,
          reason: reason.trim(),
          requestId,
          actorLabel: "SynergyOS user",
        }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? copy.errors.requestFailed);
      }

      await onSuccess();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : copy.errors.requestFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
    >
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto">
        <Dialog title={copy.title} description={copy.description}>
          <form onSubmit={(event) => void handleSubmit(event)}>
            <fieldset disabled={isSubmitting} className="grid gap-4">
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block">{copy.product}</span>
                <select
                  value={selectedSku}
                  onChange={(event) => handleProductChange(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option value="">{copy.selectProduct}</option>
                  {products.map((product) => (
                    <option key={product.sku} value={product.sku}>
                      {product.sku} — {product.name}
                    </option>
                  ))}
                </select>
                {formErrors.product ? <span className="mt-2 block text-xs text-rose-300">{formErrors.product}</span> : null}
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
                  <option value="">{locations.length === 0 && selectedSku ? copy.noInventory : copy.selectLocation}</option>
                  {locations.map((item) => (
                    <option key={item.id} value={item.id}>{item.locationCode}</option>
                  ))}
                </select>
                {formErrors.location ? <span className="mt-2 block text-xs text-rose-300">{formErrors.location}</span> : null}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{copy.currentQuantity}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{selectedInventory?.quantity ?? "—"}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{copy.resultingQuantity}</p>
                  <p className={`mt-2 text-2xl font-semibold ${resultingQuantity !== null && resultingQuantity < 0 ? "text-rose-300" : "text-white"}`}>
                    {resultingQuantity ?? "—"}
                  </p>
                </div>
              </div>

              <label className="block text-sm text-slate-300">
                <span className="mb-2 block">{copy.delta}</span>
                <input
                  type="number"
                  step="1"
                  value={deltaInput}
                  onChange={(event) => {
                    setDeltaInput(event.target.value);
                    setFormErrors((current) => ({ ...current, delta: undefined }));
                    resetRequestForChangedInput();
                  }}
                  placeholder={copy.deltaPlaceholder}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
                {formErrors.delta ? <span className="mt-2 block text-xs text-rose-300">{formErrors.delta}</span> : null}
              </label>

              <label className="block text-sm text-slate-300">
                <span className="mb-2 block">{copy.reason}</span>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(event) => {
                    setReason(event.target.value);
                    setFormErrors((current) => ({ ...current, reason: undefined }));
                    resetRequestForChangedInput();
                  }}
                  placeholder={copy.reasonPlaceholder}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
                {formErrors.reason ? <span className="mt-2 block text-xs text-rose-300">{formErrors.reason}</span> : null}
              </label>
            </fieldset>

            {submitError ? <p className="mt-4 text-sm text-rose-300">{submitError}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? copy.submitting : copy.submit}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-2xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {copy.cancel}
              </button>
            </div>
          </form>
        </Dialog>
      </div>
    </div>
  );
}
