import { useApp } from "../state";
import { useBoard } from "../components/useBoard";
import { AdminActions } from "../components/AdminActions";
import { Badge, EmptyState, Tag } from "../components/ui";
import { findName } from "../state";
import { useI18n } from "../i18n";
import { formatFull } from "../lib/format";

/** 게시판 글은 관리자만 쓰고, 댓글은 없어요. */
export function PostScreen({ id }: { id: string }) {
  const { t, l, language } = useI18n();
  const boards = useBoard();
  const { snapshot, go } = useApp();
  const post = snapshot.posts.find((item) => item.id === id);
  if (!post) return <main className="screen"><EmptyState title={t("찾을 수 없어요")} /></main>;
  const label = boards.label(post.board, post.category);
  return (
    <main className="screen">
      <p className="muted"><Badge>{label}</Badge> {t("운영자")} · {formatFull(post.createdAt, language)}</p>
      <div className="title-row"><h1 className="title">{post.title}</h1><AdminActions kind="posts" id={post.id} onEdit={() => go({ screen: "adminPost", board: post.board, id: post.id })} /></div>
      <p className="body-text">{post.body}</p>
      {post.tags && <div className="tags">{post.tags.filter((key) => findName(snapshot.dictionary.tags, key)).map((key) => <Tag key={key}>#{l(findName(snapshot.dictionary.tags, key))}</Tag>)}</div>}
    </main>
  );
}
