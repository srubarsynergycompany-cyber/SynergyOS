import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/types';

export type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export function generateLocaleParams() {
  return locales.map((locale) => ({ locale }));
}

export async function getLocaleFromParams(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  const safeLocale = locale as Locale;

  if (!locales.includes(safeLocale)) {
    notFound();
  }

  return safeLocale;
}
