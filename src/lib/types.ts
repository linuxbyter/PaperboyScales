export type Role = "agent" | "admin";
export type ProfileStatus = "pending" | "approved" | "rejected" | "suspended";
export type TransactionStatus =
  | "pending_receipt"
  | "received"
  | "forwarded"
  | "completed"
  | "cancelled";

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  status: ProfileStatus;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

export interface AgentDetails {
  agent_id: string;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  swift_bic: string | null;
  id_type: string | null;
  id_number: string | null;
  id_document_path: string | null;
  address: string | null;
  updated_at: string;
}

export interface Transaction {
  id: string;
  agent_id: string;
  client_reference: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  commission_rate: number;
  commission_amount: number;
  proof_of_receipt_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithAgent extends Transaction {
  agent_name: string;
  agent_country: string;
}
