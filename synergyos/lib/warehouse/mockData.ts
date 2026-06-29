export type ReceivingTask = {
  id: string;
  poNumber: string;
  product: string;
  sku: string;
  quantity: number;
  location: string;
  priority: "High" | "Medium" | "Low";
  progress: number;
};

export type TransferTask = {
  id: string;
  source: string;
  destination: string;
  product: string;
  barcode: string;
  history: string;
};

export type ReplenishmentTask = {
  id: string;
  location: string;
  sku: string;
  required: number;
  available: number;
  priority: "High" | "Medium" | "Low";
};

export type CountingTask = {
  id: string;
  sku: string;
  product: string;
  expected: number;
  counted: number;
  difference: number;
  status: "Needs review" | "Approved";
};

export const warehouseDashboardMetrics = [
  { title: "Active pickers", value: "6", detail: "2 on route" },
  { title: "Orders waiting", value: "14", detail: "4 priority" },
  { title: "Receiving tasks", value: "3", detail: "1 ready to confirm" },
  { title: "Transfer tasks", value: "5", detail: "2 awaiting scan" },
  { title: "Inventory alerts", value: "9", detail: "3 critical" },
  { title: "Low stock alerts", value: "2", detail: "Pick locations" },
];

export const receivingTasks: ReceivingTask[] = [
  { id: "R-101", poNumber: "PO-221", product: "Eco Tote Bag", sku: "SKU-1001", quantity: 30, location: "A-12-03", priority: "High", progress: 72 },
  { id: "R-102", poNumber: "PO-225", product: "Ceramic Mug", sku: "SKU-1002", quantity: 12, location: "B-04-01", priority: "Medium", progress: 48 },
  { id: "R-103", poNumber: "PO-230", product: "Wireless Charger", sku: "SKU-1003", quantity: 4, location: "C-07-02", priority: "High", progress: 92 },
];

export const transferTasks: TransferTask[] = [
  { id: "T-101", source: "A-12-03", destination: "B-04-01", product: "Eco Tote Bag", barcode: "789123456001", history: "Moved 12 units" },
  { id: "T-102", source: "C-07-02", destination: "A-09-08", product: "Wireless Charger", barcode: "789123456003", history: "Pending confirmation" },
  { id: "T-103", source: "B-04-01", destination: "A-12-03", product: "Ceramic Mug", barcode: "789123456002", history: "Scanned at origin" },
];

export const replenishmentTasks: ReplenishmentTask[] = [
  { id: "PL-101", location: "A-12-03", sku: "SKU-1001", required: 18, available: 6, priority: "High" },
  { id: "PL-102", location: "B-04-01", sku: "SKU-1002", required: 10, available: 3, priority: "Medium" },
  { id: "PL-103", location: "C-07-02", sku: "SKU-1003", required: 8, available: 1, priority: "High" },
];

export const countingTasks: CountingTask[] = [
  { id: "C-101", sku: "SKU-1001", product: "Eco Tote Bag", expected: 48, counted: 45, difference: -3, status: "Needs review" },
  { id: "C-102", sku: "SKU-1002", product: "Ceramic Mug", expected: 12, counted: 14, difference: 2, status: "Approved" },
  { id: "C-103", sku: "SKU-1003", product: "Wireless Charger", expected: 4, counted: 2, difference: -2, status: "Needs review" },
];
