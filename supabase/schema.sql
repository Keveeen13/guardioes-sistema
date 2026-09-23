-- ============================================================
-- Guardiões do Cruzeiro do Sul — Schema inicial (Fase 1: Auth + Dashboard)
-- Rode este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- Extensão usada para gerar UUIDs
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Cargos possíveis dentro do capítulo (ajuste conforme o
-- organograma real do Guardiões do Cruzeiro do Sul)
-- ------------------------------------------------------------
create type public.cargo_demolay as enum (
  'membro',
  'oficial',
  'mestre_conselheiro',
  '1_conselheiro',
  '2_conselheiro',
  'secretario',
  'tesoureiro',
  'conselheiro_capitular',
  'admin'
);

-- ------------------------------------------------------------
-- Perfis: estende o auth.users do Supabase com dados do capítulo
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome_completo text not null,
  email text not null,
  cargo public.cargo_demolay not null default 'membro',
  avatar_url text,
  telefone text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Mantém "atualizado_em" sempre em dia
create or replace function public.set_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_atualizado_em on public.profiles;
create trigger trg_profiles_atualizado_em
before update on public.profiles
for each row execute function public.set_atualizado_em();

-- Cria o perfil automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome_completo, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome_completo', new.email),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "Usuário vê seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Membros autenticados veem perfis do capítulo"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Usuário edita seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- ------------------------------------------------------------
-- Esqueleto das próximas fases (tabelas vazias, sem RLS ainda)
-- Serão detalhadas quando construirmos cada módulo.
-- ------------------------------------------------------------
create table if not exists public.tesouraria_lancamentos (
  id uuid primary key default uuid_generate_v4(),
  criado_em timestamptz not null default now()
);

create table if not exists public.documentos (
  id uuid primary key default uuid_generate_v4(),
  criado_em timestamptz not null default now()
);

create table if not exists public.eventos_calendario (
  id uuid primary key default uuid_generate_v4(),
  criado_em timestamptz not null default now()
);

-- Quadro de Tarefas (Kanban): rode 002_quadro_de_tarefas.sql logo em
-- seguida deste script para criar as tabelas quadros/colunas/tarefas.
