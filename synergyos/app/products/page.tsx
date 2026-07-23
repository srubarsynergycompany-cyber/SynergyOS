import ProductsModule from '@/components/products/ProductsModule';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { customerService } from '@/services';

export default async function ProductsPage() {
  const dictionary = getDictionary('cs');
  const customers = await customerService.list();

  return (
    <ProductsModule
      dictionary={dictionary}
      locale="cs"
      customers={customers.map((customer) => ({ id: customer.id, name: customer.name }))}
    />
  );
}

export const dynamic = 'force-dynamic';
