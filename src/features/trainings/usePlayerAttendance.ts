import { useCallback, useEffect, useRef, useState } from "react";
import {
  calculateAttendanceSummary,
  getAttendanceErrorMessage,
  getPlayerAttendanceSummary,
  listPlayerAttendance,
} from "./attendanceService";
import type {
  AttendanceRecord,
  AttendanceSummary,
  TrainingPageCursor,
} from "./trainingTypes";

export function usePlayerAttendance(playerId: string | undefined) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({
    total: 0,
    presentCount: 0,
    percentage: 0,
  });
  const [loading, setLoading] = useState(Boolean(playerId));
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<TrainingPageCursor | null>(null);
  const requestIdRef = useRef(0);

  const loadInitial = useCallback(async () => {
    if (!playerId) {
      setRecords([]);
      setSummary({ total: 0, presentCount: 0, percentage: 0 });
      setLoading(false);
      setError(null);
      setHasMore(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setLoadMoreError(null);
    cursorRef.current = null;

    try {
      const page = await listPlayerAttendance({ playerId });
      if (requestIdRef.current !== currentRequestId) return;

      const resolvedSummary = page.hasMore
        ? await getPlayerAttendanceSummary(playerId)
        : calculateAttendanceSummary(page.items);

      if (requestIdRef.current !== currentRequestId) return;

      setRecords(page.items);
      setSummary(resolvedSummary);
      cursorRef.current = page.nextCursor;
      setHasMore(page.hasMore);
    } catch (err) {
      if (requestIdRef.current !== currentRequestId) return;
      setError(getAttendanceErrorMessage(err));
      setRecords([]);
      setHasMore(false);
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, [playerId]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (!playerId || loadingMore || !hasMore || !cursorRef.current) return;

    const currentRequestId = requestIdRef.current;
    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      const page = await listPlayerAttendance({
        playerId,
        cursor: cursorRef.current,
      });
      if (requestIdRef.current !== currentRequestId) return;

      setRecords((prev) => [...prev, ...page.items]);
      cursorRef.current = page.nextCursor;
      setHasMore(page.hasMore);
    } catch (err) {
      if (requestIdRef.current !== currentRequestId) return;
      setLoadMoreError(getAttendanceErrorMessage(err));
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoadingMore(false);
      }
    }
  }, [playerId, hasMore, loadingMore]);

  return {
    records,
    summary,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
    reload: loadInitial,
  };
}
