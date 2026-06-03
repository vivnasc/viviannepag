-- Carrosseis semanais — tabela nova, ADITIVA, no projecto Supabase ACTUAL.
-- Correr no SQL editor do Supabase. Nao altera nada do que ja existe.
-- O render usa o bucket existente `viviannepag-assets` (pasta carrossel/).

create table if not exists public.carousel_collections (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,           -- ex.: semana-1-freeme-mae
  title       text not null,
  brief       text default '',
  dias        jsonb not null default '[]'::jsonb,  -- ConteudoDia[] (formato do Estudio)
  theme       jsonb not null default '{}'::jsonb,  -- { mundo, universo, semana }
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists carousel_collections_slug_idx    on public.carousel_collections (slug);
create index if not exists carousel_collections_created_idx  on public.carousel_collections (created_at desc);

-- updated_at automatico
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists carousel_collections_set_updated_at on public.carousel_collections;
create trigger carousel_collections_set_updated_at
  before update on public.carousel_collections
  for each row execute function public.set_updated_at();

-- RLS: leitura publica, escrita so pelo service role (o admin escreve via API).
alter table public.carousel_collections enable row level security;

drop policy if exists carousel_select_public on public.carousel_collections;
create policy carousel_select_public
  on public.carousel_collections for select
  using (true);

-- (insert/update/delete ficam restritos: a API usa a service role key, que
--  contorna a RLS. Sem politicas de escrita, clientes anon nao escrevem.)
