import { PickingView } from "@/components/warehouse/PickingView";

const mockPickingItems = [
  { sku: "SKU-1001", name: "Eco Tote Bag", quantity: 2, location: "A-12-03" },
  { sku: "SKU-1002", name: "Ceramic Mug", quantity: 1, location: "A-12-05" },
];

export default function WarehousePickingPage() {
  return <PickingView locale="cs" orderNumber="ORD-1001" items={mockPickingItems} />;
}
