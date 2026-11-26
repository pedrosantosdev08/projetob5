import { useCallback, useState } from "react";
import type { TrainingFormValues } from "./trainingSchema";
import { createTraining, getTrainingErrorMessage } from "./trainingService";

export function useTrainingMutations() {
  const [creating, setCreating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setMutationError(null);
  }, []);

  const addTraining = useCallback(
    async (values: TrainingFormValues): Promise<string> => {
      setCreating(true);
      setMutationError(null);
      try {
        return await createTraining(values);
      } catch (err) {
        const message = getTrainingErrorMessage(err);
        setMutationError(message);
        throw new Error(message);
      } finally {
        setCreating(false);
      }
    },
    []
  );

  return {
    addTraining,
    creating,
    mutationError,
    clearError,
  };
}
