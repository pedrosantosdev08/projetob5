import { useCallback, useEffect, useReducer } from "react";
import type { LoanPageCursor, LoanPageResult } from "./loanTypes";
import { listOpenLoans } from "./loanService";

type State = {
  pages: LoanPageResult[];
  cursors: (LoanPageCursor | null)[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_MORE_START" }
  | { type: "FETCH_SUCCESS"; page: LoanPageResult }
  | { type: "FETCH_MORE_SUCCESS"; page: LoanPageResult }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_MORE_START":
      return { ...state, loadingMore: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        pages: [action.page],
        cursors: [null, action.page.nextCursor],
      };
    case "FETCH_MORE_SUCCESS":
      return {
        ...state,
        loadingMore: false,
        pages: [...state.pages, action.page],
        cursors: [...state.cursors, action.page.nextCursor],
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, loadingMore: false, error: action.error };
    case "RESET":
      return { pages: [], cursors: [null], loading: false, loadingMore: false, error: null };
    default:
      return state;
  }
}

const initialState: State = {
  pages: [],
  cursors: [null],
  loading: false,
  loadingMore: false,
  error: null,
};

export function useLoans() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchFirst = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const page = await listOpenLoans(null);
      dispatch({ type: "FETCH_SUCCESS", page });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", error: err instanceof Error ? err.message : "Erro ao carregar empréstimos" });
    }
  }, []);

  const fetchMore = useCallback(async () => {
    const lastCursor = state.cursors[state.cursors.length - 1];
    if (!lastCursor || state.loadingMore) return;
    dispatch({ type: "FETCH_MORE_START" });
    try {
      const page = await listOpenLoans(lastCursor);
      dispatch({ type: "FETCH_MORE_SUCCESS", page });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", error: err instanceof Error ? err.message : "Erro ao carregar mais" });
    }
  }, [state.cursors, state.loadingMore]);

  const refresh = useCallback(() => {
    dispatch({ type: "RESET" });
    void fetchFirst();
  }, [fetchFirst]);

  useEffect(() => {
    void fetchFirst();
  }, [fetchFirst]);

  const loans = state.pages.flatMap((p) => p.items);
  const hasMore = state.pages.length > 0
    ? state.pages[state.pages.length - 1].hasMore
    : false;

  return {
    loans,
    loading: state.loading,
    loadingMore: state.loadingMore,
    error: state.error,
    hasMore,
    fetchMore,
    refresh,
  };
}
