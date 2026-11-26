import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

const missingEnvMessage =
  "Configuração do Firebase ausente. Crie o arquivo .env a partir de .env.example com as chaves VITE_FIREBASE_* e reinicie o servidor.";

let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let configError: string | null = null;

const hasRequiredConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

if (!hasRequiredConfig) {
  configError = missingEnvMessage;
} else {
  try {
    const app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    configError =
      "Não foi possível inicializar o Firebase. Verifique as variáveis no arquivo .env.";
  }
}

export const auth = authInstance;
export const db = dbInstance;
export const firebaseConfigError = configError;

export function requireAuth(): Auth {
  if (!authInstance) {
    throw new Error(configError ?? missingEnvMessage);
  }
  return authInstance;
}

export function requireDb(): Firestore {
  if (!dbInstance) {
    throw new Error(configError ?? missingEnvMessage);
  }
  return dbInstance;
}
