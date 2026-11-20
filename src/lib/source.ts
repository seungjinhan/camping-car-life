import { applyOverlay } from "./admin";
import { firebaseEnabled } from "./firebase";
import * as remote from "./remote";
import { track } from "./progress";
import { SAMPLE, SAMPLE_EVENTS } from "./sample";
import type { CalendarEvent, Snapshot } from "./types";

// 데이터를 읽고 쓰는 곳이에요. .env에 Firebase 설정이 있으면 Firestore(remote.ts)를, 없으면 샘플을 써요.
// 모든 요청은 track()으로 감싸서 화면 위 진행 막대가 보이게 해요.

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function loadSnapshot(): Promise<Snapshot> {
  if (firebaseEnabled) return track(remote.loadSnapshot());
  return track(wait(300).then(() => applyOverlay(SAMPLE)));
}

/** 그 달에 걸친 일정이에요. 키가 있으면 구글 캘린더 "car"를 읽고, 없으면 샘플을 보여줘요. */
export function loadEvents(year: number, month: number): Promise<CalendarEvent[]> {
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 1);
  return track(
    (async () => {
      const key = import.meta.env.VITE_GCAL_API_KEY as string | undefined;
      const calendarId = import.meta.env.VITE_GCAL_CALENDAR_ID as string | undefined;
      if (key && calendarId) return fetchGoogleEvents(key, calendarId, from, to);
      await wait(200);
      return SAMPLE_EVENTS.filter((event) => new Date(eventStart(event)) < to && new Date(eventEnd(event)) > from);
    })(),
  );
}

export function eventStart(event: CalendarEvent): string {
  return event.allDay ? `${event.start}T00:00:00` : event.start;
}

export function eventEnd(event: CalendarEvent): string {
  return event.allDay ? `${event.end}T00:00:00` : event.end;
}

interface GoogleEvent {
  id: string;
  summary?: string;
  location?: string;
  description?: string;
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
}

async function fetchGoogleEvents(key: string, calendarId: string, from: Date, to: Date): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({ key, timeMin: from.toISOString(), timeMax: to.toISOString(), singleEvents: "true", orderBy: "startTime", maxResults: "250" });
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`);
  if (!response.ok) throw new Error(`calendar ${response.status}`);
  const body = (await response.json()) as { items?: GoogleEvent[] };
  return (body.items ?? []).map((item) => ({
    id: item.id,
    title: item.summary ?? "",
    start: item.start.dateTime ?? item.start.date ?? "",
    end: item.end.dateTime ?? item.end.date ?? "",
    allDay: !item.start.dateTime,
    location: item.location ?? "",
    description: item.description ?? "",
  }));
}
