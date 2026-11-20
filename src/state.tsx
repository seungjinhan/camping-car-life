import { createContext, useContext } from "react";
import type { Go } from "./routes";
import type { Named, Snapshot } from "./lib/types";

export interface AppState {
  snapshot: Snapshot;
  go: Go;
  isAdmin: boolean;
  /** 관리자가 저장한 뒤 데이터를 다시 읽어요. */
  reload: () => Promise<void>;
}

export const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const value = useContext(AppContext);
  if (!value) throw new Error("AppContext missing");
  return value;
}

export function findName(list: Named[], key: string) {
  return list.find((item) => item.key === key)?.name;
}
