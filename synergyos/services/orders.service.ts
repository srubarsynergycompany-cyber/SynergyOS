import { prisma } from '@/lib/database/prisma';
import { mockOrders } from '@/services/mockData';
import type { Order } from '@/types';

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
    if (!prisma) {
      return mockOrders;
    }

    try {
      const rows = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return rows.map(mapDbOrder);
    } catch {
      return mockOrders;
    }
  },
};
