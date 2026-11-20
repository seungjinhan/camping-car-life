import { ensureUser, firebaseEnabled } from "./firebase";
import { loadJson, saveJson } from "./platform";

// Firebase가 있으면 익명 인증 uid를, 샘플 모드에서는 기기에 만든 id를 써요.
let uid: Promise<string> | null = null;

export function getUid(): Promise<string> {
  uid ??= (async () => {
    if (firebaseEnabled) return (await ensureUser()).uid;
    const saved = await loadJson("uid");
    if (typeof saved === "string" && saved) return saved;
    const next = `local-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    saveJson("uid", next);
    return next;
  })();
  return uid;
}
