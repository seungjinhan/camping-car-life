import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "../i18n";
import { useIsBusy } from "../lib/progress";
import type { TabScreen } from "../routes";

const TABS: { screen: TabScreen; label: string; icon: ReactNode }[] = [
  { screen: "home", label: "홈", icon: <path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" /> },
  { screen: "story", label: "내 이야기", icon: <path d="M5 4h10l4 4v12H5zM9 12h6M9 16h4" /> },
  { screen: "spots", label: "차박지", icon: <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /> },
  { screen: "explore", label: "돌아보기", icon: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z" /> },
  { screen: "more", label: "더보기", icon: <path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth={3} /> },
];

export function TabBar({ current, onSelect }: { current: string; onSelect: (screen: TabScreen) => void }) {
  const { t } = useI18n();
  return (
    <nav className="tab-bar" aria-label={t("하단 메뉴")}>
      {TABS.map((tab) => (
        <button key={tab.screen} type="button" className={`tab${current === tab.screen ? " is-active" : ""}`} aria-current={current === tab.screen ? "page" : undefined} onClick={() => onSelect(tab.screen)}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            {tab.icon}
          </svg>
          {t(tab.label)}
        </button>
      ))}
    </nav>
  );
}

export function ProgressBar() {
  const { t } = useI18n();
  if (!useIsBusy()) return null;
  return (
    <div className="progress-bar" role="progressbar" aria-label={t("불러오는 중")} aria-busy="true">
      <span />
    </div>
  );
}

export function Header({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <header className="header">
      <h1>{title}</h1>
      {right}
    </header>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="state">
      <strong>{title}</strong>
      {body && <p>{body}</p>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="state">
      <strong>{t("불러오지 못했어요")}</strong>
      <p>{t("인터넷 연결을 확인하고 다시 시도해 주세요.")}</p>
      <button type="button" className="button soft" onClick={onRetry}>
        {t("다시 시도")}
      </button>
    </div>
  );
}

export function Chips<T extends string>({ items, selected, onSelect, label }: { items: { key: T; label: string }[]; selected: T; onSelect: (key: T) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // 뒤로 와서 다시 그려질 때 고른 칩이 보이게 가로로 옮겨요 (처음 한 번만).
  useEffect(() => {
    const row = ref.current;
    const on = row?.querySelector<HTMLElement>(".is-on");
    if (row && on) row.scrollLeft += on.getBoundingClientRect().left - row.getBoundingClientRect().left - 16;
  }, []);
  return (
    <div ref={ref} className="chips" role="group" aria-label={label}>
      {items.map((item) => (
        <button key={item.key} type="button" className={`chip${item.key === selected ? " is-on" : ""}`} aria-pressed={item.key === selected} onClick={() => onSelect(item.key)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ items, selected, onSelect, label }: { items: { key: T; label: string }[]; selected: T; onSelect: (key: T) => void; label: string }) {
  return (
    <div className="segmented" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button key={item.key} type="button" role="tab" aria-selected={item.key === selected} className={item.key === selected ? "is-on" : ""} onClick={() => onSelect(item.key)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Tag({ children, strong }: { children: ReactNode; strong?: boolean }) {
  return <span className={`tag${strong ? " is-strong" : ""}`}>{children}</span>;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}

export function Thumb({ youtubeId, small }: { youtubeId: string; small?: boolean }) {
  return <div className={`thumb${small ? " is-small" : ""}`}>{youtubeId ? <img src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`} alt="" loading="lazy" /> : <PlayIcon />}</div>;
}

export function PlayIcon() {
  return (
    <svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,.45)" />
      <path d="M10 8l6 4-6 4z" fill="#fff" />
    </svg>
  );
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="sheet-layer" role="presentation" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-grab" aria-hidden="true" />
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);
  return (
    <div className="toast" role="status">
      {message}
    </div>
  );
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const toast = message ? <Toast message={message} onDone={() => setMessage(null)} /> : null;
  return { show: setMessage, toast };
}

export const PAGE_SIZE = 10;

/** 목록 끝에 두면, 화면에 가까워질 때 onReach를 불러요. */
function ListSentinel({ count, onReach }: { count: number; onReach: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef(onReach);
  latest.current = onReach;
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) latest.current();
    }, { rootMargin: "400px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [count]);
  return <div ref={ref} className="list-sentinel" aria-hidden="true" />;
}

// 화면을 떠났다 돌아와도 남는 값이에요 (뒤로 가기 때 필터 · 불러온 개수 유지). 앱을 다시 열면 처음으로 돌아가요.
const sticky = new Map<string, unknown>();

/** 다른 화면에서 미리 골라 둘 때 써요 (예: 홈의 축제 "전체" → 돌아보기의 축제 칸). */
export function setSticky<T>(key: string, value: T) {
  sticky.set(key, value);
}

export function useSticky<T>(key: string, initial: T): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => (sticky.has(key) ? (sticky.get(key) as T) : initial));
  const set = useCallback(
    (next: T) => {
      sticky.set(key, next);
      setValue(next);
    },
    [key],
  );
  return [value, set];
}

/** 받은 목록을 10개씩 나눠 보여줘요. 스크롤하면 이어서 보여주고, resetKey가 바뀌면 처음으로 돌아가요.
 * stickyKey를 주면 상세에 갔다 돌아와도 보던 개수를 이어서 보여줘요. */
export function usePagedList<T>(items: T[], resetKey: unknown = null, stickyKey?: string) {
  const key = String(resetKey);
  const [state, setState] = useState(() => {
    const saved = stickyKey ? (sticky.get(stickyKey) as { key: string; limit: number } | undefined) : undefined;
    return { key, limit: saved?.key === key ? saved.limit : PAGE_SIZE };
  });
  const limit = state.key === key ? state.limit : PAGE_SIZE;
  useEffect(() => {
    if (stickyKey) sticky.set(stickyKey, { key, limit });
  }, [stickyKey, key, limit]);
  const visible = items.slice(0, limit);
  const sentinel = items.length > limit ? <ListSentinel count={visible.length} onReach={() => setState({ key, limit: limit + PAGE_SIZE })} /> : null;
  return { visible, sentinel };
}
