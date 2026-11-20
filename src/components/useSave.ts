import { useState } from "react";
import { useI18n } from "../i18n";
import { translateConfigured } from "../lib/admin";
import { useApp } from "../state";
import { useToast } from "./ui";

/** 저장 중 버튼 잠금, 저장 뒤 다시 읽기, 결과 알림을 한곳에서 해요. */
export function useSave() {
  const { t } = useI18n();
  const { reload } = useApp();
  const { show, toast } = useToast();
  const [busy, setBusy] = useState(false);

  const run = async (work: () => Promise<void>, translated: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      await work();
      await reload();
      show(translated && !translateConfigured() ? t("번역 주소가 없어 한국어만 저장했어요") : t("저장했어요"));
      setTimeout(() => history.back(), 700);
    } catch {
      show(t("저장하지 못했어요. 다시 시도해 주세요."));
    } finally {
      setBusy(false);
    }
  };

  return { busy, run, show, toast };
}
