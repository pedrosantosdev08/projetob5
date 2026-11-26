import { useCallback, useState } from "react";
import { createLoan, returnLoan } from "./loanService";

export function useLoanMutations(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLoan = useCallback(
    async (params: {
      materialId: string;
      materialName: string;
      playerId: string;
      playerName: string;
      quantity: number;
      notes: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        await createLoan(params);
        onSuccess?.();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao registrar empréstimo");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  const devolver = useCallback(
    async (loanId: string) => {
      setLoading(true);
      setError(null);
      try {
        await returnLoan(loanId);
        onSuccess?.();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao registrar devolução");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  return { addLoan, devolver, loading, error, clearError: () => setError(null) };
}
