export interface CoachProfile {
  uid: string;
  email: string;
  name: string;
}

export interface AuthContextValue {
  coach: CoachProfile | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}
