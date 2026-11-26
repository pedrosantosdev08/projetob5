import type { PlayerCategory } from "../../lib/constants";
import type { EntityStatus } from "../../types";

export interface Player {
  id: string;
  name: string;
  birthDate: Date;
  category: PlayerCategory | string;
  neighborhood: string;
  guardianName: string;
  guardianPhone: string;
  guardianConsent: boolean;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerFilter {
  status: EntityStatus;
  category: string;
  search: string;
}

export type PlayerPageCursor = unknown;

export interface PlayerPageResult {
  items: Player[];
  nextCursor: PlayerPageCursor | null;
  hasMore: boolean;
}
