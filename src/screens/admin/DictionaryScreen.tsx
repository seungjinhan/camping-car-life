import { useState } from "react";
import { Field, TextInput } from "../../components/form";
import { Header, Segmented, Sheet, useToast } from "../../components/ui";
import { useI18n } from "../../i18n";
import { newId, saveDictionary, translateAll, translateConfigured } from "../../lib/admin";
import type { Dictionary, Named } from "../../lib/types";
import { useApp } from "../../state";

type Group = "regions" | "features" | "tags" | "spotTypes" | "vehicleCategories";

/** 지역 · 특징 · 태그 · 유형 · 차량관리 분류 목록이에요. 이름은 추가할 때 9개 언어로 번역해요. */
export function DictionaryScreen() {
  const { t, l } = useI18n();
  const { snapshot, reload } = useApp();
  const { dictionary } = snapshot;
  const { show, toast } = useToast();
  const [group, setGroup] = useState<Group>("regions");
  const [province, setProvince] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ item: Named | null } | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const currentProvince = dictionary.provinces.find((item) => item.key === province);
  const list: Named[] = group === "regions" ? (currentProvince ? currentProvince.cities : dictionary.provinces) : dictionary[group];

  const open = (item: Named | null) => {
    setName(item?.name.ko ?? "");
    setIsConfirming(false);
    setEditing({ item });
  };

  const save = async () => {
    if (!editing || !name.trim() || busy) return;
    setBusy(true);
    try {
      const translated = (await translateAll({ name })).name;
      const next: Named = { key: editing.item?.key ?? newId("k"), name: translated };
      const replace = (items: Named[]) => (editing.item ? items.map((item) => (item.key === next.key ? next : item)) : [...items, next]);
      let updated: Dictionary;
      if (group !== "regions") updated = { ...dictionary, [group]: replace(dictionary[group]) };
      else if (currentProvince) updated = { ...dictionary, provinces: dictionary.provinces.map((p) => (p.key === currentProvince.key ? { ...p, cities: replace(p.cities) } : p)) };
      else updated = { ...dictionary, provinces: editing.item ? dictionary.provinces.map((p) => (p.key === next.key ? { ...p, name: next.name } : p)) : [...dictionary.provinces, { ...next, country: dictionary.countries[0]?.key ?? "kr", cities: [] }] };
      await saveDictionary(updated);
      await reload();
      setEditing(null);
      show(translateConfigured() ? t("저장했어요") : t("번역 주소가 없어 한국어만 저장했어요"));
    } catch {
      show(t("저장하지 못했어요. 다시 시도해 주세요."));
    } finally {
      setBusy(false);
    }
  };

  // 태그만 지울 수 있어요. 글 · 차박지 · 영상에 남은 태그 키는 화면에서 안 보여요.
  const remove = async () => {
    const key = editing?.item?.key;
    if (!key || busy) return;
    setBusy(true);
    try {
      await saveDictionary({ ...dictionary, tags: dictionary.tags.filter((item) => item.key !== key) });
      await reload();
      setEditing(null);
      show(t("삭제했어요"));
    } catch {
      show(t("처리하지 못했어요. 다시 시도해 주세요."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="screen">
      <Header title={currentProvince ? `${t("그룹 · 태그")} · ${l(currentProvince.name)}` : t("그룹 · 태그")} />
      <Segmented
        label={t("종류")}
        selected={group}
        onSelect={(next) => { setGroup(next); setProvince(null); }}
        items={[{ key: "regions", label: t("지역") }, { key: "features", label: t("특징") }, { key: "tags", label: t("태그") }, { key: "spotTypes", label: t("유형") }, { key: "vehicleCategories", label: t("분류") }]}
      />
      {currentProvince && <button type="button" className="link" onClick={() => setProvince(null)}>‹ {t("도 목록")}</button>}
      <ul className="list">
        {list.map((item) => {
          const cities = group === "regions" && !currentProvince ? dictionary.provinces.find((p) => p.key === item.key)?.cities.length ?? 0 : null;
          return (
            <li key={item.key}>
              <div className="row-button">
                <span className="row-main"><b>{l(item.name)}</b>{item.name.ko !== l(item.name) && <span className="muted">{item.name.ko}</span>}</span>
                {cities !== null && <button type="button" className="link" onClick={() => setProvince(item.key)}>{t("시군 {n}", { n: cities })} ›</button>}
                <button type="button" className="button small soft" onClick={() => open(item)}>{t("수정")}</button>
              </div>
            </li>
          );
        })}
      </ul>
      <button type="button" className="button soft" onClick={() => open(null)}>+ {t("추가")}</button>
      {editing && (
        <Sheet title={isConfirming ? t("삭제할까요?") : editing.item ? t("이름 수정") : t("추가")} onClose={() => setEditing(null)}>
          {isConfirming ? (
            <>
              <p className="muted">{t("이 태그를 단 글 · 차박지 · 영상에서도 태그가 사라져요. 되돌릴 수 없어요.")}</p>
              <button type="button" className="button danger" disabled={busy} onClick={() => void remove()}>{t("삭제")}</button>
              <button type="button" className="button soft" onClick={() => setIsConfirming(false)}>{t("취소")}</button>
            </>
          ) : (
            <>
              <Field label={t("이름 (한국어)")}><TextInput value={name} onChange={setName} /></Field>
              <p className="muted">{t("저장하면 8개 언어로 자동 번역해요.")}</p>
              <button type="button" className="button" disabled={busy || !name.trim()} onClick={() => void save()}>{busy ? t("저장하는 중") : t("저장")}</button>
              {group === "tags" && editing.item && <button type="button" className="button danger" onClick={() => setIsConfirming(true)}>{t("삭제")}</button>}
            </>
          )}
        </Sheet>
      )}
      {toast}
    </main>
  );
}

