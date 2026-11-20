import { useEffect, useMemo, useState } from "react";
import { KakaoMap } from "../components/KakaoMap";
import { ALL, ANY_REGION, RegionFilter, useRegionName, type Region } from "../components/RegionFilter";
import { Chips, EmptyState, ErrorState, Header, Segmented, usePagedList, useSticky } from "../components/ui";
import { useI18n } from "../i18n";
import { defaultTourProvince, loadTourPlaces, tourRegions, type TourPlace, type TourType } from "../lib/tour";
import { useApp } from "../state";
import { FestivalList } from "./FestivalList";

export const EXPLORE_CATEGORIES = ["attraction", "festival", "culture"] as const;
export type ExploreCategory = (typeof EXPLORE_CATEGORIES)[number];
export const EXPLORE_CATEGORY_LABEL: Record<ExploreCategory, string> = { attraction: "관광지", festival: "축제 · 행사", culture: "문화시설" };
/** 지도에 한 번에 꽂는 곳 수예요. 넘으면 시군이나 분류를 고르게 해요. */
const MAP_LIMIT = 300;

/** 한국의 여러 장소와 축제 · 행사를 보는 탭이에요. 정보는 한국관광공사 TourAPI에서 받아 앱에 넣어 둬요. */
export function ExploreScreen() {
  const { t } = useI18n();
  const [category, setCategory] = useSticky<ExploreCategory>("explore:category", "attraction");
  const [view, setView] = useSticky<"list" | "map">("explore:view", "list");
  return (
    <main className="screen">
      <Header
        title={t("돌아보기")}
        right={category !== "festival" && <Segmented label={t("보기")} selected={view} onSelect={setView} items={[{ key: "list", label: t("목록") }, { key: "map", label: t("지도") }]} />}
      />
      <Segmented label={t("분류")} selected={category} onSelect={setCategory} items={EXPLORE_CATEGORIES.map((key) => ({ key, label: t(EXPLORE_CATEGORY_LABEL[key]) }))} />
      {category === "festival" ? <FestivalList /> : <PlaceList key={category} type={category} view={view} />}
    </main>
  );
}

function usePlaces(province: string) {
  const [places, setPlaces] = useState<TourPlace[]>([]);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setPlaces([]);
    setFailed(false);
    if (!province || province === ALL) return;
    let cancelled = false;
    loadTourPlaces(province)
      .then((items) => !cancelled && setPlaces(items))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [province, attempt]);
  return { places, failed, retry: () => setAttempt((n) => n + 1) };
}

function PlaceList({ type, view }: { type: TourType; view: "list" | "map" }) {
  const { t } = useI18n();
  const { snapshot, go } = useApp();
  const regionName = useRegionName();
  const [picked, setRegion] = useSticky<Region>(`explore:${type}:region`, ANY_REGION);
  const [kind, setKind] = useSticky(`explore:${type}:kind`, ALL);
  const [query, setQuery] = useSticky(`explore:${type}:query`, "");
  // 도를 꼭 하나 골라요. 처음엔 지금 있는 도, 없으면 이 분류가 가장 많은 도예요.
  const region: Region = picked.province === ALL ? { ...picked, province: defaultTourProvince(type, snapshot.journey?.here.province), city: ALL } : picked;
  const { places, failed, retry } = usePlaces(region.province);
  const inType = useMemo(() => places.filter((place) => place.type === type && (region.city === ALL || place.city === region.city)), [places, type, region.city]);
  const kinds = useMemo(() => [...new Set(inType.map((place) => place.kind).filter(Boolean))].sort(), [inType]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inType
      .filter((place) => kind === ALL || place.kind === kind)
      .filter((place) => !q || place.name.toLowerCase().includes(q) || place.address.toLowerCase().includes(q));
  }, [inType, kind, query]);
  const { visible, sentinel } = usePagedList(rows, `${type}/${region.province}/${region.city}/${kind}/${query}/${places.length}`, `explore:${type}`);
  const regions = useMemo(() => tourRegions(type), [type]);
  const pins = rows.length <= MAP_LIMIT ? rows.filter((place) => place.lat).map((place) => ({ id: String(place.id), lat: place.lat, lng: place.lng, title: place.name })) : [];

  return (
    <>
      <input className="input search" type="search" value={query} placeholder={t("이름, 주소 검색")} onChange={(event) => setQuery(event.target.value)} />
      <RegionFilter items={regions} value={region} onChange={(next) => { setRegion(next); setKind(ALL); }} requireProvince />
      {kinds.length > 1 && <Chips label={t("종류")} selected={kinds.includes(kind) ? kind : ALL} onSelect={setKind} items={[{ key: ALL, label: t("종류 전체") }, ...kinds.map((key) => ({ key, label: key }))]} />}
      <p className="muted">{t("{n}곳", { n: rows.length })}</p>
      {failed && <ErrorState onRetry={retry} />}
      {view === "map" ? (
        rows.length > MAP_LIMIT ? (
          <p className="muted">{t("곳이 많아서 시군이나 종류를 고르면 지도에 보여요")}</p>
        ) : pins.length > 0 ? (
          <KakaoMap height={360} pins={pins} onPin={(id) => go({ screen: "tourPlace", province: region.province, id: Number(id) })} />
        ) : (
          <EmptyState title={t("지도에 보여줄 곳이 없어요")} body={t("필터를 바꿔 보세요.")} />
        )
      ) : rows.length === 0 && places.length > 0 ? (
        <EmptyState title={t("조건에 맞는 곳이 없어요")} body={t("필터를 바꿔 보세요.")} />
      ) : (
        <ul className="list">
          {visible.map((place) => (
            <li key={place.id}>
              <button type="button" className="row-button" onClick={() => go({ screen: "tourPlace", province: place.province, id: place.id })}>
                <span className="icon-box">{t(EXPLORE_CATEGORY_LABEL[place.type])}</span>
                <span className="row-main">
                  <b>{place.name}</b>
                  <span className="muted">{[regionName(place), place.kind].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="chevron" aria-hidden="true">›</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {view === "list" && sentinel}
      {places.length > 0 && <p className="muted center">{t("출처: 한국관광공사")}</p>}
    </>
  );
}
