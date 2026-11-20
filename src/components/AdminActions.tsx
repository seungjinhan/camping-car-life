import { useState } from "react";
import { useI18n } from "../i18n";
import { deleteItem, type Kind } from "../lib/admin";
import { useApp } from "../state";
import { Sheet, useToast } from "./ui";

/** 상세 화면 우상단 ⋯ 메뉴예요. 관리자에게만 보여요. */
export function AdminActions({ kind, id, onEdit }: { kind: Kind; id: string; onEdit: () => void }) {
  const { t } = useI18n();
  const { isAdmin, reload } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const { show, toast } = useToast();
  if (!isAdmin) return null;

  const remove = async () => {
    setBusy(true);
    try {
      await deleteItem(kind, id);
      await reload();
      history.back();
    } catch {
      show(t("처리하지 못했어요. 다시 시도해 주세요."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className="admin-more" aria-label={t("관리자 메뉴")} onClick={() => setIsOpen(true)}>⋯</button>
      {isOpen && (
        <Sheet title={isConfirming ? t("삭제할까요?") : t("관리자 메뉴")} onClose={() => { setIsOpen(false); setIsConfirming(false); }}>
          {isConfirming ? (
            <>
              <p className="muted">{t("삭제하면 되돌릴 수 없어요.")}</p>
              <button type="button" className="button danger" disabled={busy} onClick={() => void remove()}>{t("삭제")}</button>
              <button type="button" className="button soft" onClick={() => setIsConfirming(false)}>{t("취소")}</button>
            </>
          ) : (
            <>
              <button type="button" className="button soft" onClick={() => { setIsOpen(false); onEdit(); }}>{t("수정")}</button>
              <button type="button" className="button danger" onClick={() => setIsConfirming(true)}>{t("삭제")}</button>
            </>
          )}
        </Sheet>
      )}
      {toast}
    </>
  );
}
