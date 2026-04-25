-- Rescue Nav road graph schema for Iksan pilot region
-- Target: Supabase Postgres
-- Scope:
--   - road_graph_version
--   - road_graph_nodes
--   - road_graph_edges
--   - road_graph_edge_tags
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

create table if not exists public.road_graph_version (
  version_id uuid primary key default gen_random_uuid(),
  version_name text not null unique,
  region_name text not null,
  region_code text,
  source text not null default 'OSM',
  source_snapshot_date date,
  source_uri text,
  import_status text not null default 'PENDING'
    check (import_status in ('PENDING', 'PROCESSING', 'READY', 'FAILED', 'ARCHIVED')),
  is_active boolean not null default false,
  node_count integer not null default 0 check (node_count >= 0),
  edge_count integer not null default 0 check (edge_count >= 0),
  tag_count integer not null default 0 check (tag_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists uq_road_graph_version_active
  on public.road_graph_version (is_active)
  where is_active = true;

create index if not exists idx_road_graph_version_region_status
  on public.road_graph_version (region_name, import_status);

create table if not exists public.road_graph_nodes (
  node_id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.road_graph_version(version_id) on delete cascade,
  osm_node_id bigint,
  node_type text not null default 'INTERSECTION'
    check (node_type in ('INTERSECTION', 'CURVE_POINT', 'UTURN_CANDIDATE', 'ENTRY_POINT', 'EXIT_POINT', 'FIRE_ACCESS_ENTRY')),
  lat double precision not null check (lat >= -90 and lat <= 90),
  lng double precision not null check (lng >= -180 and lng <= 180),
  elevation_meters double precision,
  signalized boolean not null default false,
  u_turn_permitted_emergency boolean not null default false,
  fire_access_entry boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_road_graph_nodes_version
  on public.road_graph_nodes (version_id);

create index if not exists idx_road_graph_nodes_version_type
  on public.road_graph_nodes (version_id, node_type);

create index if not exists idx_road_graph_nodes_version_lat_lng
  on public.road_graph_nodes (version_id, lat, lng);

create index if not exists idx_road_graph_nodes_osm_node_id
  on public.road_graph_nodes (osm_node_id);

create table if not exists public.road_graph_edges (
  edge_id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.road_graph_version(version_id) on delete cascade,
  from_node_id uuid not null references public.road_graph_nodes(node_id) on delete cascade,
  to_node_id uuid not null references public.road_graph_nodes(node_id) on delete cascade,
  osm_way_id bigint,
  edge_name text,
  road_type text not null,
  road_class text,
  length_meters double precision not null check (length_meters > 0),
  base_speed_kph double precision not null check (base_speed_kph > 0),
  emergency_speed_kph double precision not null check (emergency_speed_kph > 0),
  lane_count smallint check (lane_count is null or lane_count > 0),
  one_way boolean not null default false,
  turn_type text not null default 'STRAIGHT'
    check (turn_type in ('STRAIGHT', 'LEFT', 'RIGHT', 'SLIGHT_LEFT', 'SLIGHT_RIGHT', 'UTURN', 'MERGE', 'ROUNDABOUT')),
  turn_penalty_seconds double precision not null default 0 check (turn_penalty_seconds >= 0),
  signal_penalty_seconds double precision not null default 0 check (signal_penalty_seconds >= 0),
  bus_lane boolean not null default false,
  bus_lane_allowed_emergency boolean not null default false,
  fire_access_road boolean not null default false,
  u_turn_edge boolean not null default false,
  u_turn_allowed_emergency boolean not null default false,
  blocked_for_fire_truck boolean not null default false,
  blocked_for_ambulance boolean not null default false,
  is_emergency_preferred boolean not null default false,
  access_restricted boolean not null default false,
  geometry jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint chk_road_graph_edges_distinct_nodes check (from_node_id <> to_node_id)
);

create index if not exists idx_road_graph_edges_version
  on public.road_graph_edges (version_id);

create index if not exists idx_road_graph_edges_from_node
  on public.road_graph_edges (from_node_id);

create index if not exists idx_road_graph_edges_to_node
  on public.road_graph_edges (to_node_id);

create index if not exists idx_road_graph_edges_version_from_to
  on public.road_graph_edges (version_id, from_node_id, to_node_id);

create index if not exists idx_road_graph_edges_version_road_type
  on public.road_graph_edges (version_id, road_type);

create index if not exists idx_road_graph_edges_version_emergency
  on public.road_graph_edges (
    version_id,
    bus_lane_allowed_emergency,
    fire_access_road,
    u_turn_allowed_emergency,
    blocked_for_fire_truck,
    blocked_for_ambulance
  );

create index if not exists idx_road_graph_edges_osm_way_id
  on public.road_graph_edges (osm_way_id);

create table if not exists public.road_graph_edge_tags (
  edge_tag_id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.road_graph_version(version_id) on delete cascade,
  edge_id uuid not null references public.road_graph_edges(edge_id) on delete cascade,
  tag_key text not null,
  tag_value text not null,
  source text not null default 'OSM'
    check (source in ('OSM', 'MANUAL', 'DERIVED')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint uq_road_graph_edge_tags unique (edge_id, tag_key, tag_value)
);

create index if not exists idx_road_graph_edge_tags_version
  on public.road_graph_edge_tags (version_id);

create index if not exists idx_road_graph_edge_tags_edge
  on public.road_graph_edge_tags (edge_id);

create index if not exists idx_road_graph_edge_tags_key
  on public.road_graph_edge_tags (tag_key);

create index if not exists idx_road_graph_edge_tags_key_value
  on public.road_graph_edge_tags (tag_key, tag_value);

drop trigger if exists trg_road_graph_version_set_updated_at on public.road_graph_version;
create trigger trg_road_graph_version_set_updated_at
before update on public.road_graph_version
for each row execute function public.set_updated_at();

drop trigger if exists trg_road_graph_nodes_set_updated_at on public.road_graph_nodes;
create trigger trg_road_graph_nodes_set_updated_at
before update on public.road_graph_nodes
for each row execute function public.set_updated_at();

drop trigger if exists trg_road_graph_edges_set_updated_at on public.road_graph_edges;
create trigger trg_road_graph_edges_set_updated_at
before update on public.road_graph_edges
for each row execute function public.set_updated_at();

drop trigger if exists trg_road_graph_edge_tags_set_updated_at on public.road_graph_edge_tags;
create trigger trg_road_graph_edge_tags_set_updated_at
before update on public.road_graph_edge_tags
for each row execute function public.set_updated_at();

alter table public.road_graph_version enable row level security;
alter table public.road_graph_nodes enable row level security;
alter table public.road_graph_edges enable row level security;
alter table public.road_graph_edge_tags enable row level security;

drop policy if exists "road_graph_version_select_public" on public.road_graph_version;
create policy "road_graph_version_select_public"
on public.road_graph_version
for select
to anon, authenticated
using (true);

drop policy if exists "road_graph_nodes_select_public" on public.road_graph_nodes;
create policy "road_graph_nodes_select_public"
on public.road_graph_nodes
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.road_graph_version v
    where v.version_id = road_graph_nodes.version_id
      and v.import_status = 'READY'
  )
);

drop policy if exists "road_graph_edges_select_public" on public.road_graph_edges;
create policy "road_graph_edges_select_public"
on public.road_graph_edges
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.road_graph_version v
    where v.version_id = road_graph_edges.version_id
      and v.import_status = 'READY'
  )
);

drop policy if exists "road_graph_edge_tags_select_public" on public.road_graph_edge_tags;
create policy "road_graph_edge_tags_select_public"
on public.road_graph_edge_tags
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.road_graph_version v
    where v.version_id = road_graph_edge_tags.version_id
      and v.import_status = 'READY'
  )
);

comment on table public.road_graph_version is
  'Version registry for imported road graphs. One active version is expected for the Iksan region at a time.';

comment on table public.road_graph_nodes is
  'Graph nodes derived from OSM intersections, routing anchors, and emergency-specific entry points.';

comment on table public.road_graph_edges is
  'Directed road graph edges with standard and emergency routing attributes.';

comment on table public.road_graph_edge_tags is
  'Raw or derived tags attached to graph edges, preserved separately from normalized edge columns.';
