import { useCallback, useState } from "react";
import type { MaterialFormValues } from "./materialSchema";
import {
  createMaterial,
  getMaterialErrorMessage,
  updateMaterial,
} from "./materialService";

export function useMaterialMutations() {
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setMutationError(null);
  }, []);

  const saveMaterial = useCallback(
    async (values: MaterialFormValues, existingId?: string): Promise<void> => {
      setSaving(true);
      setMutationError(null);
      try {
        if (existingId) {
          await updateMaterial(existingId, values);
        } else {
          await createMaterial(values);
        }
      } catch (err) {
        const message = getMaterialErrorMessage(err);
        setMutationError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return {
    saveMaterial,
    saving,
    mutationError,
    clearError,
  };
}
