create extension if not exists "pgcrypto";

-- Users
create table if not exists profiles (
  id text primary key,
  type text not null default 'trader' check (type in ('trader', 'agent', 'admin')),
  full_name text not null,
  email text not null unique,
  phone text,
  country text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Agent bank accounts (agents input their own banks)
create table if not exists agent_banks (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references profiles(id) on delete cascade,
  bank_name text not null check (bank_name in (
    'Revolut','HSBC','Stanbic','Lloyds',
    'AMP','ING','ANZ','UpBank','Bankwest'
  )),
  country text not null check (country in ('UK','AU')),
  account_name text not null,
  account_number text not null,
  swift_bic text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Transactions
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references profiles(id),
  trader_id text not null references profiles(id),
  bank_id uuid not null references agent_banks(id),
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'USD',
  client_reference text not null default '',
  quick_status text not null default 'pending' check (quick_status in (
    'pending','active','sending','sent','paid','complete','dispute','confirmed'
  )),
  commission_rate numeric(5,2) not null default 10.00,
  commission_amount numeric(14,2) generated always as (round(amount * commission_rate / 100, 2)) stored,
  payment_proof_path text,
  dispute_reason text,
  dispute_evidence_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admin WhatsApp numbers (agents send funds here)
create table if not exists whatsapp_numbers (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  label text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Auto-update triggers
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();
drop trigger if exists trg_transactions_updated on transactions;
create trigger trg_transactions_updated before update on transactions for each row execute function set_updated_at();
