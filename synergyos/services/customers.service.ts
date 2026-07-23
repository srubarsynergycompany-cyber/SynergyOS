import { getSupabaseServer } from '@/lib/supabase-server';
import type { Customer } from '@/types';

type CustomerRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tier: string | null;
  address: string | null;
};

function mapCustomer(row: CustomerRow): Customer {
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
    const { data, error } = await getSupabaseServer()
      .from('clients')
      .select('id, name, email, phone, tier, address')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as CustomerRow[]).map(mapCustomer);
  },
};
