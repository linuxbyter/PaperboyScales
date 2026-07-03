import { neon } from "@neondatabase/serverless";
import type { Profile, AgentBank, Transaction, TransactionWithNames, WhatsappNumber, QuickStatus, UserType } from "./types";

let _sql: ReturnType<typeof neon> | null = null;

function sql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql as unknown as (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;
}

// ─── Profiles ──────────────────────────────────────────────
export async function getProfileById(id: string): Promise<Profile | null> {
  const rows = await sql()`SELECT * FROM profiles WHERE id = ${id}`;
  return (rows as unknown as Profile[])[0] ?? null;
}

export async function getProfileByEmail(email: string): Promise<Profile | null> {
  const rows = await sql()`SELECT * FROM profiles WHERE email = ${email}`;
  return (rows as unknown as Profile[])[0] ?? null;
}

export async function createProfile(data: {
  id: string; type: UserType; full_name: string; email: string; password_hash: string; phone?: string; country?: string;
}): Promise<Profile> {
  try {
    const rows = await sql()`
      INSERT INTO profiles (id, type, full_name, email, password_hash, phone, country, status)
      VALUES (${data.id}, ${data.type}, ${data.full_name}, ${data.email}, ${data.password_hash}, ${data.phone ?? null}, ${data.country ?? ''}, ${data.type === 'agent' ? 'pending' : 'approved'})
      RETURNING *
    `;
    return (rows as unknown as Profile[])[0];
  } catch (error) {
    console.error('Database error in createProfile:', error);
    throw error;
  }
}

export async function updateProfileStatus(userId: string, status: string): Promise<Profile | null> {
  const rows = await sql()`UPDATE profiles SET status = ${status} WHERE id = ${userId} RETURNING *`;
  return (rows as unknown as Profile[])[0] ?? null;
}

// ─── Agent Banks ───────────────────────────────────────────
export async function getAgentBanks(agentId: string): Promise<AgentBank[]> {
  const rows = await sql()`SELECT * FROM agent_banks WHERE agent_id = ${agentId} AND is_active = true ORDER BY created_at DESC`;
  return rows as unknown as AgentBank[];
}

export async function getAllActiveAgentBanks(): Promise<(AgentBank & { agent_name: string })[]> {
  const rows = await sql()`
    SELECT b.*, p.full_name as agent_name
    FROM agent_banks b
    JOIN profiles p ON b.agent_id = p.id
    WHERE b.is_active = true AND p.status = 'approved' AND p.type = 'agent'
    ORDER BY p.full_name, b.bank_name
  `;
  return rows as unknown as (AgentBank & { agent_name: string })[];
}

export async function addAgentBank(data: {
  agent_id: string; bank_name: string; country: string; account_name: string; account_number: string; swift_bic?: string;
}): Promise<AgentBank> {
  const rows = await sql()`
    INSERT INTO agent_banks (agent_id, bank_name, country, account_name, account_number, swift_bic)
    VALUES (${data.agent_id}, ${data.bank_name}, ${data.country}, ${data.account_name}, ${data.account_number}, ${data.swift_bic ?? null})
    RETURNING *
  `;
  return (rows as unknown as AgentBank[])[0];
}

export async function deleteAgentBank(bankId: string): Promise<void> {
  await sql()`UPDATE agent_banks SET is_active = false WHERE id = ${bankId}`;
}

export async function getAllAgentBanksAdmin(): Promise<(AgentBank & { agent_name: string })[]> {
  const rows = await sql()`
    SELECT b.*, p.full_name as agent_name
    FROM agent_banks b
    JOIN profiles p ON b.agent_id = p.id
    ORDER BY p.full_name, b.bank_name
  `;
  return rows as unknown as (AgentBank & { agent_name: string })[];
}

// ─── Transactions ──────────────────────────────────────────
export async function getAgentTransactions(agentId: string): Promise<TransactionWithNames[]> {
  const rows = await sql()`
    SELECT t.*, p2.full_name as trader_name, p.full_name as agent_name,
           b.bank_name, b.country as bank_country, b.account_name, b.account_number
    FROM transactions t
    JOIN profiles p ON t.agent_id = p.id
    JOIN profiles p2 ON t.trader_id = p2.id
    JOIN agent_banks b ON t.bank_id = b.id
    WHERE t.agent_id = ${agentId}
    ORDER BY t.created_at DESC
  `;
  return rows as unknown as TransactionWithNames[];
}

export async function getTraderTransactions(traderId: string): Promise<TransactionWithNames[]> {
  const rows = await sql()`
    SELECT t.*, p.full_name as agent_name, p2.full_name as trader_name,
           b.bank_name, b.country as bank_country, b.account_name, b.account_number
    FROM transactions t
    JOIN profiles p ON t.agent_id = p.id
    JOIN profiles p2 ON t.trader_id = p2.id
    JOIN agent_banks b ON t.bank_id = b.id
    WHERE t.trader_id = ${traderId}
    ORDER BY t.created_at DESC
  `;
  return rows as unknown as TransactionWithNames[];
}

