import { useCallback, useEffect, useState } from "react";
import { localDateKey } from "../lib/format";
import { loadEvents } from "../lib/source";
import type { CalendarEvent } from "../lib/types";

export function useMonthEvents() {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState(localDateKey(now));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    setFailed(false);
    loadEvents(cursor.year, cursor.month).then(setEvents).catch(() => setFailed(true));
  }, [cursor]);

  useEffect(load, [load]);

  const moveMonth = (delta: number) => {
    const next = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
    setSelected(localDateKey(next));
  };

  return { ...cursor, selected, setSelected, events, failed, reload: load, moveMonth };
}
