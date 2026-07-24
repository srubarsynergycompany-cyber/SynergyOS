export * from './orders';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  createdAt: string;
  priority: string;
  totalAmount: number;
  currency: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  address: string;
}

export interface Product {
  id: string;
  sku: string;
  eanBarcode: string;
  name: string;
  description: string;
  customerId: string;
  customerName: string;
  category: string;
  weight: number;
  width: number;
  height: number;
  length: number;
  minimumStock: number;
  currentStock: number;
  unit: string;
  price: number;
  currency: string;
  active: boolean;
  warehousePositions?: string[];
  batches?: string[];
  expirationDates?: string[];
  images?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseLocation {
  id: string;
  code: string;
  zone: string;
  capacity: number;
  used: number;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status: string;
  shippedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  locationCode: string;
  quantity: number;
  reserved: number;
  available: number;
  minimumStock: number;
  status: string;
}

export interface InventoryMovementItem {
  id: string;
  requestId: string;
  inventoryId: string | null;
  productId: string | null;
  sku: string;
  productName: string;
  locationCode: string;
  delta: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  actorLabel: string | null;
  createdAt: string;
}

export interface InventoryMovementsResponse {
  items: InventoryMovementItem[];
  total: number;
  page: number;
  pageSize: number;
}
