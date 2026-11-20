import { describe, expect, it } from "vitest";
import { newestVideoFirst, parseYoutubeId } from "./youtube";

describe("parseYoutubeId", () => {
  it("reads common links", () => {
    expect(parseYoutubeId("https://youtu.be/abcdefghijk")).toBe("abcdefghijk");
    expect(parseYoutubeId("https://www.youtube.com/watch?v=abcdefghijk&t=10")).toBe("abcdefghijk");
    expect(parseYoutubeId("https://m.youtube.com/shorts/abcdefghijk")).toBe("abcdefghijk");
    expect(parseYoutubeId("abcdefghijk")).toBe("abcdefghijk");
  });
  it("rejects other links", () => {
    expect(parseYoutubeId("https://example.com/watch?v=abcdefghijk")).toBeNull();
    expect(parseYoutubeId("hello")).toBeNull();
  });
});

describe("newestVideoFirst", () => {
  it("puts the later date first, then the later id on the same day", () => {
    const items = [
      { id: "vmwgg4y01zo2", createdAt: "2026-11-14" },
      { id: "vmwgjmtv2a14", createdAt: "2026-11-14" },
      { id: "vmaaaaaaaaaa", createdAt: "2026-11-15" },
    ];
    expect([...items].sort(newestVideoFirst).map((item) => item.id)).toEqual(["vmaaaaaaaaaa", "vmwgjmtv2a14", "vmwgg4y01zo2"]);
  });
});
