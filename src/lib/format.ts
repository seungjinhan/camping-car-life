import type { Language } from "./types";

const DAY = 24 * 60 * 60 * 1000;

function toDate(value: string): Date {
  // 날짜만 있으면 그 나라 시간 기준 자정으로 읽어요.
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
}

export function formatDay(value: string, language: Language): string {
  return new Intl.DateTimeFormat(language, { month: "short", day: "numeric", weekday: "short" }).format(toDate(value));
}

export function formatShort(value: string, language: Language): string {
  return new Intl.DateTimeFormat(language, { month: "short", day: "numeric" }).format(toDate(value));
}

export function formatFull(value: string, language: Language): string {
  return new Intl.DateTimeFormat(language, { year: "numeric", month: "short", day: "numeric", weekday: "short" }).format(toDate(value));
}

export function formatTime(value: string, language: Language): string {
  return new Intl.DateTimeFormat(language, { hour: "numeric", minute: "2-digit" }).format(toDate(value));
}

export function formatMonth(year: number, month: number, language: Language): string {
  return new Intl.DateTimeFormat(language, { year: "numeric", month: "long" }).format(new Date(year, month, 1));
}

/** 일요일부터 시작하는 요일 이름이에요. */
export function weekdayNames(language: Language): string[] {
  const sunday = new Date(2026, 10, 1);
  return Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(language, { weekday: "narrow" }).format(new Date(sunday.getTime() + i * DAY)));
}

export function formatNumber(value: number, language: Language): string {
  return new Intl.NumberFormat(language).format(value);
}

/** 시작한 날이 D+1이에요. */
export function dayCount(startDate: string, today: Date): number {
  const start = toDate(startDate);
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.floor((base.getTime() - start.getTime()) / DAY) + 1;
}

export function localDateKey(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 두 좌표 사이 거리(km)예요. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (v: number) => (v * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** 구글 캘린더 추가 링크의 dates 값이에요. 하루 종일은 YYYYMMDD/YYYYMMDD(끝 날짜는 다음 날), 시간이 있으면 UTC예요. */
export function calendarDates(event: { start: string; end: string; allDay: boolean }): string {
  if (event.allDay) return `${event.start.replace(/-/g, "")}/${(event.end || event.start).replace(/-/g, "")}`;
  const utc = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `${utc(event.start)}/${utc(event.end || event.start)}`;
}
