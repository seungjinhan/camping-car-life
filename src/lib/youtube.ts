/** 유튜브 주소에서 영상 ID를 꺼내요. 못 찾으면 null이에요. */
export function parseYoutubeId(input: string): string | null {
  const text = input.trim();
  if (/^[\w-]{11}$/.test(text)) return text;
  try {
    const url = new URL(text);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return valid(url.pathname.slice(1));
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.searchParams.get("v")) return valid(url.searchParams.get("v")!);
      const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/);
      return match ? match[1] : null;
    }
  } catch {
    return null;
  }
  return null;
}

function valid(id: string): string | null {
  return /^[\w-]{11}$/.test(id) ? id : null;
}

/** 키 없이 제목과 채널명을 가져와요 (oEmbed). 실패하면 관리자가 직접 적어요. */
export async function fetchYoutubeInfo(id: string): Promise<{ title: string; channel: string } | null> {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`);
    if (!response.ok) return null;
    const body = (await response.json()) as { title?: string; author_name?: string };
    return { title: body.title ?? "", channel: body.author_name ?? "" };
  } catch {
    return null;
  }
}

/** 최근에 올린 영상이 먼저예요. 등록일(날짜만)이 같으면 id로 가려요: id 앞부분이 등록 시각(newId)이라 나중에 올린 게 커요. */
export function newestVideoFirst(a: { createdAt: string; id: string }, b: { createdAt: string; id: string }): number {
  return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
}
