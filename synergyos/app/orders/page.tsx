import OrdersModule from "@/components/OrdersModule";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function OrdersPage() {
  const dictionary = getDictionary("en");

  return <OrdersModule dictionary={dictionary} locale="en" />;
}
