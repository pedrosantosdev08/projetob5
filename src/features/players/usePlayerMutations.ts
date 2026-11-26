import { useCallback, useState } from "react";
import type { EntityStatus } from "../../types";
import type { PlayerFormValues } from "./playerSchema";
import {
  createPlayer,
  getPlayerErrorMessage,
  setPlayerStatus,
  updatePlayer,
} from "./playerService";

export function usePlayerMutations() {
  const [saving, setSaving] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setMutationError(null);
  }, []);

  const savePlayer = useCallback(
    async (values: PlayerFormValues, existingId?: string): Promise<string> => {
      setSaving(true);
      setMutationError(null);
      try {
        if (existingId) {
          await updatePlayer(existingId, values);
          return existingId;
        }
        return await createPlayer(values);
      } catch (err) {
        const message = getPlayerErrorMessage(err);
        setMutationError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const toggleStatus = useCallback(
    async (id: string, nextStatus: EntityStatus): Promise<void> => {
      setTogglingStatus(true);
      setMutationError(null);
      try {
        await setPlayerStatus(id, nextStatus);
      } catch (err) {
        const message = getPlayerErrorMessage(err);
        setMutationError(message);
        throw new Error(message);
      } finally {
        setTogglingStatus(false);
      }
    },
    []
  );

  return {
    savePlayer,
    toggleStatus,
    saving,
    togglingStatus,
    mutationError,
    clearError,
  };
}
