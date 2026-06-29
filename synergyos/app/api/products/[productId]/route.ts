import { NextResponse } from 'next/server';
import { productsService, type ProductInput } from '@/services/products.service';

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

export async function GET(_: Request, context: { params: Promise<{ productId: string }> }) {
  const { productId } = await context.params;
  const product = await productsService.getById(productId);

  if (!product) {
    return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: Request, context: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const product = await productsService.update(productId, toProductInput(body));
    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update product.';
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await context.params;
    await productsService.remove(productId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete product.';
    return NextResponse.json({ message }, { status: 400 });
  }
}
