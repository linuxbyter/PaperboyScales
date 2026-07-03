import { neon } from "@neondatabase/serverless";
import type {
  Profile,
  AgentDetails,
  Transaction,
  TransactionWithAgent,
  TransactionStatus,
  ProfileStatus,
} from "./types";

let _sql: ReturnType<typeof neon> | null = null;

function sql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const rows = await sql()`SELECT * FROM profiles WHERE id = ${id}`;
  return (rows as Profile[])[0] ?? null;
}

export async function ensureProfile(userId: string, email: string, fullName: string): Promise<Profile> {
  const existing = await getProfileById(userId);
  if (existing) return existing;
  return createProfile({
    id: userId,
    role: "agent",
    full_name: fullName,
    email,
    country: "Unknown",
    status: "pending",
    commission_rate: 10.00,
  });
}

export async function createProfile(profile: {
  id: string;
  role: string;
  full_name: string;
  email: string;
  phone?: string;
  country: string;
  status?: string;
  commission_rate?: number;
}): Promise<Profile> {
  const rows = await sql()`
    INSERT INTO profiles (id, role, full_name, email, phone, country, status, commission_rate)
    VALUES (${profile.id}, ${profile.role}, ${profile.full_name}, ${profile.email}, ${profile.phone ?? null}, ${profile.country}, ${profile.status ?? "pending"}, ${profile.commission_rate ?? 10.00})
    RETURNING *
  `;
  return (rows as Profile[])[0];
}

export async function getAgentDetails(agentId: string): Promise<AgentDetails | null> {
  const rows = await sql()`SELECT * FROM agent_details WHERE agent_id = ${agentId}`;
  return (rows as AgentDetails[])[0] ?? null;
}

export async function upsertAgentDetails(data: {
  agent_id: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  swift_bic?: string;
  id_type?: string;
  id_number?: string;
  id_document_path?: string;
  address?: string;
}): Promise<AgentDetails> {
  const rows = await sql()`
    INSERT INTO agent_details (agent_id, bank_name, account_name, account_number, swift_bic, id_type, id_number, id_document_path, address)
    VALUES (${data.agent_id}, ${data.bank_name ?? null}, ${data.account_name ?? null}, ${data.account_number ?? null}, ${data.swift_bic ?? null}, ${data.id_type ?? null}, ${data.id_number ?? null}, ${data.id_document_path ?? null}, ${data.address ?? null})
    ON CONFLICT (agent_id) DO UPDATE SET
      bank_name = COALESCE(${data.bank_name ?? null}, agent_details.bank_name),
      account_name = COALESCE(${data.account_name ?? null}, agent_details.account_name),
      account_number = COALESCE(${data.account_number ?? null}, agent_details.account_number),
      swift_bic = COALESCE(${data.swift_bic ?? null}, agent_details.swift_bic),
      id_type = COALESCE(${data.id_type ?? null}, agent_details.id_type),
      id_number = COALESCE(${data.id_number ?? null}, agent_details.id_number),
      id_document_path = COALESCE(${data.id_document_path ?? null}, agent_details.id_document_path),
      address = COALESCE(${data.address ?? null}, agent_details.address),
      updated_at = now()
    RETURNING *
  `;
  return (rows as AgentDetails[])[0];
}

export async function getAgentTransactions(agentId: string): Promise<Transaction[]> {
  const rows = await sql()`SELECT * FROM transactions WHERE agent_id = ${agentId} ORDER BY created_at DESC`;
  return rows as Transaction[];
}

export async function getAllTransactions(): Promise<TransactionWithAgent[]> {
  const rows = await sql()`
    SELECT t.*, p.full_name as agent_name, p.country as agent_country
    FROM transactions t
    JOIN profiles p ON t.agent_id = p.id
    ORDER BY t.created_at DESC
  `;
  return rows as TransactionWithAgent[];
}

export async function getAllAgents(): Promise<Profile[]> {
  const rows = await sql()`SELECT * FROM profiles WHERE role = 'agent' ORDER BY created_at DESC`;
  return rows as Profile[];
}

export async function createTransaction(data: {
  agent_id: string;
  client_reference: string;
  amount: number;
  currency: string;
  commission_rate?: number;
  notes?: string;
}): Promise<Transaction> {
  const rows = await sql()`
    INSERT INTO transactions (agent_id, client_reference, amount, currency, commission_rate, notes)
    VALUES (${data.agent_id}, ${data.client_reference}, ${data.amount}, ${data.currency}, ${data.commission_rate ?? 10.00}, ${data.notes ?? null})
    RETURNING *
  `;
  return (rows as Transaction[])[0];
}

export async function updateTransactionStatus(id: string, status: TransactionStatus): Promise<Transaction | null> {
  const rows = await sql()`UPDATE transactions SET status = ${status} WHERE id = ${id} RETURNING *`;
  return (rows as Transaction[])[0] ?? null;
}

export async function updateProfileStatus(userId: string, status: ProfileStatus): Promise<Profile | null> {
  const rows = await sql()`UPDATE profiles SET status = ${status} WHERE id = ${userId} RETURNING *`;
  return (rows as Profile[])[0] ?? null;
}

export async function getAgentStats(agentId: string) {
  const rows = await sql()`
    SELECT
      COALESCE(SUM(CASE WHEN status IN ('forwarded', 'completed') THEN commission_amount ELSE 0 END), 0) as commission_earned,
      COALESCE(SUM(CASE WHEN status = 'pending_receipt' THEN 1 ELSE 0 END), 0) as awaiting_receipt
    FROM transactions WHERE agent_id = ${agentId}
  `;
  return (rows as { commission_earned: number; awaiting_receipt: number }[])[0];
}

export async function getAdminStats() {
  const rows = await sql()`
    SELECT
      COALESCE(SUM(CASE WHEN status = 'forwarded' THEN commission_amount ELSE 0 END), 0) as commission_owed,
      COALESCE(SUM(CASE WHEN status IN ('pending_receipt', 'received') THEN 1 ELSE 0 END), 0) as in_flight,
      COALESCE(SUM(CASE WHEN status != 'cancelled' THEN amount ELSE 0 END), 0) as total_volume
    FROM transactions
  `;
  return (rows as { commission_owed: number; in_flight: number; total_volume: number }[])[0];
}
