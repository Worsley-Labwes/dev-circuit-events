create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organizer text not null,
  category text not null check (category in ('Meetup', 'Hackathon', 'Workshop', 'Conference')),
  city text not null,
  venue text not null,
  event_date date not null,
  deadline date not null,
  description text not null,
  image_url text,
  attendees integer not null default 0,
  spots integer not null default 100,
  registration_url text,
  is_virtual boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Anyone can view published events"
  on public.events for select
  using (published = true);