import { useEffect, useState } from "react";
import { KakaoMap } from "../components/KakaoMap";
import { useRegionName } from "../components/RegionFilter";
import { EmptyState, ErrorState, useToast } from "../components/ui";
import { useI18n } from "../i18n";
import { campsiteSourceUrl, loadCampsites, type Campsite } from "../lib/campsites";
import { copyText, mapSearchUrl, mapUrl, openExternal } from "../lib/platform";

/** 정해진 값(시설, 유형, 계절)은 번역하고, 나머지는 쓴 그대로 둬요. */
export function useCampsiteText() {
  const { t } = useI18n();
  return (value: string) => value.split(/\s*([,+])\s*/).map((part) => (part === "," ? ", " : part === "+" ? " + " : t(part))).join("");
}

export function CampsiteScreen({ province, id }: { province: string; id: number }) {
  const { t } = useI18n();
  const regionName = useRegionName();
  const known = useCampsiteText();
  const { show, toast } = useToast();
  const [camp, setCamp] = useState<Campsite | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    loadCampsites(province)
      .then((items) => setCamp(items.find((item) => item.id === id) ?? null))
      .catch(() => setFailed(true));
  };
  useEffect(load, [province, id]);

  if (failed) return <main className="screen"><ErrorState onRetry={load} /></main>;
  if (camp === undefined) return <main className="screen" />;
  if (camp === null) return <main className="screen"><EmptyState title={t("찾을 수 없어요")} /></main>;

  const rows: [string, string][] = [
    [t("문의처"), camp.phone],
    [t("운영기간"), known(camp.season)],
    [t("운영일"), known(camp.days)],
    [t("반려동물"), known(camp.pets)],
    [t("주변 시설"), camp.nearby],
    [t("기타 정보"), camp.note],
  ];

  return (
    <main className="screen has-actions">
      {camp.lat ? <KakaoMap height={180} pins={[{ id: String(camp.id), lat: camp.lat, lng: camp.lng, title: camp.name }]} /> : <div className="address-card">{camp.address}</div>}
      <h1 className="title">{camp.name}</h1>
      <p className="muted">{[t("캠핑장"), regionName(camp), known(camp.kind)].filter(Boolean).join(" · ")}</p>
      {camp.summary && <p className="body-text">{camp.summary}</p>}
      {camp.facilities.length > 0 && (
        <section>
          <h2 className="section-title">{t("시설")}</h2>
          <div className="feature-grid">{camp.facilities.map((name) => <span key={name} className="feature">{t(name)}</span>)}</div>
        </section>
      )}
      <section>
        <div className="info-row">
          <span>{t("주소")}</span>
          <span className="muted">{camp.address}</span>
        </div>
        {rows.filter(([, value]) => value && value !== "-").map(([label, value]) => (
          <div key={label} className="info-row">
            <span>{label}</span>
            <span className="muted">{value}</span>
          </div>
        ))}
        {camp.homepage && (
          <button type="button" className="info-row as-button" onClick={() => openExternal(camp.homepage)}>
            <span>{t("홈페이지")}</span>
            <span className="muted">{t("열기")} ›</span>
          </button>
        )}
      </section>
      <button type="button" className="link" onClick={() => openExternal(campsiteSourceUrl(camp.id))}>
        {t("출처: 한국관광공사 고캠핑")}{camp.updated && ` · ${t("{date} 수정", { date: camp.updated })}`} ›
      </button>
      <p className="muted">{t("현장 사정과 다를 수 있어요. 가기 전에 캠핑장에 확인해 주세요.")}</p>
      <div className="bottom-actions">
        <button type="button" className="button soft" onClick={() => void copyText(camp.address).then((ok) => show(ok ? t("주소를 복사했어요") : t("복사하지 못했어요")))}>
          {t("주소 복사")}
        </button>
        <button type="button" className="button" onClick={() => openExternal(camp.lat ? mapUrl({ name: camp.name, lat: camp.lat, lng: camp.lng, country: "kr" }) : mapSearchUrl(camp.address))}>
          {t("지도 앱에서 열기")}
        </button>
      </div>
      {toast}
    </main>
  );
}
