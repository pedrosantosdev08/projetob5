import type { PlayerCategory } from "../../lib/constants";

export interface Training {
  id: string;
  date: Date;
  category: PlayerCategory | string;
  notes?: string;
  attendanceDone: boolean;
  createdAt: Date;
}

export type TrainingPageCursor = unknown;

export interface TrainingPageResult {
  items: Training[];
  nextCursor: TrainingPageCursor | null;
  hasMore: boolean;
}

export interface AttendanceRecord {
  id: string;
  trainingId: string;
  playerId: string;
  category: PlayerCategory | string;
  date: Date;
  present: boolean;
}

export interface AttendanceSummary {
  total: number;
  presentCount: number;
  percentage: number;
}

export interface AttendancePageResult {
  items: AttendanceRecord[];
  nextCursor: TrainingPageCursor | null;
  hasMore: boolean;
}
