import { useEffect, useMemo, useState } from "react";
import { findName, useApp } from "../state";
import { KakaoMap } from "../components/KakaoMap";
import { ALL, ANY_REGION, matchesRegion, RegionFilter, useRegionName, type Region } from "../components/RegionFilter";
import { Chips, EmptyState, ErrorState, Header, Segmented, Tag, usePagedList, useSticky } from "../components/ui";
import { useI18n } from "../i18n";
import { campsiteRegions, CAMPSITE_INDEX, defaultCampProvince, loadCampsites, type Campsite } from "../lib/campsites";
import { localized } from "../lib/i18n";
import { SPOT_CATEGORIES, type Spot, type SpotCategory } from "../lib/types";
import { SPOT_CATEGORY_LABEL, spotCategory } from "../components/spotCategory";
import { useCampsiteText } from "./CampsiteScreen";

const CAMP_REGIONS = campsiteRegions();
/** 지도에 한 번에 꽂는 캠핑장 수예요. 넘으면 시군을 고르게 해요. */
const MAP_LIMIT = 300;

/** 내 차박지의 특징 · 태그를 고캠핑 정보로 맞춰 봐요. 알 수 없는 특징이면 캠핑장은 빼요. */
function campMatches(camp: Campsite, key: string): boolean {
  switch (key) {
    case "power": return camp.facilities.includes("전기");
    case "shower": return camp.facilities.includes("온수");
    case "pet": return camp.pets === "가능" || camp.pets === "소형견만 가능";
    case "fishing": return camp.nearby.includes("낚시");
    default: return false;
  }
}

type Row = { kind: "spot"; spot: Spot } | { kind: "camp"; camp: Campsite };

/** 고른 도의 고캠핑 캠핑장이에요. 도를 고르기 전에는 받지 않아요. */
function useCampsites(province: string, enabled: boolean) {
  const [camps, setCamps] = useState<Campsite[]>([]);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setCamps([]);
    setFailed(false);
    if (!enabled || !CAMPSITE_INDEX[province]) return;
    let cancelled = false;
    loadCampsites(province)
      .then((items) => !cancelled && setCamps(items))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [province, enabled, attempt]);
  return { camps, failed, retry: () => setAttempt((n) => n + 1) };
}

