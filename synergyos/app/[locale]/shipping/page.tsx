import { ModulePage } from '@/components/layout/ModulePage';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleShippingPage({ params }: LocalePageProps) {
  await getLocaleFromParams(params);
  return <ModulePage title="Shipping" description="Carrier labels, dispatch windows, and handoff tracking." />;
}

export const dynamicParams = false;
