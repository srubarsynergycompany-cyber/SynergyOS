import { ModulePage } from '@/components/layout/ModulePage';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { generateLocaleParams, getLocaleFromParams, type LocalePageProps } from '@/app/[locale]/_shared';

export function generateStaticParams() {
  return generateLocaleParams();
}

export default async function LocaleReturnsPage({ params }: LocalePageProps) {
  const locale = await getLocaleFromParams(params);
  const dictionary = getDictionary(locale);
  return (
    <ModulePage
      title={dictionary.modules.returns.title}
      description={dictionary.modules.returns.description}
      badgeLabel={dictionary.modules.modulePage.badge}
      readySuffix={dictionary.modules.modulePage.readySuffix}
      readyDescription={dictionary.modules.modulePage.readyDescription}
      goToDashboardLabel={dictionary.modules.modulePage.goToDashboard}
      dashboardHref={`/${locale}/dashboard`}
    />
  );
}

export const dynamicParams = false;
