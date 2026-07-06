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

export async function GET() {
  try {
    const orders = await ordersService.list();
    return NextResponse.json({ items: orders, total: orders.length });
  } catch (error) {
    return toErrorResponse(error, 'Failed to load orders.');
  }
}
