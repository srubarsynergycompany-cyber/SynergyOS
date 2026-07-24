import { getSupabaseServer } from '@/lib/supabase-server';
import type { InventoryItem } from '@/types';

type InventoryServiceErrorCode = 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'DATA_ACCESS';

export type InventoryAdjustmentInput = {
  inventoryId: string;
  delta: number;
  reason: string;
  requestId: string;
  actorLabel?: string;
};

export type InventoryAdjustmentResult = {
  movementId: string;
  inventoryId: string;
  productId: string | null;
  sku: string;
  location: string;
  delta: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  actorLabel: string | null;
  createdAt: string;
};

type InventoryRow = {
  id: string;
  product_id: string;
  quantity: number;
  location: string | null;
  products?: {
    sku: string;
    name: string;
  } | null;
};

type InventoryAdjustmentRow = {
  movement_id: string;
  inventory_id: string;
  product_id: string | null;
  sku: string;
  location: string;
  delta: number;
  quantity_before: number;
  quantity_after: number;
  reason: string;
  actor_label: string | null;
  created_at: string;
};

export class InventoryServiceError extends Error {
  code: InventoryServiceErrorCode;

  constructor(message: string, code: InventoryServiceErrorCode) {
    super(message);
    this.name = 'InventoryServiceError';
    this.code = code;
  }
}

export function isInventoryServiceError(error: unknown): error is InventoryServiceError {
  return error instanceof InventoryServiceError;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toKnownServiceError(error: unknown): InventoryServiceError {
  if (isInventoryServiceError(error)) {
    return error;
  }

  const candidate = error as { code?: string; message?: string };
  if (candidate?.code === '22023') {
    return new InventoryServiceError(candidate.message ?? 'Invalid inventory adjustment.', 'VALIDATION');
  }
  if (candidate?.code === 'P0002') {
    return new InventoryServiceError(candidate.message ?? 'Inventory item not found.', 'NOT_FOUND');
  }
  if (candidate?.code === '23505' || candidate?.code === '23514') {
    return new InventoryServiceError(candidate.message ?? 'Inventory adjustment conflicts with current stock.', 'CONFLICT');
  }

  return new InventoryServiceError(candidate?.message ?? 'Unexpected inventory data error.', 'DATA_ACCESS');
}

function normalizeAdjustmentInput(input: InventoryAdjustmentInput): InventoryAdjustmentInput {
  const normalized = {
    inventoryId: input.inventoryId?.trim() ?? '',
    delta: input.delta,
    reason: input.reason?.trim() ?? '',
    requestId: input.requestId?.trim() ?? '',
    actorLabel: input.actorLabel?.trim() || undefined,
  };

  if (!isUuid(normalized.inventoryId)) {
    throw new InventoryServiceError('Inventory id must be a valid UUID.', 'VALIDATION');
  }
  if (!isUuid(normalized.requestId)) {
    throw new InventoryServiceError('Request id must be a valid UUID.', 'VALIDATION');
  }
  if (!Number.isInteger(normalized.delta) || normalized.delta === 0) {
    throw new InventoryServiceError('Inventory delta must be a non-zero integer.', 'VALIDATION');
  }
  if (!normalized.reason) {
    throw new InventoryServiceError('Inventory adjustment reason is required.', 'VALIDATION');
  }

  return normalized;
}

function mapInventory(row: InventoryRow): InventoryItem {
  const quantity = row.quantity ?? 0;

  return {
    id: row.id,
    sku: row.products?.sku ?? row.product_id,
    productName: row.products?.name ?? 'Unknown product',
    locationCode: row.location ?? 'UNASSIGNED',
    quantity,
    reserved: 0,
    available: quantity,
    minimumStock: 0,
    status: quantity > 0 ? 'In stock' : 'Out of stock',
  };
}

function mapAdjustment(row: InventoryAdjustmentRow): InventoryAdjustmentResult {
  return {
    movementId: row.movement_id,
    inventoryId: row.inventory_id,
    productId: row.product_id,
    sku: row.sku,
    location: row.location,
    delta: row.delta,
    quantityBefore: row.quantity_before,
    quantityAfter: row.quantity_after,
    reason: row.reason,
    actorLabel: row.actor_label,
    createdAt: row.created_at,
  };
}

export const inventoryService = {
  async list(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await getSupabaseServer()
        .from('inventory')
        .select('id, product_id, quantity, location, products(sku, name)')
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return ((data ?? []) as InventoryRow[]).map(mapInventory);
    } catch (error) {
      throw toKnownServiceError(error);
    }
  },

  async adjust(input: InventoryAdjustmentInput): Promise<InventoryAdjustmentResult> {
    const normalized = normalizeAdjustmentInput(input);

    try {
      const { data, error } = await getSupabaseServer().rpc('adjust_inventory', {
        p_inventory_id: normalized.inventoryId,
        p_delta: normalized.delta,
        p_reason: normalized.reason,
        p_request_id: normalized.requestId,
        p_actor_label: normalized.actorLabel ?? null,
      });

      if (error) {
        throw error;
      }

      const movement = (data as InventoryAdjustmentRow[] | null)?.[0];
      if (!movement) {
        throw new InventoryServiceError('Inventory adjustment returned no result.', 'DATA_ACCESS');
      }

      return mapAdjustment(movement);
    } catch (error) {
      throw toKnownServiceError(error);
    }
  },
};
