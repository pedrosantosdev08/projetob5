export interface PlayerReportItem {
  id: string;
  name: string;
  category: string;
  status: "active" | "inactive";
  totalTrainings: number;
  presentCount: number;
  absenceCount: number;
  attendancePercentage: number;
}

export interface CategoryReportSummary {
  category: string;
  playersCount: number;
  totalTrainingsConducted: number;
  averageAttendancePercentage: number;
}

export interface ReportFilter {
  category: string; // 'all' ou categoria específica
  status: "all" | "active" | "inactive";
  period: "all" | "30d" | "90d";
}
