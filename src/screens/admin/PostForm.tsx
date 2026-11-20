import { useState } from "react";
import { Field, SaveBar, SingleChips, TextArea, TextInput } from "../../components/form";
import { Header, Segmented } from "../../components/ui";
import { useSave } from "../../components/useSave";
import { useI18n } from "../../i18n";
import { newId, saveItem } from "../../lib/admin";
import { POST_KINDS, STORY_KINDS, type Board } from "../../lib/types";
import { useApp } from "../../state";
import { useBoard } from "../../components/useBoard";
import { TagPicker } from "../../components/TagPicker";

/** 소통 · 차량관리 · 내 이야기 게시판 글이에요. 번역하지 않아요. */
export function PostForm({ board: initialBoard, id }: { board: Board; id?: string }) {
  const { t } = useI18n();
  const boards = useBoard();
  const { snapshot } = useApp();
  const initial = snapshot.posts.find((item) => item.id === id);
  const { busy, run, toast } = useSave();
  const [board, setBoard] = useState(initial?.board ?? initialBoard);
  const categories = boards.categories(board);
  const [category, setCategory] = useState(initial?.category ?? categories[0]?.key ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [tags, setTags] = useState(initial?.tags ?? []);
  const isValid = title.trim() && body.trim() && categories.some((item) => item.key === category);

  const changeBoard = (next: Board) => {
    setBoard(next);
    setCategory(next === "vehicle" ? snapshot.dictionary.vehicleCategories[0]?.key ?? "" : next === "story" ? STORY_KINDS[0] : POST_KINDS[0]);
  };

  const save = () =>
    run(async () => {
      await saveItem("posts", { id: initial?.id ?? newId("p"), board, category, title: title.trim(), body: body.trim(), ...(board === "community" && pinned ? { pinned: true } : {}), ...(board === "story" && tags.length > 0 ? { tags } : {}), createdAt: initial?.createdAt ?? new Date().toISOString().slice(0, 10) });
    }, false);

  return (
    <main className="screen has-actions">
      <Header title={initial ? t("글 수정") : t("글쓰기")} />
      {!initial && <Field label={t("게시판")}><Segmented label={t("게시판")} selected={board} onSelect={changeBoard} items={[{ key: "story", label: t("내 이야기") }, { key: "community", label: t("소통") }, { key: "vehicle", label: t("차량관리") }]} /></Field>}
      <Field label={board === "community" ? t("종류") : t("분류")}><SingleChips selected={category} onChange={setCategory} items={categories} /></Field>
      {board === "community" && (
        <label className="check-row"><input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} /> {t("목록 위에 고정")}</label>
      )}
      <Field label={t("제목")}><TextInput value={title} onChange={setTitle} /></Field>
      <Field label={t("본문")}><TextArea value={body} onChange={setBody} rows={10} /></Field>
      {board === "story" && <TagPicker selected={tags} onChange={setTags} />}
      <p className="muted">{t("게시판 글은 번역하지 않아요")}</p>
      <SaveBar label={busy ? t("저장하는 중") : initial ? t("수정") : t("등록")} busy={busy} disabled={!isValid} onSave={() => void save()} />
      {toast}
    </main>
  );
}
