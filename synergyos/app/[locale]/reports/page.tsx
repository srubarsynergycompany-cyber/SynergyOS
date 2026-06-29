import { ModulePage } from '@/components/layout/ModulePage';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleReportsPage({ params }: LocalePageProps) {
  await getLocaleFromParams(params);
  return <ModulePage title="Reports" description="Operational KPIs, trend analysis, and decision dashboards." />;
}

export const dynamicParams = false;
