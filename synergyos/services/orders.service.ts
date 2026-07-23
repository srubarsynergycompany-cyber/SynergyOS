import { getSupabaseServer } from '@/lib/supabase-server';
import { canTransition, getNextStatus } from '@/lib/orders/stateMachine';
import type { Order, OrderStatus } from '@/lib/orders/mockData';

type OrderServiceErrorCode = 'VALIDATION' | 'NOT_FOUND' | 'DATA_ACCESS';
type OrderPriority = Order['priority'];
type PaymentStatus = Order['paymentStatus'];
type SalesChannel = Order['salesChannel'];

type OrderItemRow = {
  id: string;
  order_id: string;
  sku: string | null;
  name: string | null;
  quantity: number | null;
  warehouse_location: string | null;
  in_stock: boolean | null;
};

type OrderRow = {
  id: string | null;
  external_id: string | null;
  client_id: string | null;
  status: string | null;
  carrier: string | null;
  priority: string | null;
  total_items: number | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_company: string | null;
  total_amount: number | string | null;
  currency: string | null;
  payment_status: string | null;
  sales_channel: string | null;
  tracking_number: string | null;
  shipping_address: string | null;
  billing_address: string | null;
  notes: string | null;
  warehouse_slot: string | null;
  promise_date: string | null;
  shipped_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const ORDER_STATUSES: readonly OrderStatus[] = ['new', 'picking', 'packed', 'shipped', 'delivered'];
const ORDER_PRIORITIES: readonly OrderPriority[] = ['High', 'Normal', 'Low'];
const PAYMENT_STATUSES: readonly PaymentStatus[] = ['Paid', 'Pending', 'Awaiting'];
const SALES_CHANNELS: readonly SalesChannel[] = ['Shopify', 'Shoptet'];

export class OrderServiceError extends Error {
  code: OrderServiceErrorCode;

  constructor(message: string, code: OrderServiceErrorCode) {
    super(message);
    this.name = 'OrderServiceError';
    this.code = code;
  }
}

export function isOrderServiceError(error: unknown): error is OrderServiceError {
  return error instanceof OrderServiceError;
}

function toDataAccessError(error: unknown): OrderServiceError {
  if (isOrderServiceError(error)) {
    return error;
  }

  const message = error instanceof Error ? error.message : 'Unexpected order data error.';
  return new OrderServiceError(message, 'DATA_ACCESS');
}

function normalizeString(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

function normalizeStatus(value: string | null | undefined): OrderStatus {
  const normalized = normalizeString(value, 'new').toLowerCase();
  if (ORDER_STATUSES.includes(normalized as OrderStatus)) {
    return normalized as OrderStatus;
  }

  return 'new';
}

function normalizePriority(value: string | null | undefined): OrderPriority {
  if (ORDER_PRIORITIES.includes(value as OrderPriority)) {
    return value as OrderPriority;
  }

  return 'Normal';
}

function normalizePaymentStatus(value: string | null | undefined): PaymentStatus {
  if (PAYMENT_STATUSES.includes(value as PaymentStatus)) {
    return value as PaymentStatus;
  }

  return 'Pending';
}

function normalizeSalesChannel(value: string | null | undefined): SalesChannel {
  if (SALES_CHANNELS.includes(value as SalesChannel)) {
    return value as SalesChannel;
  }

  return 'Shopify';
}

function normalizeAmount(value: number | string | null): number {
  const amount = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeItemCount(value: number | null, products: Order['products']): number {
  if (Number.isFinite(value) && value !== null) {
    return value;
  }

  return products.reduce((total, product) => total + product.quantity, 0);
}

function formatTotal(amount: number, currency: string): string {
  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`;
  }

  return `${amount.toFixed(2)} ${currency}`;
}

function toOrderProducts(items: OrderItemRow[]): Order['products'] {
  return items.map((item) => ({
    sku: normalizeString(item.sku, 'UNKNOWN-SKU'),
    name: normalizeString(item.name, 'Unknown product'),
    quantity: Number.isFinite(item.quantity) && item.quantity !== null ? item.quantity : 0,
    location: normalizeString(item.warehouse_location, 'UNASSIGNED'),
    inStock: item.in_stock ?? false,
    image: '',
  }));
}

function mapOrderRow(row: OrderRow, items: OrderItemRow[] = []): Order {
  const nowIso = new Date().toISOString();
  const createdAt = normalizeString(row.created_at, nowIso);
  const updatedAt = normalizeString(row.updated_at, createdAt);
  const customerName = normalizeString(row.customer_name, normalizeString(row.client_id, 'Unknown customer'));
  const company = normalizeString(row.customer_company, customerName);
  const currency = normalizeString(row.currency, 'USD').toUpperCase();
  const totalAmount = normalizeAmount(row.total_amount);
  const products = toOrderProducts(items);

  return {
    id: normalizeString(row.id, normalizeString(row.external_id, 'unknown-order')),
    orderNumber: normalizeString(row.external_id, 'Unknown order'),
    customer: customerName,
    company,
    phone: normalizeString(row.customer_phone, ''),
    email: normalizeString(row.customer_email, ''),
    shop: normalizeSalesChannel(row.sales_channel),
    status: normalizeStatus(row.status),
    carrier: normalizeString(row.carrier, '-'),
    createdAt,
    updatedAt,
    items: normalizeItemCount(row.total_items, products),
    total: formatTotal(totalAmount, currency),
    address: normalizeString(row.shipping_address, ''),
    shippingAddress: normalizeString(row.shipping_address, ''),
    billingAddress: normalizeString(row.billing_address, ''),
    priority: normalizePriority(row.priority),
    trackingNumber: normalizeString(row.tracking_number, ''),
    notes: normalizeString(row.notes, ''),
    warehouseSlot: normalizeString(row.warehouse_slot, 'TBD'),
    promiseDate: normalizeString(row.promise_date, createdAt.split('T')[0] ?? createdAt),
    salesChannel: normalizeSalesChannel(row.sales_channel),
    paymentStatus: normalizePaymentStatus(row.payment_status),
    shippedAt: row.shipped_at ?? undefined,
    products,
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function loadItemsByOrderId(orderIds: string[]) {
  if (orderIds.length === 0) {
    return new Map<string, OrderItemRow[]>();
  }

  const { data, error } = await getSupabaseServer()
    .from('order_items')
    .select('id, order_id, sku, name, quantity, warehouse_location, in_stock')
    .in('order_id', orderIds);

  if (error) {
    throw new OrderServiceError(error.message, 'DATA_ACCESS');
  }

  const grouped = new Map<string, OrderItemRow[]>();
  for (const item of (data ?? []) as OrderItemRow[]) {
    const list = grouped.get(item.order_id) ?? [];
    list.push(item);
    grouped.set(item.order_id, list);
  }

  return grouped;
}

export const ordersService = {
  async list(): Promise<Order[]> {
    try {
      const { data, error } = await getSupabaseServer()
        .from('orders')
        .select(
          [
            'id',
            'external_id',
            'client_id',
            'status',
            'carrier',
            'priority',
            'total_items',
            'customer_name',
            'customer_email',
            'customer_phone',
            'customer_company',
            'total_amount',
            'currency',
            'payment_status',
            'sales_channel',
            'tracking_number',
            'shipping_address',
            'billing_address',
            'notes',
            'warehouse_slot',
            'promise_date',
            'shipped_at',
            'created_at',
            'updated_at',
          ].join(', '),
        )
        .order('created_at', { ascending: false });

      if (error) {
        throw new OrderServiceError(error.message, 'DATA_ACCESS');
      }

      const rows = (data ?? []) as OrderRow[];
      const itemMap = await loadItemsByOrderId(rows.map((row) => normalizeString(row.id, '')));
      return rows.map((row) => mapOrderRow(row, itemMap.get(normalizeString(row.id, ''))));
    } catch (error) {
      throw toDataAccessError(error);
    }
  },

  async getById(orderId: string): Promise<Order | null> {
    const normalizedOrderId = orderId.trim();
    if (!normalizedOrderId) {
      throw new OrderServiceError('Order id is required.', 'VALIDATION');
    }

    try {
      let query = getSupabaseServer()
        .from('orders')
        .select(
          [
            'id',
            'external_id',
            'client_id',
            'status',
            'carrier',
            'priority',
            'total_items',
            'customer_name',
            'customer_email',
            'customer_phone',
            'customer_company',
            'total_amount',
            'currency',
            'payment_status',
            'sales_channel',
            'tracking_number',
            'shipping_address',
            'billing_address',
            'notes',
            'warehouse_slot',
            'promise_date',
            'shipped_at',
            'created_at',
            'updated_at',
          ].join(', '),
        );

      query = isUuid(normalizedOrderId)
        ? query.or(`id.eq.${normalizedOrderId},external_id.eq.${normalizedOrderId}`)
        : query.eq('external_id', normalizedOrderId);

      const { data, error } = await query.maybeSingle();

      if (error) {
        throw new OrderServiceError(error.message, 'DATA_ACCESS');
      }
      if (!data) {
        return null;
      }

      const row = data as OrderRow;
      const itemMap = await loadItemsByOrderId([normalizeString(row.id, '')]);
      return mapOrderRow(row, itemMap.get(normalizeString(row.id, '')));
    } catch (error) {
      throw toDataAccessError(error);
    }
  },

  async transitionStatus(orderId: string, requestedNextStatus?: string): Promise<Order> {
    const order = await this.getById(orderId);
    if (!order) {
      throw new OrderServiceError('Order not found.', 'NOT_FOUND');
    }

    const nextStatus = requestedNextStatus
      ? normalizeStatus(requestedNextStatus)
      : getNextStatus(order.status);

    if (!nextStatus) {
      throw new OrderServiceError('Next status is required or no valid transition is available.', 'VALIDATION');
    }
    if (!canTransition(order.status, nextStatus)) {
      throw new OrderServiceError(`Transition ${order.status} -> ${nextStatus} is not allowed.`, 'VALIDATION');
    }

    try {
      const timestamp = new Date().toISOString();
      const { error } = await getSupabaseServer()
        .from('orders')
        .update({
          status: nextStatus,
          updated_at: timestamp,
          ...(nextStatus === 'shipped' ? { shipped_at: timestamp } : {}),
        })
        .eq('id', order.id);

      if (error) {
        throw new OrderServiceError(error.message, 'DATA_ACCESS');
      }

      const updated = await this.getById(order.id);
      if (!updated) {
        throw new OrderServiceError('Order not found.', 'NOT_FOUND');
      }

      return updated;
    } catch (error) {
      throw toDataAccessError(error);
    }
  },
};
