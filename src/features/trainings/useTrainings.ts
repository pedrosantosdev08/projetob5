import { useCallback, useEffect, useRef, useState } from "react";
import { getTrainingErrorMessage, listTrainings } from "./trainingService";
import type { Training, TrainingPageCursor } from "./trainingTypes";

export function useTrainings(category: string) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<TrainingPageCursor | null>(null);
  const requestIdRef = useRef(0);

  const loadInitial = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setLoadMoreError(null);
    cursorRef.current = null;

    try {
      const result = await listTrainings({ category });
      if (requestIdRef.current !== currentRequestId) return;

      setTrainings(result.items);
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasMore);
    } catch (err) {
      if (requestIdRef.current !== currentRequestId) return;
      setError(getTrainingErrorMessage(err));
      setTrainings([]);
      setHasMore(false);
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, [category]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;

    const currentRequestId = ++requestIdRef.current;
    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      const result = await listTrainings({
        category,
        cursor: cursorRef.current,
      });
      if (requestIdRef.current !== currentRequestId) return;

      setTrainings((prev) => [...prev, ...result.items]);
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasMore);
    } catch (err) {
      if (requestIdRef.current !== currentRequestId) return;
      setLoadMoreError(getTrainingErrorMessage(err));
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoadingMore(false);
      }
    }
  }, [category, hasMore, loadingMore]);

  return {
    trainings,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
    reload: loadInitial,
  };
}
