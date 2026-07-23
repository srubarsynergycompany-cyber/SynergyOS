import { getSupabaseServer } from '@/lib/supabase-server';
import type { InventoryItem } from '@/types';

type InventoryRow = {
  id: string;
  product_id: string;
  quantity: number | null;
  reserved: number | null;
  minimum_stock: number | null;
  status: string | null;
  location: string | null;
  products?: {
    sku: string | null;
    name: string | null;
  } | null;
};

function mapInventory(row: InventoryRow): InventoryItem {
  const quantity = row.quantity ?? 0;
  const reserved = row.reserved ?? 0;

  return {
    id: row.id,
    sku: row.products?.sku ?? row.product_id,
    productName: row.products?.name ?? 'Unknown product',
    locationCode: row.location ?? 'UNASSIGNED',
    quantity,
    reserved,
    available: quantity - reserved,
    minimumStock: row.minimum_stock ?? 0,
    status: row.status ?? 'In stock',
  };
}

export const inventoryService = {
  async list(): Promise<InventoryItem[]> {
    const { data, error } = await getSupabaseServer()
      .from('inventory')
      .select('id, product_id, quantity, reserved, minimum_stock, status, location, products(sku, name)')
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as InventoryRow[]).map(mapInventory);
  },
};
