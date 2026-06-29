import SynergyDashboard from '@/components/SynergyDashboard';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleDashboardPage({ params }: LocalePageProps) {
  const locale = await getLocaleFromParams(params);
  const dictionary = getDictionary(locale);

  return <SynergyDashboard dictionary={dictionary} locale={locale} />;
}

export const dynamicParams = false;
