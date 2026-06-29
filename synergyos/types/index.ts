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
  name: string;
  category: string;
  price: number;
  currency: string;
  active: boolean;
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
