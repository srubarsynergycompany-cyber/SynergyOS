import { InventoryPageView } from '@/components/inventory/InventoryPageView';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleInventoryPage({ params }: LocalePageProps) {
  const locale = await getLocaleFromParams(params);
  const dictionary = getDictionary(locale);
  return <InventoryPageView copy={dictionary.modules.inventory} />;
}

export const dynamicParams = false;
