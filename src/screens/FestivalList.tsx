import { useEffect, useMemo, useState } from "react";
import { useApp } from "../state";
import { ANY_REGION, matchesRegion, RegionFilter, useRegionName, type Region } from "../components/RegionFilter";
import { EmptyState, Segmented, usePagedList, useSticky } from "../components/ui";
import { useI18n } from "../i18n";
import { campsitesNear, useCampsitesIn } from "../components/useCampsitesIn";
import { distanceKm, formatMonth, formatShort, localDateKey } from "../lib/format";
import { loadTourFestivals, type TourFestival } from "../lib/tour";

type Period = "now" | "upcoming" | "past";

/** 내가 등록한 축제와 한국관광공사 축제 · 행사를 한 줄로 합친 거예요. */
interface Row {
  key: string;
  name: string;
  country: string;
  province: string;
  city: string;
  start: string;
  end: string;
  lat: number;
  lng: number;
  open: () => void;
}

function useTourFestivals(): TourFestival[] {
  const [items, setItems] = useState<TourFestival[]>([]);
  useEffect(() => {
    loadTourFestivals().then(setItems).catch(() => setItems([]));
  }, []);
  return items;
}

/** 돌아보기의 "축제 · 행사" 칸이에요. 기간 · 지역으로 골라요. */
export function FestivalList() {
  const { t, l, language } = useI18n();
  const { snapshot, go } = useApp();
  const regionName = useRegionName();
  const today = localDateKey(new Date());
  const tour = useTourFestivals();
  const all = useMemo<Row[]>(
    () => [
      ...snapshot.festivals.map((f) => ({ key: f.id, name: l(f.name), country: f.country, province: f.province, city: f.city, start: f.start, end: f.end, lat: f.lat, lng: f.lng, open: () => go({ screen: "festival", id: f.id }) })),
      ...tour.map((f) => ({ key: `kto${f.id}`, name: f.name, country: "kr", province: f.province, city: f.city, start: f.start, end: f.end, lat: f.lat, lng: f.lng, open: () => go({ screen: "tourFestival", id: f.id }) })),
    ],
    [snapshot.festivals, tour, l, go],
  );
  const [region, setRegion] = useSticky<Region>("festivals:region", ANY_REGION);
  // 진행 중인 축제가 있으면 그 칸부터 보여줘요.
  const hasNow = all.some((f) => f.start <= today && f.end >= today);
  const [picked, setPeriod] = useSticky<Period | null>("festivals:period", null);
  const period: Period = picked ?? (hasNow ? "now" : "upcoming");

  const filtered = useMemo(() => {
    const inPeriod = all.filter((f) => (period === "now" ? f.start <= today && f.end >= today : period === "upcoming" ? f.start > today : f.end < today));
    // 진행 중은 곧 끝나는 순서, 다가오는 건 시작 순서, 지난 건 최근 순서예요.
    const order = (a: Row, b: Row) => (period === "now" ? a.end.localeCompare(b.end) : period === "upcoming" ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start));
    return inPeriod.filter((f) => matchesRegion(f, region)).sort(order);
  }, [all, region, period, today]);
  const { visible, sentinel } = usePagedList(filtered, `${period}/${region.province}/${region.city}/${all.length}`, "festivals");
  const campsites = useCampsitesIn(visible.map((festival) => festival.province));
  let lastMonth = "";

  return (
    <>
      <RegionFilter items={all} value={region} onChange={setRegion} />
      <Segmented label={t("기간")} selected={period} onSelect={setPeriod} items={[{ key: "now", label: t("진행 중") }, { key: "upcoming", label: t("다가오는") }, { key: "past", label: t("지난") }]} />
      {filtered.length === 0 && <EmptyState title={t("이 기간에는 축제가 없어요")} />}
      <ul className="list">
        {visible.map((festival) => {
          // 진행 중에는 몇 년째 이어지는 공연도 있어서 시작 달로 묶지 않아요.
          const month = festival.start.slice(0, 7);
          const head = period !== "now" && month !== lastMonth ? month : null;
          lastMonth = month;
          const nearby = festival.lat ? snapshot.spots.filter((spot) => distanceKm(spot, festival) <= 10).length + campsitesNear(campsites[festival.province], festival).length : 0;
          return (
            <li key={festival.key}>
              {head && <h2 className="month-head">{formatMonth(Number(head.slice(0, 4)), Number(head.slice(5, 7)) - 1, language)}</h2>}
              <button type="button" className="row-button" onClick={festival.open}>
                <span className="icon-box">{formatShort(period === "now" ? festival.end : festival.start, language)}</span>
                <span className="row-main">
                  <b>{festival.name}</b>
                  <span className="muted">{regionName(festival)} · {period === "now" ? t("{date}까지", { date: formatShort(festival.end, language) }) : `${formatShort(festival.start, language)} ~ ${formatShort(festival.end, language)}`}</span>
                  {nearby > 0 && <span className="muted">{t("근처 차박지 {n}곳", { n: nearby })}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {sentinel}
      {tour.length > 0 && <p className="muted center">{t("출처: 한국관광공사 · 운영자")}</p>}
    </>
  );
}
