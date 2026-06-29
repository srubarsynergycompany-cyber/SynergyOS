import type { Customer, InventoryItem, Order, Product, Shipment, User, WarehouseLocation } from '@/types';
import {
  mockCustomers,
  mockInventory,
  mockOrders,
  mockProducts,
  mockShipments,
  mockUsers,
  mockWarehouseLocations,
} from '@/services/mockData';

export type DataProvider = {
  getOrders: () => Promise<Order[]>;
  getCustomers: () => Promise<Customer[]>;
  getProducts: () => Promise<Product[]>;
  getWarehouseLocations: () => Promise<WarehouseLocation[]>;
  getShipments: () => Promise<Shipment[]>;
  getUsers: () => Promise<User[]>;
  getInventory: () => Promise<InventoryItem[]>;
};

const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

export function createMockProvider(): DataProvider {
  return {
    async getOrders() {
      await delay();
      return mockOrders;
    },
    async getCustomers() {
      await delay();
      return mockCustomers;
    },
    async getProducts() {
      await delay();
      return mockProducts;
    },
    async getWarehouseLocations() {
      await delay();
      return mockWarehouseLocations;
    },
    async getShipments() {
      await delay();
      return mockShipments;
    },
    async getUsers() {
      await delay();
      return mockUsers;
    },
    async getInventory() {
      await delay();
      return mockInventory;
    },
  };
}
