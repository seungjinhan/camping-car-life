import { describe, expect, it } from "vitest";
import { localized, pickLanguage, translate } from "./i18n";
import { MESSAGES } from "./messages";

// 소스 파일을 글자 그대로 읽어 와요 (테스트 파일은 빼요).
const SOURCES = import.meta.glob(["../**/*.ts", "../**/*.tsx", "!../**/*.test.ts"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

describe("pickLanguage", () => {
  it("keeps a saved language", () => expect(pickLanguage("th", "ko-KR")).toBe("th"));
  it("follows the device", () => {
    expect(pickLanguage(null, "ja-JP")).toBe("ja");
    expect(pickLanguage(null, "zh-TW")).toBe("zh-Hant");
    expect(pickLanguage(null, "zh-Hant-HK")).toBe("zh-Hant");
    expect(pickLanguage(null, "zh-CN")).toBe("zh-Hans");
    expect(pickLanguage(null, "in-ID")).toBe("id");
    expect(pickLanguage(null, "es-MX")).toBe("es");
  });
  it("starts in English for other languages", () => expect(pickLanguage(null, "fr-FR")).toBe("en"));
});

describe("translate", () => {
  it("fills params", () => expect(translate("en", "{n}곳", { n: 3 })).toBe("3 places"));
  it("keeps Korean as is", () => expect(translate("ko", "{n}곳", { n: 3 })).toBe("3곳"));
});

describe("localized", () => {
  it("falls back chosen → English → Korean", () => {
    expect(localized({ ko: "가", en: "A", ja: "ア" }, "ja")).toBe("ア");
    expect(localized({ ko: "가", en: "A" }, "th")).toBe("A");
    expect(localized({ ko: "가" }, "th")).toBe("가");
  });
});

describe("messages", () => {
  it("has all 8 translations for every row", () => {
    for (const [key, row] of Object.entries(MESSAGES)) {
      expect(row, key).toHaveLength(8);
      for (const value of row) expect(value.trim(), key).not.toBe("");
    }
  });

  it("covers every t(\"...\") string in the source", () => {
    const keys = new Set<string>();
    for (const text of Object.values(SOURCES)) {
      for (const match of text.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g)) keys.add(match[1].replace(/\\"/g, '"'));
    }
    const missing = [...keys].filter((key) => !(key in MESSAGES));
    expect(missing).toEqual([]);
  });

  it("keeps the same {params} in every language", () => {
    for (const [key, row] of Object.entries(MESSAGES)) {
      const params = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
      for (const value of row) expect(params(value), `${key} → ${value}`).toBe(params(key));
    }
  });
});
