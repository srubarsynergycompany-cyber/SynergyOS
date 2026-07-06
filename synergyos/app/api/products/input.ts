import type { ProductInput } from '@/services/products.service';

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

export function toProductInput(body: Record<string, unknown>): ProductInput {
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