import { useCallback, useEffect, useState, type ReactNode } from "react";
import { firebaseConfigError } from "../../lib/firebase";
import { AuthContext } from "./AuthContext";
import {
  fetchCoachProfile,
  getAuthErrorMessage,
  loginWithEmail,
  logoutCoach,
  subscribeToAuthState,
} from "./authService";
import type { CoachProfile } from "./authTypes";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(!firebaseConfigError);
  const [authError, setAuthError] = useState<string | null>(firebaseConfigError);

  useEffect(() => {
    if (firebaseConfigError) {
      return;
    }

    let active = true;

    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!active) return;

      if (!user) {
        setCoach(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await fetchCoachProfile(user.uid, user.email ?? "");
        if (!active) return;

        if (!profile) {
          setAuthError("Sem permissão para acessar este sistema.");
          setCoach(null);
          setLoading(false);
          await logoutCoach().catch(() => undefined);
          return;
        }

        setCoach(profile);
        setAuthError(null);
        setLoading(false);
      } catch (error) {
        if (!active) return;
        setAuthError(getAuthErrorMessage(error));
        setCoach(null);
        setLoading(false);
        await logoutCoach().catch(() => undefined);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      const profile = await loginWithEmail(email, password);
      setCoach(profile);
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    try {
      await logoutCoach();
      setCoach(null);
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(firebaseConfigError);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        coach,
        loading,
        authError,
        signIn,
        signOut,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
