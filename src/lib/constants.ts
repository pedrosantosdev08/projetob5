export const PLAYER_CATEGORIES = [
  "Sub-8",
  "Sub-10",
  "Sub-12",
  "Sub-14",
  "Sub-16",
] as const;

export type PlayerCategory = (typeof PLAYER_CATEGORIES)[number];

/** Quantidade de faltas seguidas para disparar alerta de evasão (RN06). */
export const ABSENCE_ALERT_STREAK = 3;

/** Dias em aberto para disparar alerta de material atrasado (RN07). */
export const LOAN_ALERT_DAYS = 7;

/** Janela padrão de dias para métricas recentes no dashboard (RN08). */
export const DASHBOARD_WINDOW_DAYS = 30;

/** Limite padrão por página nas listagens do Firestore. */
export const DEFAULT_PAGE_SIZE = 20;
