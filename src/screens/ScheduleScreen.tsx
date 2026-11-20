import { EventList } from "../components/EventList";
import { eventsOn, MonthCalendar } from "../components/MonthCalendar";
import { ErrorState, Header } from "../components/ui";
import { useMonthEvents } from "../components/useEvents";
import { useI18n } from "../i18n";

export function ScheduleScreen() {
  const { t } = useI18n();
  const calendar = useMonthEvents();
  return (
    <main className="screen">
      <Header title={t("일정")} />
      {calendar.failed ? (
        <ErrorState onRetry={calendar.reload} />
      ) : (
        <>
          <MonthCalendar year={calendar.year} month={calendar.month} events={calendar.events} selected={calendar.selected} onSelect={calendar.setSelected} onMonth={calendar.moveMonth} />
          <EventList day={calendar.selected} events={eventsOn(calendar.events, calendar.selected)} />
        </>
      )}
    </main>
  );
}
