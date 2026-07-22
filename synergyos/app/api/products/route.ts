import { NextResponse } from 'next/server';
import { ProductServiceError, isProductServiceError } from '@/services/products.service';
import { toProductInput } from '@/app/api/products/input';
import { supabaseServer } from '@/lib/supabase-server';
import type { Product } from '@/types';
import type { ProductInput } from '@/services/products.service';

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

function parsePositiveInteger(value: string | null, fallback: number) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function toErrorResponse(error: unknown, fallbackMessage: string) {
  if (isProductServiceError(error)) {
    const statusByCode = {
      VALIDATION: 400,
      NOT_FOUND: 404,
      CONFLICT: 409,
      DATA_ACCESS: 500,
    } as const;

    return NextResponse.json({ message: error.message }, { status: statusByCode[error.code] });
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json({ message }, { status: 500 });
}

function normalizeInput(input: ProductInput): ProductInput {
  return {
    sku: input.sku.trim(),
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') ?? undefined;
    const category = url.searchParams.get('category') ?? undefined;
    const active = parseBoolean(url.searchParams.get('active'));
    const page = parsePositiveInteger(url.searchParams.get('page'), 1);
    const pageSize = parsePositiveInteger(url.searchParams.get('pageSize'), 10);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseServer
      .from('products')
      .select('id, sku, name, barcode, created_at, updated_at', { count: 'exact' })
      .order('name', { ascending: true })
      .range(from, to);

    if (search?.trim()) {
      const pattern = `%${search.trim()}%`;
      query = query.or(`sku.ilike.${pattern},name.ilike.${pattern},barcode.ilike.${pattern}`);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const mappedItems: Product[] = (data ?? []).map((row) => ({
      id: row.id,
      sku: row.sku,
      eanBarcode: row.barcode ?? '',
      name: row.name,
      description: '',
      customerId: '',
      customerName: 'Unknown customer',
      category: 'Uncategorized',
      weight: 0,
      width: 0,
      height: 0,
      length: 0,
      minimumStock: 0,
      currentStock: 0,
      unit: 'pcs',
      price: 0,
      currency: 'USD',
      active: true,
      warehousePositions: [],
      batches: [],
      expirationDates: [],
      images: [],
      attachments: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    const filteredItems = mappedItems.filter((item) => {
      const categoryMatch = !category || category === 'all' || item.category === category;
      const activeMatch = active === undefined || item.active === active;
      return categoryMatch && activeMatch;
    });

    return NextResponse.json({
      items: filteredItems,
      total: count ?? 0,
      page,
      pageSize,
      categories: ['Uncategorized'],
    });
  } catch (error) {
    return toErrorResponse(error, 'Failed to load products.');
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const normalizedInput = normalizeInput(toProductInput(body));
    validateInput(normalizedInput);

    const { data, error } = await supabaseServer
      .from('products')
      .insert({
        sku: normalizedInput.sku,
        name: normalizedInput.name,
        barcode: normalizedInput.eanBarcode,
      })
      .select('id, sku, name, barcode, created_at, updated_at')
      .single();

    if (error) {
      const isDuplicateSku = error.code === '23505' && error.message.toLowerCase().includes('sku');
      if (isDuplicateSku) {
        return NextResponse.json({ message: 'SKU must be unique.' }, { status: 409 });
      }

      throw new ProductServiceError(error.message, 'DATA_ACCESS');
    }

    const createdProduct: Product = {
      id: data.id,
      sku: data.sku,
      eanBarcode: data.barcode ?? '',
      name: data.name,
      description: '',
      customerId: '',
      customerName: 'Unknown customer',
      category: 'Uncategorized',
      weight: 0,
      width: 0,
      height: 0,
      length: 0,
      minimumStock: 0,
      currentStock: 0,
      unit: 'pcs',
      price: 0,
      currency: 'USD',
      active: true,
      warehousePositions: [],
      batches: [],
      expirationDates: [],
      images: [],
      attachments: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, 'Failed to create product.');
  }
}
