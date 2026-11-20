import { useEffect, useMemo, useState } from "react";
import { findName, useApp } from "../state";
import { EventList, eventTime } from "../components/EventList";
import { eventsOn, MonthCalendar } from "../components/MonthCalendar";
import { useRegionName } from "../components/RegionFilter";
import { Badge, ErrorState, setSticky, Tag, Thumb } from "../components/ui";
import { useBoard } from "../components/useBoard";
import { useMonthEvents } from "../components/useEvents";
import { useI18n } from "../i18n";
import { dayCount, formatShort, localDateKey } from "../lib/format";
import { eventStart, loadEvents } from "../lib/source";
import { newestVideoFirst } from "../lib/youtube";
import { loadTourFestivals, type TourFestival } from "../lib/tour";
import type { CalendarEvent } from "../lib/types";
import { IS_WEB } from "../lib/platform";

/** 이번 달과 다음 달에서 아직 지나지 않은 첫 일정이에요. */
function useNextEvent(): CalendarEvent | null {
  const [next, setNext] = useState<CalendarEvent | null>(null);
  useEffect(() => {
    const now = new Date();
    Promise.all([loadEvents(now.getFullYear(), now.getMonth()), loadEvents(now.getFullYear(), now.getMonth() + 1)])
      .then(([a, b]) => {
        const upcoming = [...a, ...b].filter((event) => new Date(eventStart(event)) >= new Date(localDateKey(now) + "T00:00:00"));
        upcoming.sort((x, y) => eventStart(x).localeCompare(eventStart(y)));
        setNext(upcoming[0] ?? null);
      })
      .catch(() => setNext(null));
  }, []);
  return next;
}

/** 한국관광공사 축제예요. 홈의 다가오는 축제에 운영자가 등록한 축제와 함께 보여줘요. */
function useTourFestivals(): TourFestival[] {
  const [items, setItems] = useState<TourFestival[]>([]);
  useEffect(() => {
    loadTourFestivals().then(setItems).catch(() => setItems([]));
  }, []);
  return items;
}

