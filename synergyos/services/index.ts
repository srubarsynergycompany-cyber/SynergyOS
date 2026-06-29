import { createMockProvider } from '@/services/provider';

const provider = createMockProvider();

export const orderService = {
  list: () => provider.getOrders(),
};

export const customerService = {
  list: () => provider.getCustomers(),
};

export const productService = {
  list: () => provider.getProducts(),
};

export const warehouseService = {
  listLocations: () => provider.getWarehouseLocations(),
};

export const shipmentService = {
  list: () => provider.getShipments(),
};

export const userService = {
  list: () => provider.getUsers(),
};

export const inventoryService = {
  list: () => provider.getInventory(),
};

export const dataProvider = provider;
