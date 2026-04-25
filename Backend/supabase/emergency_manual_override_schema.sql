-- Rescue Nav emergency manual override schema
-- Target: Supabase Postgres / schema public
-- Scope:
--   - emergency_override_set
--   - emergency_edge_overrides
--   - emergency_node_overrides
-- Includes:
--   - indexes
--   - foreign keys
--   - updated_at triggers
--   - RLS policies

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.emergency_override_set (
  override_set_id uuid primary key default gen_random_uuid(),
  override_set_name text not null unique,
  region_name text not null default 'Iksan',
  description text,
  status text not null default 'DRAFT'
    check (status in ('DRAFT', 'REVIEWING', 'APPROVED', 'REJECTED', 'ARCHIVED')),
  is_active boolean not null default false,
  created_by text,
  reviewed_by text,
  approved_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint chk_emergency_override_set_active_requires_approved
    check (not is_active or status = 'APPROVED')
);

create unique index if not exists uq_emergency_override_set_active
  on public.emergency_override_set (region_name, is_active)
  where is_active = true;

create index if not exists idx_emergency_override_set_status
  on public.emergency_override_set (status);

create index if not exists idx_emergency_override_set_region_status
  on public.emergency_override_set (region_name, status);

create table if not exists public.emergency_edge_overrides (
  edge_override_id uuid primary key default gen_random_uuid(),
  override_set_id uuid not null references public.emergency_override_set(override_set_id) on delete cascade,
  version_id uuid not null references public.road_graph_version(version_id) on delete cascade,
  edge_id uuid not null references public.road_graph_edges(edge_id) on delete cascade,
  override_type text not null
    check (override_type in (
      'FIRE_ACCESS_ROAD',
      'BUS_LANE_EMERGENCY_ALLOWED',
      'EMERGENCY_PREFERRED_EDGE',
      'FIRE_TRUCK_BLOCK',
      'AMBULANCE_BLOCK',
      'UTURN_EMERGENCY_ALLOWED',
      'CUSTOM'
    )),
  is_enabled boolean not null default true,
  fire_access_road boolean,
  bus_lane_allowed_emergency boolean,
  u_turn_allowed_emergency boolean,
  is_emergency_preferred boolean,
  blocked_for_fire_truck boolean,
  blocked_for_ambulance boolean,
  override_reason text not null,
  evidence_note text,
  source text not null default 'MANUAL_SURVEY'
    check (source in ('MANUAL_SURVEY', 'DESK_RESEARCH', 'FIELD_REPORT', 'FIRE_STATION_INPUT', 'ADMIN_REVIEW')),
  created_by text,
  reviewed_by text,
  approved_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists uq_emergency_edge_overrides_unique_rule
  on public.emergency_edge_overrides (override_set_id, edge_id, override_type);

create index if not exists idx_emergency_edge_overrides_override_set
  on public.emergency_edge_overrides (override_set_id);

create index if not exists idx_emergency_edge_overrides_version
  on public.emergency_edge_overrides (version_id);

create index if not exists idx_emergency_edge_overrides_edge
  on public.emergency_edge_overrides (edge_id);

create index if not exists idx_emergency_edge_overrides_type
  on public.emergency_edge_overrides (override_type);

create index if not exists idx_emergency_edge_overrides_enabled
  on public.emergency_edge_overrides (is_enabled);

create table if not exists public.emergency_node_overrides (
  node_override_id uuid primary key default gen_random_uuid(),
  override_set_id uuid not null references public.emergency_override_set(override_set_id) on delete cascade,
  version_id uuid not null references public.road_graph_version(version_id) on delete cascade,
  node_id uuid not null references public.road_graph_nodes(node_id) on delete cascade,
  override_type text not null
    check (override_type in (
      'EMERGENCY_UTURN_NODE',
      'FIRE_ACCESS_ENTRY_NODE',
      'SIGNAL_PRIORITY_NODE',
      'CUSTOM'
    )),
  is_enabled boolean not null default true,
  u_turn_permitted_emergency boolean,
  fire_access_entry boolean,
  signal_priority_intersection boolean,
  override_reason text not null,
  evidence_note text,
  source text not null default 'MANUAL_SURVEY'
    check (source in ('MANUAL_SURVEY', 'DESK_RESEARCH', 'FIELD_REPORT', 'FIRE_STATION_INPUT', 'ADMIN_REVIEW')),
  created_by text,
  reviewed_by text,
  approved_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists uq_emergency_node_overrides_unique_rule
  on public.emergency_node_overrides (override_set_id, node_id, override_type);

create index if not exists idx_emergency_node_overrides_override_set
  on public.emergency_node_overrides (override_set_id);

create index if not exists idx_emergency_node_overrides_version
  on public.emergency_node_overrides (version_id);

create index if not exists idx_emergency_node_overrides_node
  on public.emergency_node_overrides (node_id);

create index if not exists idx_emergency_node_overrides_type
  on public.emergency_node_overrides (override_type);

create index if not exists idx_emergency_node_overrides_enabled
  on public.emergency_node_overrides (is_enabled);

drop trigger if exists trg_emergency_override_set_set_updated_at on public.emergency_override_set;
create trigger trg_emergency_override_set_set_updated_at
before update on public.emergency_override_set
for each row execute function public.set_updated_at();

drop trigger if exists trg_emergency_edge_overrides_set_updated_at on public.emergency_edge_overrides;
create trigger trg_emergency_edge_overrides_set_updated_at
before update on public.emergency_edge_overrides
for each row execute function public.set_updated_at();

drop trigger if exists trg_emergency_node_overrides_set_updated_at on public.emergency_node_overrides;
create trigger trg_emergency_node_overrides_set_updated_at
before update on public.emergency_node_overrides
for each row execute function public.set_updated_at();

alter table public.emergency_override_set enable row level security;
alter table public.emergency_edge_overrides enable row level security;
alter table public.emergency_node_overrides enable row level security;

-- Override tables are internal operational data.
-- Public read access is intentionally blocked.

drop policy if exists "emergency_override_set_no_public_select" on public.emergency_override_set;
create policy "emergency_override_set_no_public_select"
on public.emergency_override_set
for select
to anon, authenticated
using (false);

drop policy if exists "emergency_edge_overrides_no_public_select" on public.emergency_edge_overrides;
create policy "emergency_edge_overrides_no_public_select"
on public.emergency_edge_overrides
for select
to anon, authenticated
using (false);

drop policy if exists "emergency_node_overrides_no_public_select" on public.emergency_node_overrides;
create policy "emergency_node_overrides_no_public_select"
on public.emergency_node_overrides
for select
to anon, authenticated
using (false);

comment on table public.emergency_override_set is
  'Manual emergency-routing override set registry. Only APPROVED and active sets should be merged into routing data.';

comment on table public.emergency_edge_overrides is
  'Manual edge-level overrides for fire access roads, emergency bus-lane usage, emergency-preferred edges, and vehicle-specific blocks.';

comment on table public.emergency_node_overrides is
  'Manual node-level overrides for emergency U-turn points, fire access entries, and signal-priority intersections.';
