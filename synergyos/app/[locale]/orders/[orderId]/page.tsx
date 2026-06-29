import { notFound } from "next/navigation";
import { getDictionary, locales } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/types";
import { mockOrders } from "@/lib/orders/mockData";
import { OrderDetailView } from "@/components/orders/OrderDetailView";

type PageProps = {
  params: Promise<{ locale: string; orderId: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    mockOrders.flatMap((order) => [
      { locale, orderId: order.id },
      { locale, orderId: order.orderNumber },
    ])
  );
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { locale, orderId } = await params;
  const safeLocale = locale as Locale;

  if (!locales.includes(safeLocale)) {
    notFound();
  }

  const normalizedOrderId = orderId.toLowerCase();
  const order = mockOrders.find(
    (item) => item.id.toLowerCase() === normalizedOrderId || item.orderNumber.toLowerCase() === normalizedOrderId
  );

  if (!order) {
    notFound();
  }

  const dictionary = getDictionary(safeLocale);

  return <OrderDetailView initialOrder={order} locale={safeLocale} dictionary={dictionary} />;
}
