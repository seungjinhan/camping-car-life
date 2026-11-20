import type { Board, CalendarEvent } from "./lib/types";

export type TabScreen = "home" | "story" | "spots" | "explore" | "more";

export type Route =
  | { screen: TabScreen }
  | { screen: "community" }
  | { screen: "spot"; id: string }
  | { screen: "campsite"; province: string; id: number }
  | { screen: "videos" }
  | { screen: "tourPlace"; province: string; id: number }
  | { screen: "tourFestival"; id: number }
  | { screen: "festival"; id: string }
  | { screen: "schedule" }
  | { screen: "event"; event: CalendarEvent }
  | { screen: "vehicle" }
  | { screen: "post"; id: string }
  | { screen: "video"; id: string }
  | { screen: "admin" }
  | { screen: "adminSpot"; id?: string }
  | { screen: "adminFestival"; id?: string }
  | { screen: "adminVideo"; id?: string }
  | { screen: "adminPost"; board: Board; id?: string }
  | { screen: "adminDictionary" };

export type Go = (route: Route) => void;

export const TAB_SCREENS: readonly TabScreen[] = ["home", "story", "spots", "explore", "more"];
