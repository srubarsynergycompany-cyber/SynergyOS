import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/types';

export type ShellNavKey =
  | 'dashboard'
  | 'orders'
  | 'inventory'
  | 'warehouse'
  | 'packing'
  | 'shipping'
  | 'returns'
  | 'customers'
  | 'products'
  | 'reports'
  | 'settings';

export const shellNavigationConfig: Array<{ key: ShellNavKey; href: string; shortcut: string }> = [
  { key: 'dashboard', href: '/dashboard', shortcut: '01' },
  { key: 'orders', href: '/orders', shortcut: '02' },
  { key: 'inventory', href: '/inventory', shortcut: '03' },
  { key: 'warehouse', href: '/warehouse', shortcut: '04' },
  { key: 'packing', href: '/packing', shortcut: '05' },
  { key: 'shipping', href: '/shipping', shortcut: '06' },
  { key: 'returns', href: '/returns', shortcut: '07' },
  { key: 'customers', href: '/customers', shortcut: '08' },
  { key: 'products', href: '/products', shortcut: '09' },
  { key: 'reports', href: '/reports', shortcut: '10' },
  { key: 'settings', href: '/settings', shortcut: '11' },
];

export function detectLocaleFromPath(pathname: string): Locale | null {
  const match = pathname.match(/^\/(cs|en)(?=\/|$)/);
  return (match?.[1] as Locale | undefined) ?? null;
}

export function localizeHref(href: string, locale: Locale | null): string {
  return locale ? `/${locale}${href}` : href;
}

export function getShellNavigationItems(locale: Locale | null) {
  const dictionary = getDictionary(locale ?? 'en');
  return shellNavigationConfig.map((item) => ({
    ...item,
    href: localizeHref(item.href, locale),
    label: dictionary.navigation.globalNav[item.key],
  }));
}
