import { Clipboard, Device, Storage } from "@apps-in-toss/web-framework";

/** GitHub Pages 웹 버전이에요 (vite build --mode web). 토스 기능 대신 브라우저 기능을 써요. */
export const IS_WEB = import.meta.env.MODE === "web";
/** 웹 버전 맨 위 "앱 바로가기"가 여는 토스 미니앱 주소예요. */
export const TOSS_APP_URL = "https://tossminiapp.com/d/camping-car-life";

function readLocal(key: string): unknown {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeLocal(key: string, text: string): void {
  try {
    localStorage.setItem(key, text);
  } catch {
    // 저장 공간을 못 쓰는 브라우저(사생활 보호 모드 등)에서는 저장하지 않고 넘어가요.
  }
}

export async function loadJson(key: string): Promise<unknown> {
  if (IS_WEB) return readLocal(key);
  try {
    const value = await Storage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return import.meta.env.DEV ? readLocal(key) : null;
  }
}

export function saveJson(key: string, value: unknown): void {
  const text = JSON.stringify(value);
  if (IS_WEB) return writeLocal(key, text);
  Storage.setItem(key, text).catch(() => {
    if (import.meta.env.DEV) writeLocal(key, text);
  });
}

export function deviceLocale(): string {
  if (IS_WEB) return navigator.language;
  try {
    return Device.locale || navigator.language;
  } catch {
    return navigator.language;
  }
}

export function openExternal(url: string): void {
  if (IS_WEB) {
    window.open(url, "_blank", "noopener");
    return;
  }
  Device.openURL(url).catch(() => {
    if (import.meta.env.DEV) window.open(url, "_blank");
  });
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (IS_WEB) throw new Error("web");
    await Clipboard.setText(text);
    return true;
  } catch {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}

/** 국내는 카카오맵, 해외는 구글 지도에서 열어요. */
export function mapUrl(place: { name: string; lat: number; lng: number; country: string }): string {
  if (place.country === "kr") return `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
}

/** 좌표 없이 장소 이름으로 찾아요 (일정 위치). */
export function mapSearchUrl(query: string): string {
  return `https://map.kakao.com/link/search/${encodeURIComponent(query)}`;
}
