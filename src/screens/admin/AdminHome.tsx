import { useState } from "react";
import { Header, Sheet, useToast } from "../../components/ui";
import { useRegionName } from "../../components/RegionFilter";
import { useI18n } from "../../i18n";
import { saveDictionary, saveJourney } from "../../lib/admin";
import { BASE_DICTIONARY } from "../../lib/baseDictionary";
import type { Journey } from "../../lib/types";
import { localDateKey } from "../../lib/format";
import { useApp } from "../../state";

export function AdminHome() {
  const { t, l } = useI18n();
  const { snapshot, go, reload } = useApp();
  const regionName = useRegionName();
  const [isPickingHere, setIsPickingHere] = useState(false);
  // 시작일이 없을 때 "지금 있는 곳"만 골라도 출발한 것으로 보이지 않게, 시작일은 비워 둬요.
  const journey: Journey = snapshot.journey ?? { startDate: "", phase: "korea", koreaDays: 365, here: { province: "", city: "", since: "" } };
  const [busy, setBusy] = useState(false);
  const { show, toast } = useToast();

  const setHere = async (spotId: string) => {
    const spot = snapshot.spots.find((item) => item.id === spotId);
    if (!spot) return;
    setBusy(true);
    try {
      await saveJourney({ ...journey, here: { spotId, province: spot.province, city: spot.city, since: localDateKey(new Date()) } });
      await reload();
      setIsPickingHere(false);
    } catch {
      show(t("처리하지 못했어요. 다시 시도해 주세요."));
    } finally {
      setBusy(false);
    }
  };

  // 처음 한 번: 실제 행정구역 · 시설 이름을 넣어요.
  const seed = async () => {
    setBusy(true);
    try {
      await saveDictionary(BASE_DICTIONARY);
      await reload();
    } catch {
      show(t("처리하지 못했어요. 다시 시도해 주세요."));
    } finally {
      setBusy(false);
    }
  };

  const tiles = [
    { label: t("차박지"), onClick: () => go({ screen: "adminSpot" }) },
    { label: t("축제"), onClick: () => go({ screen: "adminFestival" }) },
    { label: t("영상"), onClick: () => go({ screen: "adminVideo" }) },
    { label: t("차량관리"), onClick: () => go({ screen: "adminPost", board: "vehicle" }) },
    { label: t("소통 글"), onClick: () => go({ screen: "adminPost", board: "community" }) },
    { label: t("내 이야기"), onClick: () => go({ screen: "adminPost", board: "story" }) },
  ];

  return (
    <main className="screen">
      <Header title={t("관리자")} />
      <div className="grid3 stats">
        <div className="stat"><span className="muted">{t("차박지")}</span><strong>{snapshot.spots.length}</strong></div>
        <div className="stat"><span className="muted">{t("축제")}</span><strong>{snapshot.festivals.length}</strong></div>
        <div className="stat"><span className="muted">{t("영상")}</span><strong>{snapshot.videos.length}</strong></div>
      </div>
      <h2 className="section-title">{t("새로 쓰기")}</h2>
      <div className="grid3">
        {tiles.map((tile) => (
          <button key={tile.label} type="button" className="tile" onClick={tile.onClick}>{tile.label}</button>
        ))}
      </div>
      <h2 className="section-title">{t("관리")}</h2>
      {snapshot.dictionary.provinces.length === 0 && (
        <button type="button" className="button" disabled={busy} onClick={() => void seed()}>{t("기본 목록 넣기 (지역 · 특징 · 태그)")}</button>
      )}
      <button type="button" className="info-row as-button" onClick={() => setIsPickingHere(true)}>
        <span>{t("지금 있는 곳")}</span><span className="muted">{snapshot.journey?.here.province ? regionName(snapshot.journey.here) : t("정하지 않았어요")} ›</span>
      </button>
      <button type="button" className="info-row as-button" onClick={() => go({ screen: "adminDictionary" })}>
        <span>{t("그룹 · 태그")}</span><span className="chevron">›</span>
      </button>
      <p className="muted">{t("수정 · 삭제는 각 상세 화면 오른쪽 위 ⋯에서 해요.")}</p>
      {isPickingHere && (
        <Sheet title={t("지금 있는 곳")} onClose={() => setIsPickingHere(false)}>
          <ul className="list sheet-list">
            {[...snapshot.spots].sort((a, b) => b.visitedAt.localeCompare(a.visitedAt)).map((spot) => (
              <li key={spot.id}>
                <button type="button" className="row-button" disabled={busy} onClick={() => void setHere(spot.id)}>
                  <span className="row-main"><b>{l(spot.name)}</b><span className="muted">{regionName(spot)}</span></span>
                  {snapshot.journey?.here.spotId === spot.id && <span className="tag is-strong">{t("지금")}</span>}
                </button>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
      {toast}
    </main>
  );
}
