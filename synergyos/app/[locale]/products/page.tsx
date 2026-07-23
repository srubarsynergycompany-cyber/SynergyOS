import ProductsModule from '@/components/products/ProductsModule';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';
import { customerService } from '@/services';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleProductsPage({ params }: LocalePageProps) {
  const locale = await getLocaleFromParams(params);
  const dictionary = getDictionary(locale);
  const customers = await customerService.list();

  return (
    <ProductsModule
      dictionary={dictionary}
      locale={locale}
      customers={customers.map((customer) => ({ id: customer.id, name: customer.name }))}
    />
  );
}

export const dynamicParams = false;
export const dynamic = 'force-dynamic';
