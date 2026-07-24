import { NextResponse } from 'next/server';
import {
  inventoryService,
  isInventoryServiceError,
} from '@/services/inventory.service';

function toErrorResponse(error: unknown, fallbackMessage: string) {
  if (isInventoryServiceError(error)) {
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

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const result = await inventoryService.adjust({
      inventoryId: typeof input.inventoryId === 'string' ? input.inventoryId : '',
      delta: typeof input.delta === 'number' ? input.delta : Number.NaN,
      reason: typeof input.reason === 'string' ? input.reason : '',
      requestId: typeof input.requestId === 'string' ? input.requestId : '',
      actorLabel: typeof input.actorLabel === 'string' ? input.actorLabel : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error, 'Failed to adjust inventory.');
  }
}
