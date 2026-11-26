import { useCallback, useEffect, useRef, useState } from "react";
import type { EntityStatus } from "../../types";
import { getPlayerErrorMessage, listPlayers } from "./playerService";
import type { Player, PlayerPageCursor } from "./playerTypes";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debounced;
}

interface UsePlayersOptions {
  status: EntityStatus;
  category: string;
  search: string;
}

export function usePlayers({ status, category, search }: UsePlayersOptions) {
  const debouncedSearch = useDebouncedValue(search, 300);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<PlayerPageCursor | null>(null);
  const requestIdRef = useRef(0);

  const loadInitial = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setLoadMoreError(null);
    cursorRef.current = null;

    try {
      const result = await listPlayers({
        status,
        category,
        search: debouncedSearch,
      });
      if (requestIdRef.current !== currentRequestId) return;

      setPlayers(result.items);
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasMore);
    } catch (err) {
      if (requestIdRef.current !== currentRequestId) return;
      setError(getPlayerErrorMessage(err));
      setPlayers([]);
      setHasMore(false);
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, [status, category, debouncedSearch]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;

    const currentRequestId = requestIdRef.current;
    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      const result = await listPlayers({
        status,
        category,
        search: debouncedSearch,
        cursor: cursorRef.current,
      });
      if (requestIdRef.current !== currentRequestId) return;

      setPlayers((prev) => [...prev, ...result.items]);
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasMore);
    } catch (err) {
      if (requestIdRef.current !== currentRequestId) return;
      setLoadMoreError(getPlayerErrorMessage(err));
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoadingMore(false);
      }
    }
  }, [status, category, debouncedSearch, hasMore, loadingMore]);

  return {
    players,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
    reload: loadInitial,
  };
}
