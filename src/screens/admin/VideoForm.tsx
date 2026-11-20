import { useState } from "react";
import { Field, SaveBar, Select, SingleChips, TextInput } from "../../components/form";
import { RegionFields } from "../../components/RegionFields";
import { Header, Thumb } from "../../components/ui";
import { useRegionPicker } from "../../components/useRegionPicker";
import { useSave } from "../../components/useSave";
import { TagPicker } from "../../components/TagPicker";
import { useI18n } from "../../i18n";
import { newId, saveItem, translateAll } from "../../lib/admin";
import { track } from "../../lib/progress";
import { VIDEO_KINDS, type VideoKind } from "../../lib/types";
import { fetchYoutubeInfo, parseYoutubeId } from "../../lib/youtube";
import { useApp } from "../../state";
import { VIDEO_KIND_LABEL } from "../VideosScreen";

export function VideoForm({ id }: { id?: string }) {
  const { t, l } = useI18n();
  const { snapshot } = useApp();
  const initial = snapshot.videos.find((item) => item.id === id);
  const picker = useRegionPicker(initial);
  const { busy, run, show, toast } = useSave();
  const [link, setLink] = useState(initial?.youtubeId ? `https://youtu.be/${initial.youtubeId}` : "");
  const [youtubeId, setYoutubeId] = useState(initial?.youtubeId ?? "");
  const [title, setTitle] = useState(initial?.title.ko ?? "");
  const [channel, setChannel] = useState(initial?.channel ?? "");
  const [kind, setKind] = useState<VideoKind>(initial?.kind ?? "travel");
  const [tags, setTags] = useState(initial?.tags ?? []);
  const [spotId, setSpotId] = useState(initial?.spotId ?? "");
  const [isFetching, setIsFetching] = useState(false);
  const isValid = youtubeId && title.trim();

  const load = async () => {
    const parsed = parseYoutubeId(link);
    if (!parsed) return show(t("유튜브 주소를 확인해 주세요"));
    setYoutubeId(parsed);
    setIsFetching(true);
    try {
      const info = await track(fetchYoutubeInfo(parsed));
      if (info) {
        setTitle(info.title);
        setChannel(info.channel);
      } else show(t("제목을 가져오지 못했어요. 직접 적어 주세요."));
    } finally {
      setIsFetching(false);
    }
  };

  const save = () =>
    run(async () => {
      // 제목은 번역하고, 채널명은 원래대로 둬요.
      const translated = await translateAll({ title });
      await saveItem("videos", { id: initial?.id ?? newId("v"), youtubeId, title: translated.title, channel: channel.trim(), kind, ...picker.value, tags, ...(spotId ? { spotId } : {}), createdAt: initial?.createdAt ?? new Date().toISOString().slice(0, 10) });
    }, true);

  return (
    <main className="screen has-actions">
      <Header title={initial ? t("영상 수정") : t("영상 등록")} />
      <Field label={t("유튜브 주소")}>
        <div className="input-row">
          <TextInput value={link} onChange={setLink} inputMode="url" placeholder="https://youtu.be/…" />
          <button type="button" className="button small soft" disabled={isFetching} onClick={() => void load()}>{t("불러오기")}</button>
        </div>
      </Field>
      {youtubeId && <Thumb youtubeId={youtubeId} />}
      <Field label={t("제목 (한국어)")}><TextInput value={title} onChange={setTitle} /></Field>
      <Field label={t("채널명")}><TextInput value={channel} onChange={setChannel} /></Field>
      <Field label={t("타입")}><SingleChips selected={kind} onChange={(next) => setKind(next as VideoKind)} items={VIDEO_KINDS.map((key) => ({ key, label: t(VIDEO_KIND_LABEL[key]) }))} /></Field>
      <RegionFields picker={picker} />
      <TagPicker selected={tags} onChange={setTags} />
      <Field label={t("연결할 차박지")}>
        <Select value={spotId} onChange={setSpotId} options={[{ key: "", label: t("없음") }, ...snapshot.spots.map((spot) => ({ key: spot.id, label: l(spot.name) }))]} />
      </Field>
      <SaveBar label={busy ? t("저장하는 중") : initial ? t("수정") : t("등록")} busy={busy} disabled={!isValid} onSave={() => void save()} />
      {toast}
    </main>
  );
}
