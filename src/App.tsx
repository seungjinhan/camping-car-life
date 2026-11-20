import { useCallback, useEffect, useMemo, useState } from "react";
import { AppContext } from "./state";
import { ErrorState, ProgressBar, TabBar } from "./components/ui";
import { I18nProvider, useI18n } from "./i18n";
import { checkAdmin } from "./lib/admin";
import { loadSnapshot } from "./lib/source";
import { IS_WEB, TOSS_APP_URL } from "./lib/platform";
import appIcon from "./assets/app-icon.png";
import type { Theme } from "./lib/theme";
import type { Language, Snapshot } from "./lib/types";
import { TAB_SCREENS, type Route, type TabScreen } from "./routes";
import { AdminHome } from "./screens/admin/AdminHome";
import { DictionaryScreen } from "./screens/admin/DictionaryScreen";
import { FestivalForm } from "./screens/admin/FestivalForm";
import { PostForm } from "./screens/admin/PostForm";
import { SpotForm } from "./screens/admin/SpotForm";
import { VideoForm } from "./screens/admin/VideoForm";
import { BoardScreen } from "./screens/BoardScreen";
import { CampsiteScreen } from "./screens/CampsiteScreen";
import { EventScreen } from "./screens/EventScreen";
import { FestivalScreen } from "./screens/FestivalScreen";
import { ExploreScreen } from "./screens/ExploreScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { MoreScreen } from "./screens/MoreScreen";
import { PostScreen } from "./screens/PostScreen";
import { ScheduleScreen } from "./screens/ScheduleScreen";
import { SpotScreen } from "./screens/SpotScreen";
import { SpotsScreen } from "./screens/SpotsScreen";
import { TourFestivalScreen, TourPlaceScreen } from "./screens/TourScreens";
import { VideoScreen } from "./screens/VideoScreen";
import { VideosScreen } from "./screens/VideosScreen";

/** 웹 버전(GitHub Pages)에만 있는 맨 위 줄이에요. 퓨처셀프 웹처럼 아이콘 · 앱 이름 · 토스 앱 바로가기를 보여주고 화면과 함께 올라가요.
 *  토스 내비게이션 바가 없어서, 탭이 아닌 화면에서는 그 아래에 뒤로 줄을 둬요. */
function WebBar({ canGoBack }: { canGoBack: boolean }) {
  const { t } = useI18n();
  return (
    <>
      <div className="app-link-bar">
        <img className="app-link-icon" src={appIcon} alt="" width="32" height="32" />
        <div className="app-link-text">
          <strong>{t("캠핑카라이프 앱")}</strong>
          <span>{t("토스에서 더 편하게 봐요")}</span>
        </div>
        <a className="app-link-button" href={TOSS_APP_URL} target="_blank" rel="noopener">{t("앱 바로가기")}</a>
      </div>
      {canGoBack && <button type="button" className="web-back" onClick={() => history.back()}>‹ {t("뒤로")}</button>}
    </>
  );
}

/** 관리자 화면이에요. admins/{uid}에 있는 사람만 들어와요. */
function adminBody(route: Route) {
  switch (route.screen) {
    case "admin": return <AdminHome />;
    case "adminSpot": return <SpotForm key={route.id ?? "new"} id={route.id} />;
    case "adminFestival": return <FestivalForm key={route.id ?? "new"} id={route.id} />;
    case "adminVideo": return <VideoForm key={route.id ?? "new"} id={route.id} />;
    case "adminPost": return <PostForm key={route.id ?? route.board} board={route.board} id={route.id} />;
    case "adminDictionary": return <DictionaryScreen />;
    default: return null;
  }
}

function readRoute(): Route {
  return (history.state?.screen ? history.state : { screen: "home" }) as Route;
}

interface Props {
  initialLanguage: Language;
  initialTheme: Theme;
}

export function App({ initialLanguage, ...props }: Props) {
  return (
    <I18nProvider initialLanguage={initialLanguage}>
      <ProgressBar />
      <AppBody {...props} />
    </I18nProvider>
  );
}

