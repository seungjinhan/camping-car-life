import { findName, useApp } from "../state";
import { AdminActions } from "../components/AdminActions";
import { KakaoMap } from "../components/KakaoMap";
import { useRegionName } from "../components/RegionFilter";
import { EmptyState, Tag, useToast } from "../components/ui";
import { useI18n } from "../i18n";
import { copyText, mapUrl, openExternal } from "../lib/platform";
import { SPOT_CATEGORY_LABEL, spotCategory } from "../components/spotCategory";
import { newestVideoFirst } from "../lib/youtube";

export function SpotScreen({ id }: { id: string }) {
  const { t, l } = useI18n();
  const { snapshot, go } = useApp();
  const { dictionary, videos } = snapshot;
  const regionName = useRegionName();
  const { show, toast } = useToast();
  const spot = snapshot.spots.find((item) => item.id === id);
  if (!spot) return <main className="screen"><EmptyState title={t("찾을 수 없어요")} /></main>;
  const related = videos.filter((video) => video.spotId === spot.id).sort(newestVideoFirst);

  return (
    <main className="screen has-actions">
      {spot.country === "kr" ? <KakaoMap height={180} pins={[{ id: spot.id, lat: spot.lat, lng: spot.lng, title: l(spot.name) }]} /> : <div className="address-card">{spot.address}</div>}
      <div className="title-row"><h1 className="title">{l(spot.name)}</h1><AdminActions kind="spots" id={spot.id} onEdit={() => go({ screen: "adminSpot", id: spot.id })} /></div>
      <p className="muted">{t(SPOT_CATEGORY_LABEL[spotCategory(spot.category)])} · {regionName(spot)} · {l(findName(dictionary.spotTypes, spot.type))}</p>
      <div className="tags">{spot.tags.filter((key) => findName(dictionary.tags, key)).map((key) => <Tag key={key}>#{l(findName(dictionary.tags, key))}</Tag>)}</div>
      <section>
        <h2 className="section-title">{t("특징")}</h2>
        {spot.features.length === 0 ? (
          <p className="muted">{t("시설이 없어요")}</p>
        ) : (
          <div className="feature-grid">{spot.features.map((key) => <span key={key} className="feature">{l(findName(dictionary.features, key))}</span>)}</div>
        )}
      </section>
      <section>
        <h2 className="section-title">{t("설명")}</h2>
        <p className="body-text">{l(spot.description)}</p>
      </section>
      <div className="info-row">
        <span>{t("주소")}</span>
        <span className="muted">{spot.address}</span>
      </div>
      {related.length > 0 && (
        <section>
          <h2 className="section-title">{t("관련 영상")}</h2>
          <ul className="list">
            {related.map((video) => (
              <li key={video.id}>
                <button type="button" className="row-button" onClick={() => go({ screen: "video", id: video.id })}>
                  <span className="row-main"><b>{l(video.title)}</b></span>
                  <span className="chevron" aria-hidden="true">›</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="bottom-actions">
        <button type="button" className="button soft" onClick={() => void copyText(spot.address).then((ok) => show(ok ? t("주소를 복사했어요") : t("복사하지 못했어요")))}>
          {t("주소 복사")}
        </button>
        <button type="button" className="button" onClick={() => openExternal(mapUrl({ name: l(spot.name), lat: spot.lat, lng: spot.lng, country: spot.country }))}>
          {t("지도 앱에서 열기")}
        </button>
      </div>
      {toast}
    </main>
  );
}
