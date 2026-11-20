import { useApp } from "../state";
import { useI18n } from "../i18n";
import { formatDay, formatTime } from "../lib/format";
import type { CalendarEvent } from "../lib/types";
import { EmptyState } from "./ui";

export function eventTime(event: CalendarEvent, language: Parameters<typeof formatTime>[1], allDayLabel: string): string {
  if (event.allDay) return allDayLabel;
  return `${formatTime(event.start, language)} – ${formatTime(event.end, language)}`;
}

/** 일정 제목 · 장소는 캘린더에 쓴 그대로 보여줘요. */
export function EventList({ day, events }: { day: string; events: CalendarEvent[] }) {
  const { t, language } = useI18n();
  const { go } = useApp();
  return (
    <section>
      <h2 className="section-title">{formatDay(day, language)}</h2>
      {events.length === 0 ? (
        <EmptyState title={t("이날은 일정이 없어요")} />
      ) : (
        <ul className="list">
          {events.map((event) => (
            <li key={event.id}>
              <button type="button" className="row-button event-row" onClick={() => go({ screen: "event", event })}>
                <span className="event-bar" aria-hidden="true" />
                <span className="row-main">
                  <b>{event.title}</b>
                  <span className="muted">{[eventTime(event, language, t("하루 종일")), event.location].filter(Boolean).join(" · ")}</span>
                  {event.description && <span className="muted clamp">{event.description}</span>}
                </span>
                <span className="chevron" aria-hidden="true">›</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
