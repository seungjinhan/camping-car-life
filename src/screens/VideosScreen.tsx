import { useMemo } from "react";
import { useApp } from "../state";
import { ALL, ANY_REGION, matchesRegion, RegionFilter, useRegionName, type Region } from "../components/RegionFilter";
import { Chips, EmptyState, Header, Segmented, Thumb, usePagedList, useSticky } from "../components/ui";
import { useI18n } from "../i18n";
import { VIDEO_KINDS, type VideoKind } from "../lib/types";
import { newestVideoFirst } from "../lib/youtube";

export const VIDEO_KIND_LABEL: Record<VideoKind, string> = { travel: "여행", camper: "캠핑카", repair: "수리", etc: "기타" };

export function VideosScreen() {
  const { t, l } = useI18n();
  const { snapshot, go } = useApp();
  const { dictionary } = snapshot;
  const regionName = useRegionName();
  const [kind, setKind] = useSticky<VideoKind | typeof ALL>("videos:kind", ALL);
  const [region, setRegion] = useSticky<Region>("videos:region", ANY_REGION);
  const [tag, setTag] = useSticky("videos:tag", ALL);

  const filtered = useMemo(
    () =>
      snapshot.videos
        .filter((video) => (kind === ALL || video.kind === kind) && matchesRegion(video, region) && (tag === ALL || video.tags.includes(tag)))
        .sort(newestVideoFirst),
    [snapshot.videos, kind, region, tag],
  );
  const { visible, sentinel } = usePagedList(filtered, `${kind}/${region.province}/${region.city}/${tag}`, "videos");
  const usedTags = dictionary.tags.filter((item) => snapshot.videos.some((video) => video.tags.includes(item.key)));

  return (
    <main className="screen">
      <Header title={t("영상")} />
      <Segmented label={t("타입")} selected={kind} onSelect={setKind} items={[{ key: ALL, label: t("전체") }, ...VIDEO_KINDS.map((key) => ({ key, label: t(VIDEO_KIND_LABEL[key]) }))]} />
      <RegionFilter items={snapshot.videos} value={region} onChange={setRegion} />
      <Chips label={t("태그")} selected={tag} onSelect={setTag} items={[{ key: ALL, label: t("태그 전체") }, ...usedTags.map((item) => ({ key: item.key, label: `#${l(item.name)}` }))]} />
      {filtered.length === 0 && <EmptyState title={t("조건에 맞는 영상이 없어요")} body={t("필터를 바꿔 보세요.")} />}
      <ul className="video-list">
        {visible.map((video) => (
          <li key={video.id}>
            <button type="button" className="plain" onClick={() => go({ screen: "video", id: video.id })}>
              <Thumb youtubeId={video.youtubeId} />
              <b className="video-title">{l(video.title)}</b>
              <span className="muted">{[video.channel, t(VIDEO_KIND_LABEL[video.kind]), regionName(video)].join(" · ")}</span>
            </button>
          </li>
        ))}
      </ul>
      {sentinel}
    </main>
  );
}

