create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  response text not null check (response in ('attending', 'declined')),
  full_name text not null,
  phone text,
  arrival text check (arrival in ('self_drive', 'driver', 'ride_hailing', 'drop_off')),
  needs_parking boolean not null default false,
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists guests_phone_key on guests (phone) where phone is not null;
