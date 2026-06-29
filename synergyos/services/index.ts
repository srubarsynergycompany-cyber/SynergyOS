import { customersService } from '@/services/customers.service';
import { inventoryService as inventoryDbService } from '@/services/inventory.service';
import { ordersService } from '@/services/orders.service';
import { productsService } from '@/services/products.service';
import { createMockProvider } from '@/services/provider';

const provider = createMockProvider();

export const orderService = {
  list: () => ordersService.list(),
};

export const customerService = {
  list: () => customersService.list(),
};

export const productService = {
  list: () => productsService.list(),
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
  list: () => inventoryDbService.list(),
};

export const dataProvider = provider;
