import { getSupabaseServer } from '@/lib/supabase-server';
import type { Product } from '@/types';

type ProductListParams = {
  search?: string;
  category?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
};

type PaginatedProducts = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

type ProductServiceErrorCode = 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'DATA_ACCESS';

export type ProductInput = {
  sku: string;
  eanBarcode: string;
  name: string;
  description: string;
  customerId: string;
  category: string;
  weight: number;
  width: number;
  height: number;
  length: number;
  minimumStock: number;
  currentStock: number;
  unit: string;
  active: boolean;
};

type ProductRow = {
  id: string;
  sku: string;
  name: string;
  barcode: string | null;
  description: string | null;
  client_id: string | null;
  category: string | null;
  weight: number | string | null;
  width: number | string | null;
  height: number | string | null;
  length: number | string | null;
  minimum_stock: number | null;
  current_stock: number | null;
  unit: string | null;
  price: number | string | null;
  currency: string | null;
  active: boolean | null;
  warehouse_positions: unknown;
  batches: unknown;
  expiration_dates: unknown;
  images: unknown;
  attachments: unknown;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string | null;
  } | null;
};

export class ProductServiceError extends Error {
  code: ProductServiceErrorCode;

  constructor(message: string, code: ProductServiceErrorCode) {
    super(message);
    this.name = 'ProductServiceError';
    this.code = code;
  }
}

export function isProductServiceError(error: unknown): error is ProductServiceError {
  return error instanceof ProductServiceError;
}

function normalizeInput(input: ProductInput): ProductInput {
  return {
    sku: input.sku.trim().toUpperCase(),
    eanBarcode: input.eanBarcode.trim(),
    name: input.name.trim(),
    description: input.description.trim(),
    customerId: input.customerId.trim(),
    category: input.category.trim(),
    weight: Number(input.weight),
    width: Number(input.width),
    height: Number(input.height),
    length: Number(input.length),
    minimumStock: Number(input.minimumStock),
    currentStock: Number(input.currentStock),
    unit: input.unit.trim(),
    active: input.active,
  };
}

function validateRequired(input: ProductInput) {
  const requiredText: Array<[keyof ProductInput, string]> = [
    ['sku', 'SKU is required.'],
    ['eanBarcode', 'EAN barcode is required.'],
    ['name', 'Name is required.'],
    ['description', 'Description is required.'],
    ['customerId', 'Customer is required.'],
    ['category', 'Category is required.'],
    ['unit', 'Unit is required.'],
  ];

  for (const [key, message] of requiredText) {
    const value = input[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new ProductServiceError(message, 'VALIDATION');
    }
  }
}

function validateNumericFields(input: ProductInput) {
  const decimalFields: Array<[keyof ProductInput, string]> = [
    ['weight', 'Weight must be a non-negative number.'],
    ['width', 'Width must be a non-negative number.'],
    ['height', 'Height must be a non-negative number.'],
    ['length', 'Length must be a non-negative number.'],
  ];

  for (const [key, message] of decimalFields) {
    const value = input[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new ProductServiceError(message, 'VALIDATION');
    }
  }

  const integerFields: Array<[keyof ProductInput, string]> = [
    ['minimumStock', 'Minimum stock must be a non-negative integer.'],
    ['currentStock', 'Current stock must be a non-negative integer.'],
  ];

  for (const [key, message] of integerFields) {
    const value = input[key];
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw new ProductServiceError(message, 'VALIDATION');
    }
  }

  if (typeof input.active !== 'boolean') {
    throw new ProductServiceError('Active flag must be boolean.', 'VALIDATION');
  }
}

function validateInput(input: ProductInput) {
  validateRequired(input);
  validateNumericFields(input);
}

function toKnownServiceError(error: unknown): ProductServiceError {
  if (isProductServiceError(error)) {
    return error;
  }

  const candidate = error as { code?: string; message?: string };
  if (candidate?.code === '23505') {
    return new ProductServiceError('SKU or EAN barcode must be unique.', 'CONFLICT');
  }
  if (candidate?.code === '23503') {
    return new ProductServiceError('Customer reference is invalid.', 'VALIDATION');
  }

  return new ProductServiceError(candidate?.message ?? 'Unexpected product data error.', 'DATA_ACCESS');
}

