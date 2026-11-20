import { findName, useApp } from "../state";
import { AdminActions } from "../components/AdminActions";
import { useRegionName } from "../components/RegionFilter";
import { EmptyState, PlayIcon, Tag } from "../components/ui";
import { useI18n } from "../i18n";
import { openExternal } from "../lib/platform";
import { VIDEO_KIND_LABEL } from "./VideosScreen";

export function VideoScreen({ id }: { id: string }) {
  const { t, l } = useI18n();
  const { snapshot, go } = useApp();
  const regionName = useRegionName();
  const video = snapshot.videos.find((item) => item.id === id);
  if (!video) return <main className="screen"><EmptyState title={t("찾을 수 없어요")} /></main>;
  const spot = video.spotId ? snapshot.spots.find((item) => item.id === video.spotId) : undefined;

  return (
    <main className="screen">
      <div className="player">
        {video.youtubeId ? (
          <iframe src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?playsinline=1`} title={l(video.title)} allow="encrypted-media; picture-in-picture" allowFullScreen />
        ) : (
          <div className="player-empty"><PlayIcon /><span>{t("샘플 영상이에요")}</span></div>
        )}
      </div>
      <div className="title-row"><h1 className="title">{l(video.title)}</h1><AdminActions kind="videos" id={video.id} onEdit={() => go({ screen: "adminVideo", id: video.id })} /></div>
      <p className="muted">{[video.channel, t(VIDEO_KIND_LABEL[video.kind]), regionName(video)].join(" · ")}</p>
      <div className="tags">{video.tags.filter((key) => findName(snapshot.dictionary.tags, key)).map((key) => <Tag key={key}>#{l(findName(snapshot.dictionary.tags, key))}</Tag>)}</div>
      {video.youtubeId && (
        <button type="button" className="button soft" onClick={() => openExternal(`https://www.youtube.com/watch?v=${video.youtubeId}`)}>{t("유튜브에서 보기")}</button>
      )}
      {spot && (
        <button type="button" className="row-button card" onClick={() => go({ screen: "spot", id: spot.id })}>
          <span className="icon-box">{t("장소")}</span>
          <span className="row-main"><b>{l(spot.name)}</b><span className="muted">{regionName(spot)}</span></span>
          <span className="chevron" aria-hidden="true">›</span>
        </button>
      )}
    </main>
  );
}
