import type { Locale, Dictionary } from "./types";
import cs from "./locales/cs";
import en from "./locales/en";

const dictionaries: Record<Locale, Dictionary> = {
  cs,
  en,
};

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
export const defaultLocale: Locale = "cs";
export const locales: Locale[] = ["cs", "en"];
