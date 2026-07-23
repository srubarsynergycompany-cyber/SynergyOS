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
  badgeLabel = 'Základní modul',
  readySuffix = 'je připravený',
  readyDescription = 'Tato sekce používá globální rozhraní aplikace, design systém a sdílenou servisní vrstvu.',
  goToDashboardLabel = 'Přejít na dashboard',
  dashboardHref = '/cs/dashboard',
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
