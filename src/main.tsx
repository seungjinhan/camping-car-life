import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { pickLanguage } from "./lib/i18n";
import { deviceLocale, loadJson } from "./lib/platform";
import { applyTheme, pickTheme } from "./lib/theme";
import "./styles.css";

const [language, theme] = await Promise.all([loadJson("language"), loadJson("theme")]);
const initialTheme = pickTheme(theme);
applyTheme(initialTheme);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App initialLanguage={pickLanguage(language, deviceLocale())} initialTheme={initialTheme} />
  </StrictMode>,
);
