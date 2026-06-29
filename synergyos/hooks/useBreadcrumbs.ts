import { useMemo } from 'react';

const routeMap: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/orders': 'Orders',
  '/inventory': 'Inventory',
  '/warehouse': 'Warehouse',
  '/packing': 'Packing',
  '/shipping': 'Shipping',
  '/returns': 'Returns',
  '/customers': 'Customers',
  '/products': 'Products',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export function useBreadcrumbs(pathname: string) {
  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [] as Array<{ label: string; href: string }>;

    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const label = routeMap[currentPath] ?? segment.replace(/-/g, ' ');
      breadcrumbs.push({ label: label.charAt(0).toUpperCase() + label.slice(1), href: currentPath });
    }

    if (breadcrumbs.length === 0) {
      breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' });
    }

    return breadcrumbs;
  }, [pathname]);
}
