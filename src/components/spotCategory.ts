import type { SpotCategory } from "../lib/types";

export const SPOT_CATEGORY_LABEL: Record<SpotCategory, string> = { campsite: "캠핑장", wild: "노지", parking: "주차장" };

/** 예전에 분류 없이 저장한 곳은 노지로 봐요. */
export function spotCategory(value: string | undefined): SpotCategory {
  return value === "campsite" || value === "parking" ? value : "wild";
}
