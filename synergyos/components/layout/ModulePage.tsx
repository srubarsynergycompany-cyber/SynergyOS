import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

type ModulePageProps = {
  title: string;
  description: string;
  badgeLabel?: string;
  readySuffix?: string;
  readyDescription?: string;
  goToDashboardLabel?: string;
  dashboardHref?: string;
};

export function ModulePage({
  title,
  description,
  badgeLabel = 'Foundation module',
  readySuffix = 'module is ready',
  readyDescription = 'This section now uses the global app shell, design system, and shared service layer.',
  goToDashboardLabel = 'Go to Dashboard',
  dashboardHref = '/dashboard',
}: ModulePageProps) {
  return (
    <Card title={title} subtitle={description} action={<StatusBadge label={badgeLabel} tone="slate" />}>
      <EmptyState
        title={`${title} ${readySuffix}`}
        description={readyDescription}
        action={
          <Link href={dashboardHref}>
            <Button variant="secondary">{goToDashboardLabel}</Button>
          </Link>
        }
      />
    </Card>
  );
}
