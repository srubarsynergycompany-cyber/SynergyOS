import { ModulePage } from '@/components/layout/ModulePage';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocalePackingPage({ params }: LocalePageProps) {
  await getLocaleFromParams(params);
  return <ModulePage title="Packing" description="Pack station orchestration, quality checks, and parcel readiness." />;
}

export const dynamicParams = false;
