import { ReceivingView } from '@/components/warehouse/ReceivingView';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleWarehouseReceivingPage({ params }: LocalePageProps) {
  await getLocaleFromParams(params);
  return <ReceivingView />;
}

export const dynamicParams = false;