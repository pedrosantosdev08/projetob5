export interface CategoryAttendanceRate {
  category: string;
  totalAttendances: number;
  presentCount: number;
  percentage: number;
}

export interface AbsenceAlert {
  type: "absence";
  playerId: string;
  playerName: string;
  category: string;
  consecutiveAbsences: number;
}

export interface OverdueLoanAlert {
  type: "loan";
  loanId: string;
  materialName: string;
  playerName: string;
  loanedAt: Date;
  daysOverdue: number;
}

export type DashboardAlert = AbsenceAlert | OverdueLoanAlert;

export interface DashboardMetrics {
  activePlayersCount: number;
  categoryRates: CategoryAttendanceRate[];
  overallAttendancePercentage: number;
  materialsInUseCount: number;
  openLoansCount: number;
  alerts: DashboardAlert[];
}
