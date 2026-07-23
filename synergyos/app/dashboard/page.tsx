import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { customerService, inventoryService, orderService } from '@/services';

export default async function DashboardPage() {
  const [orders, customers, inventory] = await Promise.all([orderService.list(), customerService.list(), inventoryService.list()]);

  return (
    <div className="space-y-6">
      <Card title="Provozní přehled" subtitle="Sdílený architektonický základ" action={<StatusBadge label="Živá data ze Supabase" tone="cyan" />}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Objednávky</p>
            <p className="mt-2 text-2xl font-semibold text-white">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Zákazníci</p>
            <p className="mt-2 text-2xl font-semibold text-white">{customers.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Skladové položky</p>
            <p className="mt-2 text-2xl font-semibold text-white">{inventory.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic';
