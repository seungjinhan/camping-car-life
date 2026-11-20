import { useCallback, useState } from "react";
import { Field, MultiChips, SaveBar, SingleChips, TextArea, TextInput } from "../../components/form";
import { geocode, hasMapKey, KakaoMap } from "../../components/KakaoMap";
import { RegionFields } from "../../components/RegionFields";
import { Header } from "../../components/ui";
import { useRegionPicker } from "../../components/useRegionPicker";
import { useSave } from "../../components/useSave";
import { TagPicker } from "../../components/TagPicker";
import { useI18n } from "../../i18n";
import { newId, saveItem, translateAll } from "../../lib/admin";
import { localDateKey } from "../../lib/format";
import { SPOT_CATEGORIES, type SpotCategory } from "../../lib/types";
import { SPOT_CATEGORY_LABEL, spotCategory } from "../../components/spotCategory";
import { useApp } from "../../state";

export function SpotForm({ id }: { id?: string }) {
  const { t, l } = useI18n();
  const { snapshot } = useApp();
  const { dictionary } = snapshot;
  const initial = snapshot.spots.find((spot) => spot.id === id);
  const picker = useRegionPicker(initial);
  const { busy, run, show, toast } = useSave();
  const [name, setName] = useState(initial?.name.ko ?? "");
  const [category, setCategory] = useState<SpotCategory>(spotCategory(initial?.category));
  const [visitedAt, setVisitedAt] = useState(initial?.visitedAt ?? localDateKey(new Date()));
  const [type, setType] = useState(initial?.type ?? dictionary.spotTypes[0]?.key ?? "");
  const [features, setFeatures] = useState(initial?.features ?? []);
  const [tags, setTags] = useState(initial?.tags ?? []);
  const [address, setAddress] = useState(initial?.address ?? "");
  const [lat, setLat] = useState(initial ? String(initial.lat) : "");
  const [lng, setLng] = useState(initial ? String(initial.lng) : "");
  const [description, setDescription] = useState(initial?.description.ko ?? "");
  const pick = useCallback((nextLat: number, nextLng: number) => {
    setLat(nextLat.toFixed(5));
    setLng(nextLng.toFixed(5));
  }, []);
  const latNum = Number(lat);
  const lngNum = Number(lng);
  const isValid = name.trim() && visitedAt && lat && lng && Number.isFinite(latNum) && Number.isFinite(lngNum) && Math.abs(latNum) <= 90 && Math.abs(lngNum) <= 180;

  const search = async () => {
    const found = await geocode(address);
    if (found) pick(found.lat, found.lng);
    else show(t("주소로 위치를 찾지 못했어요"));
  };

  const save = () =>
    run(async () => {
      // 차박지 이름 · 설명은 번역하고, 주소는 지도 앱에서 찾을 수 있게 원문으로 둬요.
      const translated = await translateAll({ name, description });
      await saveItem("spots", { id: initial?.id ?? newId("s"), name: translated.name, description: translated.description, category, visitedAt, type, ...picker.value, features, tags, address: address.trim(), lat: latNum, lng: lngNum });
    }, true);

  return (
    <main className="screen has-actions">
      <Header title={initial ? t("차박지 수정") : t("차박지 등록")} />
      <Field label={t("이름 (한국어)")}><TextInput value={name} onChange={setName} placeholder={t("예: 인제 내린천 오토캠핑")} /></Field>
      <Field label={t("분류")}><SingleChips selected={category} onChange={(next) => setCategory(next as SpotCategory)} items={SPOT_CATEGORIES.map((key) => ({ key, label: t(SPOT_CATEGORY_LABEL[key]) }))} /></Field>
      <Field label={t("방문일")}><TextInput type="date" value={visitedAt} onChange={setVisitedAt} /></Field>
      <Field label={t("유형")}><SingleChips selected={type} onChange={setType} items={dictionary.spotTypes.map((item) => ({ key: item.key, label: l(item.name) }))} /></Field>
      <RegionFields picker={picker} />
      <Field label={t("특징")}><MultiChips selected={features} onChange={setFeatures} items={dictionary.features.map((item) => ({ key: item.key, label: l(item.name) }))} /></Field>
      <TagPicker selected={tags} onChange={setTags} />
      <Field label={t("주소")}>
        <div className="input-row">
          <TextInput value={address} onChange={setAddress} placeholder={t("도로명 주소")} />
          {hasMapKey && picker.value.country === "kr" && <button type="button" className="button small soft" onClick={() => void search()}>{t("검색")}</button>}
        </div>
      </Field>
      {picker.value.country === "kr" && <KakaoMap height={180} pins={lat && lng ? [{ id: "pick", lat: latNum, lng: lngNum, title: name }] : []} onPick={pick} />}
      <div className="grid2">
        <Field label={t("위도")}><TextInput value={lat} onChange={setLat} inputMode="decimal" placeholder="37.98" /></Field>
        <Field label={t("경도")}><TextInput value={lng} onChange={setLng} inputMode="decimal" placeholder="128.17" /></Field>
      </div>
      <p className="muted">{t("국내는 지도를 눌러 위치를 정하고, 해외는 위도 · 경도를 직접 넣어요.")}</p>
      <Field label={t("설명 (한국어)")}><TextArea value={description} onChange={setDescription} /></Field>
      <p className="muted">{t("등록하면 이름 · 설명을 8개 언어로 자동 번역해요.")}</p>
      <SaveBar label={busy ? t("저장하는 중") : initial ? t("수정") : t("등록")} busy={busy} disabled={!isValid} onSave={() => void save()} />
      {toast}
    </main>
  );
}
