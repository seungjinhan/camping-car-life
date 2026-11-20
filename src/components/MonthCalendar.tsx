import { useI18n } from "../i18n";
import { formatMonth, localDateKey, weekdayNames } from "../lib/format";
import { eventEnd, eventStart } from "../lib/source";
import type { CalendarEvent } from "../lib/types";

/** 그 날짜(로컬)에 걸친 일정이에요. */
export function eventsOn(events: CalendarEvent[], day: string): CalendarEvent[] {
  const start = new Date(`${day}T00:00:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return events.filter((event) => new Date(eventStart(event)) < end && new Date(eventEnd(event)) > start);
}

export function MonthCalendar({ year, month, events, selected, onSelect, onMonth }: { year: number; month: number; events: CalendarEvent[]; selected: string; onSelect: (day: string) => void; onMonth: (delta: number) => void }) {
  const { t, language } = useI18n();
  const first = new Date(year, month, 1);
  const cells = Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - first.getDay() + i));
  const rows = cells[35].getMonth() === month ? 6 : 5;
  const today = localDateKey(new Date());
  return (
    <div className="calendar">
      <div className="calendar-head">
        <button type="button" className="icon-button" aria-label={t("이전 달")} onClick={() => onMonth(-1)}>‹</button>
        <strong>{formatMonth(year, month, language)}</strong>
        <button type="button" className="icon-button" aria-label={t("다음 달")} onClick={() => onMonth(1)}>›</button>
      </div>
      <div className="calendar-grid">
        {weekdayNames(language).map((name, i) => (
          <span key={i} className="weekday">{name}</span>
        ))}
        {cells.slice(0, rows * 7).map((date) => {
          const key = localDateKey(date);
          const has = eventsOn(events, key).length > 0;
          const outside = date.getMonth() !== month;
          return (
            <button key={key} type="button" disabled={outside} className={`day${key === selected ? " is-selected" : ""}${has ? " has-event" : ""}${key === today ? " is-today" : ""}`} onClick={() => onSelect(key)}>
              {outside ? "" : date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
