import { ModulePage } from '@/components/layout/ModulePage';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleReturnsPage({ params }: LocalePageProps) {
  await getLocaleFromParams(params);
  return <ModulePage title="Returns" description="Reverse logistics intake, inspections, and disposition paths." />;
}

export const dynamicParams = false;
