import { useMemo } from "react";
import { useApp } from "../state";
import { Badge, Chips, EmptyState, Header, Segmented, usePagedList, useSticky } from "../components/ui";
import { useI18n } from "../i18n";
import { formatShort } from "../lib/format";
import type { Board } from "../lib/types";
import { useBoard } from "../components/useBoard";

const ALL = "all";

/** 소통 · 차량관리 · 내 이야기 게시판이에요. 글은 번역하지 않아요. */
export function BoardScreen({ board }: { board: Board }) {
  const { t, language } = useI18n();
  const { snapshot, go, isAdmin } = useApp();
  const boards = useBoard();
  const [category, setCategory] = useSticky(`${board}:category`, ALL);
  const [query, setQuery] = useSticky(`${board}:query`, "");
  const categories = boards.categories(board);
  const label = (key: string) => boards.label(board, key);

  const posts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return snapshot.posts
      .filter((post) => post.board === board && (category === ALL || post.category === category))
      .filter((post) => !q || `${post.title} ${post.body}`.toLowerCase().includes(q))
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.createdAt.localeCompare(a.createdAt));
  }, [snapshot.posts, board, category, query]);
  const { visible, sentinel } = usePagedList(posts, `${category}/${query}`, board);
  const items = [{ key: ALL, label: t("전체") }, ...categories];

  return (
    <main className="screen">
      <Header title={boards.title(board)} />
      {board !== "community" ? (
        <>
          <Chips label={t("분류")} selected={category} onSelect={setCategory} items={items} />
          <input className="input search" type="search" value={query} placeholder={t("글 검색")} onChange={(event) => setQuery(event.target.value)} />
        </>
      ) : (
        <Segmented label={t("종류")} selected={category} onSelect={setCategory} items={items} />
      )}
      {posts.length === 0 && <EmptyState title={t("아직 글이 없어요")} />}
      <ul className="list">
        {visible.map((post) => (
          <li key={post.id}>
            <button type="button" className={`row-button${post.pinned ? " is-pinned" : ""}`} onClick={() => go({ screen: "post", id: post.id })}>
              <span className="row-main">
                <span className="post-title"><Badge>{label(post.category)}</Badge> {post.title}</span>
                <span className="muted">{t("운영자")} · {formatShort(post.createdAt, language)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {sentinel}
      {isAdmin && (
        <button type="button" className={`fab${board === "story" ? " above-tabs" : ""}`} aria-label={t("글쓰기")} onClick={() => go({ screen: "adminPost", board })}>+</button>
      )}
    </main>
  );
}
