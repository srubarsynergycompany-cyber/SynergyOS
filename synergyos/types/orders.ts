export type OrderDtoStatus = 'new' | 'picking' | 'packed' | 'shipped' | 'delivered';

export type OrderDtoPriority = 'High' | 'Normal' | 'Low';

export type OrderDtoSalesChannel = 'Shopify' | 'Shoptet';

export type OrderDtoPaymentStatus = 'Paid' | 'Pending' | 'Awaiting';

export interface OrderDtoMoney {
  amount: number;
  currency: string;
  formatted?: string;
}

export interface OrderDtoCustomer {
  id?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface OrderDtoProduct {
  sku: string;
  name: string;
  quantity: number;
  location?: string;
  inStock?: boolean;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: OrderDtoStatus;
  priority: OrderDtoPriority;
  createdAt: string;
  updatedAt?: string;
  customer: OrderDtoCustomer;
  totals: OrderDtoMoney;
  itemCount?: number;
  carrier?: string;
  promiseDate?: string;
  salesChannel?: OrderDtoSalesChannel;
  paymentStatus?: OrderDtoPaymentStatus;
  trackingNumber?: string;
  notes?: string;
  warehouseSlot?: string;
  address?: string;
  shippingAddress?: string;
  billingAddress?: string;
  products: OrderDtoProduct[];
}

export interface LegacyServiceOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  createdAt: string;
  priority: string;
  totalAmount: number;
  currency: string;
}

export interface LegacyMockOrderProduct {
  sku: string;
  name: string;
  quantity: number;
  location: string;
  inStock: boolean;
}

export interface LegacyMockOrder {
  id: string;
  orderNumber: string;
  customer: string;
  company: string;
  phone: string;
  email: string;
  shop: string;
  status: OrderDtoStatus;
  carrier: string;
  createdAt: string;
  updatedAt: string;
  items: number;
  total: string;
  address: string;
  shippingAddress: string;
  billingAddress: string;
  priority: OrderDtoPriority;
  trackingNumber?: string;
  notes: string;
  warehouseSlot: string;
  promiseDate: string;
  salesChannel: OrderDtoSalesChannel;
  paymentStatus: OrderDtoPaymentStatus;
  pickerName?: string;
  pickedAt?: string;
  packedAt?: string;
  shippedAt?: string;
  products: LegacyMockOrderProduct[];
}

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

function parseLegacyMoney(value: string): OrderDtoMoney {
  const trimmed = value.trim();
  const match = trimmed.match(/^([^\d-]*)\s*(-?\d+(?:[.,]\d+)?)\s*([A-Za-z]{3})?$/);

  if (!match) {
    return {
      amount: 0,
      currency: 'USD',
      formatted: trimmed,
    };
  }

  const [, symbol, rawAmount, code] = match;
  const amount = Number(rawAmount.replace(',', '.'));
  const currency = code || (symbol.includes('$') ? 'USD' : 'USD');

  return {
    amount: Number.isFinite(amount) ? amount : 0,
    currency,
    formatted: trimmed,
  };
}

export function mapServiceOrderToOrderDto(order: LegacyServiceOrder): OrderDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: normalizeStatus(order.status),
    priority: normalizePriority(order.priority),
    createdAt: order.createdAt,
    customer: {
      id: order.customerId,
    },
    totals: {
      amount: order.totalAmount,
      currency: order.currency,
    },
    products: [],
  };
}

export function mapMockOrderToOrderDto(order: LegacyMockOrder): OrderDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    priority: order.priority,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customer: {
      name: order.customer,
      company: order.company,
      email: order.email,
      phone: order.phone,
    },
    totals: parseLegacyMoney(order.total),
    itemCount: order.items,
    carrier: order.carrier,
    promiseDate: order.promiseDate,
    salesChannel: order.salesChannel,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber,
    notes: order.notes,
    warehouseSlot: order.warehouseSlot,
    address: order.address,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    products: order.products.map((product) => ({
      sku: product.sku,
      name: product.name,
      quantity: product.quantity,
      location: product.location,
      inStock: product.inStock,
    })),
  };
}