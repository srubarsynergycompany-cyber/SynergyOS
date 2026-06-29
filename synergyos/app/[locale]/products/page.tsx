import { ModulePage } from '@/components/layout/ModulePage';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleProductsPage({ params }: LocalePageProps) {
  await getLocaleFromParams(params);
  return <ModulePage title="Products" description="Catalog governance, SKU attributes, and product lifecycle." />;
}

export const dynamicParams = false;
