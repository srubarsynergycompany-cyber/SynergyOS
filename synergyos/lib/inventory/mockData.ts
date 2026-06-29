export type InventoryItem = {
  sku: string;
  name: string;
  barcode: string;
  category: string;
  warehouseLocation: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minimumStock: number;
  status: "In stock" | "Low stock" | "Critical" | "Reserved";
  description: string;
  batchNumbers: Array<{ batch: string; expiryDate: string; quantity: number }>;
  movements: Array<{
    id: string;
    type: string;
    quantity: number;
    reference: string;
    timestamp: string;
    user: string;
  }>;
};

export const mockInventoryItems: InventoryItem[] = [
  {
    sku: "SKU-1001",
    name: "Eco Tote Bag",
    barcode: "789123456001",
    category: "Accessories",
    warehouseLocation: "A-12-03",
    currentStock: 48,
    reservedStock: 8,
    availableStock: 40,
    minimumStock: 20,
    status: "In stock",
    description: "Recycled cotton tote bag with reinforced handles.",
    batchNumbers: [
      { batch: "B-101", expiryDate: "2027-06-12", quantity: 24 },
      { batch: "B-102", expiryDate: "2027-09-01", quantity: 24 },
    ],
    movements: [
      { id: "M-1001", type: "Stock In", quantity: 30, reference: "PO-221", timestamp: "2026-06-10T09:15:00", user: "M. Novak" },
      { id: "M-1002", type: "Transfer", quantity: 5, reference: "TR-118", timestamp: "2026-06-18T14:22:00", user: "L. Smith" },
      { id: "M-1003", type: "Stock Out", quantity: 7, reference: "SO-304", timestamp: "2026-06-25T10:40:00", user: "J. Kovář" },
    ],
  },
  {
    sku: "SKU-1002",
    name: "Ceramic Mug",
    barcode: "789123456002",
    category: "Home",
    warehouseLocation: "B-04-01",
    currentStock: 12,
    reservedStock: 5,
    availableStock: 7,
    minimumStock: 15,
    status: "Low stock",
    description: "Stoneware ceramic mug in matte finish.",
    batchNumbers: [
      { batch: "B-205", expiryDate: "2027-04-20", quantity: 12 },
    ],
    movements: [
      { id: "M-2001", type: "Stock In", quantity: 12, reference: "PO-225", timestamp: "2026-06-05T08:30:00", user: "M. Novak" },
      { id: "M-2002", type: "Reserved", quantity: 5, reference: "ORD-1001", timestamp: "2026-06-22T16:45:00", user: "A. Dvořák" },
    ],
  },
  {
    sku: "SKU-1003",
    name: "Wireless Charger",
    barcode: "789123456003",
    category: "Electronics",
    warehouseLocation: "C-07-02",
    currentStock: 4,
    reservedStock: 2,
    availableStock: 2,
    minimumStock: 10,
    status: "Critical",
    description: "Fast wireless charger with compact travel design.",
    batchNumbers: [
      { batch: "B-311", expiryDate: "2026-11-15", quantity: 4 },
    ],
    movements: [
      { id: "M-3001", type: "Stock In", quantity: 4, reference: "PO-230", timestamp: "2026-06-02T11:00:00", user: "K. Brown" },
      { id: "M-3002", type: "Reserved", quantity: 2, reference: "ORD-1010", timestamp: "2026-06-24T13:10:00", user: "J. Kovář" },
    ],
  },
  {
    sku: "SKU-1004",
    name: "Notebook Set",
    barcode: "789123456004",
    category: "Office",
    warehouseLocation: "A-09-08",
    currentStock: 80,
    reservedStock: 24,
    availableStock: 56,
    minimumStock: 30,
    status: "Reserved",
    description: "Premium notebook set with linen cover and pen loop.",
    batchNumbers: [
      { batch: "B-410", expiryDate: "2028-02-14", quantity: 40 },
      { batch: "B-411", expiryDate: "2028-05-22", quantity: 40 },
    ],
    movements: [
      { id: "M-4001", type: "Stock In", quantity: 80, reference: "PO-240", timestamp: "2026-06-12T12:05:00", user: "A. Dvořák" },
      { id: "M-4002", type: "Reserved", quantity: 24, reference: "ORD-1043", timestamp: "2026-06-26T09:00:00", user: "L. Smith" },
    ],
  },
];
