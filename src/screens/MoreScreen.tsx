import { useRef, useState } from "react";
import { useApp } from "../state";
import { Header, Segmented, Sheet, useToast } from "../components/ui";
import { useI18n } from "../i18n";
import { saveJourney } from "../lib/admin";
import { localDateKey } from "../lib/format";
import { getUid } from "../lib/identity";
import { LANGUAGE_NAMES } from "../lib/i18n";
import { copyText, saveJson } from "../lib/platform";
import { applyTheme, THEME_LABEL, THEMES, type Theme } from "../lib/theme";
import { LANGUAGES, type Language } from "../lib/types";

export function MoreScreen({ theme, onTheme }: { theme: Theme; onTheme: (theme: Theme) => void }) {
  const { t, language } = useI18n();
  const { go, isAdmin, snapshot } = useApp();
  const [isSettings, setIsSettings] = useState(false);
  const [isPickingStart, setIsPickingStart] = useState(false);
  const taps = useRef(0);
  const { show, toast } = useToast();

  // 버전을 7번 누르면 내 uid를 복사해요 (관리자 등록용).
  const tapVersion = async () => {
    taps.current += 1;
    if (taps.current < 7) return;
    taps.current = 0;
    const ok = await copyText(await getUid());
    show(ok ? t("내 uid를 복사했어요") : t("복사하지 못했어요"));
  };

  return (
    <main className="screen">
      <Header title={t("더보기")} />
      <h2 className="group-label">{t("메뉴")}</h2>
      <button type="button" className="info-row as-button" onClick={() => go({ screen: "videos" })}><span>{t("영상")}</span><span className="chevron">›</span></button>
      <button type="button" className="info-row as-button" onClick={() => go({ screen: "community" })}><span>{t("소통")}</span><span className="chevron">›</span></button>
      <button type="button" className="info-row as-button" onClick={() => go({ screen: "schedule" })}><span>{t("일정")}</span><span className="chevron">›</span></button>
      <button type="button" className="info-row as-button" onClick={() => go({ screen: "vehicle" })}><span>{t("차량관리")}</span><span className="chevron">›</span></button>
      <h2 className="group-label">{t("설정")}</h2>
      <button type="button" className="info-row as-button" onClick={() => setIsSettings(true)}><span>{t("언어")}</span><span className="muted">{LANGUAGE_NAMES[language]} ›</span></button>
      <button type="button" className="info-row as-button" onClick={() => setIsSettings(true)}><span>{t("디자인")}</span><span className="muted">{t(THEME_LABEL[theme])} ›</span></button>
      {isAdmin && (
        <button type="button" className="info-row as-button" onClick={() => setIsPickingStart(true)}>
          <span>{t("캠핑카 생활 시작일")}</span><span className="muted">{snapshot.journey?.startDate || t("정하지 않았어요")} ›</span>
        </button>
      )}
      {isAdmin && (
        <button type="button" className="info-row as-button" onClick={() => go({ screen: "admin" })}><span>{t("관리자")}</span><span className="chevron">›</span></button>
      )}
      <button type="button" className="version" onClick={() => void tapVersion()}>{t("버전 {v}", { v: "0.1.0" })}</button>
      {isPickingStart && <StartDateSheet onClose={() => setIsPickingStart(false)} />}
      {isSettings && <SettingsSheet theme={theme} onTheme={onTheme} onClose={() => setIsSettings(false)} />}
      {toast}
    </main>
  );
}

function SettingsSheet({ theme, onTheme, onClose }: { theme: Theme; onTheme: (theme: Theme) => void; onClose: () => void }) {
  const { t, language, setLanguage } = useI18n();
  const [nextLanguage, setNextLanguage] = useState<Language>(language);
  const [nextTheme, setNextTheme] = useState<Theme>(theme);
  const apply = () => {
    setLanguage(nextLanguage);
    applyTheme(nextTheme);
    saveJson("theme", nextTheme);
    onTheme(nextTheme);
    onClose();
  };
  return (
    <Sheet title={t("언어")} onClose={onClose}>
      <div className="language-grid">
        {LANGUAGES.map((code) => (
          <button key={code} type="button" lang={code} className={`chip${code === nextLanguage ? " is-on" : ""}`} aria-pressed={code === nextLanguage} onClick={() => setNextLanguage(code)}>
            {LANGUAGE_NAMES[code]}
          </button>
        ))}
      </div>
      <h2>{t("디자인")}</h2>
      <Segmented label={t("디자인")} selected={nextTheme} onSelect={setNextTheme} items={THEMES.map((key) => ({ key, label: t(THEME_LABEL[key]) }))} />
      <button type="button" className="button" onClick={apply}>{t("적용")}</button>
    </Sheet>
  );
}

/** 관리자만 봐요. 홈의 "캠핑카 생활 D+n"이 이 날짜부터 세요. */
function StartDateSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { snapshot, reload } = useApp();
  const [startDate, setStartDate] = useState(snapshot.journey?.startDate || localDateKey(new Date()));
  const [busy, setBusy] = useState(false);
  const { show, toast } = useToast();
  const save = async () => {
    setBusy(true);
    try {
      const journey = snapshot.journey ?? { startDate, phase: "korea" as const, koreaDays: 365, here: { province: "", city: "", since: "" } };
      await saveJourney({ ...journey, startDate });
      await reload();
      onClose();
    } catch {
      show(t("처리하지 못했어요. 다시 시도해 주세요."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet title={t("캠핑카 생활 시작일")} onClose={onClose}>
      <input className="input" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
      <button type="button" className="button" disabled={busy || !startDate} onClick={() => void save()}>{t("저장")}</button>
      {toast}
    </Sheet>
  );
}
