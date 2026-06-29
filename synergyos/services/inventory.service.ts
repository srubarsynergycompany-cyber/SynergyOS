import { prisma } from '@/lib/database/prisma';
import { mockInventory } from '@/services/mockData';
import type { InventoryItem } from '@/types';

function mapDbInventory(row: {
  id: string;
  quantity: number;
  reserved: number;
  minimumStock: number;
  status: string;
  product: { sku: string; name: string };
  warehouseLocation: { code: string } | null;
}): InventoryItem {
  const available = row.quantity - row.reserved;
  return {
    id: row.id,
    sku: row.product.sku,
    productName: row.product.name,
    locationCode: row.warehouseLocation?.code ?? 'UNASSIGNED',
    quantity: row.quantity,
    reserved: row.reserved,
    available,
    minimumStock: row.minimumStock,
    status: row.status,
  };
}

export const inventoryService = {
  async list(): Promise<InventoryItem[]> {
    if (!prisma) {
      return mockInventory;
    }

    try {
      const rows = await prisma.inventoryItem.findMany({
        include: {
          product: {
            select: {
              sku: true,
              name: true,
            },
          },
          warehouseLocation: {
            select: {
              code: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
      return rows.map(mapDbInventory);
    } catch {
      return mockInventory;
    }
  },
};
