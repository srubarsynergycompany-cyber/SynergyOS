import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

type ModulePageProps = {
  title: string;
  description: string;
};

export function ModulePage({ title, description }: ModulePageProps) {
  return (
    <Card title={title} subtitle={description} action={<StatusBadge label="Foundation module" tone="slate" />}>
      <EmptyState
        title={`${title} module is ready`}
        description="This section now uses the global app shell, design system, and shared service layer."
        action={
          <Link href="/dashboard">
            <Button variant="secondary">Go to Dashboard</Button>
          </Link>
        }
      />
    </Card>
  );
}
