import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { localized, translate, type Translate } from "./lib/i18n";
import { saveJson } from "./lib/platform";
import type { Language, Localized } from "./lib/types";

interface I18n {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translate;
  /** 관리자 콘텐츠를 고른 언어로 보여줘요. */
  l: (value: Localized | undefined) => string;
}

const I18nContext = createContext<I18n>({ language: "ko", setLanguage: () => undefined, t: (text) => text, l: (value) => value?.ko ?? "" });

export function I18nProvider({ initialLanguage, children }: { initialLanguage: Language; children: ReactNode }) {
  const [language, setCurrent] = useState(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setCurrent(next);
    saveJson("language", next);
  }, []);

  const t = useCallback<Translate>((text, params) => translate(language, text, params), [language]);
  const l = useCallback((value: Localized | undefined) => localized(value, language), [language]);
  const value = useMemo(() => ({ language, setLanguage, t, l }), [language, setLanguage, t, l]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
