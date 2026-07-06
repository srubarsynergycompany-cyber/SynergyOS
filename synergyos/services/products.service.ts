import { prisma } from '@/lib/database/prisma';
import { mockCustomers, mockProducts } from '@/services/mockData';
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

type ProductServiceErrorCode = 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'DATA_ACCESS';

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

export class ProductServiceError extends Error {
  code: ProductServiceErrorCode;

  constructor(message: string, code: ProductServiceErrorCode) {
    super(message);
    this.name = 'ProductServiceError';
    this.code = code;
  }
}

export function isProductServiceError(error: unknown): error is ProductServiceError {
  return error instanceof ProductServiceError;
}

let mockProductsStore: Product[] = [...mockProducts];

function shouldUseMockDataSource() {
  return !prisma;
}

function getDbClient() {
  if (!prisma) {
    throw new ProductServiceError('Database client is not available.', 'DATA_ACCESS');
  }

  return prisma;
}

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

function validateNumericFields(input: ProductInput) {
  const decimalFields: Array<[keyof ProductInput, string]> = [
    ['weight', 'Weight must be a non-negative number.'],
    ['width', 'Width must be a non-negative number.'],
    ['height', 'Height must be a non-negative number.'],
    ['length', 'Length must be a non-negative number.'],
  ];

  for (const [key, message] of decimalFields) {
    const value = input[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new ProductServiceError(message, 'VALIDATION');
    }
  }

  const integerFields: Array<[keyof ProductInput, string]> = [
    ['minimumStock', 'Minimum stock must be a non-negative integer.'],
    ['currentStock', 'Current stock must be a non-negative integer.'],
  ];

  for (const [key, message] of integerFields) {
    const value = input[key];
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw new ProductServiceError(message, 'VALIDATION');
    }
  }

  if (typeof input.active !== 'boolean') {
    throw new ProductServiceError('Active flag must be boolean.', 'VALIDATION');
  }
}

function normalizeInput(input: ProductInput): ProductInput {
  return {
    sku: input.sku.trim(),
    eanBarcode: input.eanBarcode.trim(),
    name: input.name.trim(),
    description: input.description.trim(),
    customerId: input.customerId.trim(),
    category: input.category.trim(),
    weight: Number(input.weight),
    width: Number(input.width),
    height: Number(input.height),
    length: Number(input.length),
    minimumStock: Number(input.minimumStock),
    currentStock: Number(input.currentStock),
    unit: input.unit.trim(),
    active: input.active,
  };
}

function validateInput(input: ProductInput) {
  validateRequired(input);
  validateNumericFields(input);
}

function toKnownServiceError(error: unknown): ProductServiceError {
  if (isProductServiceError(error)) {
    return error;
  }

  const candidate = error as { code?: string; message?: string };
  if (candidate?.code === 'P2002') {
    return new ProductServiceError('SKU or EAN barcode must be unique.', 'CONFLICT');
  }
  if (candidate?.code === 'P2003') {
    return new ProductServiceError('Customer reference is invalid.', 'VALIDATION');
  }
  if (candidate?.code === 'P2025') {
    return new ProductServiceError('Product not found.', 'NOT_FOUND');
  }

  return new ProductServiceError(candidate?.message ?? 'Unexpected product data error.', 'DATA_ACCESS');
}

function isDatabaseUnavailableError(error: unknown): boolean {
  const candidate = error as { code?: string; message?: string };
  const message = String(candidate?.message ?? '').toLowerCase();
  const dbUnavailableCodes = new Set(['P1000', 'P1001', 'P1002', 'P1017']);

  if (candidate?.code && dbUnavailableCodes.has(candidate.code)) {
    return true;
  }

  return (
    message.includes('can\'t reach database server')
    || message.includes('connection refused')
    || message.includes('econnrefused')
    || message.includes('database client is not available')
  );
}

function validateSkuUniqueInMock(sku: string, existingId?: string) {
  const exists = mockProductsStore.some((product) => product.sku.toLowerCase() === sku.toLowerCase() && product.id !== existingId);
  if (exists) {
    throw new Error('SKU must be unique.');
  }
}

