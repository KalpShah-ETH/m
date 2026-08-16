create table public.otps (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    otp_hash text not null,
    attempts int default 0,
    expires_at timestamptz not null,
    verified boolean default false,
    created_at timestamptz default now()
);

create index idx_otps_email on public.otps(email);

alter table public.otps enable row level security;
-- No client access at all — only edge functions (using service role) touch this table
