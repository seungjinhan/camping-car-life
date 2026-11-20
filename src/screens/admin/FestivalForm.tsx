import { useState } from "react";
import { Field, SaveBar, TextArea, TextInput } from "../../components/form";
import { RegionFields } from "../../components/RegionFields";
import { Header } from "../../components/ui";
import { useRegionPicker } from "../../components/useRegionPicker";
import { useSave } from "../../components/useSave";
import { useI18n } from "../../i18n";
import { newId, saveItem, translateAll } from "../../lib/admin";
import { distanceKm } from "../../lib/format";
import type { Festival } from "../../lib/types";
import { useApp } from "../../state";

/** 날짜의 해를 1년 뒤로 옮겨요 (작년 축제 복사). */
function nextYear(date: string): string {
  return date ? `${Number(date.slice(0, 4)) + 1}${date.slice(4)}` : date;
}

export function FestivalForm({ id }: { id?: string }) {
  const { t, l } = useI18n();
  const { snapshot } = useApp();
  const [initial, setInitial] = useState<Festival | undefined>(() => snapshot.festivals.find((item) => item.id === id));
  const isEdit = Boolean(id);
  const picker = useRegionPicker(initial);
  const { busy, run, toast } = useSave();
  const [name, setName] = useState(initial?.name.ko ?? "");
  const [start, setStart] = useState(initial?.start ?? "");
  const [end, setEnd] = useState(initial?.end ?? "");
  const [place, setPlace] = useState(initial?.place.ko ?? "");
  const [lat, setLat] = useState(initial ? String(initial.lat) : "");
  const [lng, setLng] = useState(initial ? String(initial.lng) : "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [intro, setIntro] = useState(initial?.intro.ko ?? "");
  const [isCopying, setIsCopying] = useState(false);
  const latNum = Number(lat);
  const lngNum = Number(lng);
  const hasPoint = lat !== "" && lng !== "" && Number.isFinite(latNum) && Number.isFinite(lngNum);
  const isValid = name.trim() && start && end && end >= start && hasPoint;
  const nearby = hasPoint ? snapshot.spots.map((spot) => ({ spot, km: distanceKm(spot, { lat: latNum, lng: lngNum }) })).filter((item) => item.km <= 10).sort((a, b) => a.km - b.km) : [];

  const copyFrom = (festival: Festival) => {
    setInitial(undefined);
    setName(festival.name.ko);
    setStart(nextYear(festival.start));
    setEnd(nextYear(festival.end));
    setPlace(festival.place.ko);
    setLat(String(festival.lat));
    setLng(String(festival.lng));
    setUrl(festival.url);
    setIntro(festival.intro.ko);
    picker.setCountry(festival.country);
    picker.setProvince(festival.province);
    picker.setCity(festival.city);
    setIsCopying(false);
  };

  const save = () =>
    run(async () => {
      const translated = await translateAll({ name, place, intro });
      await saveItem("festivals", { id: id ?? newId("f"), ...translated, start, end, ...picker.value, lat: latNum, lng: lngNum, url: url.trim() });
    }, true);

  return (
    <main className="screen has-actions">
      <Header title={isEdit ? t("축제 수정") : t("축제 등록")} right={!isEdit && <button type="button" className="link" onClick={() => setIsCopying((v) => !v)}>{t("작년 축제 복사")}</button>} />
      {isCopying && (
        <ul className="list card">
          {snapshot.festivals.map((festival) => (
            <li key={festival.id}>
              <button type="button" className="row-button" onClick={() => copyFrom(festival)}>
                <span className="row-main"><b>{l(festival.name)}</b><span className="muted">{festival.start} ~ {festival.end}</span></span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Field label={t("이름 (한국어)")}><TextInput value={name} onChange={setName} /></Field>
      <RegionFields picker={picker} />
      <div className="grid2">
        <Field label={t("시작일")}><TextInput type="date" value={start} onChange={setStart} /></Field>
        <Field label={t("종료일")}><TextInput type="date" value={end} onChange={setEnd} /></Field>
      </div>
      <Field label={t("장소 (한국어)")}><TextInput value={place} onChange={setPlace} /></Field>
      <div className="grid2">
        <Field label={t("위도")}><TextInput value={lat} onChange={setLat} inputMode="decimal" /></Field>
        <Field label={t("경도")}><TextInput value={lng} onChange={setLng} inputMode="decimal" /></Field>
      </div>
      <Field label={t("공식 사이트")}><TextInput value={url} onChange={setUrl} inputMode="url" placeholder="https://" /></Field>
      <Field label={t("소개 (한국어)")}><TextArea value={intro} onChange={setIntro} /></Field>
      <section>
        <h2 className="section-title">{t("근처 차박지 미리보기")} <span className="muted">{t("10km 안")}</span></h2>
        {nearby.length === 0 ? <p className="muted">{t("10km 안에 차박지가 없어요")}</p> : nearby.map(({ spot, km }) => (
          <div key={spot.id} className="info-row"><span>{l(spot.name)}</span><span className="muted">{km.toFixed(1)}km</span></div>
        ))}
      </section>
      <SaveBar label={busy ? t("저장하는 중") : isEdit ? t("수정") : t("등록")} busy={busy} disabled={!isValid} onSave={() => void save()} />
      {toast}
    </main>
  );
}
