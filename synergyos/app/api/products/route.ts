import { NextResponse } from 'next/server';
import {
  isProductServiceError,
  productsService,
  type ProductInput,
} from '@/services/products.service';

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

function parseActiveInput(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return Boolean(value);
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

function toProductInput(body: Record<string, unknown>): ProductInput {
  return {
    sku: String(body.sku ?? ''),
    eanBarcode: String(body.eanBarcode ?? ''),
    name: String(body.name ?? ''),
    description: String(body.description ?? ''),
    customerId: String(body.customerId ?? ''),
    category: String(body.category ?? ''),
    weight: Number(body.weight ?? 0),
    width: Number(body.width ?? 0),
    height: Number(body.height ?? 0),
    length: Number(body.length ?? 0),
    minimumStock: Number(body.minimumStock ?? 0),
    currentStock: Number(body.currentStock ?? 0),
    unit: String(body.unit ?? ''),
    active: parseActiveInput(body.active),
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') ?? undefined;
    const category = url.searchParams.get('category') ?? undefined;
    const active = parseBoolean(url.searchParams.get('active'));
    const page = parsePositiveInteger(url.searchParams.get('page'), 1);
    const pageSize = parsePositiveInteger(url.searchParams.get('pageSize'), 10);

    const [result, categories] = await Promise.all([
      productsService.listPaginated({
        search,
        category,
        active,
        page,
        pageSize,
      }),
      productsService.listCategories(),
    ]);

    return NextResponse.json({
      ...result,
      categories,
    });
  } catch (error) {
    return toErrorResponse(error, 'Failed to load products.');
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const product = await productsService.create(toProductInput(body));
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, 'Failed to create product.');
  }
}
