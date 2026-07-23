import { notFound } from "next/navigation";
import SynergyDashboard from "@/components/SynergyDashboard";
import { getDictionary, locales } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/types";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocalePage({ params }: PageProps) {
  const { locale } = await params;
  const safeLocale = locale as Locale;

  if (!locales.includes(safeLocale)) {
    notFound();
  }

  const dictionary = getDictionary(safeLocale);

  return <SynergyDashboard dictionary={dictionary} locale={safeLocale} />;
}

export const dynamicParams = false;
