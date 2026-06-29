import type { Customer, InventoryItem, Order, Product, Shipment, User, WarehouseLocation } from '@/types';

export const mockOrders: Order[] = [
  {
    id: 'ORD-1001',
    orderNumber: 'ORD-1001',
    customerId: 'C-1001',
    status: 'Packed',
    createdAt: '2026-06-26',
    priority: 'High',
    totalAmount: 249.9,
    currency: 'USD',
  },
  {
    id: 'ORD-1002',
    orderNumber: 'ORD-1002',
    customerId: 'C-1002',
    status: 'In transit',
    createdAt: '2026-06-27',
    priority: 'Medium',
    totalAmount: 89,
    currency: 'USD',
  },
];

export const mockCustomers: Customer[] = [
  {
    id: 'C-1001',
    name: 'Northstar Studio',
    email: 'ops@northstar.com',
    phone: '+1 555 0101',
    tier: 'Platinum',
    address: '12 Sunset Ave',
  },
];

export const mockProducts: Product[] = [
  {
    id: 'P-1001',
    sku: 'SKU-1001',
    eanBarcode: '8591234567001',
    name: 'Eco Tote Bag',
    description: 'Recycled cotton tote bag with reinforced handles.',
    customerId: 'C-1001',
    customerName: 'Northstar Studio',
    category: 'Accessories',
    weight: 0.35,
    width: 36,
    height: 42,
    length: 4,
    minimumStock: 20,
    currentStock: 48,
    unit: 'pcs',
    price: 24.9,
    currency: 'USD',
    active: true,
    warehousePositions: ['A-12-03', 'A-12-04'],
    batches: ['B-101', 'B-102'],
    expirationDates: [],
    images: [],
    attachments: [],
    createdAt: '2026-06-05T08:00:00.000Z',
    updatedAt: '2026-06-27T12:15:00.000Z',
  },
  {
    id: 'P-1002',
    sku: 'SKU-1002',
    eanBarcode: '8591234567002',
    name: 'Ceramic Mug',
    description: 'Stoneware ceramic mug in matte finish.',
    customerId: 'C-1001',
    customerName: 'Northstar Studio',
    category: 'Home',
    weight: 0.48,
    width: 9,
    height: 10,
    length: 9,
    minimumStock: 15,
    currentStock: 12,
    unit: 'pcs',
    price: 19.5,
    currency: 'USD',
    active: true,
    warehousePositions: ['B-04-01'],
    batches: ['B-205'],
    expirationDates: [],
    images: [],
    attachments: [],
    createdAt: '2026-06-07T09:20:00.000Z',
    updatedAt: '2026-06-27T13:10:00.000Z',
  },
];

export const mockWarehouseLocations: WarehouseLocation[] = [
  {
    id: 'W-1',
    code: 'A-12-03',
    zone: 'A',
    capacity: 300,
    used: 180,
  },
];

export const mockShipments: Shipment[] = [
  {
    id: 'S-1001',
    orderId: 'ORD-1001',
    carrier: 'PPL',
    trackingNumber: 'PPL123456',
    status: 'In transit',
    shippedAt: '2026-06-27',
  },
];

export const mockUsers: User[] = [
  {
    id: 'U-1',
    name: 'Jane Smith',
    email: 'jane@synergyos.com',
    role: 'Warehouse Lead',
    avatarInitials: 'JS',
  },
];

export const mockInventory: InventoryItem[] = [
  {
    id: 'INV-1',
    sku: 'SKU-1001',
    productName: 'Eco Tote Bag',
    locationCode: 'A-12-03',
    quantity: 48,
    reserved: 8,
    available: 40,
    minimumStock: 20,
    status: 'In stock',
  },
];
