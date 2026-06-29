import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { orderService } from '@/services';

export default async function OrdersPage() {
  const orders = await orderService.list();

  return (
    <Card title="Orders" subtitle="Shared order workspace">
      <Table
        headers={['Order', 'Status', 'Priority', 'Amount']}
        rows={orders.map((order) => [order.orderNumber, order.status, order.priority, `${order.currency} ${order.totalAmount}`])}
      />
    </Card>
  );
}