export function SpotsScreen() {
  const { t, l, language } = useI18n();
  const { snapshot, go } = useApp();
  const { spots, dictionary } = snapshot;
  const regionName = useRegionName();
  const [view, setView] = useSticky<"list" | "map">("spots:view", "list");
  // 분류는 캠핑장 · 노지 · 주차장 중 하나예요 ("전체"는 운영자 요청으로 뺐어요). 처음엔 캠핑장이에요.
  const [category, setCategory] = useSticky<SpotCategory>("spots:category", "campsite");
  const [picked, setRegion] = useSticky<Region>("spots:region", ANY_REGION);
  const [feature, setFeature] = useSticky("spots:feature", ALL);
  const [query, setQuery] = useSticky("spots:query", "");
  const withCamps = category === "campsite";
  // 캠핑장에서는 도를 꼭 하나 골라요 ("전체" 칩 없음). 처음엔 지금 있는 도, 없으면 캠핑장이 가장 많은 도예요.
  const region: Region = withCamps && picked.province === ALL ? { ...picked, province: defaultCampProvince(snapshot.journey?.here.province), city: ALL } : picked;
  const campsites = useCampsites(region.province, withCamps && region.province !== ALL);

  // Firestore가 못 하는 이름 검색과 특징 · 태그 조합은 받아온 뒤 여기서 걸러요.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return spots
      .filter((spot) => spotCategory(spot.category) === category)
      .filter((spot) => matchesRegion(spot, region))
      .filter((spot) => feature === ALL || spot.features.includes(feature) || spot.tags.includes(feature))
      .filter((spot) => !q || [localized(spot.name, language), spot.name.ko, ...spot.tags.map((key) => localized(findName(dictionary.tags, key), language))].some((text) => text.toLowerCase().includes(q)))
      .sort((a, b) => b.visitedAt.localeCompare(a.visitedAt));
  }, [spots, category, region, feature, query, language, dictionary.tags]);
  // 고캠핑 캠핑장은 조회 많은 순서 그대로 내 차박지 뒤에 붙여요.
  const camps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campsites.camps
      .filter((camp) => region.city === ALL || camp.city === region.city)
      .filter((camp) => feature === ALL || campMatches(camp, feature))
      .filter((camp) => !q || [camp.name, camp.address, camp.nearby].some((text) => text.toLowerCase().includes(q)));
  }, [campsites.camps, region.city, feature, query]);
  const rows = useMemo<Row[]>(() => [...filtered.map((spot) => ({ kind: "spot" as const, spot })), ...camps.map((camp) => ({ kind: "camp" as const, camp }))], [filtered, camps]);
  const { visible, sentinel } = usePagedList(rows, `${category}/${region.province}/${region.city}/${feature}/${query}/${campsites.camps.length}`, "spots");
  const filterItems = [
    { key: ALL, label: t("특징 전체") },
    ...dictionary.features.map((item) => ({ key: item.key, label: l(item.name) })),
    ...dictionary.tags.map((item) => ({ key: item.key, label: `#${l(item.name)}` })),
  ];
  const domestic = filtered.filter((spot) => spot.country === "kr");
  const mapCamps = camps.length <= MAP_LIMIT ? camps.filter((camp) => camp.lat) : [];
  const pins = [...domestic.map((spot) => ({ id: spot.id, lat: spot.lat, lng: spot.lng, title: l(spot.name) })), ...mapCamps.map((camp) => ({ id: `gc:${camp.id}`, lat: camp.lat, lng: camp.lng, title: camp.name }))];
  const regionItems = useMemo(() => (withCamps ? [...spots, ...CAMP_REGIONS] : spots), [withCamps, spots]);

  return (
    <main className="screen">
      <Header title={t("차박지")} right={<Segmented label={t("보기")} selected={view} onSelect={setView} items={[{ key: "list", label: t("목록") }, { key: "map", label: t("지도") }]} />} />
      <Segmented label={t("분류")} selected={category} onSelect={setCategory} items={SPOT_CATEGORIES.map((key) => ({ key, label: t(SPOT_CATEGORY_LABEL[key]) }))} />
      <input className="input search" type="search" value={query} placeholder={t("장소 이름, 태그 검색")} onChange={(event) => setQuery(event.target.value)} />
      <RegionFilter items={regionItems} value={region} onChange={setRegion} requireProvince={withCamps} />
      <Chips label={t("특징")} selected={feature} onSelect={setFeature} items={filterItems} />
      <p className="muted">{t("{n}곳", { n: rows.length })}</p>
      {campsites.failed && <ErrorState onRetry={campsites.retry} />}
      {view === "map" ? (
        <>
          {pins.length > 0 ? (
            <KakaoMap height={360} pins={pins} onPin={(id) => (id.startsWith("gc:") ? go({ screen: "campsite", province: region.province, id: Number(id.slice(3)) }) : go({ screen: "spot", id }))} />
          ) : (
            camps.length <= MAP_LIMIT && <EmptyState title={t("지도에 보여줄 곳이 없어요")} body={t("필터를 바꿔 보세요.")} />
          )}
          {camps.length > MAP_LIMIT && <p className="muted">{t("캠핑장이 많아서 시군을 고르면 지도에 보여요")}</p>}
        </>
      ) : rows.length === 0 ? (
        <EmptyState title={t("조건에 맞는 차박지가 없어요")} body={t("필터를 바꿔 보세요.")} />
      ) : (
        <ul className="list">
          {visible.map((row) =>
            row.kind === "spot" ? (
              <SpotRow key={row.spot.id} spot={row.spot} regionName={regionName(row.spot)} onOpen={() => go({ screen: "spot", id: row.spot.id })} />
            ) : (
              <CampRow key={`gc${row.camp.id}`} camp={row.camp} regionName={regionName(row.camp)} onOpen={() => go({ screen: "campsite", province: row.camp.province, id: row.camp.id })} />
            ),
          )}
        </ul>
      )}
      {view === "list" && sentinel}
      {camps.length > 0 && <p className="muted center">{t("출처: 한국관광공사 고캠핑")}</p>}
    </main>
  );
}

export function CampRow({ camp, regionName, onOpen, extra }: { camp: Campsite; regionName: string; onOpen: () => void; extra?: string }) {
  const { t } = useI18n();
  const known = useCampsiteText();
  return (
    <li>
      <button type="button" className="row-button" onClick={onOpen}>
        <span className="icon-box">{t("캠핑장")}</span>
        <span className="row-main">
          <b>{camp.name}</b>
          <span className="muted">{extra ?? [regionName, known(camp.kind)].filter(Boolean).join(" · ")}</span>
          <span className="tags">{camp.facilities.slice(0, 4).map((name) => <Tag key={name}>{t(name)}</Tag>)}</span>
        </span>
      </button>
    </li>
  );
}

export function SpotRow({ spot, regionName, onOpen, extra }: { spot: Spot; regionName: string; onOpen: () => void; extra?: string }) {
  const { t, l } = useI18n();
  const { dictionary } = useApp().snapshot;
  const type = l(findName(dictionary.spotTypes, spot.type));
  return (
    <li>
      <button type="button" className="row-button" onClick={onOpen}>
        <span className="icon-box">{type}</span>
        <span className="row-main">
          <b>{l(spot.name)}</b>
          <span className="muted">{extra ?? `${t(SPOT_CATEGORY_LABEL[spotCategory(spot.category)])} · ${regionName} · ${type}`}</span>
          <span className="tags">
            {spot.features.map((key) => <Tag key={key}>{l(findName(dictionary.features, key))}</Tag>)}
            {spot.tags.filter((key) => findName(dictionary.tags, key)).map((key) => <Tag key={key}>#{l(findName(dictionary.tags, key))}</Tag>)}
          </span>
        </span>
      </button>
    </li>
  );
}
