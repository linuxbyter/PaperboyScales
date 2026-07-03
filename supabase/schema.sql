create extension if not exists "pgcrypto";

create table if not exists profiles (
  id text primary key,
  role text not null default 'agent' check (role in ('agent', 'admin')),
  full_name text not null,
  email text not null unique,
  phone text,
  country text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  commission_rate numeric(5,2) not null default 10.00,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_details (
  agent_id text primary key references profiles(id) on delete cascade,
  bank_name text,
  account_name text,
  account_number text,
  swift_bic text,
  id_type text,
  id_number text,
  id_document_path text,
  address text,
  updated_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references profiles(id),
  client_reference text not null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null,
  status text not null default 'pending_receipt'
    check (status in ('pending_receipt', 'received', 'forwarded', 'completed', 'cancelled')),
  commission_rate numeric(5,2) not null default 10.00,
  commission_amount numeric(14,2) generated always as (round(amount * commission_rate / 100, 2)) stored,
  proof_of_receipt_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();
drop trigger if exists trg_agent_details_updated on agent_details;
create trigger trg_agent_details_updated before update on agent_details for each row execute function set_updated_at();
drop trigger if exists trg_transactions_updated on transactions;
create trigger trg_transactions_updated before update on transactions for each row execute function set_updated_at();
