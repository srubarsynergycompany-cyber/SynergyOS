// Mock fulfillment data prepared for future database-backed API integration.
export type OrderStatus = "new" | "picking" | "packed" | "shipped" | "delivered";

export type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  company: string;
  phone: string;
  email: string;
  shop: string;
  status: OrderStatus;
  carrier: string;
  createdAt: string;
  updatedAt: string;
  items: number;
  total: string;
  address: string;
  shippingAddress: string;
  billingAddress: string;
  priority: "High" | "Normal" | "Low";
  trackingNumber?: string;
  notes: string;
  warehouseSlot: string;
  promiseDate: string;
  salesChannel: "Shopify" | "Shoptet";
  paymentStatus: "Paid" | "Pending" | "Awaiting";
  pickerName?: string;
  pickedAt?: string;
  packedAt?: string;
  shippedAt?: string;
  products: Array<{
    sku: string;
    name: string;
    quantity: number;
    location: string;
    inStock: boolean;
    image: string;
  }>;
};

export const mockOrders: Order[] = [
  {
    id: "ord-1001",
    orderNumber: "ORD-1001",
    customer: "Northstar Studio",
    company: "Northstar Studio s.r.o.",
    phone: "+420 777 123 456",
    email: "ops@northstar.example",
    shop: "Northstar Commerce",
    status: "new",
    carrier: "PPL",
    createdAt: "2026-06-29T08:10:00Z",
    updatedAt: "2026-06-29T08:20:00Z",
    items: 3,
    total: "$128.90",
    address: "Prague, Czech Republic",
    shippingAddress: "Karlova 12, 110 00 Prague 1",
    billingAddress: "Karlova 12, 110 00 Prague 1",
    priority: "High",
    notes: "Fragile items — handle with care.",
    warehouseSlot: "A-12",
    promiseDate: "2026-06-30",
    salesChannel: "Shopify",
    paymentStatus: "Paid",
    products: [
      { sku: "SKU-1001", name: "Eco Tote Bag", quantity: 2, location: "A-12-02", inStock: true, image: "👜" },
      { sku: "SKU-1002", name: "Ceramic Mug", quantity: 1, location: "A-12-05", inStock: true, image: "☕" },
    ],
  },
  {
    id: "ord-1002",
    orderNumber: "ORD-1002",
    customer: "Lumen Lab",
    company: "Lumen Lab s.r.o.",
    phone: "+420 731 444 221",
    email: "warehouse@lumen.example",
    shop: "Lumen Store",
    status: "picking",
    carrier: "DPD",
    createdAt: "2026-06-29T07:05:00Z",
    updatedAt: "2026-06-29T08:00:00Z",
    items: 1,
    total: "$54.20",
    address: "Brno, Czech Republic",
    shippingAddress: "Cejl 15, 602 00 Brno",
    billingAddress: "Cejl 15, 602 00 Brno",
    priority: "Normal",
    notes: "Gift wrap requested.",
    warehouseSlot: "B-04",
    promiseDate: "2026-06-30",
    salesChannel: "Shoptet",
    paymentStatus: "Pending",
    products: [
      { sku: "SKU-2010", name: "Minimal Desk Lamp", quantity: 1, location: "B-04-01", inStock: true, image: "💡" },
    ],
  },
  {
    id: "ord-1003",
    orderNumber: "ORD-1003",
    customer: "Aero Goods",
    company: "Aero Goods a.s.",
    phone: "+420 602 111 789",
    email: "fulfillment@aero.example",
    shop: "Aero Shop",
    status: "packed",
    carrier: "Zásilkovna",
    createdAt: "2026-06-28T18:45:00Z",
    updatedAt: "2026-06-29T06:40:00Z",
    items: 5,
    total: "$221.15",
    address: "Ostrava, Czech Republic",
    shippingAddress: "Masarykova 88, 700 30 Ostrava",
    billingAddress: "Masarykova 88, 700 30 Ostrava",
    priority: "High",
    trackingNumber: "ZAS-4182",
    notes: "Ready for carrier handoff.",
    warehouseSlot: "C-09",
    promiseDate: "2026-06-30",
    salesChannel: "Shopify",
    paymentStatus: "Paid",
    products: [
      { sku: "SKU-3001", name: "Travel Backpack", quantity: 3, location: "C-09-03", inStock: true, image: "🎒" },
      { sku: "SKU-3002", name: "Bottle Set", quantity: 2, location: "C-09-08", inStock: false, image: "🧴" },
    ],
  },
  {
    id: "ord-1004",
    orderNumber: "ORD-1004",
    customer: "Mosaic House",
    company: "Mosaic House Ltd.",
    phone: "+420 776 221 334",
    email: "support@mosaic.example",
    shop: "Mosaic Living",
    status: "shipped",
    carrier: "Balíkovna",
    createdAt: "2026-06-28T15:20:00Z",
    updatedAt: "2026-06-29T05:10:00Z",
    items: 2,
    total: "$79.40",
    address: "Plzeň, Czech Republic",
    shippingAddress: "Náměstí Republiky 8, 301 00 Plzeň",
    billingAddress: "Náměstí Republiky 8, 301 00 Plzeň",
    priority: "Normal",
    trackingNumber: "BAL-7713",
    notes: "Customer requested delivery before noon.",
    warehouseSlot: "D-02",
    promiseDate: "2026-06-29",
    salesChannel: "Shoptet",
    paymentStatus: "Paid",
    products: [
      { sku: "SKU-4010", name: "Folded Chair", quantity: 2, location: "D-02-01", inStock: true, image: "🪑" },
    ],
  },
  {
    id: "ord-1005",
    orderNumber: "ORD-1005",
    customer: "Perfektně uklizeno",
    company: "Perfektně uklizeno s.r.o.",
    phone: "+420 603 115 008",
    email: "ops@perfektně.example",
    shop: "Perfektně",
    status: "delivered",
    carrier: "PPL",
    createdAt: "2026-06-27T12:35:00Z",
    updatedAt: "2026-06-28T10:05:00Z",
    items: 4,
    total: "$165.60",
    address: "Liberec, Czech Republic",
    shippingAddress: "Moskevská 21, 460 01 Liberec",
    billingAddress: "Moskevská 21, 460 01 Liberec",
    priority: "Low",
    trackingNumber: "PPL-3335",
    notes: "Delivered successfully.",
    warehouseSlot: "E-01",
    promiseDate: "2026-06-28",
    salesChannel: "Shopify",
    paymentStatus: "Paid",
    products: [
      { sku: "SKU-5005", name: "Storage Bin", quantity: 4, location: "E-01-07", inStock: true, image: "🧺" },
    ],
  },
  {
    id: "ord-1006",
    orderNumber: "ORD-1006",
    customer: "Synergy client",
    company: "Synergy client s.r.o.",
    phone: "+420 606 010 202",
    email: "orders@synergy.example",
    shop: "Synergy Store",
    status: "picking",
    carrier: "DPD",
    createdAt: "2026-06-29T09:25:00Z",
    updatedAt: "2026-06-29T09:40:00Z",
    items: 6,
    total: "$302.90",
    address: "Pardubice, Czech Republic",
    shippingAddress: "Smetanova 5, 530 02 Pardubice",
    billingAddress: "Smetanova 5, 530 02 Pardubice",
    priority: "High",
    notes: "Multiple units, same SKU.",
    warehouseSlot: "A-17",
    promiseDate: "2026-07-01",
    salesChannel: "Shoptet",
    paymentStatus: "Awaiting",
    products: [
      { sku: "SKU-6011", name: "Notebook Set", quantity: 6, location: "A-17-09", inStock: true, image: "📓" },
    ],
  },
  {
    id: "ord-1007",
    orderNumber: "ORD-1007",
    customer: "Navelly",
    company: "Navelly s.r.o.",
    phone: "+420 725 199 114",
    email: "support@navelly.example",
    shop: "Navelly Market",
    status: "packed",
    carrier: "PPL",
    createdAt: "2026-06-29T10:50:00Z",
    updatedAt: "2026-06-29T11:10:00Z",
    items: 2,
    total: "$96.20",
    address: "Hradec Králové, Czech Republic",
    shippingAddress: "Tylova 4, 500 02 Hradec Králové",
    billingAddress: "Tylova 4, 500 02 Hradec Králové",
    priority: "Normal",
    notes: "Barcode label reprinted.",
    warehouseSlot: "B-11",
    promiseDate: "2026-06-30",
    salesChannel: "Shopify",
    paymentStatus: "Paid",
    products: [
      { sku: "SKU-7002", name: "Compact Organizer", quantity: 2, location: "B-11-02", inStock: true, image: "🗂️" },
    ],
  },
  {
    id: "ord-1008",
    orderNumber: "ORD-1008",
    customer: "Aqua Works",
    company: "Aqua Works s.r.o.",
    phone: "+420 774 223 881",
    email: "ops@aquaworks.example",
    shop: "Aqua Works",
    status: "new",
    carrier: "Zásilkovna",
    createdAt: "2026-06-29T11:35:00Z",
    updatedAt: "2026-06-29T11:40:00Z",
    items: 8,
    total: "$412.55",
    address: "Olomouc, Czech Republic",
    shippingAddress: "Horní náměstí 23, 779 00 Olomouc",
    billingAddress: "Horní náměstí 23, 779 00 Olomouc",
    priority: "High",
    notes: "High-volume order, check carton size.",
    warehouseSlot: "C-01",
    promiseDate: "2026-07-02",
    salesChannel: "Shopify",
    paymentStatus: "Pending",
    products: [
      { sku: "SKU-8001", name: "Glass Water Bottle", quantity: 8, location: "C-01-10", inStock: true, image: "🍼" },
    ],
  },
];