function toNumber(value: number | string | null) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    eanBarcode: row.barcode ?? '',
    name: row.name,
    description: row.description ?? '',
    customerId: row.client_id ?? '',
    customerName: row.clients?.name ?? 'Unknown customer',
    category: row.category ?? 'Uncategorized',
    weight: toNumber(row.weight),
    width: toNumber(row.width),
    height: toNumber(row.height),
    length: toNumber(row.length),
    minimumStock: row.minimum_stock ?? 0,
    currentStock: row.current_stock ?? 0,
    unit: row.unit ?? 'pcs',
    price: toNumber(row.price),
    currency: (row.currency ?? 'USD').toUpperCase(),
    active: row.active ?? true,
    warehousePositions: toStringArray(row.warehouse_positions),
    batches: toStringArray(row.batches),
    expirationDates: toStringArray(row.expiration_dates),
    images: toStringArray(row.images),
    attachments: toStringArray(row.attachments),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbPayload(input: ProductInput) {
  return {
    sku: input.sku,
    barcode: input.eanBarcode,
    name: input.name,
    description: input.description,
    client_id: input.customerId,
    category: input.category,
    weight: input.weight,
    width: input.width,
    height: input.height,
    length: input.length,
    minimum_stock: input.minimumStock,
    current_stock: input.currentStock,
    unit: input.unit,
    active: input.active,
    updated_at: new Date().toISOString(),
  };
}

const PRODUCT_SELECT =
  'id, sku, name, barcode, description, client_id, category, weight, width, height, length, minimum_stock, current_stock, unit, price, currency, active, warehouse_positions, batches, expiration_dates, images, attachments, created_at, updated_at, clients(name)';

export const productsService = {
  async list(): Promise<Product[]> {
    const result = await this.listPaginated({ page: 1, pageSize: 1000 });
    return result.items;
  },

  async listPaginated(params: ProductListParams = {}): Promise<PaginatedProducts> {
    const requestedPage = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 10);
    const from = (requestedPage - 1) * pageSize;
    const to = from + pageSize - 1;
    const search = params.search?.trim();

    try {
      let query = getSupabaseServer()
        .from('products')
        .select(PRODUCT_SELECT, { count: 'exact' })
        .order('name', { ascending: true })
        .range(from, to);

      if (params.category && params.category !== 'all') {
        query = query.eq('category', params.category);
      }
      if (params.active !== undefined) {
        query = query.eq('active', params.active);
      }
      if (search) {
        const pattern = `%${search}%`;
        query = query.or(`sku.ilike.${pattern},name.ilike.${pattern},barcode.ilike.${pattern},category.ilike.${pattern}`);
      }

      const { data, error, count } = await query;
      if (error) {
        throw error;
      }

      const total = count ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const page = Math.min(requestedPage, totalPages);

      return {
        items: ((data ?? []) as ProductRow[]).map(mapProductRow),
        total,
        page,
        pageSize,
      };
    } catch (error) {
      throw toKnownServiceError(error);
    }
  },

  async getById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await getSupabaseServer()
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapProductRow(data as ProductRow) : null;
    } catch (error) {
      throw toKnownServiceError(error);
    }
  },

  async create(input: ProductInput): Promise<Product> {
    const normalizedInput = normalizeInput(input);
    validateInput(normalizedInput);

    try {
      const { data, error } = await getSupabaseServer()
        .from('products')
        .insert(toDbPayload(normalizedInput))
        .select(PRODUCT_SELECT)
        .single();

      if (error) {
        throw error;
      }

      return mapProductRow(data as ProductRow);
    } catch (error) {
      throw toKnownServiceError(error);
    }
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    const normalizedInput = normalizeInput(input);
    validateInput(normalizedInput);

    try {
      const { data, error } = await getSupabaseServer()
        .from('products')
        .update(toDbPayload(normalizedInput))
        .eq('id', id)
        .select(PRODUCT_SELECT)
        .maybeSingle();

      if (error) {
        throw error;
      }
      if (!data) {
        throw new ProductServiceError('Product not found.', 'NOT_FOUND');
      }

      return mapProductRow(data as ProductRow);
    } catch (error) {
      throw toKnownServiceError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      const { data, error } = await getSupabaseServer()
        .from('products')
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle();

      if (error) {
        throw error;
      }
      if (!data) {
        throw new ProductServiceError('Product not found.', 'NOT_FOUND');
      }
    } catch (error) {
      throw toKnownServiceError(error);
    }
  },

  async listCategories(): Promise<string[]> {
    try {
      const { data, error } = await getSupabaseServer()
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        throw error;
      }

      const categories = new Set(
        (data ?? [])
          .map((row) => row.category)
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0),
      );

      return Array.from(categories).sort((a, b) => a.localeCompare(b));
    } catch (error) {
      throw toKnownServiceError(error);
    }
  },
};
