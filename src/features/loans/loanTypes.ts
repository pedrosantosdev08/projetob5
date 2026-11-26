export type LoanStatus = "open" | "returned";

export interface Loan {
  id: string;
  materialId: string;
  materialName: string;
  playerId: string;
  playerName: string;
  quantity: number;
  status: LoanStatus;
  loanedAt: Date;
  returnedAt: Date | null;
  notes: string;
  createdAt: Date;
}

export type LoanPageCursor = unknown;

export interface LoanPageResult {
  items: Loan[];
  nextCursor: LoanPageCursor | null;
  hasMore: boolean;
}
