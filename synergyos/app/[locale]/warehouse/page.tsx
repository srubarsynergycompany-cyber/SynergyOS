import { WarehouseDashboardView } from '@/components/warehouse/WarehouseDashboardView';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleWarehousePage({ params }: LocalePageProps) {
  await getLocaleFromParams(params);
  return <WarehouseDashboardView />;
}

export const dynamicParams = false;
