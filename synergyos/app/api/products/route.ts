import { NextResponse } from 'next/server';
import { productsService, type ProductInput } from '@/services/products.service';

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  return value === 'true';
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
    active: Boolean(body.active),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') ?? undefined;
  const category = url.searchParams.get('category') ?? undefined;
  const active = parseBoolean(url.searchParams.get('active'));
  const page = Number(url.searchParams.get('page') ?? 1);
  const pageSize = Number(url.searchParams.get('pageSize') ?? 10);

  const result = await productsService.listPaginated({
    search,
    category,
    active,
    page,
    pageSize,
  });

  return NextResponse.json({
    ...result,
    categories: productsService.listCategories(),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const product = await productsService.create(toProductInput(body));
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create product.';
    return NextResponse.json({ message }, { status: 400 });
  }
}
