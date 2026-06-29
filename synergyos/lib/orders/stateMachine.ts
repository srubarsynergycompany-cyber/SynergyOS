import type { Order, OrderStatus } from "@/lib/orders/mockData";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  new: ["picking"],
  picking: ["packed"],
  packed: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
};

export function canTransition(currentStatus: OrderStatus, nextStatus: OrderStatus) {
  return transitions[currentStatus].includes(nextStatus);
}

export function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  const [nextStatus] = transitions[currentStatus];
  return nextStatus ?? null;
}

export function transitionOrder(order: Order, nextStatus: OrderStatus): Order {
  if (!canTransition(order.status, nextStatus)) {
    return order;
  }

  const timestamp = new Date().toISOString();
  const nextOrder: Order = {
    ...order,
    status: nextStatus,
    updatedAt: timestamp,
  };

  if (nextStatus === "picking") {
    nextOrder.pickerName = "Warehouse Operator";
    nextOrder.pickedAt = timestamp;
  }

  if (nextStatus === "packed") {
    nextOrder.packedAt = timestamp;
  }

  if (nextStatus === "shipped") {
    nextOrder.shippedAt = timestamp;
  }

  return nextOrder;
}
