import { ModulePage } from '@/components/layout/ModulePage';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleCustomersPage({ params }: LocalePageProps) {
  await getLocaleFromParams(params);
  return <ModulePage title="Customers" description="Account health, SLA visibility, and customer operations." />;
}

export const dynamicParams = false;
