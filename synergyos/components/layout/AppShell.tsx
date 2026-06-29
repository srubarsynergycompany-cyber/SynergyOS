'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { detectLocaleFromPath, getShellNavigationItems, shellNavigationConfig } from '@/utils/navigation';

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const locale = useMemo(() => detectLocaleFromPath(pathname), [pathname]);
  const dictionary = useMemo(() => getDictionary(locale ?? 'en'), [locale]);
  const navigationItems = useMemo(() => getShellNavigationItems(locale), [locale]);
  const breadcrumbRouteMap = useMemo(
    () =>
      shellNavigationConfig.reduce<Record<string, string>>((acc, item) => {
        acc[item.href] = dictionary.navigation.globalNav[item.key];
        return acc;
      }, {}),
    [dictionary],
  );
  const breadcrumbs = useBreadcrumbs(pathname, breadcrumbRouteMap);

  const activeItem = useMemo(() => {
    const normalizedPath = locale ? pathname.replace(/^\/(cs|en)(?=\/|$)/, '') || '/' : pathname;
    const normalized = normalizedPath === '/' ? '/dashboard' : normalizedPath;
    return shellNavigationConfig.find((item) => item.href === normalized || item.href.replace(/\/$/, '') === normalized.replace(/\/$/, ''))?.href ?? '/dashboard';
  }, [pathname, locale]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 py-4 lg:px-6 lg:py-6">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-400">SynergyOS</p>
              <h1 className="text-xl font-semibold text-white">Fulfillment OS</h1>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setMobileOpen((value) => !value)}>
              Menu
            </Button>
          </div>

          <nav className={`${mobileOpen ? 'block' : 'hidden'} space-y-2 px-3 pb-4 lg:block lg:px-4 lg:pb-6`}>
            {navigationItems.map((item) => {
              const isActive = item.key === shellNavigationConfig.find((entry) => entry.href === activeItem)?.key;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-300' : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.shortcut}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-800 bg-slate-950/70 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                  {navigationItems.map((item) => {
                    const isActive = item.key === shellNavigationConfig.find((entry) => entry.href === activeItem)?.key;
                    return (
                      <Link
                        key={`top-${item.href}`}
                        href={item.href}
                        className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          isActive
                            ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                            : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.href} className="flex items-center gap-2">
                      {index > 0 ? <span>/</span> : null}
                      {index === breadcrumbs.length - 1 ? (
                        <span className="font-medium text-slate-200">{crumb.label}</span>
                      ) : (
                        <Link href={crumb.href} className="transition hover:text-white">
                          {crumb.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">Operations workspace</h2>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm">
                  Notifications
                  <span className="ml-2 rounded-full border border-amber-500/40 bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">3</span>
                </Button>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-semibold text-cyan-300">JS</div>
                  <div>
                    <p className="text-sm font-medium text-white">Jane Smith</p>
                    <p className="text-xs text-slate-400">Warehouse Lead</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
