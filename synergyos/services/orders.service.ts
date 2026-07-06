import { prisma } from '@/lib/database/prisma';
import { canTransition, getNextStatus } from '@/lib/orders/stateMachine';
import { mockOrders } from '@/services/mockData';
import type { Order } from '@/types';

type OrderStatus = Parameters<typeof canTransition>[0];
type OrderServiceErrorCode = 'VALIDATION' | 'NOT_FOUND' | 'DATA_ACCESS';

const ORDER_STATUSES: ReadonlyArray<OrderStatus> = ['new', 'picking', 'packed', 'shipped', 'delivered'];

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

let mockOrdersStore: Order[] = [...mockOrders];

function shouldUseMockDataSource() {
  return !prisma;
}

function getDbClient() {
  if (!prisma) {
    throw new OrderServiceError('Database client is not available.', 'DATA_ACCESS');
  }

  return prisma;
}

function parseOrderStatus(value: string): OrderStatus | null {
  const normalized = value.trim().toLowerCase();
  if (ORDER_STATUSES.includes(normalized as OrderStatus)) {
    return normalized as OrderStatus;
  }

  return null;
}

function toKnownOrderServiceError(error: unknown): OrderServiceError {
  if (isOrderServiceError(error)) {
    return error;
  }

  const candidate = error as { code?: string; message?: string };
  if (candidate?.code === 'P2025') {
    return new OrderServiceError('Order not found.', 'NOT_FOUND');
  }

  return new OrderServiceError(candidate?.message ?? 'Unexpected order data error.', 'DATA_ACCESS');
}

function isDatabaseUnavailableError(error: unknown): boolean {
  const candidate = error as { code?: string; message?: string };
  const message = String(candidate?.message ?? '').toLowerCase();
  const dbUnavailableCodes = new Set(['P1000', 'P1001', 'P1002', 'P1017']);

  if (candidate?.code && dbUnavailableCodes.has(candidate.code)) {
    return true;
  }

  return (
    message.includes('can\'t reach database server')
    || message.includes('connection refused')
    || message.includes('econnrefused')
    || message.includes('database client is not available')
  );
}

function findMockOrderById(orderId: string): Order | null {
  const normalizedOrderId = orderId.trim().toLowerCase();
  const match = mockOrdersStore.find(
    (order) => order.id.toLowerCase() === normalizedOrderId || order.orderNumber.toLowerCase() === normalizedOrderId,
  );

  return match ?? null;
}

function transitionMockOrder(orderId: string, nextStatus: OrderStatus): Order {
  const normalizedOrderId = orderId.trim().toLowerCase();
  let found = false;

  mockOrdersStore = mockOrdersStore.map((item) => {
    if (item.id.toLowerCase() !== normalizedOrderId && item.orderNumber.toLowerCase() !== normalizedOrderId) {
      return item;
    }

    found = true;
    return {
      ...item,
      status: nextStatus,
      createdAt: item.createdAt,
    };
  });

  if (!found) {
    throw new OrderServiceError('Order not found.', 'NOT_FOUND');
  }

  const updated = findMockOrderById(orderId);
  if (!updated) {
    throw new OrderServiceError('Order not found.', 'NOT_FOUND');
  }

  return updated;
}

function mapDbOrder(row: {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  createdAt: Date;
  priority: string | null;
  totalAmount: unknown;
  currency: string;
}): Order {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    customerId: row.customerId,
    status: row.status,
    createdAt: row.createdAt.toISOString().slice(0, 10),
    priority: row.priority ?? 'Normal',
    totalAmount: Number(row.totalAmount),
    currency: row.currency,
  };
}

export const ordersService = {
  async list(): Promise<Order[]> {
    if (shouldUseMockDataSource()) {
      return [...mockOrdersStore];
    }

    const db = getDbClient();

    try {
      const rows = await db.order.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return rows.map(mapDbOrder);
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        return [...mockOrdersStore];
      }

      throw toKnownOrderServiceError(error);
    }
  },

  async getById(orderId: string): Promise<Order | null> {
    if (shouldUseMockDataSource()) {
      return findMockOrderById(orderId);
    }

    const db = getDbClient();

    try {
      const row = await db.order.findFirst({
        where: {
          OR: [
            { id: orderId },
            { orderNumber: orderId },
          ],
        },
      });

      return row ? mapDbOrder(row) : null;
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        return findMockOrderById(orderId);
      }

      throw toKnownOrderServiceError(error);
    }
  },

  async transitionStatus(orderId: string, requestedNextStatus?: string): Promise<Order> {
    const order = await this.getById(orderId);
    if (!order) {
      throw new OrderServiceError('Order not found.', 'NOT_FOUND');
    }

    const currentStatus = parseOrderStatus(order.status);
    if (!currentStatus) {
      throw new OrderServiceError(`Unsupported current status: ${order.status}`, 'VALIDATION');
    }

    const nextStatus = requestedNextStatus
      ? parseOrderStatus(requestedNextStatus)
      : getNextStatus(currentStatus);

    if (!nextStatus) {
      throw new OrderServiceError('Next status is required or no valid transition is available.', 'VALIDATION');
    }

    if (!canTransition(currentStatus, nextStatus)) {
      throw new OrderServiceError(`Transition ${currentStatus} -> ${nextStatus} is not allowed.`, 'VALIDATION');
    }

    if (shouldUseMockDataSource()) {
      return transitionMockOrder(orderId, nextStatus);
    }

    const db = getDbClient();

    try {
      const target = await db.order.findFirst({
        where: {
          OR: [
            { id: orderId },
            { orderNumber: orderId },
          ],
        },
        select: { id: true },
      });

      if (!target) {
        throw new OrderServiceError('Order not found.', 'NOT_FOUND');
      }

      const row = await db.order.update({
        where: { id: target.id },
        data: { status: nextStatus },
      });

      return mapDbOrder(row);
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        return transitionMockOrder(orderId, nextStatus);
      }

      throw toKnownOrderServiceError(error);
    }
  },
};
