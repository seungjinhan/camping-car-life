import { useApp } from "../state";
import { useI18n } from "../i18n";
import { distanceKm, formatNumber } from "../lib/format";
import { CampRow, SpotRow } from "../screens/SpotsScreen";
import { useRegionName } from "./RegionFilter";
import { campsitesNear, useCampsitesIn } from "./useCampsitesIn";

/** 돌아보기 장소 · 축제에서 10km 안의 내 차박지와 고캠핑 캠핑장이에요. */
export function NearbySpots({ place }: { place: { province: string; lat: number; lng: number } }) {
  const { t, language } = useI18n();
  const { snapshot, go } = useApp();
  const regionName = useRegionName();
  const campsites = useCampsitesIn(place.lat ? [place.province] : []);
  if (!place.lat) return null;
  const spots = snapshot.spots
    .map((spot) => ({ spot, km: distanceKm(spot, place) }))
    .filter((item) => item.km <= 10)
    .sort((a, b) => a.km - b.km);
  const camps = campsitesNear(campsites[place.province], place)
    .map((camp) => ({ camp, km: distanceKm(camp, place) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 10);
  const kmText = (km: number) => t("{km}km", { km: formatNumber(Math.round(km * 10) / 10, language) });
  return (
    <section>
      <h2 className="section-title">{t("근처 차박지")} <span className="muted">{t("{n}곳", { n: spots.length + camps.length })}</span></h2>
      {spots.length + camps.length === 0 ? (
        <p className="muted">{t("10km 안에 차박지가 없어요")}</p>
      ) : (
        <ul className="list">
          {spots.map(({ spot, km }) => (
            <SpotRow key={spot.id} spot={spot} regionName={regionName(spot)} extra={kmText(km)} onOpen={() => go({ screen: "spot", id: spot.id })} />
          ))}
          {camps.map(({ camp, km }) => (
            <CampRow key={`gc${camp.id}`} camp={camp} regionName={regionName(camp)} extra={kmText(km)} onOpen={() => go({ screen: "campsite", province: camp.province, id: camp.id })} />
          ))}
        </ul>
      )}
    </section>
  );
}
