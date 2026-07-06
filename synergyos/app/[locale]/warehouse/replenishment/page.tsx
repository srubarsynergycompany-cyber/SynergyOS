import { ReplenishmentView } from '@/components/warehouse/ReplenishmentView';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleWarehouseReplenishmentPage({ params }: LocalePageProps) {
  await getLocaleFromParams(params);
  return <ReplenishmentView />;
}

export const dynamicParams = false;