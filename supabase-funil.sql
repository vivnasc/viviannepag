-- Funil do Amparo: colunas para a sequência de cartas.
-- Corre isto UMA vez no Supabase (SQL Editor) antes de ligar a sequência.
-- É seguro: só ACRESCENTA colunas com valores por omissão; não mexe em dados.

alter table subscribers add column if not exists funil_step    int     not null default 0;
alter table subscribers add column if not exists funil_last_at  timestamptz;
alter table subscribers add column if not exists funil_unsub    boolean not null default false;
alter table subscribers add column if not exists locale         text;

-- Importante: as leitoras que JÁ estão na lista ficam com funil_step=0. Para
-- elas NUNCA entrarem na sequência, o cron só apanha quem se inscreveu a partir
-- da variável de ambiente FUNIL_DESDE (põe-na na data em que ligas o funil).
-- Em alternativa, marca já as antigas como terminadas:
--   update subscribers set funil_step = 99 where created_at < now();
