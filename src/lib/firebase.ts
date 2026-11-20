import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// .env에 Firebase 설정이 있으면 Firestore를 쓰고, 없으면 샘플 모드로 동작해요.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
};

export const firebaseEnabled = Boolean(config.apiKey && config.projectId && import.meta.env.MODE !== "test");

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let user: Promise<User> | null = null;

function getApp(): FirebaseApp {
  app ??= initializeApp(config);
  return app;
}

export function getDb(): Firestore {
  db ??= getFirestore(getApp());
  return db;
}

/** 화면 없이 익명으로 로그인해요. 같은 기기에서는 같은 uid가 유지돼요. */
export function ensureUser(): Promise<User> {
  user ??= new Promise<User>((resolve, reject) => {
    const auth = getAuth(getApp());
    const stop = onAuthStateChanged(auth, (current) => {
      if (current) {
        stop();
        resolve(current);
      }
    });
    if (!auth.currentUser) signInAnonymously(auth).catch((error) => {
      stop();
      user = null;
      reject(error);
    });
  });
  return user;
}
