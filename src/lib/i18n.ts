import { MESSAGES } from "./messages";
import { LANGUAGES, type Language, type Localized } from "./types";

export type Params = Record<string, string | number>;
export type Translate = (text: string, params?: Params) => string;

/** messages.ts의 번역 순서예요 (한국어는 키 그대로). */
export const MESSAGE_ORDER = ["en", "ja", "zh-Hant", "zh-Hans", "vi", "id", "es", "th"] as const;

/** 언어 고르기에 보여줄 이름이에요. 각 언어로 적어요. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  "zh-Hant": "繁體中文",
  "zh-Hans": "简体中文",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia",
  es: "Español",
  th: "ไทย",
};

const has = (target: object, key: string) => Object.prototype.hasOwnProperty.call(target, key);

export function fill(text: string, params?: Params): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (has(params, key) ? String(params[key]) : match));
}

/** 화면 문구예요. 번역이 없으면 영어, 영어도 없으면 한국어를 보여줘요. */
export function translate(language: Language, text: string, params?: Params): string {
  if (language === "ko" || !has(MESSAGES, text)) return fill(text, params);
  const row = MESSAGES[text];
  const value = row[MESSAGE_ORDER.indexOf(language as (typeof MESSAGE_ORDER)[number])] || row[0] || text;
  return fill(value, params);
}

/** 관리자가 쓴 콘텐츠예요. 고른 언어 → 영어 → 한국어 순서로 보여줘요. */
export function localized(value: Localized | undefined, language: Language): string {
  if (!value) return "";
  return value[language] || value.en || value.ko;
}

/** 저장한 언어가 없으면 기기 언어를 따라요. 9개에 없는 언어면 영어로 시작해요. */
export function pickLanguage(stored: unknown, locale: string): Language {
  if (typeof stored === "string" && (LANGUAGES as readonly string[]).includes(stored)) return stored as Language;
  const tag = locale.toLowerCase().replace("_", "-");
  if (tag.startsWith("zh")) return /hant|tw|hk|mo/.test(tag) ? "zh-Hant" : "zh-Hans";
  if (tag.startsWith("in")) return "id";
  const base = tag.split("-")[0];
  return (LANGUAGES as readonly string[]).includes(base) ? (base as Language) : "en";
}
