import { useCallback, useEffect, useState } from "react";
import { getPlayerById, getPlayerErrorMessage } from "./playerService";
import type { Player } from "./playerTypes";

export function usePlayer(playerId: string | undefined) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(Boolean(playerId));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!playerId) {
      setPlayer(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getPlayerById(playerId);
      setPlayer(data);
    } catch (err) {
      setError(getPlayerErrorMessage(err));
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    player,
    loading,
    error,
    reload: load,
  };
}
