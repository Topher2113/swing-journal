-- ============================================================
-- Swing Journal – complete schema
-- Paste this into the Supabase SQL editor (or run via CLI) to
-- recreate every table, index, and RLS policy from scratch.
-- ============================================================


-- ── 1. user_profiles ────────────────────────────────────────
-- One row per auth user, created after sign-up.

create table if not exists user_profiles (
  id               uuid        primary key references auth.users(id) on delete cascade,
  name             text        not null,
  dance_preference text        not null check (dance_preference in ('swing', 'line_dancing', 'both')),
  level            text        not null check (level in ('beginner', 'intermediate', 'advanced')),
  created_at       timestamptz not null default now()
);

alter table user_profiles enable row level security;

create policy "Users manage their own profile"
  on user_profiles for all
  using     (id = auth.uid())
  with check (id = auth.uid());


-- ── 2. moves ────────────────────────────────────────────────
-- Private dance moves belonging to one user.
-- motion_data stores an array of gyroscope frames: [{t, alpha, beta, gamma}]

create table if not exists moves (
  id             uuid        primary key,
  user_id        uuid        not null references auth.users(id) on delete cascade,
  name           text        not null,
  category       text        not null check (category in ('Footwork', 'Spins & Turns', 'Dips & Drops', 'Lifts & Tricks')),
  difficulty     text        not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  notes          text        not null default '',
  video_uri      text,
  practice_count integer     not null default 0,
  motion_data    jsonb,
  created_at     timestamptz not null,
  updated_at     timestamptz not null
);

create index if not exists moves_user_id_idx on moves (user_id);

alter table moves enable row level security;

create policy "Users manage their own moves"
  on moves for all
  using     (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ── 3. songs ────────────────────────────────────────────────

create table if not exists songs (
  id               uuid        primary key,
  user_id          uuid        not null references auth.users(id) on delete cascade,
  title            text        not null,
  artist           text        not null,
  album_art_url    text,
  spotify_url      text,
  spotify_track_id text,
  notes            text        not null default '',
  created_at       timestamptz not null,
  updated_at       timestamptz not null
);

create index if not exists songs_user_id_idx on songs (user_id);

alter table songs enable row level security;

create policy "Users manage their own songs"
  on songs for all
  using     (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ── 4. line_dances ──────────────────────────────────────────
-- steps stores an ordered array of steps: [{order, name, description}]

create table if not exists line_dances (
  id             uuid        primary key,
  user_id        uuid        not null references auth.users(id) on delete cascade,
  name           text        not null,
  steps          jsonb       not null default '[]',
  difficulty     text        not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  video_uri      text,
  linked_song_id uuid        references songs(id) on delete set null,
  notes          text        not null default '',
  practice_count integer     not null default 0,
  created_at     timestamptz not null,
  updated_at     timestamptz not null
);

create index if not exists line_dances_user_id_idx    on line_dances (user_id);
create index if not exists line_dances_song_id_idx    on line_dances (linked_song_id);

alter table line_dances enable row level security;

create policy "Users manage their own line dances"
  on line_dances for all
  using     (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ── 5. partner_links ────────────────────────────────────────
-- Connects two users via an invite code.
-- user_id_a creates the link; user_id_b claims it by redeeming the invite_code.

create table if not exists partner_links (
  id           uuid        primary key default gen_random_uuid(),
  user_id_a    uuid        not null references auth.users(id),
  user_id_b    uuid        references auth.users(id),
  user_email_a text        not null,
  user_email_b text,
  user_name_a  text,
  user_name_b  text,
  invite_code  text        not null unique,
  status       text        not null check (status in ('pending', 'linked')) default 'pending',
  created_at   timestamptz not null default now()
);

create index if not exists partner_links_invite_code_idx on partner_links (invite_code);

alter table partner_links enable row level security;

-- Either partner can see their link
create policy "Partners can view their link"
  on partner_links for select
  using (user_id_a = auth.uid() or user_id_b = auth.uid());

-- Only the inviter creates the row
create policy "Inviter creates the link"
  on partner_links for insert
  with check (user_id_a = auth.uid());

-- Creator can update their own link; a second user can claim a pending link
create policy "Partners can update their link"
  on partner_links for update
  using (
    user_id_a = auth.uid()
    or (status = 'pending' and user_id_b is null and user_id_a <> auth.uid())
  )
  with check (
    user_id_a = auth.uid()
    or user_id_b = auth.uid()
  );

-- Only the creator can cancel/delete
create policy "Inviter can delete the link"
  on partner_links for delete
  using (user_id_a = auth.uid());


-- ── 6. partner_moves ────────────────────────────────────────
-- Moves shared within a partner link. Both partners can read all rows;
-- only the user who added a move can modify or delete it.
-- original_move_id optionally references the move in the adder's private library.

create table if not exists partner_moves (
  id               uuid        primary key,
  partner_link_id  uuid        not null references partner_links(id) on delete cascade,
  added_by_user_id uuid        not null references auth.users(id),
  name             text        not null,
  category         text        not null check (category in ('Footwork', 'Spins & Turns', 'Dips & Drops', 'Lifts & Tricks')),
  difficulty       text        not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  notes            text        not null default '',
  video_uri        text,
  practice_count   integer     not null default 0,
  motion_data      jsonb,
  created_at       timestamptz not null,
  updated_at       timestamptz not null,
  original_move_id uuid
);

create index if not exists partner_moves_link_id_idx on partner_moves (partner_link_id);

alter table partner_moves enable row level security;

create policy "Partners can view shared moves"
  on partner_moves for select
  using (
    exists (
      select 1 from partner_links pl
      where pl.id = partner_moves.partner_link_id
        and (pl.user_id_a = auth.uid() or pl.user_id_b = auth.uid())
    )
  );

create policy "Users can add shared moves"
  on partner_moves for insert
  with check (added_by_user_id = auth.uid());

create policy "Move adder can update their shared moves"
  on partner_moves for update
  using     (added_by_user_id = auth.uid())
  with check (added_by_user_id = auth.uid());

create policy "Move adder can delete their shared moves"
  on partner_moves for delete
  using (added_by_user_id = auth.uid());


-- ============================================================
-- Storage bucket: move-videos
-- ============================================================
-- The bucket cannot be created with SQL — do it once in the
-- Supabase dashboard: Storage → New bucket → Name: "move-videos"
-- Toggle "Public bucket" ON (videos are served by public URL;
-- uploads and deletes are still restricted by the policies below).
--
-- Then run these storage policies:

create policy "Users can upload their own videos"
  on storage.objects for insert
  with check (
    bucket_id = 'move-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own videos"
  on storage.objects for delete
  using (
    bucket_id = 'move-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
