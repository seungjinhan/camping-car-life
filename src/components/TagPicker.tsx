import { useState } from "react";
import { useI18n } from "../i18n";
import { newId, saveDictionary, translateAll } from "../lib/admin";
import { useApp } from "../state";
import { Field, TextInput } from "./form";
import { Sheet, useToast } from "./ui";

/** 태그를 고르고, 없는 태그는 그 자리에서 만들어 바로 골라요. 만든 태그는 태그 목록에도 남아요. */
export function TagPicker({ selected, onChange }: { selected: string[]; onChange: (next: string[]) => void }) {
  const { t, l } = useI18n();
  const { snapshot, reload } = useApp();
  const { tags } = snapshot.dictionary;
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { show, toast } = useToast();

  const add = async () => {
    const text = name.trim().replace(/^#/, "");
    if (!text || busy) return;
    const same = tags.find((item) => item.name.ko === text);
    if (same) {
      if (!selected.includes(same.key)) onChange([...selected, same.key]);
      setIsAdding(false);
      setName("");
      return;
    }
    setBusy(true);
    try {
      const tag = { key: newId("k"), name: (await translateAll({ name: text })).name };
      await saveDictionary({ ...snapshot.dictionary, tags: [...tags, tag] });
      await reload();
      onChange([...selected, tag.key]);
      setIsAdding(false);
      setName("");
    } catch {
      show(t("저장하지 못했어요. 다시 시도해 주세요."));
    } finally {
      setBusy(false);
    }
  };

  return (
    // Field(label) 안에 시트를 넣으면 label이 겹쳐서, 제목을 여기서 직접 그려요.
    <div className="field">
      <span className="field-label">{t("태그")}</span>
      <div className="chips wrap">
        {tags.map((item) => {
          const on = selected.includes(item.key);
          return (
            <button key={item.key} type="button" className={`chip${on ? " is-on" : ""}`} aria-pressed={on} onClick={() => onChange(on ? selected.filter((key) => key !== item.key) : [...selected, item.key])}>
              #{l(item.name)}
            </button>
          );
        })}
        <button type="button" className="chip" onClick={() => setIsAdding(true)}>+ {t("새 태그")}</button>
      </div>
      {isAdding && (
        <Sheet title={t("새 태그")} onClose={() => setIsAdding(false)}>
          <Field label={t("이름 (한국어)")}><TextInput value={name} onChange={setName} /></Field>
          <p className="muted">{t("저장하면 8개 언어로 자동 번역해요.")}</p>
          <button type="button" className="button" disabled={busy || !name.trim()} onClick={() => void add()}>{busy ? t("저장하는 중") : t("추가")}</button>
        </Sheet>
      )}
      {toast}
    </div>
  );
}
