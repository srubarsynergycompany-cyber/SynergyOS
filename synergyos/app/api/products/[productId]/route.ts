import { NextResponse } from 'next/server';
import {
  isProductServiceError,
  productsService,
} from '@/services/products.service';
import { toProductInput } from '@/app/api/products/input';
import { supabaseServer } from '@/lib/supabase-server';
import type { Product } from '@/types';

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

function isDuplicateKeyError(error: { code?: string; message?: string }): boolean {
  if (error.code !== '23505') {
    return false;
  }

  return /sku|barcode|products/i.test(error.message ?? '');
}

function toProductResponse(row: {
  id: string;
  sku: string;
  name: string;
  barcode: string | null;
  created_at: string;
  updated_at: string;
}): Product {
  return {
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
  };
}

export async function GET(_: Request, context: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await context.params;
    const product = await productsService.getById(productId);

    if (!product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return toErrorResponse(error, 'Failed to load product.');
  }
}

export async function PUT(request: Request, context: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const input = toProductInput(body);

    const { data, error } = await supabaseServer
      .from('products')
      .update({
        sku: input.sku.trim(),
        name: input.name.trim(),
        barcode: input.eanBarcode.trim(),
      })
      .eq('id', productId)
      .select('id, sku, name, barcode, created_at, updated_at')
      .maybeSingle();

    if (error) {
      if (isDuplicateKeyError(error)) {
        return NextResponse.json({ message: 'SKU or barcode must be unique.' }, { status: 409 });
      }

      throw new Error(error.message);
    }

    if (!data) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json(toProductResponse(data));
  } catch (error) {
    return toErrorResponse(error, 'Failed to update product.');
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await context.params;
    const { data, error } = await supabaseServer
      .from('products')
      .delete()
      .eq('id', productId)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error, 'Failed to delete product.');
  }
}
