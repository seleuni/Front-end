-- 시나브로 (SINABRO) — Original Character Archive PostgreSQL / Supabase Schema
-- Run this SQL in your Supabase Project SQL Editor to provision tables & RLS policies.

create extension if not exists "pgcrypto";

-- 1. 세계관 & 폴더 (Universes)
create table if not exists public.universes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text not null default '',
  theme_color text not null default '#006194',
  icon_name text not null default 'Globe',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. 자캐 프로필 (Characters)
create table if not exists public.characters (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  universe_id text references public.universes(id) on delete set null,
  name text not null,
  english_name text not null default '',
  role_title text not null default '',
  quote text not null default '',
  age text not null default '',
  height text not null default '',
  affiliation text not null default '',
  species text not null default '인간',
  mbti text not null default '',
  birthday text not null default '',
  visibility text not null default 'public' check (visibility in ('public', 'mutual', 'private')),
  completion_percent integer not null default 70 check (completion_percent between 0 and 100),
  is_featured boolean not null default false,
  is_bookmarked boolean not null default false,
  cover_image_url text not null default '',
  avatar_image_url text not null default '',
  tags text[] not null default '{}',
  appearance_summary text not null default '',
  outfit_notes text not null default '',
  color_palette text[] not null default '{}',
  personality_summary text not null default '',
  personality_traits text[] not null default '{}',
  likes text[] not null default '{}',
  dislikes text[] not null default '{}',
  speech_tone text not null default '',
  stats jsonb not null default '{"combat": 70, "magic": 75, "agility": 80, "intellect": 75, "willpower": 85}'::jsonb,
  artifacts jsonb not null default '[]'::jsonb,
  timeline_notes jsonb not null default '[]'::jsonb,
  secret_lore text not null default '',
  episode_memo text not null default '',
  gaiden_appeared boolean not null default false,
  if_branch_open boolean not null default false,
  relations jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 3. 캐릭터 갤러리 이미지 (Character Images)
create table if not exists public.character_images (
  id text primary key,
  character_id text not null references public.characters(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  category text not null default '전신 일러스트',
  label text not null default '',
  image_url text not null,
  author text not null default '본인 (아카이브 오너)',
  version_note text not null default 'v1.0',
  visibility text not null default 'public',
  is_lossless boolean not null default true,
  has_watermark boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. 서사 체크포인트 (Checkpoints)
create table if not exists public.checkpoints (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  universe_id text references public.universes(id) on delete set null,
  character_id text references public.characters(id) on delete set null,
  title text not null,
  subtitle text not null default '',
  summary text not null default '',
  scene_location text not null default '',
  due_date text not null default '',
  dday_offset integer not null default 7,
  status text not null default 'in_progress' check (status in ('urgent', 'in_progress', 'planned', 'completed')),
  progress_percent integer not null default 40 check (progress_percent between 0 and 100),
  cover_image_url text not null default '',
  tags text[] not null default '{}',
  tasks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 5. 페어링 & 관계도 (Pairings)
create table if not exists public.pairings (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  universe_id text references public.universes(id) on delete set null,
  title text not null,
  subtitle text not null default '',
  category text not null default '로맨스 / CP' check (category in ('로맨스 / CP', '라이벌 / 대립', '파트너 / 동료', '가족 / 사제')),
  relationship_label text not null default '',
  resonance_percent integer not null default 85 check (resonance_percent between 0 and 100),
  char_a_id text not null references public.characters(id) on delete cascade,
  char_b_id text not null references public.characters(id) on delete cascade,
  joint_image_url text not null default '',
  a_calls_b text not null default '',
  a_tone_to_b text not null default '',
  b_calls_a text not null default '',
  b_tone_to_a text not null default '',
  a_feeling_summary text not null default '',
  a_quote_to_b text not null default '',
  b_feeling_summary text not null default '',
  b_quote_to_a text not null default '',
  narrative_summary text not null default '',
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 6. 페어링 서사 타임라인 (Pairing Timeline Events)
create table if not exists public.pairing_timeline_events (
  id text primary key,
  pairing_id text not null references public.pairings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  era_label text not null,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 7. 오늘의 영감 (Daily Inspirations)
create table if not exists public.inspirations (
  id text primary key,
  category text not null default '장면 프롬프트',
  prompt_text text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.universes enable row level security;
alter table public.characters enable row level security;
alter table public.character_images enable row level security;
alter table public.checkpoints enable row level security;
alter table public.pairings enable row level security;
alter table public.pairing_timeline_events enable row level security;
alter table public.inspirations enable row level security;

-- Public Read + Authenticated Owner Write Policies
create policy "Public read universes" on public.universes for select using (true);
create policy "Owner write universes" on public.universes for all using (auth.uid() = user_id or user_id is null);

create policy "Public read characters" on public.characters for select using (visibility = 'public' or auth.uid() = user_id);
create policy "Owner write characters" on public.characters for all using (auth.uid() = user_id);

create policy "Public read character_images" on public.character_images for select using (visibility = 'public' or auth.uid() = user_id);
create policy "Owner write character_images" on public.character_images for all using (auth.uid() = user_id);

create policy "Public read checkpoints" on public.checkpoints for select using (true);
create policy "Owner write checkpoints" on public.checkpoints for all using (auth.uid() = user_id);

create policy "Public read pairings" on public.pairings for select using (true);
create policy "Owner write pairings" on public.pairings for all using (auth.uid() = user_id);

create policy "Public read pairing_timeline_events" on public.pairing_timeline_events for select using (true);
create policy "Owner write pairing_timeline_events" on public.pairing_timeline_events for all using (auth.uid() = user_id);

create policy "Public read inspirations" on public.inspirations for select using (true);
