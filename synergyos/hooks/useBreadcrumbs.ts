import { useMemo } from 'react';
import type { Locale } from '@/lib/i18n/types';

type BreadcrumbRouteMap = Record<string, string>;

export function useBreadcrumbs(pathname: string, routeMap: BreadcrumbRouteMap) {
  return useMemo(() => {
    const localeMatch = pathname.match(/^\/(cs|en)(?=\/|$)/);
    const locale = (localeMatch?.[1] as Locale | undefined) ?? null;
    const localePrefix = locale ? `/${locale}` : '';
    const cleanPath = locale ? pathname.replace(/^\/(cs|en)(?=\/|$)/, '') || '/' : pathname || '/';
    const segments = cleanPath.split('/').filter(Boolean);
    const breadcrumbs = [] as Array<{ label: string; href: string }>;

    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const label = routeMap[currentPath] ?? segment.replace(/-/g, ' ');
      breadcrumbs.push({ label: label.charAt(0).toUpperCase() + label.slice(1), href: `${localePrefix}${currentPath}` });
    }

    if (breadcrumbs.length === 0) {
      breadcrumbs.push({ label: routeMap['/dashboard'] ?? 'Dashboard', href: `${localePrefix}/dashboard` });
    }

    return breadcrumbs;
  }, [pathname, routeMap]);
}
