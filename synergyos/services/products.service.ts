import { prisma } from '@/lib/database/prisma';
import { mockProducts } from '@/services/mockData';
import type { Product } from '@/types';

function mapDbProduct(row: {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  price: unknown;
  currency: string;
  active: boolean;
}): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category ?? 'Uncategorized',
    price: Number(row.price),
    currency: row.currency,
    active: row.active,
  };
}

export const productsService = {
  async list(): Promise<Product[]> {
    if (!prisma) {
      return mockProducts;
    }

    try {
      const rows = await prisma.product.findMany({
        orderBy: { name: 'asc' },
      });
      return rows.map(mapDbProduct);
    } catch {
      return mockProducts;
    }
  },
};
