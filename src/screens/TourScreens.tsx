import { useEffect, useState } from "react";
import { KakaoMap } from "../components/KakaoMap";
import { NearbySpots } from "../components/NearbySpots";
import { useRegionName } from "../components/RegionFilter";
import { EmptyState, ErrorState, useToast } from "../components/ui";
import { useI18n } from "../i18n";
import { formatFull } from "../lib/format";
import { copyText, mapSearchUrl, mapUrl, openExternal } from "../lib/platform";
import { loadTourFestivals, loadTourPlaces, type TourFestival, type TourPlace } from "../lib/tour";
import { EXPLORE_CATEGORY_LABEL } from "./ExploreScreen";

/** 불러오기 → 없음 / 실패 / 내용 순서로 보여줘요. */
function useLoaded<T>(load: () => Promise<T | undefined>, deps: unknown[]) {
  const [value, setValue] = useState<T | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const run = () => {
    setFailed(false);
    load()
      .then((found) => setValue(found ?? null))
      .catch(() => setFailed(true));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(run, deps);
  return { value, failed, retry: run };
}

function Actions({ name, address, lat, lng }: { name: string; address: string; lat: number; lng: number }) {
  const { t } = useI18n();
  const { show, toast } = useToast();
  return (
    <>
      <div className="bottom-actions">
        <button type="button" className="button soft" onClick={() => void copyText(address).then((ok) => show(ok ? t("주소를 복사했어요") : t("복사하지 못했어요")))}>
          {t("주소 복사")}
        </button>
        <button type="button" className="button" onClick={() => openExternal(lat ? mapUrl({ name, lat, lng, country: "kr" }) : mapSearchUrl(address))}>
          {t("지도 앱에서 열기")}
        </button>
      </div>
      {toast}
    </>
  );
}

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <>
      {rows.filter(([, value]) => value).map(([label, value]) => (
        <div key={label} className="info-row">
          <span>{label}</span>
          <span className="muted">{value}</span>
        </div>
      ))}
    </>
  );
}

export function TourPlaceScreen({ province, id }: { province: string; id: number }) {
  const { t } = useI18n();
  const regionName = useRegionName();
  const { value: place, failed, retry } = useLoaded<TourPlace>(() => loadTourPlaces(province).then((items) => items.find((item) => item.id === id)), [province, id]);
  if (failed) return <main className="screen"><ErrorState onRetry={retry} /></main>;
  if (place === undefined) return <main className="screen" />;
  if (place === null) return <main className="screen"><EmptyState title={t("찾을 수 없어요")} /></main>;
  return (
    <main className="screen has-actions">
      {place.lat ? <KakaoMap height={180} pins={[{ id: String(place.id), lat: place.lat, lng: place.lng, title: place.name }]} /> : <div className="address-card">{place.address}</div>}
      <h1 className="title">{place.name}</h1>
      <p className="muted">{[t(EXPLORE_CATEGORY_LABEL[place.type]), regionName(place), place.kind].filter(Boolean).join(" · ")}</p>
      <section>
        <Rows rows={[[t("주소"), place.address], [t("문의처"), place.phone]]} />
      </section>
      <NearbySpots place={place} />
      <p className="muted">{t("출처: 한국관광공사")}{place.updated && ` · ${t("{date} 수정", { date: place.updated })}`}</p>
      <p className="muted">{t("현장 사정과 다를 수 있어요. 가기 전에 확인해 주세요.")}</p>
      <Actions name={place.name} address={place.address} lat={place.lat} lng={place.lng} />
    </main>
  );
}

export function TourFestivalScreen({ id }: { id: number }) {
  const { t, language } = useI18n();
  const regionName = useRegionName();
  const { value: festival, failed, retry } = useLoaded<TourFestival>(() => loadTourFestivals().then((items) => items.find((item) => item.id === id)), [id]);
  if (failed) return <main className="screen"><ErrorState onRetry={retry} /></main>;
  if (festival === undefined) return <main className="screen" />;
  if (festival === null) return <main className="screen"><EmptyState title={t("찾을 수 없어요")} /></main>;
  return (
    <main className="screen has-actions">
      <h1 className="title">{festival.name}</h1>
      <p className="muted">{[t("축제 · 행사"), regionName(festival)].filter(Boolean).join(" · ")}</p>
      <section>
        <Rows
          rows={[
            [t("기간"), `${formatFull(festival.start, language)} ~ ${formatFull(festival.end, language)}`],
            [t("장소"), festival.place],
            [t("주소"), festival.address],
            [t("시간"), festival.time],
            [t("요금"), festival.fee],
            [t("관람 연령"), festival.age],
            [t("주최"), festival.sponsor],
            [t("문의처"), festival.phone],
          ]}
        />
        {festival.homepage && (
          <button type="button" className="info-row as-button" onClick={() => openExternal(festival.homepage)}>
            <span>{t("홈페이지")}</span>
            <span className="muted">{t("열기")} ›</span>
          </button>
        )}
      </section>
      {festival.overview && (
        <section>
          <h2 className="section-title">{t("소개")}</h2>
          <p className="body-text">{festival.overview}</p>
        </section>
      )}
      {festival.program && (
        <section>
          <h2 className="section-title">{t("프로그램")}</h2>
          <p className="body-text">{festival.program}</p>
        </section>
      )}
      {festival.lat > 0 && <KakaoMap height={180} pins={[{ id: String(festival.id), lat: festival.lat, lng: festival.lng, title: festival.name }]} />}
      <NearbySpots place={festival} />
      <p className="muted">{t("출처: 한국관광공사")}{festival.updated && ` · ${t("{date} 수정", { date: festival.updated })}`}</p>
      <p className="muted">{t("일정은 바뀔 수 있어요. 가기 전에 주최 측에 확인해 주세요.")}</p>
      <Actions name={festival.name} address={festival.address} lat={festival.lat} lng={festival.lng} />
    </main>
  );
}
