import { NextResponse } from 'next/server';
import {
  isProductServiceError,
  productsService,
} from '@/services/products.service';
import { toProductInput } from '@/app/api/products/input';

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
    const product = await productsService.update(productId, toProductInput(body));
    return NextResponse.json(product);
  } catch (error) {
    return toErrorResponse(error, 'Failed to update product.');
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await context.params;
    await productsService.remove(productId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error, 'Failed to delete product.');
  }
}
