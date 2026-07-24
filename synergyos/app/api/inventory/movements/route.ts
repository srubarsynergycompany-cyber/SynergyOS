import { NextResponse } from 'next/server';
import {
  InventoryServiceError,
  inventoryService,
  isInventoryServiceError,
} from '@/services/inventory.service';

const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/;

function isValidIsoDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value) || !Number.isFinite(Date.parse(value))) {
    return false;
  }

  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  return calendarDate.getUTCFullYear() === year
    && calendarDate.getUTCMonth() === month - 1
    && calendarDate.getUTCDate() === day;
}

function parsePositiveInteger(
  value: string | null,
  fallback: number,
  field: 'page' | 'pageSize',
  maximum?: number,
) {
  if (value === null) {
    return fallback;
  }
  if (!/^\d+$/.test(value)) {
    throw new InventoryServiceError(`${field} must be a positive integer.`, 'VALIDATION');
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || (maximum !== undefined && parsed > maximum)) {
    throw new InventoryServiceError(
      maximum === undefined
        ? `${field} must be an integer greater than or equal to 1.`
        : `${field} must be an integer from 1 to ${maximum}.`,
      'VALIDATION',
    );
  }
  return parsed;
}

function parseIsoDate(value: string | null, field: 'from' | 'to') {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }
  if (!isValidIsoDate(normalized)) {
    throw new InventoryServiceError(`${field} must be a valid ISO date.`, 'VALIDATION');
  }
  return normalized;
}

function toErrorResponse(error: unknown) {
  if (isInventoryServiceError(error) && error.code === 'VALIDATION') {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Failed to load inventory movements.' }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parsePositiveInteger(url.searchParams.get('page'), 1, 'page');
    const pageSize = parsePositiveInteger(url.searchParams.get('pageSize'), 25, 'pageSize', 100);
    const from = parseIsoDate(url.searchParams.get('from'), 'from');
    const to = parseIsoDate(url.searchParams.get('to'), 'to');

    if (from && to && Date.parse(from) > Date.parse(to)) {
      throw new InventoryServiceError('from must not be after to.', 'VALIDATION');
    }

    const result = await inventoryService.listMovements({
      page,
      pageSize,
      sku: url.searchParams.get('sku') ?? undefined,
      product: url.searchParams.get('product') ?? undefined,
      location: url.searchParams.get('location') ?? undefined,
      from,
      to,
    });

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
