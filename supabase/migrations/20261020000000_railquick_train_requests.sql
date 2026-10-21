-- =============================================================================
-- RailQuick: "Request RailQuick in Your Train"
-- Table: public.railquick_train_requests
--
-- Safe to run more than once (idempotent). Run in the Supabase SQL editor or
-- with `psql "$DATABASE_URL" -f supabase/migrations/20261020000000_railquick_train_requests.sql`.
--
-- ACCESS MODEL
--   * RLS is ENABLED. `anon` has no access at all.
--   * `authenticated` (Supabase Auth JWT) may INSERT rows for itself and SELECT
--     only its own rows. It can never read others' rows, nor set/modify `status`
--     (column-level INSERT grant + no UPDATE/DELETE grant or policy).
--   * RailQuick's login is its own session (not a Supabase Auth session), so the
--     RailQuick API server performs writes with the service-role key AFTER
--     verifying the user. The service role bypasses RLS and is never sent to a
--     browser. The policies below still protect the table if it is ever reached
--     through PostgREST with a user JWT (sub = user_id).
--   * Operations team: use the protected GET /api/admin/train-requests API, or
--     the Supabase dashboard (postgres role).
-- =============================================================================

create table if not exists public.railquick_train_requests (
  id            uuid        primary key default gen_random_uuid(),
  user_id       text        not null
                            check (char_length(user_id) between 1 and 128),
  user_name     text        not null
                            check (char_length(btrim(user_name)) between 1 and 80),
  user_email    text
                            check (user_email is null or char_length(user_email) <= 254),
  train_name    text        not null
                            check (char_length(btrim(train_name)) between 1 and 120),
  train_number  text        not null
                            check (train_number ~ '^[0-9]{5}$'),
  journey_date  date        not null,
  status        text        not null default 'pending'
                            check (status in ('pending', 'reviewing', 'approved', 'rejected')),
  created_at    timestamptz not null default now(),

  -- One request per user per train journey; makes duplicate submits (incl. races) impossible.
  constraint railquick_train_requests_one_per_user_journey
    unique (user_id, train_number, journey_date)
);

comment on table public.railquick_train_requests is
  'Passenger requests for RailQuick service on a specific train journey.';

-- Ops views: newest first, by train/date, by workflow status.
create index if not exists railquick_train_requests_created_idx
  on public.railquick_train_requests (created_at desc);
create index if not exists railquick_train_requests_train_date_idx
  on public.railquick_train_requests (train_number, journey_date);
create index if not exists railquick_train_requests_status_idx
  on public.railquick_train_requests (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.railquick_train_requests enable row level security;

revoke all on public.railquick_train_requests from anon, authenticated;
grant select on public.railquick_train_requests to authenticated;
-- Column-level grant: callers can NOT supply id / status / created_at.
grant insert (user_id, user_name, user_email, train_name, train_number, journey_date)
  on public.railquick_train_requests to authenticated;

drop policy if exists "Users read own train requests" on public.railquick_train_requests;
create policy "Users read own train requests"
  on public.railquick_train_requests
  for select to authenticated
  using (user_id = (select auth.uid())::text);

drop policy if exists "Users create own train requests" on public.railquick_train_requests;
create policy "Users create own train requests"
  on public.railquick_train_requests
  for insert to authenticated
  with check (user_id = (select auth.uid())::text and status = 'pending');

-- No UPDATE / DELETE policies => users cannot change status or remove requests.

-- ---------------------------------------------------------------------------
-- Demand summary for the operations team (service role / dashboard only).
-- ---------------------------------------------------------------------------
create or replace view public.railquick_train_request_demand
  with (security_invoker = true) as
select
  train_number,
  max(train_name)      as train_name,
  journey_date,
  count(*)             as request_count,
  min(created_at)      as first_requested_at,
  max(created_at)      as last_requested_at
from public.railquick_train_requests
group by train_number, journey_date;

revoke all on public.railquick_train_request_demand from anon, authenticated;
