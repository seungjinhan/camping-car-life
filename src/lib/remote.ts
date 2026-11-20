import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
import { EMPTY_DICTIONARY } from "./baseDictionary";
import { ensureUser, getDb } from "./firebase";
import type { Dictionary, Festival, Journey, Post, Snapshot, Spot, Video } from "./types";

// Firestore 읽기 · 쓰기예요. 권한은 firestore.rules가 막아요.
// 컬렉션: spots · festivals · videos · posts, config/dictionary · config/journey,
// admins/{uid} (댓글은 없어요)

type Kind = "spots" | "festivals" | "videos" | "posts";

function withId<T>(id: string, data: DocumentData): T {
  return { ...data, id } as T;
}

async function readAll<T>(name: Kind): Promise<T[]> {
  const snapshot = await getDocs(collection(getDb(), name));
  return snapshot.docs.map((item) => withId<T>(item.id, item.data()));
}

export async function loadSnapshot(): Promise<Snapshot> {
  await ensureUser();
  const db = getDb();
  const [spots, festivals, videos, posts, dictionary, journey] = await Promise.all([
    readAll<Spot>("spots"),
    readAll<Festival>("festivals"),
    readAll<Video>("videos"),
    readAll<Post>("posts"),
    getDoc(doc(db, "config", "dictionary")),
    getDoc(doc(db, "config", "journey")),
  ]);
  return {
    spots,
    festivals,
    videos,
    posts,
    dictionary: dictionary.exists() ? ({ ...EMPTY_DICTIONARY, ...dictionary.data() } as Dictionary) : EMPTY_DICTIONARY,
    journey: journey.exists() ? (journey.data() as Journey) : null,
  };
}

// ── 관리자 ──

export async function checkAdmin(): Promise<boolean> {
  const { uid } = await ensureUser();
  try {
    return (await getDoc(doc(getDb(), "admins", uid))).exists();
  } catch {
    return false;
  }
}

/** undefined 칸은 Firestore가 받지 않아서 빼고 저장해요. */
function clean<T extends object>(value: T): DocumentData {
  return JSON.parse(JSON.stringify(value)) as DocumentData;
}

export async function saveItem(kind: Kind, item: Spot | Festival | Video | Post): Promise<void> {
  const { id, ...data } = item;
  await setDoc(doc(getDb(), kind, id), clean(data));
}

export async function deleteItem(kind: Kind, id: string): Promise<void> {
  await deleteDoc(doc(getDb(), kind, id));
}

export async function saveJourney(journey: Journey): Promise<void> {
  await setDoc(doc(getDb(), "config", "journey"), clean(journey));
}

export async function saveDictionary(dictionary: Dictionary): Promise<void> {
  await setDoc(doc(getDb(), "config", "dictionary"), clean(dictionary));
}
