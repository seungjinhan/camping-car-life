export const LANGUAGES = ["ko", "en", "ja", "zh-Hant", "zh-Hans", "vi", "id", "es", "th"] as const;
export type Language = (typeof LANGUAGES)[number];

/** 관리자가 한국어로 쓰고 자동 번역해서 저장한 글이에요. 한국어는 꼭 있어요. */
export type Localized = { ko: string } & Partial<Record<Language, string>>;

export interface Named {
  key: string;
  name: Localized;
}

export interface Province extends Named {
  country: string;
  cities: Named[];
}

export interface Dictionary {
  countries: Named[];
  provinces: Province[];
  spotTypes: Named[];
  features: Named[];
  tags: Named[];
  vehicleCategories: Named[];
}

/** 차박지 분류예요. 고캠핑에서 가져오는 곳은 캠핑장이에요. */
export const SPOT_CATEGORIES = ["campsite", "wild", "parking"] as const;
export type SpotCategory = (typeof SPOT_CATEGORIES)[number];

export interface Spot {
  id: string;
  name: Localized;
  category: SpotCategory;
  visitedAt: string;
  type: string;
  country: string;
  province: string;
  city: string;
  features: string[];
  tags: string[];
  lat: number;
  lng: number;
  address: string;
  description: Localized;
}

export interface Festival {
  id: string;
  name: Localized;
  country: string;
  province: string;
  city: string;
  start: string;
  end: string;
  place: Localized;
  lat: number;
  lng: number;
  url: string;
  intro: Localized;
}

export const VIDEO_KINDS = ["travel", "camper", "repair", "etc"] as const;
export type VideoKind = (typeof VIDEO_KINDS)[number];

export interface Video {
  id: string;
  youtubeId: string;
  title: Localized;
  channel: string;
  kind: VideoKind;
  country: string;
  province: string;
  city: string;
  tags: string[];
  spotId?: string;
  createdAt: string;
}

export const POST_KINDS = ["notice", "update", "question"] as const;
// 준비: 출발 전 예산 · 장비 · 짐 · 체크리스트 같은 글이에요 (2026-11-18). 새 글은 이 분류가 먼저 골라져요.
export const STORY_KINDS = ["prep", "camper", "video", "life"] as const;

/** 소통 · 차량관리 · 내 이야기 게시판이에요. */
export type Board = "community" | "vehicle" | "story";
export type PostKind = (typeof POST_KINDS)[number];

/** 게시판 글은 번역하지 않아요. */
export interface Post {
  id: string;
  board: Board;
  category: string;
  title: string;
  body: string;
  /** 내 이야기 글에만 있어요. */
  tags?: string[];
  pinned?: boolean;
  createdAt: string;
}

/** 구글 캘린더 일정이에요. 쓴 그대로 보여줘요. */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
  description: string;
}

export interface Journey {
  /** 출발일(캠핑카 생활 시작일)이에요. ""이면 아직 정하지 않았고, 오늘보다 뒤면 출발 준비 중이에요. */
  startDate: string;
  phase: "korea" | "world";
  koreaDays: number;
  here: { spotId?: string; province: string; city: string; since: string };
}

export interface Snapshot {
  dictionary: Dictionary;
  spots: Spot[];
  festivals: Festival[];
  videos: Video[];
  posts: Post[];
  /** 아직 시작일을 정하지 않았으면 null이에요. */
  journey: Journey | null;
}


