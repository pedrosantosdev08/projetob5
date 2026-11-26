import { FirebaseError } from "firebase/app";

interface FirestoreErrorMessages {
  permissionDenied: string;
  unavailable?: string;
  fallback: string;
}

export function getFirestoreErrorMessage(
  error: unknown,
  messages: FirestoreErrorMessages
): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "permission-denied":
        return messages.permissionDenied;
      case "failed-precondition": {
        if (import.meta.env.DEV) {
          const urlMatch = error.message.match(
            /https:\/\/console\.firebase\.google\.com\S+/
          );
          if (urlMatch) {
            console.warn("Crie o índice do Firestore neste link:", urlMatch[0]);
          }
        }
        return "Índice do Firestore pendente para esta consulta. Crie o índice pelo link exibido no console do navegador.";
      }
      case "unavailable":
        return (
          messages.unavailable ??
          "Sem conexão no momento. As alterações serão sincronizadas quando a rede voltar."
        );
      default:
        return messages.fallback;
    }
  }

  return messages.fallback;
}
