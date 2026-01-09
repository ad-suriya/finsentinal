
export type Status = "APPROVED" | "FLAGGED" | "BLOCKED";
export type Entity = "Bank A" | "Bank B";

export interface Transaction {
  id: string;
  hashId: string;
  timestamp: string;
  amount: number;
  score: number; // 0.0 to 1.0
  status: Status;
  scenario: string;
  explanation: string;
  entity: Entity;
}

export interface User {
  email: string;
  role: 'Admin' | 'Analyst';
}
