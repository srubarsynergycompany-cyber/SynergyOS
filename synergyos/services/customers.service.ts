import { prisma } from '@/lib/database/prisma';
import { mockCustomers } from '@/services/mockData';
import type { Customer } from '@/types';

function mapDbCustomer(row: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tier: string | null;
  address: string | null;
}): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? '',
    phone: row.phone ?? '',
    tier: row.tier ?? 'Standard',
    address: row.address ?? '',
  };
}

export const customersService = {
  async list(): Promise<Customer[]> {
    if (!prisma) {
      return mockCustomers;
    }

    try {
      const rows = await prisma.customer.findMany({
        orderBy: { name: 'asc' },
      });
      return rows.map(mapDbCustomer);
    } catch {
      return mockCustomers;
    }
  },
};
