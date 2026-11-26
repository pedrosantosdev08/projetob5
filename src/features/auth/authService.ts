import { FirebaseError } from "firebase/app";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type Unsubscribe,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  firebaseConfigError,
  requireAuth,
  requireDb,
} from "../../lib/firebase";
import type { CoachProfile } from "./authTypes";

export class AuthPermissionError extends Error {
  constructor(message = "Sem permissão para acessar este sistema.") {
    super(message);
    this.name = "AuthPermissionError";
  }
}

export async function fetchCoachProfile(
  uid: string,
  fallbackEmail: string
): Promise<CoachProfile | null> {
  const db = requireDb();
  const snapshot = await getDoc(doc(db, "coaches", uid));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  const rawName = data.name;
  const name =
    typeof rawName === "string" && rawName.trim().length > 0
      ? rawName.trim()
      : "Treinador";

  return {
    uid,
    email: fallbackEmail,
    name,
  };
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<CoachProfile> {
  const auth = requireAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await fetchCoachProfile(
    credential.user.uid,
    credential.user.email ?? email
  );

  if (!profile) {
    await firebaseSignOut(auth);
    throw new AuthPermissionError("Sem permissão para acessar este sistema.");
  }

  return profile;
}

export async function logoutCoach(): Promise<void> {
  const auth = requireAuth();
  await firebaseSignOut(auth);
}

export function subscribeToAuthState(
  onChange: (user: User | null) => void
): Unsubscribe {
  if (firebaseConfigError) {
    return () => undefined;
  }
  return onAuthStateChanged(requireAuth(), onChange);
}

export function getAuthErrorMessage(error: unknown): string {
  if (firebaseConfigError) {
    return firebaseConfigError;
  }

  if (error instanceof AuthPermissionError) {
    return error.message;
  }

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/invalid-email":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "E-mail ou senha inválidos.";
      case "auth/invalid-api-key":
        return "Chave do Firebase inválida. Verifique o arquivo .env.";
      case "auth/user-disabled":
        return "Esta conta foi desativada.";
      case "auth/too-many-requests":
        return "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.";
      case "auth/network-request-failed":
      case "unavailable":
        return "Sem conexão no momento. Verifique a internet e tente novamente.";
      case "permission-denied":
        return "Sem permissão para acessar este sistema.";
      default:
        return "Não foi possível entrar. Tente novamente.";
    }
  }

  return "Não foi possível entrar. Tente novamente.";
}
