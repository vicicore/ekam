-- SETU Phase 19: officer workflow assignments + officer notifications
create table if not exists setu_assignments (
  id uuid primary key,
  application_id text not null,
  service_code text not null,
  department text not null,
  officer_id text not null,
  assigned_by text not null,
  status text not null default 'assigned',
  note text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
create index if not exists idx_setu_assignments_officer on setu_assignments(officer_id,status);
create index if not exists idx_setu_assignments_application on setu_assignments(application_id,service_code);

create table if not exists setu_officer_notifications (
  id uuid primary key,
  officer_id text not null,
  title text not null,
  message text not null,
  notification_type text not null default 'workflow',
  resource_id text,
  read boolean not null default false,
  created_at timestamptz not null
);
create index if not exists idx_setu_officer_notifications on setu_officer_notifications(officer_id,read,created_at desc);

-- Backend service-role access is expected for this prototype boundary.
-- Add explicit RLS policies before allowing direct browser access to these tables.
