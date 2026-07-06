import { TransfersView } from '@/components/warehouse/TransfersView';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleWarehouseTransfersPage({ params }: LocalePageProps) {
  await getLocaleFromParams(params);
  return <TransfersView />;
}

export const dynamicParams = false;