function AppBody({ initialTheme }: Omit<Props, "initialLanguage">) {
  const { t } = useI18n();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [failed, setFailed] = useState(false);
  const [route, setRoute] = useState<Route>(readRoute);
  const [theme, setTheme] = useState(initialTheme);
  // null이면 아직 확인 중이에요.
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const load = useCallback(() => {
    setFailed(false);
    loadSnapshot().then(setSnapshot).catch(() => setFailed(true));
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    // 웹 버전에는 관리자 기능이 없어요.
    if (IS_WEB) return setIsAdmin(false);
    checkAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));
  }, []);

  const reload = useCallback(async () => {
    setSnapshot(await loadSnapshot());
  }, []);

  useEffect(() => {
    // 뒤로 가면 그 화면을 떠날 때의 스크롤 위치로 돌아가요. 캠핑장처럼 늦게 오는 목록을 위해 몇 번 더 맞춰요.
    const sync = () => {
      setRoute(readRoute());
      const y = Number(history.state?.scrollY) || 0;
      window.scrollTo(0, y);
      if (y > 0) for (const ms of [50, 200, 500]) setTimeout(() => window.scrollTo(0, y), ms);
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const go = useCallback((next: Route) => {
    if ((TAB_SCREENS as readonly string[]).includes(next.screen)) history.replaceState(next, "");
    else {
      history.replaceState({ ...readRoute(), scrollY: window.scrollY }, "");
      history.pushState(next, "");
    }
    setRoute(next);
    window.scrollTo(0, 0);
  }, []);

  const selectTab = useCallback((screen: TabScreen) => go({ screen }), [go]);
  const state = useMemo(() => (snapshot ? { snapshot, go, isAdmin: isAdmin === true, reload } : null), [snapshot, go, isAdmin, reload]);

  if (!state) {
    return (
      <>
        {IS_WEB && <WebBar canGoBack={false} />}
        <main className="screen">{failed ? <ErrorState onRetry={load} /> : <p className="muted center loading-text">{t("불러오는 중")}</p>}</main>
      </>
    );
  }

  const isTab = (TAB_SCREENS as readonly string[]).includes(route.screen);
  const body = (() => {
    switch (route.screen) {
      case "home": return <HomeScreen />;
      case "spots": return <SpotsScreen />;
      case "explore": return <ExploreScreen />;
      // 웹 버전에서 잠근 메뉴(영상 목록 · 소통 · 일정 · 차량관리)와 관리자 화면은 웹 빌드에 넣지 않아요. 혹시 들어오면 홈을 보여줘요.
      case "videos": return IS_WEB ? <HomeScreen /> : <VideosScreen />;
      case "community": return IS_WEB ? <HomeScreen /> : <BoardScreen key="community" board="community" />;
      case "more": return <MoreScreen theme={theme} onTheme={setTheme} />;
      case "spot": return <SpotScreen id={route.id} />;
      case "campsite": return <CampsiteScreen province={route.province} id={route.id} />;
      case "festival": return <FestivalScreen id={route.id} />;
      case "tourPlace": return <TourPlaceScreen province={route.province} id={route.id} />;
      case "tourFestival": return <TourFestivalScreen id={route.id} />;
      case "schedule": return IS_WEB ? <HomeScreen /> : <ScheduleScreen />;
      case "event": return <EventScreen event={route.event} />;
      case "vehicle": return IS_WEB ? <HomeScreen /> : <BoardScreen key="vehicle" board="vehicle" />;
      case "story": return <BoardScreen key="story" board="story" />;
      case "post": return <PostScreen id={route.id} />;
      case "video": return <VideoScreen id={route.id} />;
      default: return IS_WEB ? <HomeScreen /> : isAdmin ? adminBody(route) : isAdmin === null ? <main className="screen"><p className="muted center loading-text">{t("불러오는 중")}</p></main> : <main className="screen"><ErrorState onRetry={() => selectTab("home")} /></main>;
    }
  })();

  return (
    <AppContext.Provider value={state}>
      {IS_WEB && <WebBar canGoBack={!isTab} />}
      {import.meta.env.DEV && !isTab && (
        <button type="button" className="dev-back" onClick={() => history.back()}>
          개발 화면 전용: 뒤로
        </button>
      )}
      <div className={isTab ? "with-tabs" : ""}>{body}</div>
      {isTab && <TabBar current={route.screen} onSelect={selectTab} />}
    </AppContext.Provider>
  );
}
