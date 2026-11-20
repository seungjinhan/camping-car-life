import { useSyncExternalStore } from "react";

// 서버를 읽거나 쓰는 요청이 몇 개 진행 중인지 세요. 하나라도 있으면 진행바를 보여줘요.
let pending = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export async function track<T>(work: Promise<T>): Promise<T> {
  pending += 1;
  emit();
  try {
    return await work;
  } finally {
    pending -= 1;
    emit();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useIsBusy(): boolean {
  return useSyncExternalStore(subscribe, () => pending > 0);
}
