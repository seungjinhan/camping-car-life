import { useEffect, useState } from "react";
import { loadCampsites, type Campsite } from "../lib/campsites";
import { distanceKm } from "../lib/format";

/** 여러 도의 고캠핑 캠핑장을 받아요 (축제 근처 차박지용). 못 받은 도는 비어 있는 채로 둬요. */
export function useCampsitesIn(provinces: string[]): Record<string, Campsite[]> {
  const key = [...new Set(provinces)].sort().join(",");
  const [loaded, setLoaded] = useState<Record<string, Campsite[]>>({});
  useEffect(() => {
    let cancelled = false;
    for (const province of key ? key.split(",") : []) {
      loadCampsites(province)
        .then((items) => !cancelled && setLoaded((prev) => (prev[province] ? prev : { ...prev, [province]: items })))
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [key]);
  return loaded;
}

/** 축제장에서 10km 안의 캠핑장이에요. 좌표 없는 곳은 빼요. */
export function campsitesNear(camps: Campsite[] | undefined, place: { lat: number; lng: number }, km = 10): Campsite[] {
  return (camps ?? []).filter((camp) => camp.lat && distanceKm(camp, place) <= km);
}

