import { CountingView } from '@/components/warehouse/CountingView';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleWarehouseCountingPage({ params }: LocalePageProps) {
  await getLocaleFromParams(params);
  return <CountingView />;
}

export const dynamicParams = false;