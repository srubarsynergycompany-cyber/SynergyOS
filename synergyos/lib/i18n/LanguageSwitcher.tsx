"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "./types";

const localeLabels: Record<Locale, string> = {
  cs: "CS",
  en: "EN",
};

type LanguageSwitcherProps = {
  locale: Locale;
  labels: Record<Locale, string>;
};

export default function LanguageSwitcher({ locale, labels }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);

  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale]);

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === currentLocale) return;

    const nextPath = `/${nextLocale}${pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"}`;
    router.push(nextPath);
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-sm">
      {(Object.keys(localeLabels) as Locale[]).map((lang) => (
        <button
          key={lang}
          onClick={() => switchLocale(lang)}
          className={`rounded-full px-3 py-1.5 transition ${
            currentLocale === lang ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {labels[lang]}
        </button>
      ))}
    </div>
  );
}
