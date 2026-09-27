-- SETU Phase 18 Supabase/PostgreSQL schema.
-- Apply in Supabase SQL Editor. JSONB is used for nested journey state so
-- the domain/repository contract stays unchanged during the migration.

create table if not exists applications (
  id text primary key,
  citizen_id text not null,
  life_event_code text not null,
  steps jsonb not null default '{}'::jsonb,
  consents jsonb not null default '{}'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
create index if not exists idx_applications_citizen on applications(citizen_id);

create table if not exists audit_logs (
  id text primary key,
  application_id text,
  actor text not null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null
);
create index if not exists idx_audit_application on audit_logs(application_id);

create table if not exists citizen_profiles (
  citizen_id text primary key,
  full_name text not null,
  dob text,
  district text,
  taluka text,
  phone text,
  email text,
  preferred_language text not null default 'en',
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists documents (
  id text primary key,
  citizen_id text not null,
  doc_type text not null,
  issuer text,
  storage_key text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  status text not null,
  rejection_reason text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
create index if not exists idx_documents_citizen on documents(citizen_id);

create table if not exists connector_requests (
  external_reference text primary key,
  department text not null,
  service_code text not null,
  status text not null,
  submitted_at timestamptz not null,
  sla_deadline timestamptz not null,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists accounts (
  citizen_id text primary key,
  identifier text unique not null,
  role text not null default 'citizen',
  created_at timestamptz not null
);
create table if not exists sessions (
  token text primary key,
  citizen_id text not null,
  role text not null,
  created_at timestamptz not null,
  expires_at timestamptz not null
);
create index if not exists idx_sessions_expiry on sessions(expires_at);

create table if not exists officers (
  officer_id text primary key,
  display_name text not null,
  department text not null,
  district text,
  active boolean not null default true,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
create index if not exists idx_officers_department on officers(department);

create table if not exists connector_jobs (
  id text primary key,
  operation text not null,
  department text not null,
  service_code text not null,
  external_reference text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  next_attempt_at timestamptz not null,
  last_error text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
create index if not exists idx_connector_jobs_due on connector_jobs(status, next_attempt_at);

create table if not exists dead_letters (
  id text primary key,
  job_id text not null,
  reason text not null,
  attempts integer not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null
);

create table if not exists metric_events (
  id text primary key,
  name text not null,
  value double precision not null default 1,
  labels jsonb not null default '{}'::jsonb,
  created_at timestamptz not null
);
create index if not exists idx_metric_events_created on metric_events(created_at desc);

-- RLS should be enabled and policies should be designed for the chosen
-- production identity model before exposing tables to browser clients.
-- The service-role key is backend-only and bypasses RLS.
