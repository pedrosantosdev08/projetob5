import { useCallback, useEffect, useRef, useState } from "react";
import { getMaterialErrorMessage, listMaterials } from "./materialService";
import type { Material, MaterialPageCursor } from "./materialTypes";

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<MaterialPageCursor | null>(null);
  const requestIdRef = useRef(0);

  const loadInitial = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setLoadMoreError(null);
    cursorRef.current = null;

    try {
      const result = await listMaterials();
      if (requestIdRef.current !== currentRequestId) return;

      setMaterials(result.items);
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasMore);
    } catch (err) {
      if (requestIdRef.current !== currentRequestId) return;
      setError(getMaterialErrorMessage(err));
      setMaterials([]);
      setHasMore(false);
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;

    const currentRequestId = ++requestIdRef.current;
    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      const result = await listMaterials({ cursor: cursorRef.current });
      if (requestIdRef.current !== currentRequestId) return;

      setMaterials((prev) => [...prev, ...result.items]);
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasMore);
    } catch (err) {
      if (requestIdRef.current !== currentRequestId) return;
      setLoadMoreError(getMaterialErrorMessage(err));
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoadingMore(false);
      }
    }
  }, [hasMore, loadingMore]);

  return {
    materials,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
    reload: loadInitial,
  };
}
