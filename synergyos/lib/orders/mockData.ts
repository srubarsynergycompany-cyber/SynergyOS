// Mock fulfillment data prepared for future database-backed API integration.
export type OrderStatus = "new" | "picking" | "packed" | "shipped" | "delivered";

export type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  shop: string;
  status: OrderStatus;
  carrier: string;
  createdAt: string;
  updatedAt: string;
  items: number;
  total: string;
  address: string;
  priority: "High" | "Normal" | "Low";
  trackingNumber?: string;
  notes: string;
  warehouseSlot: string;
  promiseDate: string;
};

export const mockOrders: Order[] = [
  {
    id: "ord-1001",
    orderNumber: "ORD-1001",
    customer: "Northstar Studio",
    shop: "Northstar Commerce",
    status: "new",
    carrier: "PPL",
    createdAt: "2026-06-29T08:10:00Z",
    updatedAt: "2026-06-29T08:20:00Z",
    items: 3,
    total: "$128.90",
    address: "Prague, Czech Republic",
    priority: "High",
    notes: "Fragile items — handle with care.",
    warehouseSlot: "A-12",
    promiseDate: "2026-06-30",
  },
  {
    id: "ord-1002",
    orderNumber: "ORD-1002",
    customer: "Lumen Lab",
    shop: "Lumen Store",
    status: "picking",
    carrier: "DPD",
    createdAt: "2026-06-29T07:05:00Z",
    updatedAt: "2026-06-29T08:00:00Z",
    items: 1,
    total: "$54.20",
    address: "Brno, Czech Republic",
    priority: "Normal",
    notes: "Gift wrap requested.",
    warehouseSlot: "B-04",
    promiseDate: "2026-06-30",
  },
  {
    id: "ord-1003",
    orderNumber: "ORD-1003",
    customer: "Aero Goods",
    shop: "Aero Shop",
    status: "packed",
    carrier: "Zásilkovna",
    createdAt: "2026-06-28T18:45:00Z",
    updatedAt: "2026-06-29T06:40:00Z",
    items: 5,
    total: "$221.15",
    address: "Ostrava, Czech Republic",
    priority: "High",
    trackingNumber: "ZAS-4182",
    notes: "Ready for carrier handoff.",
    warehouseSlot: "C-09",
    promiseDate: "2026-06-30",
  },
  {
    id: "ord-1004",
    orderNumber: "ORD-1004",
    customer: "Mosaic House",
    shop: "Mosaic Living",
    status: "shipped",
    carrier: "Balíkovna",
    createdAt: "2026-06-28T15:20:00Z",
    updatedAt: "2026-06-29T05:10:00Z",
    items: 2,
    total: "$79.40",
    address: "Plzeň, Czech Republic",
    priority: "Normal",
    trackingNumber: "BAL-7713",
    notes: "Customer requested delivery before noon.",
    warehouseSlot: "D-02",
    promiseDate: "2026-06-29",
  },
  {
    id: "ord-1005",
    orderNumber: "ORD-1005",
    customer: "Perfektně uklizeno",
    shop: "Perfektně",
    status: "delivered",
    carrier: "PPL",
    createdAt: "2026-06-27T12:35:00Z",
    updatedAt: "2026-06-28T10:05:00Z",
    items: 4,
    total: "$165.60",
    address: "Liberec, Czech Republic",
    priority: "Low",
    trackingNumber: "PPL-3335",
    notes: "Delivered successfully.",
    warehouseSlot: "E-01",
    promiseDate: "2026-06-28",
  },
  {
    id: "ord-1006",
    orderNumber: "ORD-1006",
    customer: "Synergy client",
    shop: "Synergy Store",
    status: "picking",
    carrier: "DPD",
    createdAt: "2026-06-29T09:25:00Z",
    updatedAt: "2026-06-29T09:40:00Z",
    items: 6,
    total: "$302.90",
    address: "Pardubice, Czech Republic",
    priority: "High",
    notes: "Multiple units, same SKU.",
    warehouseSlot: "A-17",
    promiseDate: "2026-07-01",
  },
  {
    id: "ord-1007",
    orderNumber: "ORD-1007",
    customer: "Navelly",
    shop: "Navelly Market",
    status: "packed",
    carrier: "PPL",
    createdAt: "2026-06-29T10:50:00Z",
    updatedAt: "2026-06-29T11:10:00Z",
    items: 2,
    total: "$96.20",
    address: "Hradec Králové, Czech Republic",
    priority: "Normal",
    notes: "Barcode label reprinted.",
    warehouseSlot: "B-11",
    promiseDate: "2026-06-30",
  },
  {
    id: "ord-1008",
    orderNumber: "ORD-1008",
    customer: "Aqua Works",
    shop: "Aqua Works",
    status: "new",
    carrier: "Zásilkovna",
    createdAt: "2026-06-29T11:35:00Z",
    updatedAt: "2026-06-29T11:40:00Z",
    items: 8,
    total: "$412.55",
    address: "Olomouc, Czech Republic",
    priority: "High",
    notes: "High-volume order, check carton size.",
    warehouseSlot: "C-01",
    promiseDate: "2026-07-02",
  },
];
