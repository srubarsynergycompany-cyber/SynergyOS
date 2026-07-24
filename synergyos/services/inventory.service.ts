import { getSupabaseServer } from '@/lib/supabase-server';
import type {
  InventoryItem,
  InventoryMovementItem,
  InventoryMovementsResponse,
} from '@/types';

type InventoryServiceErrorCode = 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'DATA_ACCESS';
const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/;

function isValidIsoDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value) || !Number.isFinite(Date.parse(value))) {
    return false;
  }

  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  return calendarDate.getUTCFullYear() === year
    && calendarDate.getUTCMonth() === month - 1
    && calendarDate.getUTCDate() === day;
}

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

export type InventoryMovementsOptions = {
  page?: number;
  pageSize?: number;
  sku?: string;
  product?: string;
  location?: string;
  from?: string;
  to?: string;
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

type InventoryMovementRow = {
  id: string;
  request_id: string;
  inventory_id: string | null;
  product_id: string | null;
  sku: string;
  location: string;
  delta: number;
  quantity_before: number;
  quantity_after: number;
  reason: string;
  actor_label: string | null;
  created_at: string;
  products?: {
    name: string;
  } | null;
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

function normalizeDateFilter(value: string | undefined, field: 'from' | 'to') {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }
  if (!isValidIsoDate(normalized)) {
    throw new InventoryServiceError(`Inventory movement ${field} date must be a valid ISO value.`, 'VALIDATION');
  }
  return normalized;
}

function mapMovement(row: InventoryMovementRow): InventoryMovementItem {
  return {
    id: row.id,
    requestId: row.request_id,
    inventoryId: row.inventory_id,
    productId: row.product_id,
    sku: row.sku,
    productName: row.products?.name ?? 'Deleted product',
    locationCode: row.location,
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

  async listMovements(options: InventoryMovementsOptions = {}): Promise<InventoryMovementsResponse> {
    const page = Number.isInteger(options.page) && (options.page ?? 0) >= 1
      ? options.page as number
      : 1;
    const requestedPageSize = Number.isInteger(options.pageSize) && (options.pageSize ?? 0) >= 1
      ? options.pageSize as number
      : 25;
    const pageSize = Math.min(requestedPageSize, 100);
    const sku = options.sku?.trim();
    const product = options.product?.trim();
    const location = options.location?.trim();
    const from = normalizeDateFilter(options.from, 'from');
    const to = normalizeDateFilter(options.to, 'to');

    if (from && to && Date.parse(from) > Date.parse(to)) {
      throw new InventoryServiceError('Inventory movement from date must not be after to date.', 'VALIDATION');
    }

    const fromRow = (page - 1) * pageSize;
    const toRow = fromRow + pageSize - 1;
    const productSelect = product ? 'products!inner(name)' : 'products(name)';
    const movementSelect =
      `id, request_id, inventory_id, product_id, sku, location, delta, quantity_before, quantity_after, reason, actor_label, created_at, ${productSelect}`;

    try {
      let query = getSupabaseServer()
        .from('inventory_movements')
        .select(movementSelect, { count: 'exact' })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(fromRow, toRow);

      if (sku) {
        query = query.ilike('sku', `%${sku}%`);
      }
      if (product) {
        query = query.ilike('products.name', `%${product}%`);
      }
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }
      if (from) {
        query = query.gte('created_at', from);
      }
      if (to) {
        query = query.lte('created_at', to);
      }

      const { data, error, count } = await query;
      if (error) {
        throw error;
      }

      return {
        items: ((data ?? []) as unknown as InventoryMovementRow[]).map(mapMovement),
        total: count ?? 0,
        page,
        pageSize,
      };
    } catch (error) {
      throw toKnownServiceError(error);
    }
  },
};
