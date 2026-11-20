import { firebaseEnabled } from "./firebase";
import { loadJson, saveJson } from "./platform";
import * as remote from "./remote";
import { track } from "./progress";
import { LANGUAGES, type Dictionary, type Festival, type Journey, type Language, type Localized, type Post, type Snapshot, type Spot, type Video } from "./types";

// 관리자 쓰기예요. Firebase가 있으면 Firestore에 쓰고(규칙: admins/{uid}만), 없으면 기기에 저장해서 화면에 덧씌워요.

export type Kind = "spots" | "festivals" | "videos" | "posts";
type Item = Spot | Festival | Video | Post;

interface Overlay {
  spots: Spot[];
  festivals: Festival[];
  videos: Video[];
  posts: Post[];
  deleted: string[];
  journey?: Journey | null;
  dictionary?: Dictionary;
}

const EMPTY: Overlay = { spots: [], festivals: [], videos: [], posts: [], deleted: [] };

async function readOverlay(): Promise<Overlay> {
  const saved = (await loadJson("admin-overlay")) as Partial<Overlay> | null;
  return { ...EMPTY, ...saved };
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return [item, ...list.filter((entry) => entry.id !== item.id)];
}

/** 샘플 데이터 위에 관리자가 저장한 내용을 덧씌워요. */
export async function applyOverlay(base: Snapshot): Promise<Snapshot> {
  const overlay = await readOverlay();
  const merge = <T extends { id: string }>(list: T[], extra: T[]) => [...extra, ...list.filter((item) => !extra.some((e) => e.id === item.id))].filter((item) => !overlay.deleted.includes(item.id));
  return {
    dictionary: overlay.dictionary ?? base.dictionary,
    journey: overlay.journey ?? base.journey,
    spots: merge(base.spots, overlay.spots),
    festivals: merge(base.festivals, overlay.festivals),
    videos: merge(base.videos, overlay.videos),
    posts: merge(base.posts, overlay.posts),
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function saveItem(kind: Kind, item: Item): Promise<void> {
  if (firebaseEnabled) return track(remote.saveItem(kind, item));
  return track(
    (async () => {
      await wait(300);
      const overlay = await readOverlay();
      saveJson("admin-overlay", { ...overlay, [kind]: upsert(overlay[kind] as Item[], item), deleted: overlay.deleted.filter((id) => id !== item.id) });
    })(),
  );
}

export function deleteItem(kind: Kind, id: string): Promise<void> {
  if (firebaseEnabled) return track(remote.deleteItem(kind, id));
  return track(
    (async () => {
      await wait(200);
      const overlay = await readOverlay();
      saveJson("admin-overlay", { ...overlay, deleted: [...new Set([...overlay.deleted, id])] });
    })(),
  );
}

export function saveJourney(journey: Journey): Promise<void> {
  if (firebaseEnabled) return track(remote.saveJourney(journey));
  return track(
    (async () => {
      await wait(200);
      saveJson("admin-overlay", { ...(await readOverlay()), journey });
    })(),
  );
}

export function saveDictionary(dictionary: Dictionary): Promise<void> {
  if (firebaseEnabled) return track(remote.saveDictionary(dictionary));
  return track(
    (async () => {
      await wait(200);
      saveJson("admin-overlay", { ...(await readOverlay()), dictionary });
    })(),
  );
}

export function newId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

/** 관리자인지 확인해요. Firebase가 있으면 admins/{uid}를 읽고, 샘플 모드에서는 개발 화면에서만 관리자예요. */
export async function checkAdmin(): Promise<boolean> {
  if (firebaseEnabled) return remote.checkAdmin();
  return import.meta.env.DEV;
}

// ── 자동 번역 (Apps Script LanguageApp) ──

/** Apps Script에 보낼 언어 코드예요. */
const TARGET: Record<Exclude<Language, "ko">, string> = { en: "en", ja: "ja", "zh-Hant": "zh-TW", "zh-Hans": "zh-CN", vi: "vi", id: "id", es: "es", th: "th" };

export function translateConfigured(): boolean {
  return Boolean(import.meta.env.VITE_TRANSLATE_URL);
}

/** 한국어 글을 8개 언어로 번역해요. 번역 주소가 없거나 실패하면 한국어만 돌려줘요. */
export async function translateText(ko: string): Promise<Localized> {
  const url = import.meta.env.VITE_TRANSLATE_URL as string | undefined;
  const text = ko.trim();
  if (!url || !text) return { ko: text };
  const params = new URLSearchParams({ text, targets: Object.values(TARGET).join(",") });
  const response = await fetch(`${url}?${params}`);
  if (!response.ok) return { ko: text };
  const body = (await response.json()) as Record<string, string>;
  const result: Localized = { ko: text };
  for (const language of LANGUAGES) {
    if (language === "ko") continue;
    const value = body[TARGET[language]];
    if (value) result[language] = value;
  }
  return result;
}

/** 여러 칸을 한 번에 번역해요. 진행 막대를 보여줘요. */
export function translateAll<K extends string>(fields: Record<K, string>): Promise<Record<K, Localized>> {
  return track(
    (async () => {
      const entries = await Promise.all(Object.entries(fields).map(async ([key, value]) => [key, await translateText(value as string)] as const));
      return Object.fromEntries(entries) as Record<K, Localized>;
    })(),
  );
}
