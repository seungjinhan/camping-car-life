import { useApp } from "../state";
import { AdminActions } from "../components/AdminActions";
import { useRegionName } from "../components/RegionFilter";
import { EmptyState } from "../components/ui";
import { useI18n } from "../i18n";
import { distanceKm, formatFull, formatNumber } from "../lib/format";
import { openExternal } from "../lib/platform";
import { CampRow, SpotRow } from "./SpotsScreen";
import { campsitesNear, useCampsitesIn } from "../components/useCampsitesIn";

export function FestivalScreen({ id }: { id: string }) {
  const { t, l, language } = useI18n();
  const { snapshot, go } = useApp();
  const regionName = useRegionName();
  const festival = snapshot.festivals.find((item) => item.id === id);
  const campsites = useCampsitesIn(festival ? [festival.province] : []);
  if (!festival) return <main className="screen"><EmptyState title={t("찾을 수 없어요")} /></main>;
  const nearby = snapshot.spots
    .map((spot) => ({ spot, km: distanceKm(spot, festival) }))
    .filter((item) => item.km <= 10)
    .sort((a, b) => a.km - b.km);
  // 고캠핑 캠핑장도 같은 도에서 10km 안이면 내 차박지 뒤에 보여줘요.
  const nearbyCamps = campsitesNear(campsites[festival.province], festival)
    .map((camp) => ({ camp, km: distanceKm(camp, festival) }))
    .sort((a, b) => a.km - b.km);
  const kmText = (km: number) => t("축제장에서 {km}km", { km: formatNumber(Math.round(km * 10) / 10, language) });

  return (
    <main className="screen">
      <div className="title-row"><h1 className="title">{l(festival.name)}</h1><AdminActions kind="festivals" id={festival.id} onEdit={() => go({ screen: "adminFestival", id: festival.id })} /></div>
      <p className="muted">{regionName(festival)}</p>
      <div className="info-row"><span>{t("기간")}</span><span className="muted">{formatFull(festival.start, language)} ~ {formatFull(festival.end, language)}</span></div>
      <div className="info-row"><span>{t("장소")}</span><span className="muted">{l(festival.place)}</span></div>
      <button type="button" className="info-row as-button" onClick={() => openExternal(festival.url)}>
        <span>{t("공식 사이트")}</span><span className="muted">{t("열기")} ›</span>
      </button>
      <section>
        <h2 className="section-title">{t("소개")}</h2>
        <p className="body-text">{l(festival.intro)}</p>
      </section>
      <section>
        <h2 className="section-title">{t("근처 차박지")} <span className="muted">{t("{n}곳", { n: nearby.length + nearbyCamps.length })}</span></h2>
        {nearby.length + nearbyCamps.length === 0 ? (
          <p className="muted">{t("10km 안에 차박지가 없어요")}</p>
        ) : (
          <ul className="list">
            {nearby.map(({ spot, km }) => (
              <SpotRow key={spot.id} spot={spot} regionName={regionName(spot)} extra={kmText(km)} onOpen={() => go({ screen: "spot", id: spot.id })} />
            ))}
            {nearbyCamps.map(({ camp, km }) => (
              <CampRow key={`gc${camp.id}`} camp={camp} regionName={regionName(camp)} extra={kmText(km)} onOpen={() => go({ screen: "campsite", province: camp.province, id: camp.id })} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
