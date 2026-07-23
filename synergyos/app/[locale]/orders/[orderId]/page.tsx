import { notFound } from "next/navigation";
import { getDictionary, locales } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/types";
import { OrderDetailView } from "@/components/orders/OrderDetailView";
import { ordersService } from "@/services/orders.service";

type PageProps = {
  params: Promise<{ locale: string; orderId: string }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { locale, orderId } = await params;
  const safeLocale = locale as Locale;

  if (!locales.includes(safeLocale)) {
    notFound();
  }

  const order = await ordersService.getById(orderId);

  if (!order) {
    notFound();
  }

  const dictionary = getDictionary(safeLocale);

  return <OrderDetailView initialOrder={order} locale={safeLocale} dictionary={dictionary} />;
}

export const dynamic = "force-dynamic";
