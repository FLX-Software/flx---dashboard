-- FLX Dashboard – Initiales Datenbankschema
-- In Supabase SQL Editor ausführen oder via CLI migrieren

-- Profile (erweitert auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'manager' check (role in ('admin', 'manager', 'employee')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Support-Tickets
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number serial,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  customer_email text,
  customer_name text,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Aufgaben / To-Do
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Kalender-Termine
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  all_day boolean not null default false,
  location text,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Automatisches Profil bei Registrierung
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at Trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger support_tickets_updated_at before update on public.support_tickets
  for each row execute function public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger calendar_events_updated_at before update on public.calendar_events
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.support_tickets enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;

-- Policies: Authentifizierte Nutzer (Geschäftsführung) haben vollen Zugriff
create policy "Authenticated users can read profiles"
  on public.profiles for select to authenticated using (true);

create policy "Users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

create policy "Authenticated users full access tickets"
  on public.support_tickets for all to authenticated using (true) with check (true);

create policy "Authenticated users full access tasks"
  on public.tasks for all to authenticated using (true) with check (true);

create policy "Authenticated users full access events"
  on public.calendar_events for all to authenticated using (true) with check (true);

-- Indizes
create index if not exists idx_tickets_status on public.support_tickets(status);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_events_user_time on public.calendar_events(user_id, start_time);
