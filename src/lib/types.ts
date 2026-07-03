export type UserType = "trader" | "agent" | "admin";
export type ProfileStatus = "pending" | "approved" | "rejected" | "suspended";
export type QuickStatus = "pending" | "active" | "sending" | "sent" | "paid" | "complete" | "dispute" | "confirmed";

export const UK_BANKS = ["Revolut", "HSBC", "Stanbic", "Lloyds"] as const;
export const AU_BANKS = ["AMP", "ING", "ANZ", "UpBank", "Bankwest"] as const;
export const ALL_BANKS = [...UK_BANKS, ...AU_BANKS] as const;

export const QUICK_STATUS_LABELS: Record<QuickStatus, string> = {
  pending: "Pending",
  active: "Active",
  sending: "Sending Now",
  sent: "Sent",
  paid: "Paid",
  complete: "Complete",
  dispute: "Dispute",
  confirmed: "Confirmed",
};

export interface Profile {
  id: string;
  type: UserType;
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  status: ProfileStatus;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface AgentBank {
  id: string;
  agent_id: string;
  bank_name: string;
  country: string;
  account_name: string;
  account_number: string;
  swift_bic: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  agent_id: string;
  trader_id: string;
  bank_id: string;
  amount: number;
  currency: string;
  client_reference: string;
  quick_status: QuickStatus;
  commission_rate: number;
  commission_amount: number;
  payment_proof_path: string | null;
  dispute_reason: string | null;
  dispute_evidence_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithNames extends Transaction {
  agent_name: string;
  trader_name: string;
  bank_name: string;
  bank_country: string;
  account_name: string;
  account_number: string;
}

export interface WhatsappNumber {
  id: string;
  number: string;
  label: string;
  is_active: boolean;
  created_at: string;
}