export async function getAllTransactions(): Promise<TransactionWithNames[]> {
  const rows = await sql()`
    SELECT t.*, p.full_name as agent_name, p2.full_name as trader_name,
           b.bank_name, b.country as bank_country, b.account_name, b.account_number
    FROM transactions t
    JOIN profiles p ON t.agent_id = p.id
    JOIN profiles p2 ON t.trader_id = p2.id
    JOIN agent_banks b ON t.bank_id = b.id
    ORDER BY t.created_at DESC
  `;
  return rows as unknown as TransactionWithNames[];
}

export async function createTransaction(data: {
  agent_id: string; trader_id: string; bank_id: string; amount: number; currency?: string; client_reference?: string;
}): Promise<Transaction> {
  const rows = await sql()`
    INSERT INTO transactions (agent_id, trader_id, bank_id, amount, currency, client_reference)
    VALUES (${data.agent_id}, ${data.trader_id}, ${data.bank_id}, ${data.amount}, ${data.currency ?? 'USD'}, ${data.client_reference ?? ''})
    RETURNING *
  `;
  return (rows as unknown as Transaction[])[0];
}

export async function updateQuickStatus(id: string, quick_status: QuickStatus): Promise<Transaction | null> {
  const rows = await sql()`UPDATE transactions SET quick_status = ${quick_status} WHERE id = ${id} RETURNING *`;
  return (rows as unknown as Transaction[])[0] ?? null;
}

export async function updateTransactionDispute(id: string, dispute_reason: string, dispute_evidence_path: string): Promise<Transaction | null> {
  const rows = await sql()`
    UPDATE transactions SET quick_status = 'dispute', dispute_reason = ${dispute_reason}, dispute_evidence_path = ${dispute_evidence_path} WHERE id = ${id} RETURNING *
  `;
  return (rows as unknown as Transaction[])[0] ?? null;
}

// ─── Admin Stats ───────────────────────────────────────────
export async function getAdminStats() {
  const rows = await sql()`
    SELECT
      (SELECT count(*)::int FROM profiles WHERE type = 'agent' AND status = 'approved') as total_agents,
      (SELECT count(*)::int FROM profiles WHERE type = 'trader') as total_traders,
      (SELECT count(*)::int FROM profiles WHERE type = 'agent' AND status = 'pending') as pending_agents,
      (SELECT COALESCE(SUM(amount), 0)::numeric FROM transactions WHERE quick_status != 'complete') as in_flight,
      (SELECT COALESCE(SUM(commission_amount), 0)::numeric FROM transactions WHERE quick_status = 'complete') as total_commission
  `;
  return (rows as unknown as { total_agents: number; total_traders: number; pending_agents: number; in_flight: number; total_commission: number }[])[0];
}

// ─── WhatsApp Numbers ──────────────────────────────────────
export async function getWhatsappNumbers(): Promise<WhatsappNumber[]> {
  const rows = await sql()`SELECT * FROM whatsapp_numbers WHERE is_active = true ORDER BY created_at DESC`;
  return rows as unknown as WhatsappNumber[];
}

export async function getWhatsAppNumbers(): Promise<WhatsappNumber[]> {
  return getWhatsappNumbers();
}

export async function addWhatsappNumber(number: string, label: string): Promise<WhatsappNumber> {
  const rows = await sql()`INSERT INTO whatsapp_numbers (number, label) VALUES (${number}, ${label}) RETURNING *`;
  return (rows as unknown as WhatsappNumber[])[0];
}

export async function deleteWhatsappNumber(id: string): Promise<void> {
  await sql()`UPDATE whatsapp_numbers SET is_active = false WHERE id = ${id}`;
}

// ─── Agent Stats ───────────────────────────────────────────
export async function getAgentStats(agentId: string) {
  const rows = await sql()`
    SELECT
      COALESCE(SUM(CASE WHEN quick_status = 'complete' THEN commission_amount ELSE 0 END), 0) as commission_earned,
      COALESCE(SUM(CASE WHEN quick_status IN ('pending','active','sending','sent','paid') THEN 1 ELSE 0 END), 0) as in_progress,
      count(*)::int as total
    FROM transactions WHERE agent_id = ${agentId}
  `;
  return (rows as unknown as { commission_earned: number; in_progress: number; total: number }[])[0];
}

// ─── All agents for trader view ────────────────────────────
export async function getApprovedAgents(): Promise<Profile[]> {
  const rows = await sql()`SELECT * FROM profiles WHERE type = 'agent' AND status = 'approved' ORDER BY full_name`;
  return rows as unknown as Profile[];
}

export async function getAllAgents(): Promise<Profile[]> {
  const rows = await sql()`SELECT * FROM profiles WHERE type = 'agent' ORDER BY created_at DESC`;
  return rows as unknown as Profile[];
}

export async function getAllTraders(): Promise<Profile[]> {
  const rows = await sql()`SELECT * FROM profiles WHERE type = 'trader' ORDER BY created_at DESC`;
  return rows as unknown as Profile[];
}
