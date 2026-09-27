create table if not exists setu_integration_dispatches (
 id uuid primary key, application_id text not null, service_code text not null,
 department text not null, connector text not null, external_reference text,
 status text not null default 'queued', attempt_count integer not null default 0,
 last_error text, created_at timestamptz not null, updated_at timestamptz not null
);
create index if not exists idx_setu_integration_dispatch_app on setu_integration_dispatches(application_id);
create table if not exists setu_citizen_notifications (
 id uuid primary key, citizen_id text not null, title text not null, message text not null,
 notification_type text not null default 'application', application_id text,
 read boolean not null default false, created_at timestamptz not null
);
create index if not exists idx_setu_citizen_notifications_citizen on setu_citizen_notifications(citizen_id,created_at desc);
