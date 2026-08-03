import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";

const SESSION_COOKIE = "novachat-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function setSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${SESSION_MAX_AGE}; samesite=lax`;
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

export function watchSessionCookie() {
  return onIdTokenChanged(auth, (user) => {
    if (user) setSessionCookie();
    else clearSessionCookie();
  });
}

export async function registerWithEmail(name: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, new GoogleAuthProvider());
  return credential.user;
}

export async function loginAsGuest() {
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function logout() {
  await signOut(auth);
}

export async function updateAuthProfile(displayName: string) {
  if (!auth.currentUser) return;
  await updateProfile(auth.currentUser, { displayName });
}

export async function updateAuthEmail(email: string) {
  if (!auth.currentUser) return;
  await updateEmail(auth.currentUser, email);
}

function isFirebaseAuthError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

export function getAuthErrorMessage(error: unknown): string {
  const code = isFirebaseAuthError(error) ? error.code : undefined;
  switch (code) {
    case "auth/email-already-in-use":
      return "Diese E-Mail-Adresse wird bereits verwendet.";
    case "auth/invalid-email":
      return "Ungültige E-Mail-Adresse.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "E-Mail oder Passwort ist falsch.";
    case "auth/weak-password":
      return "Das Passwort ist zu schwach (mindestens 6 Zeichen).";
    case "auth/popup-closed-by-user":
      return "Anmeldefenster wurde geschlossen.";
    case "auth/too-many-requests":
      return "Zu viele Versuche. Bitte später erneut versuchen.";
    case "auth/operation-not-allowed":
      return "Diese Anmeldeart ist aktuell nicht aktiviert.";
    case "auth/requires-recent-login":
      return "Bitte melde dich erneut an, um diese Änderung vorzunehmen.";
    default:
      return "Etwas ist schiefgelaufen. Bitte erneut versuchen.";
  }
}