/** 홈은 나의 캠핑카 라이프가 먼저예요: 근황 → 내 이야기 → 영상 → 다녀온 차박지 → 축제 → 달력. 비어 있는 칸은 숨겨요. */
export function HomeScreen() {
  const { t, l, language } = useI18n();
  const { snapshot, go } = useApp();
  const { journey, spots, videos, posts, festivals, dictionary } = snapshot;
  const regionName = useRegionName();
  const boards = useBoard();
  const calendar = useMonthEvents();
  const nextEvent = useNextEvent();
  const tourFestivals = useTourFestivals();
  const today = localDateKey(new Date());
  // 출발일이 오늘이거나 지났으면 캠핑카 생활 중, 아니면(없거나 미래) 출발 준비 중이에요.
  const started = Boolean(journey?.startDate && journey.startDate <= today);
  const days = started && journey ? dayCount(journey.startDate, new Date()) : 0;
  const daysLeft = journey?.startDate && !started ? 1 - dayCount(journey.startDate, new Date()) : null;
  const progress = journey ? Math.min(100, Math.max(0, (days / journey.koreaDays) * 100)) : 0;
  const here = journey ? spots.find((spot) => spot.id === journey.here.spotId) : undefined;
  const stories = posts.filter((post) => post.board === "story").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentVideos = [...videos].sort(newestVideoFirst).slice(0, 3);
  const visited = [...spots].sort((a, b) => b.visitedAt.localeCompare(a.visitedAt)).slice(0, 2);
  const upcoming = useMemo(
    () =>
      [
        ...festivals.map((f) => ({ key: f.id, name: l(f.name), province: f.province, city: f.city, start: f.start, end: f.end, open: () => go({ screen: "festival", id: f.id }) })),
        ...tourFestivals.map((f) => ({ key: `kto${f.id}`, name: f.name, province: f.province, city: f.city, start: f.start, end: f.end, open: () => go({ screen: "tourFestival", id: f.id }) })),
      ]
        .filter((f) => f.end >= today)
        // 오늘 이후 시작하는 축제를 먼저(시작 순), 그다음 이미 진행 중인 축제(곧 끝나는 순)예요. 몇 년째 하는 공연이 맨 위에 오지 않게요.
        .sort((a, b) => Number(a.start < today) - Number(b.start < today) || (a.start < today ? a.end.localeCompare(b.end) : a.start.localeCompare(b.start)))
        .slice(0, 2),
    [festivals, tourFestivals, today, l, go],
  );
  const hasFestivals = festivals.length + tourFestivals.length > 0;

  return (
    <main className="screen">
      <header className="header">
        <h1>{t("캠핑카라이프")}</h1>
      </header>

      <section className="card journey">
        {started && journey ? (
          <>
            <div className="journey-head">
              <strong>{t("캠핑카 생활 D+{n}", { n: days })}</strong>
              <span className="muted">{journey.phase === "korea" ? t("국내 1년 여행 중") : t("세계여행 중")}</span>
            </div>
            <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={journey.koreaDays} aria-valuenow={days}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <span className="muted">{t("{n} / {total}일", { n: days, total: journey.koreaDays })}</span>
          </>
        ) : (
          // 출발 전에는 D-day와 출발일만 보여줘요. 출발일을 아직 안 정했으면 "출발 준비 중"만.
          <div className="journey-head">
            <strong>{daysLeft !== null ? t("출발 준비 중 · D-{n}", { n: daysLeft }) : t("출발 준비 중")}</strong>
            {journey?.startDate && <span className="muted">{t("{date} 출발", { date: formatShort(journey.startDate, language) })}</span>}
          </div>
        )}
        {journey?.here.province && (
          <button type="button" className="row-button" onClick={() => here && go({ screen: "spot", id: here.id })} disabled={!here}>
            <span className="icon-box">{t("지금")}</span>
            <span className="row-main">
              <b>{t("지금 {place}에 있어요", { place: regionName(journey.here) })}</b>
              <span className="muted">{[here && l(here.name), journey.here.since && t("{date}부터", { date: formatShort(journey.here.since, language) })].filter(Boolean).join(" · ")}</span>
            </span>
            {here && <span className="chevron" aria-hidden="true">›</span>}
          </button>
        )}
        {nextEvent && (
          <button type="button" className="row-button" onClick={() => go({ screen: "event", event: nextEvent })}>
            <span className="icon-box">{formatShort(eventStart(nextEvent), language)}</span>
            <span className="row-main">
              <span className="muted">{t("다음 일정")}</span>
              <b>{nextEvent.title}</b>
              <span className="muted">{[eventTime(nextEvent, language, t("하루 종일")), nextEvent.location].filter(Boolean).join(" · ")}</span>
            </span>
            <span className="chevron" aria-hidden="true">›</span>
          </button>
        )}
      </section>

      {stories.length > 0 && (
        <section>
          <div className="section-head">
            <h2 className="section-title">{t("최근 내 이야기")}</h2>
            <button type="button" className="link" onClick={() => go({ screen: "story" })}>{t("전체")} ›</button>
          </div>
          <div className="hscroll">
            {stories.map((post) => (
              <button key={post.id} type="button" className="story-card" onClick={() => go({ screen: "post", id: post.id })}>
                <Badge>{boards.label(post.board, post.category)}</Badge>
                <b className="clamp">{post.title}</b>
                <span className="muted clamp">{post.body}</span>
                <span className="muted">{formatShort(post.createdAt, language)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {recentVideos.length > 0 && (
        <section>
          <div className="section-head">
            <h2 className="section-title">{t("최근 영상")}</h2>
            {!IS_WEB && <button type="button" className="link" onClick={() => go({ screen: "videos" })}>{t("전체")} ›</button>}
          </div>
          <button type="button" className="plain" onClick={() => go({ screen: "video", id: recentVideos[0].id })}>
            <Thumb youtubeId={recentVideos[0].youtubeId} />
            <b className="video-title">{l(recentVideos[0].title)}</b>
          </button>
          {recentVideos.length > 1 && (
            <div className="grid2">
              {recentVideos.slice(1).map((video) => (
                <button key={video.id} type="button" className="plain" onClick={() => go({ screen: "video", id: video.id })}>
                  <Thumb youtubeId={video.youtubeId} small />
                  <span className="muted clamp">{l(video.title)}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {visited.length > 0 && (
        <section>
          <div className="section-head">
            <h2 className="section-title">{t("최근 다녀온 차박지")}</h2>
            <button type="button" className="link" onClick={() => go({ screen: "spots" })}>{t("전체")} ›</button>
          </div>
          <ul className="list">
            {visited.map((spot) => (
              <li key={spot.id}>
                <button type="button" className="row-button" onClick={() => go({ screen: "spot", id: spot.id })}>
                  <span className="icon-box">{l(findName(dictionary.spotTypes, spot.type))}</span>
                  <span className="row-main">
                    <b>{l(spot.name)}</b>
                    <span className="muted">{t("{date} 방문", { date: formatShort(spot.visitedAt, language) })} · {regionName(spot)}</span>
                    <span className="tags">{spot.features.map((key) => <Tag key={key}>{l(findName(dictionary.features, key))}</Tag>)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasFestivals && (
        <section>
          <div className="section-head">
            <h2 className="section-title">{t("다가오는 축제")}</h2>
            <button type="button" className="link" onClick={() => { setSticky("explore:category", "festival"); go({ screen: "explore" }); }}>{t("전체")} ›</button>
          </div>
          {/* 축제 화면은 여기서만 들어가서, 다가오는 축제가 없어도 칸은 남겨요. */}
          {upcoming.length === 0 && <p className="muted">{t("다가오는 축제가 없어요")}</p>}
          <ul className="list">
            {upcoming.map((festival) => (
              <li key={festival.key}>
                <button type="button" className="row-button" onClick={festival.open}>
                  <span className="icon-box">{formatShort(festival.start, language)}</span>
                  <span className="row-main">
                    <b>{festival.name}</b>
                    <span className="muted">{regionName(festival)} · {formatShort(festival.start, language)} ~ {formatShort(festival.end, language)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="section-title">{t("일정 달력")}</h2>
        {calendar.failed ? (
          <ErrorState onRetry={calendar.reload} />
        ) : (
          <>
            <MonthCalendar year={calendar.year} month={calendar.month} events={calendar.events} selected={calendar.selected} onSelect={calendar.setSelected} onMonth={calendar.moveMonth} />
            <EventList day={calendar.selected} events={eventsOn(calendar.events, calendar.selected)} />
          </>
        )}
        <p className="muted center">{t("일정은 구글 캘린더 \"car\"에서 가져와요")}</p>
      </section>
    </main>
  );
}
