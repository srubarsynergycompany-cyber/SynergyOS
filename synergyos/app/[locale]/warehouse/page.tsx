import { WarehouseDashboardView } from '@/components/warehouse/WarehouseDashboardView';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleWarehousePage({ params }: LocalePageProps) {
  const locale = await getLocaleFromParams(params);
  const dictionary = getDictionary(locale);
  return <WarehouseDashboardView copy={dictionary.modules.warehouse} />;
}

export const dynamicParams = false;
