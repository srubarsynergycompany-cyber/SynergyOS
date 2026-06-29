import { InventoryPageView } from '@/components/inventory/InventoryPageView';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleInventoryPage({ params }: LocalePageProps) {
  await getLocaleFromParams(params);
  return <InventoryPageView />;
}

export const dynamicParams = false;
