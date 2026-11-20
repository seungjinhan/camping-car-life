import { useI18n } from "../i18n";
import { POST_KINDS, STORY_KINDS, type Board } from "../lib/types";
import { findName, useApp } from "../state";

export const POST_KIND_LABEL: Record<string, string> = { notice: "공지", update: "업데이트", question: "질문" };
export const STORY_KIND_LABEL: Record<string, string> = { prep: "준비", camper: "캠핑카 고르기", video: "영상 만들기", life: "일상" };
export const BOARD_TITLE: Record<Board, string> = { community: "소통", vehicle: "차량관리", story: "내 이야기" };

/** 게시판마다 분류(종류) 목록과 이름이에요. 차량관리 분류만 관리자가 바꿀 수 있어요. */
export function useBoard() {
  const { t, l } = useI18n();
  const { dictionary } = useApp().snapshot;
  const categories = (board: Board) => {
    if (board === "vehicle") return dictionary.vehicleCategories.map((item) => ({ key: item.key, label: l(item.name) }));
    if (board === "story") return STORY_KINDS.map((key) => ({ key, label: t(STORY_KIND_LABEL[key]) }));
    return POST_KINDS.map((key) => ({ key, label: t(POST_KIND_LABEL[key]) }));
  };
  const label = (board: Board, key: string) => {
    if (board === "vehicle") return l(findName(dictionary.vehicleCategories, key));
    return t((board === "story" ? STORY_KIND_LABEL : POST_KIND_LABEL)[key] ?? "");
  };
  return { categories, label, title: (board: Board) => t(BOARD_TITLE[board]) };
}
