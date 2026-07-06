import {
  countingTasks,
  receivingTasks,
  replenishmentTasks,
  transferTasks,
  warehouseDashboardMetrics,
  type CountingTask,
  type ReceivingTask,
  type ReplenishmentTask,
  type TransferTask,
} from '@/lib/warehouse/mockData';

type WarehouseDashboardMetric = {
  title: string;
  value: string;
  detail: string;
};

function cloneList<T extends object>(items: T[]): T[] {
  return items.map((item) => ({ ...item }));
}

export const warehouseService = {
  listDashboardMetrics(): WarehouseDashboardMetric[] {
    return cloneList(warehouseDashboardMetrics);
  },

  listReceivingTasks(): ReceivingTask[] {
    return cloneList(receivingTasks);
  },

  listTransferTasks(): TransferTask[] {
    return cloneList(transferTasks);
  },

  listReplenishmentTasks(): ReplenishmentTask[] {
    return cloneList(replenishmentTasks);
  },

  listCountingTasks(): CountingTask[] {
    return cloneList(countingTasks);
  },
};