function validateEanUniqueInMock(eanBarcode: string, existingId?: string) {
  const exists = mockProductsStore.some((product) => product.eanBarcode.toLowerCase() === eanBarcode.toLowerCase() && product.id !== existingId);
  if (exists) {
    throw new ProductServiceError('EAN barcode must be unique.', 'CONFLICT');
  }
}

function getMockCustomerName(customerId: string) {
  const customer = mockCustomers.find((item) => item.id === customerId);
  return customer?.name ?? 'Unknown customer';
}

function listPaginatedFromMock(params: ProductListParams = {}): PaginatedProducts {
  return paginate(applyFilters(mockProductsStore, params), params);
}

function getByIdFromMock(id: string): Product | null {
  return mockProductsStore.find((product) => product.id === id) ?? null;
}

function createInMock(normalizedInput: ProductInput): Product {
  validateSkuUniqueInMock(normalizedInput.sku);
  validateEanUniqueInMock(normalizedInput.eanBarcode);
  const customerName = getMockCustomerName(normalizedInput.customerId);

  const created: Product = {
    id: `P-${Date.now()}`,
    sku: normalizedInput.sku,
    eanBarcode: normalizedInput.eanBarcode,
    name: normalizedInput.name,
    description: normalizedInput.description,
    customerId: normalizedInput.customerId,
    customerName,
    category: normalizedInput.category,
    weight: normalizedInput.weight,
    width: normalizedInput.width,
    height: normalizedInput.height,
    length: normalizedInput.length,
    minimumStock: normalizedInput.minimumStock,
    currentStock: normalizedInput.currentStock,
    unit: normalizedInput.unit,
    price: 0,
    currency: 'USD',
    active: normalizedInput.active,
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
}

function updateInMock(id: string, normalizedInput: ProductInput): Product {
  validateSkuUniqueInMock(normalizedInput.sku, id);
  validateEanUniqueInMock(normalizedInput.eanBarcode, id);

  const existing = mockProductsStore.find((product) => product.id === id);
  if (!existing) {
    throw new ProductServiceError('Product not found.', 'NOT_FOUND');
  }

  const updated: Product = {
    ...existing,
    ...normalizedInput,
    updatedAt: new Date().toISOString(),
    customerName: getMockCustomerName(normalizedInput.customerId),
  };
  mockProductsStore = mockProductsStore.map((product) => (product.id === id ? updated : product));
  return updated;
}

function removeInMock(id: string): void {
  const next = mockProductsStore.filter((product) => product.id !== id);
  if (next.length === mockProductsStore.length) {
    throw new ProductServiceError('Product not found.', 'NOT_FOUND');
  }
  mockProductsStore = next;
}

function listCategoriesFromMock(): string[] {
  const categories = new Set(mockProductsStore.map((product) => product.category).filter(Boolean));
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
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
  const requestedPage = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, params.pageSize ?? 10);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
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
    if (shouldUseMockDataSource()) {
      return listPaginatedFromMock(params);
    }

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
    const requestedPage = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 10);
    const skip = (requestedPage - 1) * pageSize;
    const db = getDbClient();

    try {
      const [rows, total] = await Promise.all([
        db.product.findMany({
          where,
          include: { customer: { select: { name: true } } },
          orderBy: { name: 'asc' },
          skip,
          take: pageSize,
        }),
        db.product.count({ where }),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const page = Math.min(requestedPage, totalPages);
      if (page === requestedPage || total === 0) {
        return {
          items: rows.map(mapDbProduct),
          total,
          page,
          pageSize,
        };
      }

      const correctedRows = await db.product.findMany({
        where,
        include: { customer: { select: { name: true } } },
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      return {
        items: correctedRows.map(mapDbProduct),
        total,
        page,
        pageSize,
      };
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        return listPaginatedFromMock(params);
      }

      throw toKnownServiceError(error);
    }
  },

  async getById(id: string): Promise<Product | null> {
    if (shouldUseMockDataSource()) {
      return getByIdFromMock(id);
    }

    const db = getDbClient();

    try {
      const row = await db.product.findUnique({
        where: { id },
        include: { customer: { select: { name: true } } },
      });
      return row ? mapDbProduct(row) : null;
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        return getByIdFromMock(id);
      }

      throw toKnownServiceError(error);
    }
  },

  async create(input: ProductInput): Promise<Product> {
    const normalizedInput = normalizeInput(input);
    validateInput(normalizedInput);

    if (!shouldUseMockDataSource()) {
      const db = getDbClient();

      try {
        const customer = await db.customer.findUnique({
          where: { id: normalizedInput.customerId },
          select: { id: true, organizationId: true, name: true },
        });

        if (!customer) {
          throw new ProductServiceError('Customer is required.', 'VALIDATION');
        }

        const row = await db.product.create({
          data: {
            organizationId: customer.organizationId,
            sku: normalizedInput.sku,
            eanBarcode: normalizedInput.eanBarcode,
            name: normalizedInput.name,
            description: normalizedInput.description,
            customerId: normalizedInput.customerId,
            category: normalizedInput.category,
            weight: normalizedInput.weight,
            width: normalizedInput.width,
            height: normalizedInput.height,
            length: normalizedInput.length,
            minimumStock: normalizedInput.minimumStock,
            currentStock: normalizedInput.currentStock,
            unit: normalizedInput.unit,
            active: normalizedInput.active,
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
      } catch (error) {
        if (isDatabaseUnavailableError(error)) {
          return createInMock(normalizedInput);
        }

        throw toKnownServiceError(error);
      }
    }

    return createInMock(normalizedInput);
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    const normalizedInput = normalizeInput(input);
    validateInput(normalizedInput);

    if (!shouldUseMockDataSource()) {
      const db = getDbClient();

      try {
        const customer = await db.customer.findUnique({
          where: { id: normalizedInput.customerId },
          select: { id: true, organizationId: true },
        });

        if (!customer) {
          throw new ProductServiceError('Customer is required.', 'VALIDATION');
        }

        const row = await db.product.update({
          where: { id },
          data: {
            organizationId: customer.organizationId,
            sku: normalizedInput.sku,
            eanBarcode: normalizedInput.eanBarcode,
            name: normalizedInput.name,
            description: normalizedInput.description,
            customerId: normalizedInput.customerId,
            category: normalizedInput.category,
            weight: normalizedInput.weight,
            width: normalizedInput.width,
            height: normalizedInput.height,
            length: normalizedInput.length,
            minimumStock: normalizedInput.minimumStock,
            currentStock: normalizedInput.currentStock,
            unit: normalizedInput.unit,
            active: normalizedInput.active,
          },
          include: { customer: { select: { name: true } } },
        });
        return mapDbProduct(row);
      } catch (error) {
        if (isDatabaseUnavailableError(error)) {
          return updateInMock(id, normalizedInput);
        }

        throw toKnownServiceError(error);
      }
    }

    return updateInMock(id, normalizedInput);
  },

  async remove(id: string): Promise<void> {
    if (!shouldUseMockDataSource()) {
      const db = getDbClient();

      try {
        await db.product.delete({ where: { id } });
        return;
      } catch (error) {
        if (isDatabaseUnavailableError(error)) {
          removeInMock(id);
          return;
        }

        throw toKnownServiceError(error);
      }
    }

    removeInMock(id);
  },

  async listCategories(): Promise<string[]> {
    if (shouldUseMockDataSource()) {
      return listCategoriesFromMock();
    }

    const db = getDbClient();

    try {
      const rows = await db.product.findMany({
        select: { category: true },
        distinct: ['category'],
      });
      return rows
        .map((row) => row.category)
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .sort((a, b) => a.localeCompare(b));
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        return listCategoriesFromMock();
      }

      throw toKnownServiceError(error);
    }
  },

  resetMockStoreForTests(): void {
    mockProductsStore = [...mockProducts];
  },
};
