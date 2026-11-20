import { track } from "./progress";
import index from "../data/campsites/index.json";

// 고캠핑(한국관광공사)에 등록된 캠핑장이에요. scripts/build-campsites.py가 도마다 JSON 한 개로 만들어 앱에 같이 넣어요.
// Firestore에 넣지 않아서 읽기 요금 · 한도가 들지 않고, 그 도를 고를 때만 받아요. 글은 한국어 그대로 보여줘요.

export interface Campsite {
  id: number; // 고캠핑 c_no
  name: string;
  province: string;
  city: string; // 사전의 시군 키, 광역시는 ""
  address: string;
  phone: string;
  lat: number;
  lng: number;
  summary: string;
  kind: string; // 일반야영장, 자동차야영장, 글램핑, 카라반
  facilities: string[];
  nearby: string;
  pets: string;
  season: string;
  days: string;
  homepage: string;
  note: string; // 기타 정보 (트레일러 · 카라반 입장 같은 내용)
  updated: string;
}

/** 도 → 시군 → 캠핑장 수예요. 지역 칩을 받기 전에 보여줄 때 써요. */
export const CAMPSITE_INDEX = index as Record<string, Record<string, number>>;
const countIn = (province: string) => Object.values(CAMPSITE_INDEX[province] ?? {}).reduce((a, b) => a + b, 0);

/** 캠핑장 분류에서 처음 고를 도예요: 지금 있는 도, 없으면 캠핑장이 가장 많은 도. */
export function defaultCampProvince(here?: string): string {
  if (here && CAMPSITE_INDEX[here]) return here;
  return Object.keys(CAMPSITE_INDEX).sort((a, b) => countIn(b) - countIn(a))[0] ?? "";
}

const files = import.meta.glob<Omit<Campsite, "province">[]>(["../data/campsites/*.json", "!../data/campsites/index.json"], { import: "default" });
const cache = new Map<string, Promise<Campsite[]>>();

export function loadCampsites(province: string): Promise<Campsite[]> {
  const load = files[`../data/campsites/${province}.json`];
  if (!load) return Promise.resolve([]);
  let promise = cache.get(province);
  if (!promise) {
    promise = track(load()).then((items) => items.map((item) => ({ ...item, province })));
    promise.catch(() => cache.delete(province));
    cache.set(province, promise);
  }
  return promise;
}

export function campsiteSourceUrl(id: number): string {
  return `https://www.gocamping.or.kr/bsite/camp/info/read.do?c_no=${id}`;
}

/** 지역 칩용 가짜 항목이에요 (시군마다 하나). */
export function campsiteRegions(): { country: string; province: string; city: string }[] {
  return Object.entries(CAMPSITE_INDEX).flatMap(([province, cities]) => Object.keys(cities).map((city) => ({ country: "kr", province, city })));
}
