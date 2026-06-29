import { prisma } from '@/lib/database/prisma';
import { mockProducts } from '@/services/mockData';
import type { Product } from '@/types';

type ProductListParams = {
  search?: string;
  category?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
};

type PaginatedProducts = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductInput = {
  sku: string;
  eanBarcode: string;
  name: string;
  description: string;
  customerId: string;
  category: string;
  weight: number;
  width: number;
  height: number;
  length: number;
  minimumStock: number;
  currentStock: number;
  unit: string;
  active: boolean;
};

let mockProductsStore: Product[] = [...mockProducts];

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function mapDbProduct(row: {
  id: string;
  sku: string;
  eanBarcode: string;
  name: string;
  description: string;
  customerId: string;
  customer: { name: string } | null;
  category: string | null;
  weight: unknown;
  width: unknown;
  height: unknown;
  length: unknown;
  minimumStock: number;
  currentStock: number;
  unit: string;
  price: unknown;
  currency: string;
  active: boolean;
  warehousePositions: unknown;
  batches: unknown;
  expirationDates: unknown;
  images: unknown;
  attachments: unknown;
  createdAt: Date;
  updatedAt: Date;
}): Product {
  return {
    id: row.id,
    sku: row.sku,
    eanBarcode: row.eanBarcode,
    name: row.name,
    description: row.description,
    customerId: row.customerId,
    customerName: row.customer?.name ?? 'Unknown customer',
    category: row.category ?? 'Uncategorized',
    weight: toNumber(row.weight),
    width: toNumber(row.width),
    height: toNumber(row.height),
    length: toNumber(row.length),
    minimumStock: row.minimumStock,
    currentStock: row.currentStock,
    unit: row.unit,
    price: toNumber(row.price),
    currency: row.currency,
    active: row.active,
    warehousePositions: Array.isArray(row.warehousePositions) ? (row.warehousePositions as string[]) : [],
    batches: Array.isArray(row.batches) ? (row.batches as string[]) : [],
    expirationDates: Array.isArray(row.expirationDates) ? (row.expirationDates as string[]) : [],
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    attachments: Array.isArray(row.attachments) ? (row.attachments as string[]) : [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function validateRequired(input: ProductInput) {
  const requiredText: Array<[keyof ProductInput, string]> = [
    ['sku', 'SKU is required.'],
    ['eanBarcode', 'EAN barcode is required.'],
    ['name', 'Name is required.'],
    ['description', 'Description is required.'],
    ['customerId', 'Customer is required.'],
    ['category', 'Category is required.'],
    ['unit', 'Unit is required.'],
  ];

  for (const [key, message] of requiredText) {
    const value = input[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(message);
    }
  }
}

function validateSkuUniqueInMock(sku: string, existingId?: string) {
  const exists = mockProductsStore.some((product) => product.sku.toLowerCase() === sku.toLowerCase() && product.id !== existingId);
  if (exists) {
    throw new Error('SKU must be unique.');
  }
}

function applyFilters(items: Product[], params: ProductListParams): Product[] {
  const search = params.search?.trim().toLowerCase();

  return items.filter((product) => {
    const matchesSearch =
      !search ||
      [product.name, product.sku, product.eanBarcode, product.category, product.customerName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search));
    const matchesCategory = !params.category || params.category === 'all' || product.category === params.category;
    const matchesActive = params.active === undefined || product.active === params.active;
    return matchesSearch && matchesCategory && matchesActive;
  });
}

function paginate(items: Product[], params: ProductListParams): PaginatedProducts {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, params.pageSize ?? 10);
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

export const productsService = {
  async list(): Promise<Product[]> {
    const result = await this.listPaginated({ page: 1, pageSize: 1000 });
    return result.items;
  },

  async listPaginated(params: ProductListParams = {}): Promise<PaginatedProducts> {
    if (!prisma) {
      return paginate(applyFilters(mockProductsStore, params), params);
    }

    try {
      const search = params.search?.trim();
      const where = {
        ...(params.category && params.category !== 'all' ? { category: params.category } : {}),
        ...(params.active === undefined ? {} : { active: params.active }),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { sku: { contains: search, mode: 'insensitive' as const } },
                { eanBarcode: { contains: search, mode: 'insensitive' as const } },
                { category: { contains: search, mode: 'insensitive' as const } },
                { customer: { name: { contains: search, mode: 'insensitive' as const } } },
              ],
            }
          : {}),
      };
      const page = Math.max(1, params.page ?? 1);
      const pageSize = Math.max(1, params.pageSize ?? 10);
      const skip = (page - 1) * pageSize;

      const [rows, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { customer: { select: { name: true } } },
          orderBy: { name: 'asc' },
          skip,
          take: pageSize,
        }),
        prisma.product.count({ where }),
      ]);

      return {
        items: rows.map(mapDbProduct),
        total,
        page,
        pageSize,
      };
    } catch {
      return paginate(applyFilters(mockProductsStore, params), params);
    }
  },

  async getById(id: string): Promise<Product | null> {
    if (!prisma) {
      return mockProductsStore.find((product) => product.id === id) ?? null;
    }

    try {
      const row = await prisma.product.findUnique({
        where: { id },
        include: { customer: { select: { name: true } } },
      });
      return row ? mapDbProduct(row) : null;
    } catch {
      return mockProductsStore.find((product) => product.id === id) ?? null;
    }
  },

  async create(input: ProductInput): Promise<Product> {
    validateRequired(input);
    validateSkuUniqueInMock(input.sku);

    if (prisma) {
      try {
        const row = await prisma.product.create({
          data: {
            organizationId: 'ORG-DEMO',
            sku: input.sku,
            eanBarcode: input.eanBarcode,
            name: input.name,
            description: input.description,
            customerId: input.customerId,
            category: input.category,
            weight: input.weight,
            width: input.width,
            height: input.height,
            length: input.length,
            minimumStock: input.minimumStock,
            currentStock: input.currentStock,
            unit: input.unit,
            active: input.active,
            price: 0,
            currency: 'USD',
            warehousePositions: [],
            batches: [],
            expirationDates: [],
            images: [],
            attachments: [],
          },
          include: { customer: { select: { name: true } } },
        });
        return mapDbProduct(row);
      } catch {
        // Fallback to mock storage when database is not connected.
      }
    }

    const created: Product = {
      id: `P-${Date.now()}`,
      sku: input.sku,
      eanBarcode: input.eanBarcode,
      name: input.name,
      description: input.description,
      customerId: input.customerId,
      customerName: 'Northstar Studio',
      category: input.category,
      weight: input.weight,
      width: input.width,
      height: input.height,
      length: input.length,
      minimumStock: input.minimumStock,
      currentStock: input.currentStock,
      unit: input.unit,
      price: 0,
      currency: 'USD',
      active: input.active,
      warehousePositions: [],
      batches: [],
      expirationDates: [],
      images: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProductsStore = [created, ...mockProductsStore];
    return created;
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    validateRequired(input);
    validateSkuUniqueInMock(input.sku, id);

    if (prisma) {
      try {
        const row = await prisma.product.update({
          where: { id },
          data: {
            sku: input.sku,
            eanBarcode: input.eanBarcode,
            name: input.name,
            description: input.description,
            customerId: input.customerId,
            category: input.category,
            weight: input.weight,
            width: input.width,
            height: input.height,
            length: input.length,
            minimumStock: input.minimumStock,
            currentStock: input.currentStock,
            unit: input.unit,
            active: input.active,
          },
          include: { customer: { select: { name: true } } },
        });
        return mapDbProduct(row);
      } catch {
        // Fallback below
      }
    }

    const existing = mockProductsStore.find((product) => product.id === id);
    if (!existing) {
      throw new Error('Product not found.');
    }

    const updated: Product = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
      customerName: existing.customerName,
    };
    mockProductsStore = mockProductsStore.map((product) => (product.id === id ? updated : product));
    return updated;
  },

  async remove(id: string): Promise<void> {
    if (prisma) {
      try {
        await prisma.product.delete({ where: { id } });
        return;
      } catch {
        // Fallback below
      }
    }

    const next = mockProductsStore.filter((product) => product.id !== id);
    if (next.length === mockProductsStore.length) {
      throw new Error('Product not found.');
    }
    mockProductsStore = next;
  },

  listCategories(): string[] {
    const categories = new Set(mockProductsStore.map((product) => product.category).filter(Boolean));
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  },

  resetMockStoreForTests(): void {
    mockProductsStore = [...mockProducts];
  },
};
