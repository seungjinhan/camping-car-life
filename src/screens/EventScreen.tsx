import { eventTime } from "../components/EventList";
import { useI18n } from "../i18n";
import { calendarDates, formatFull } from "../lib/format";
import { mapSearchUrl, openExternal } from "../lib/platform";
import type { CalendarEvent } from "../lib/types";

/** 구글 캘린더 일정이에요. 제목 · 장소 · 메모는 쓴 그대로 보여줘요. */
export function EventScreen({ event }: { event: CalendarEvent }) {
  const { t, language } = useI18n();
  const addUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${calendarDates(event)}&location=${encodeURIComponent(event.location)}`;
  return (
    <main className="screen">
      <p className="muted">{t("구글 캘린더 · car")}</p>
      <h1 className="title">{event.title}</h1>
      <div className="info-row"><span>{t("날짜")}</span><span className="muted">{formatFull(event.start, language)} · {eventTime(event, language, t("하루 종일"))}</span></div>
      {event.location && (
        <button type="button" className="info-row as-button" onClick={() => openExternal(mapSearchUrl(event.location))}>
          <span>{t("장소")}</span><span className="muted">{event.location} ›</span>
        </button>
      )}
      {event.description && (
        <section>
          <h2 className="section-title">{t("메모")}</h2>
          <p className="body-text">{event.description}</p>
        </section>
      )}
      <button type="button" className="button soft" onClick={() => openExternal(addUrl)}>{t("내 캘린더에 추가")}</button>
    </main>
  );
}
