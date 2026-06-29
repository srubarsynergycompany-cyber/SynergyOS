import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/inventory/ProductDetailView";
import { mockInventoryItems } from "@/lib/inventory/mockData";

type PageProps = {
  params: Promise<{ sku: string }>;
};

export default async function InventoryDetailPage({ params }: PageProps) {
  const { sku } = await params;
  const item = mockInventoryItems.find((entry) => entry.sku.toLowerCase() === sku.toLowerCase());

  if (!item) {
    notFound();
  }

  return <ProductDetailView item={item} />;
}
