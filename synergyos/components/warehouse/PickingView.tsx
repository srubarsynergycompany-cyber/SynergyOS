"use client";

import { useMemo, useRef, useState } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ProductCard } from "@/components/warehouse/ProductCard";
import { PickingProgress } from "@/components/warehouse/PickingProgress";
import { ScanInput } from "@/components/warehouse/ScanInput";

type PickingItem = {
  sku: string;
  name: string;
  quantity: number;
  location: string;
};

type PickingViewProps = {
  locale: string;
  orderNumber: string;
  items: PickingItem[];
};

export function PickingView({ locale, orderNumber, items }: PickingViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pickedQuantities, setPickedQuantities] = useState<number[]>(() => items.map(() => 0));
  const [scanValue, setScanValue] = useState("");
  const [flashState, setFlashState] = useState<"success" | "error" | null>(null);
  const [completed, setCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dictionary = useMemo(() => getDictionary(locale === "cs" ? "cs" : "en"), [locale]);

  const currentItem = items[currentIndex];
  const pickedQuantity = pickedQuantities[currentIndex] ?? 0;
  const isComplete = currentIndex >= items.length;

  const successLabel = locale === "en" ? "Success" : "Úspěch";
  const errorLabel = locale === "en" ? "Wrong item" : "Špatná položka";
  const completedLabel = locale === "en" ? "Picking completed" : "Sběr dokončen";
  const continueLabel = locale === "en" ? "Continue to Packing" : "Pokračovat do balení";
  const currentOrderLabel = locale === "en" ? "Current order" : "Aktuální objednávka";
  const currentProductLabel = locale === "en" ? "Current product" : "Aktuální produkt";
  const requiredLabel = locale === "en" ? "Required quantity" : "Požadované množství";
  const pickedLabel = locale === "en" ? "Picked quantity" : "Sběrané množství";
  const scanLabel = locale === "en" ? "Scan barcode" : "Naskenujte čárový kód";
  const scanPlaceholder = locale === "en" ? "Scan product barcode" : "Naskenujte čárový kód produktu";

  const handleScan = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    if (trimmed === currentItem?.sku) {
      setPickedQuantities((prev) => {
        const next = [...prev];
        next[currentIndex] = Math.min(currentItem.quantity, (next[currentIndex] ?? 0) + 1);
        return next;
      });
      setFlashState("success");
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        void audioRef.current.play().catch(() => undefined);
      }
      setTimeout(() => setFlashState(null), 220);
      setScanValue("");

      if (pickedQuantities[currentIndex] + 1 >= currentItem.quantity) {
        setTimeout(() => {
          if (currentIndex < items.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            setCompleted(true);
          }
        }, 220);
      }
      return;
    }

    setFlashState("error");
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => undefined);
    }
    setTimeout(() => setFlashState(null), 220);
    setScanValue("");
  };

  const summaryLabel = useMemo(() => {
    if (completed) {
      return completedLabel;
    }

    return `${currentIndex + 1} / ${items.length}`;
  }, [completed, currentIndex, items.length, completedLabel]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <audio ref={audioRef} src="/sounds/pick-success.mp3" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">Warehouse picking</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{currentOrderLabel} {orderNumber}</h1>
            <p className="mt-2 text-sm text-slate-400">{locale === "en" ? "Fast barcode-driven picking workflow for warehouse staff." : "Rychlý sběr řízený čárovými kódy pro skladové pracovníky."}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-medium text-slate-200">
            {summaryLabel}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <ScanInput
              value={scanValue}
              onChange={setScanValue}
              onSubmit={handleScan}
              label={scanLabel}
              placeholder={scanPlaceholder}
            />

            {completed ? (
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center shadow-2xl shadow-slate-950/40">
                <h2 className="text-3xl font-semibold text-white">{completedLabel}</h2>
                <p className="mt-3 text-slate-300">{locale === "en" ? "All required items were picked successfully." : "Všechny požadované položky byly úspěšně sebrány."}</p>
                <button className="mt-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">
                  {continueLabel}
                </button>
              </div>
            ) : (
              <ProductCard
                productName={currentItem.name}
                sku={currentItem.sku}
                location={currentItem.location}
                requiredQuantity={currentItem.quantity}
                pickedQuantity={pickedQuantity}
                isSuccess={flashState === "success"}
                isError={flashState === "error"}
              />
            )}
          </div>

          <div className="space-y-6">
            <PickingProgress currentIndex={completed ? items.length : currentIndex + 1} totalItems={items.length} completed={completed} />
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
              <h3 className="text-xl font-semibold text-white">{dictionary.orders.detail.summary}</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span>{locale === "en" ? "Order" : "Objednávka"}</span>
                  <span className="font-semibold text-slate-100">{orderNumber}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span>{locale === "en" ? "Products" : "Položky"}</span>
                  <span className="font-semibold text-slate-100">{items.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span>{locale === "en" ? "Status" : "Stav"}</span>
                  <span className="font-semibold text-slate-100">{completed ? completedLabel : locale === "en" ? "In progress" : "Probíhá"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
