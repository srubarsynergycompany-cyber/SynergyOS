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

export async function GET() {
  try {
    const inventory = await inventoryService.list();
    return NextResponse.json({ items: inventory, total: inventory.length });
  } catch (error) {
    return toErrorResponse(error, 'Failed to load inventory.');
  }
}
