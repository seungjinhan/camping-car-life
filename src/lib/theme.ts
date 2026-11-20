export const THEMES = ["basic", "forest", "sea", "sunset"] as const;
export type Theme = (typeof THEMES)[number];

/** 토스 비게임 앱은 라이트 모드만 써야 해서 밝은 색 테마만 있어요. */
export const THEME_LABEL: Record<Theme, string> = { basic: "기본", forest: "숲", sea: "바다", sunset: "노을" };

export function pickTheme(value: unknown): Theme {
  return (THEMES as readonly string[]).includes(value as string) ? (value as Theme) : "basic";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}
