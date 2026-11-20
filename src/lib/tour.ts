import { track } from "./progress";
import index from "../data/tour/index.json";

// 한국관광공사 TourAPI(국문 관광정보 서비스)에서 받은 돌아보기 정보예요.
// scripts/fetch-tour.py → scripts/build-tour.py가 도마다 JSON 한 개로 만들어 앱에 같이 넣어요 (고캠핑과 같은 방식).
// 글은 한국어 그대로 보여주고, 사진은 쓰지 않아요.

export type TourType = "attraction" | "culture";

export interface TourPlace {
  id: number; // TourAPI contentid
  type: TourType;
  name: string;
  province: string;
  city: string; // 사전의 시군 키, 광역시는 ""
  address: string;
  phone: string;
  lat: number;
  lng: number;
  kind: string; // TourAPI 분류(중분류) 이름, 예: 역사유적지
  updated: string;
}

export interface TourFestival {
  id: number;
  name: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  start: string;
  end: string;
  place: string;
  time: string;
  fee: string;
  age: string;
  sponsor: string;
  program: string;
  overview: string;
  homepage: string;
  updated: string;
}

/** 도 → 분류 → 시군 → 곳 수예요. */
export const TOUR_INDEX = index as Record<string, Record<TourType, Record<string, number>>>;
const countIn = (province: string, type: TourType) => Object.values(TOUR_INDEX[province]?.[type] ?? {}).reduce((a, b) => a + b, 0);

/** 처음 고를 도예요: 지금 있는 도, 없으면 그 분류가 가장 많은 도. */
export function defaultTourProvince(type: TourType, here?: string): string {
  if (here && countIn(here, type) > 0) return here;
  return Object.keys(TOUR_INDEX).sort((a, b) => countIn(b, type) - countIn(a, type))[0] ?? "";
}

/** 지역 칩용 가짜 항목이에요 (시군마다 하나). */
export function tourRegions(type: TourType): { country: string; province: string; city: string }[] {
  return Object.entries(TOUR_INDEX).flatMap(([province, types]) => Object.keys(types[type] ?? {}).map((city) => ({ country: "kr", province, city })));
}

const files = import.meta.glob<Omit<TourPlace, "province">[]>(["../data/tour/*.json", "!../data/tour/index.json", "!../data/tour/festivals.json"], { import: "default" });
const cache = new Map<string, Promise<TourPlace[]>>();

export function loadTourPlaces(province: string): Promise<TourPlace[]> {
  const load = files[`../data/tour/${province}.json`];
  if (!load) return Promise.resolve([]);
  let promise = cache.get(province);
  if (!promise) {
    promise = track(load()).then((items) => items.map((item) => ({ ...item, province })));
    promise.catch(() => cache.delete(province));
    cache.set(province, promise);
  }
  return promise;
}

let festivals: Promise<TourFestival[]> | null = null;

/** 진행 중이거나 다가오는 축제 · 공연 · 행사예요 (받은 날 기준). */
export function loadTourFestivals(): Promise<TourFestival[]> {
  festivals ??= track(import("../data/tour/festivals.json").then((module) => module.default as TourFestival[]));
  festivals.catch(() => {
    festivals = null;
  });
  return festivals;
}
