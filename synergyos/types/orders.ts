import type { Order as UiOrder } from '@/lib/orders/mockData';

export type OrderDtoStatus = 'new' | 'picking' | 'packed' | 'shipped' | 'delivered';

export type OrderDtoPriority = 'High' | 'Normal' | 'Low';

export type OrderDto = {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderDtoStatus;
  createdAt: string;
  priority: OrderDtoPriority;
  totalAmount: number;
  currency: string;
};

export type ServiceOrderLike = {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  createdAt: string;
  priority: string;
  totalAmount: number;
  currency: string;
};

function normalizeStatus(status: string): OrderDtoStatus {
  const normalized = status.trim().toLowerCase();

  if (normalized === 'new' || normalized === 'picking' || normalized === 'packed' || normalized === 'shipped' || normalized === 'delivered') {
    return normalized;
  }

  return 'new';
}

function normalizePriority(priority: string): OrderDtoPriority {
  if (priority === 'High' || priority === 'Normal' || priority === 'Low') {
    return priority;
  }

  return 'Normal';
}

function parseUiMoney(value: string): { amount: number; currency: string } {
  const trimmed = value.trim();
  const match = trimmed.match(/^([^\d-]*)\s*(-?\d+(?:[.,]\d+)?)\s*([A-Za-z]{3})?$/);

  if (!match) {
    return {
      amount: 0,
      currency: 'USD',
    };
  }

  const [, symbol, rawAmount, code] = match;
  const amount = Number(rawAmount.replace(',', '.'));
  const currency = code || (symbol.includes('$') ? 'USD' : 'USD');

  return {
    amount: Number.isFinite(amount) ? amount : 0,
    currency,
  };
}

function formatUiMoney(totalAmount: number, currency: string): string {
  if (!Number.isFinite(totalAmount)) {
    return '$0.00';
  }

  if (currency === 'USD') {
    return `$${totalAmount.toFixed(2)}`;
  }

  return `${totalAmount.toFixed(2)} ${currency}`;
}

export function mapServiceOrderToOrderDto(order: ServiceOrderLike): OrderDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    status: normalizeStatus(order.status),
    priority: normalizePriority(order.priority),
    createdAt: order.createdAt,
    totalAmount: order.totalAmount,
    currency: order.currency,
  };
}

export function mapOrderDtoToUiOrder(order: OrderDto): UiOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customer: order.customerId,
    company: order.customerId,
    phone: '',
    email: '',
    shop: 'SynergyOS',
    status: order.status,
    carrier: '-',
    createdAt: order.createdAt,
    updatedAt: order.createdAt,
    items: 0,
    total: formatUiMoney(order.totalAmount, order.currency),
    address: '',
    shippingAddress: '',
    billingAddress: '',
    priority: order.priority,
    notes: '',
    warehouseSlot: 'TBD',
    promiseDate: order.createdAt.split('T')[0] ?? order.createdAt,
    salesChannel: 'Shopify',
    paymentStatus: 'Pending',
    products: [],
  };
}

export function mapUiOrderToOrderDto(order: UiOrder, customerId = order.customer): OrderDto {
  const totals = parseUiMoney(order.total);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId,
    status: order.status,
    createdAt: order.createdAt,
    priority: order.priority,
    totalAmount: totals.amount,
    currency: totals.currency,
  };
}

export function mapMockOrderToOrderDto(order: UiOrder, customerId = order.customer): OrderDto {
  return mapUiOrderToOrderDto(order, customerId);
}