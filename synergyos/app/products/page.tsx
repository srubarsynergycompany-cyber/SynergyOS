import ProductsModule from '@/components/products/ProductsModule';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { customerService } from '@/services';

export default async function ProductsPage() {
  const dictionary = getDictionary('en');
  const customers = await customerService.list();

  return (
    <ProductsModule
      dictionary={dictionary}
      locale="en"
      customers={customers.map((customer) => ({ id: customer.id, name: customer.name }))}
    />
  );
}
