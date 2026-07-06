import { NextResponse } from 'next/server';
import { isOrderServiceError, ordersService } from '@/services/orders.service';

function toErrorResponse(error: unknown, fallbackMessage: string) {
  if (isOrderServiceError(error)) {
    const statusByCode = {
      VALIDATION: 400,
      NOT_FOUND: 404,
      DATA_ACCESS: 500,
    } as const;

    return NextResponse.json({ message: error.message }, { status: statusByCode[error.code] });
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json({ message }, { status: 500 });
}

export async function GET(_: Request, context: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await context.params;
    const order = await ordersService.getById(orderId);

    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return toErrorResponse(error, 'Failed to load order detail.');
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { nextStatus?: unknown };
    const nextStatus = typeof body.nextStatus === 'string' ? body.nextStatus : undefined;

    const updated = await ordersService.transitionStatus(orderId, nextStatus);
    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error, 'Failed to update order status.');
  }
}
