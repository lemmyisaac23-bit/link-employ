-- Run in Supabase → SQL Editor after profiles schema
-- Shared jobs + applications + testimonials + tickets (cross-device)

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'worklinkus@gmail.com'
$$;

-- ========== JOB TYPES (open positions) ==========
create table if not exists public.job_types (
  id text primary key,
  title text not null,
  location text not null default 'United States · Remote & on-site',
  employer text not null default 'WorklinksUs Partner',
  pay_per_hour text not null default '$35',
  deadline date not null,
  description text not null default '',
  status text not null check (status in ('open', 'ended')) default 'open',
  updated_at date not null default (current_date)
);

alter table public.job_types enable row level security;

drop policy if exists "Anyone can read jobs" on public.job_types;
create policy "Anyone can read jobs"
  on public.job_types for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin can insert jobs" on public.job_types;
create policy "Admin can insert jobs"
  on public.job_types for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin can update jobs" on public.job_types;
create policy "Admin can update jobs"
  on public.job_types for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin can delete jobs" on public.job_types;
create policy "Admin can delete jobs"
  on public.job_types for delete
  to authenticated
  using (public.is_admin());

-- Seed starter roles (skipped if already present)
insert into public.job_types
  (id, title, location, employer, pay_per_hour, deadline, description, status, updated_at)
values
  ('job-1', 'Product Designer', 'United States · Remote & on-site', 'WorklinksUs Partners', '$42', '2026-09-15',
   'Design clear product experiences for US job seekers and hiring teams.', 'open', '2026-08-10'),
  ('job-2', 'Software Engineer', 'United States · Remote & on-site', 'WorklinksUs Tech', '$55', '2026-09-30',
   'Build and improve WorklinksUs matching tools.', 'open', '2026-08-10'),
  ('job-3', 'Operations Manager', 'United States · Remote & on-site', 'WorklinksUs Operations', '$38', '2026-08-20',
   'Lead day-to-day operations with a US hiring partner.', 'open', '2026-08-10'),
  ('job-4', 'Data Analyst', 'United States · Remote & on-site', 'WorklinksUs Insights', '$40', '2026-10-01',
   'Turn hiring and candidate data into clear decisions.', 'open', '2026-08-10'),
  ('job-5', 'Customer Success', 'United States · Remote & on-site', 'WorklinksUs Support', '$32', '2026-09-05',
   'Help candidates and employers succeed on the platform.', 'open', '2026-08-10'),
  ('job-6', 'Marketing Lead', 'United States · Remote & on-site', 'WorklinksUs Growth', '$45', '2026-08-01',
   'Grow WorklinksUs awareness across the United States.', 'ended', '2026-08-10')
on conflict (id) do nothing;

-- ========== APPLICATIONS ==========
create table if not exists public.applications (
  id text primary key,
  name text not null,
  email text not null,
  role text not null,
  location text not null,
  status text not null check (status in ('pending', 'accepted', 'denied')) default 'pending',
  applied_at date not null default (current_date),
  user_id uuid references auth.users (id) on delete set null
);

create index if not exists applications_email_idx on public.applications (email);

alter table public.applications enable row level security;

drop policy if exists "Users read own applications" on public.applications;
create policy "Users read own applications"
  on public.applications for select
  to authenticated
  using (
    public.is_admin()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "Users insert own applications" on public.applications;
create policy "Users insert own applications"
  on public.applications for insert
  to authenticated
  with check (
    public.is_admin()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "Admin update applications" on public.applications;
create policy "Admin update applications"
  on public.applications for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ========== TESTIMONIALS ==========
create table if not exists public.testimonials (
  id text primary key,
  name text not null,
  role text not null default 'WorklinksUs member',
  quote text not null,
  status text not null check (status in ('pending', 'accepted', 'denied')) default 'pending',
  submitted_at date not null default (current_date)
);

alter table public.testimonials enable row level security;

drop policy if exists "Read accepted testimonials" on public.testimonials;
create policy "Read accepted testimonials"
  on public.testimonials for select
  to anon, authenticated
  using (status = 'accepted' or public.is_admin());

drop policy if exists "Users insert testimonials" on public.testimonials;
create policy "Users insert testimonials"
  on public.testimonials for insert
  to authenticated
  with check (true);

drop policy if exists "Admin update testimonials" on public.testimonials;
create policy "Admin update testimonials"
  on public.testimonials for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ========== SUPPORT TICKETS ==========
create table if not exists public.support_tickets (
  id text primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null check (status in ('open', 'resolved', 'closed')) default 'open',
  created_at date not null default (current_date)
);

create index if not exists support_tickets_email_idx on public.support_tickets (email);

alter table public.support_tickets enable row level security;

drop policy if exists "Users read own tickets" on public.support_tickets;
create policy "Users read own tickets"
  on public.support_tickets for select
  to authenticated
  using (
    public.is_admin()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "Users insert own tickets" on public.support_tickets;
create policy "Users insert own tickets"
  on public.support_tickets for insert
  to authenticated
  with check (
    public.is_admin()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "Admin update tickets" on public.support_tickets;
create policy "Admin update tickets"
  on public.support_tickets for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
