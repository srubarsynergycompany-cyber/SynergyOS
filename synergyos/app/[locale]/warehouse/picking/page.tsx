import { PickingView } from '@/components/warehouse/PickingView';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

const mockPickingItems = [
  { sku: 'SKU-1001', name: 'Eco Tote Bag', quantity: 2, location: 'A-12-03' },
  { sku: 'SKU-1002', name: 'Ceramic Mug', quantity: 1, location: 'A-12-05' },
];

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleWarehousePickingPage({ params }: LocalePageProps) {
  const locale = await getLocaleFromParams(params);
  return <PickingView locale={locale} orderNumber="ORD-1001" items={mockPickingItems} />;
}

export const dynamicParams = false;