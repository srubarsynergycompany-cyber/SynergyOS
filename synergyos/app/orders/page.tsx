import OrdersModule from "@/components/OrdersModule";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function OrdersPage() {
  const dictionary = getDictionary("cs");

  return <OrdersModule dictionary={dictionary} locale="cs" />;
}
