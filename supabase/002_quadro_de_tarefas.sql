-- ============================================================
-- Guardiões do Cruzeiro do Sul — Fase 2: Quadro de Tarefas (Kanban)
-- Rode este script no SQL Editor do Supabase DEPOIS do schema.sql
-- (se seu projeto já tinha a tabela "tarefas" vazia da Fase 1,
-- este script substitui ela pela versão completa).
-- ============================================================

drop table if exists public.tarefas cascade;
drop table if exists public.colunas cascade;
drop table if exists public.quadros cascade;

-- ------------------------------------------------------------
-- Quadros: cada quadro é um "projeto" (ex: Reunião Solene,
-- Bazar Beneficente, Gestão 2026...)
-- ------------------------------------------------------------
create table public.quadros (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  descricao text,
  criado_por uuid references public.profiles (id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

drop trigger if exists trg_quadros_atualizado_em on public.quadros;
create trigger trg_quadros_atualizado_em
before update on public.quadros
for each row execute function public.set_atualizado_em();

-- ------------------------------------------------------------
-- Colunas: as etapas de cada quadro (A Fazer, Em Andamento...)
-- ------------------------------------------------------------
create table public.colunas (
  id uuid primary key default uuid_generate_v4(),
  quadro_id uuid not null references public.quadros (id) on delete cascade,
  titulo text not null,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

create index if not exists idx_colunas_quadro on public.colunas (quadro_id);

-- ------------------------------------------------------------
-- Tarefas: os cartões do Kanban
-- ------------------------------------------------------------
create table public.tarefas (
  id uuid primary key default uuid_generate_v4(),
  quadro_id uuid not null references public.quadros (id) on delete cascade,
  coluna_id uuid not null references public.colunas (id) on delete cascade,
  titulo text not null,
  descricao text,
  responsavel_id uuid references public.profiles (id) on delete set null,
  prioridade text not null default 'media' check (prioridade in ('baixa', 'media', 'alta')),
  prazo date,
  ordem int not null default 0,
  criado_por uuid references public.profiles (id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_tarefas_coluna on public.tarefas (coluna_id);
create index if not exists idx_tarefas_quadro on public.tarefas (quadro_id);

drop trigger if exists trg_tarefas_atualizado_em on public.tarefas;
create trigger trg_tarefas_atualizado_em
before update on public.tarefas
for each row execute function public.set_atualizado_em();

-- ------------------------------------------------------------
-- Row Level Security
-- Por enquanto, qualquer membro autenticado do capítulo pode ver e
-- mexer em qualquer quadro/tarefa (grupo pequeno e de confiança).
-- Regras mais finas (ex: só o responsável ou um admin pode excluir)
-- serão adicionadas quando o módulo de Configurações/permissões for
-- construído. A API (backend) já aplica a regra de que só quem criou
-- o quadro ou um admin pode excluí-lo.
-- ------------------------------------------------------------
alter table public.quadros enable row level security;
alter table public.colunas enable row level security;
alter table public.tarefas enable row level security;

create policy "Membros autenticados veem quadros" on public.quadros
  for select to authenticated using (true);
create policy "Membros autenticados criam quadros" on public.quadros
  for insert to authenticated with check (true);
create policy "Membros autenticados editam quadros" on public.quadros
  for update to authenticated using (true);
create policy "Membros autenticados excluem quadros" on public.quadros
  for delete to authenticated using (true);

create policy "Membros autenticados veem colunas" on public.colunas
  for select to authenticated using (true);
create policy "Membros autenticados gerenciam colunas" on public.colunas
  for all to authenticated using (true) with check (true);

create policy "Membros autenticados veem tarefas" on public.tarefas
  for select to authenticated using (true);
create policy "Membros autenticados gerenciam tarefas" on public.tarefas
  for all to authenticated using (true) with check (true);
