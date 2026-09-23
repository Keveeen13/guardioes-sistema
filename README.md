# Guardiões do Cruzeiro do Sul — Sistema de Gestão do Capítulo

Sistema web (estilo Trello + Bitrix24 + ClickUp) personalizado para o capítulo
**Guardiões do Cruzeiro do Sul** (Ordem DeMolay): projetos, tesouraria,
atividades, tarefas e documentos, com acesso via navegador (desktop e celular).

**Fase entregue nesta etapa:** autenticação (login/cadastro) + estrutura do
dashboard com navegação entre módulos, conforme os wireframes enviados.
Os demais módulos (Tesouraria, Documentos, Calendário, Registro e Tarefas,
Quadro de Tarefas) estão com a tela e a tabela do banco já criadas como
"em construção", prontas para receber a lógica de cada uma nas próximas fases.

## Arquitetura

```
React (Vite)  ──HTTP──▶  Node.js / Express  ──▶  Supabase (Auth + Postgres)
frontend/                backend/                 supabase/schema.sql
```

- O **frontend** nunca fala diretamente com o Supabase: ele chama a API em
  Express, que usa a chave `service_role` do Supabase (nunca exposta ao navegador).
- O **login/cadastro** usa o Supabase Auth por baixo dos panos (e-mail + senha).
- Cada usuário tem uma linha em `public.profiles` (nome, cargo no capítulo,
  telefone etc.), criada automaticamente por um trigger quando a conta é criada.

## 1. Criar o projeto no Supabase

1. Crie uma conta e um novo projeto em https://supabase.com.
2. No painel do projeto, vá em **SQL Editor** → cole o conteúdo de
   `supabase/schema.sql` → **Run**. Isso cria a tabela `profiles`, os cargos
   do DeMolay, o trigger de criação automática de perfil e as tabelas-base
   dos próximos módulos (tesouraria, documentos, calendário).
3. Ainda no **SQL Editor**, rode também `supabase/002_quadro_de_tarefas.sql`
   → **Run**. Isso cria as tabelas do Quadro de Tarefas (quadros, colunas,
   tarefas). Se seu projeto já existia antes deste módulo, esse script
   substitui a tabela `tarefas` vazia da Fase 1 pela versão completa —
   não tem problema rodar mesmo em um projeto já em uso.
4. Em **Settings → API**, copie:
   - `Project URL`
   - `anon public` key
   - `service_role` key (mantenha em segredo — só vai para o backend)

> Dica: se quiser ajustar os cargos do capítulo (ex.: nomes de oficiais
> específicos do Guardiões do Cruzeiro do Sul), edite o `enum cargo_demolay`
> no início do `schema.sql` antes de rodar.

## 2. Configurar e rodar o backend (API)

```bash
cd backend
cp .env.example .env
# edite o .env com SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

A API sobe em `http://localhost:4000`. Teste com `GET /api/health`.

## 3. Configurar e rodar o frontend

```bash
cd frontend
cp .env.example .env
# por padrão já aponta para http://localhost:4000/api
npm install
npm run dev
```

O app abre em `http://localhost:5173`. No celular na mesma rede, acesse pelo
IP da máquina (ex.: `http://192.168.x.x:5173`) — o layout já é responsivo.

## 4. Primeiro acesso

1. Abra o app → aba **Cadastrar** → crie sua conta com nome, e-mail e senha.
2. Faça login. Você entra como cargo `membro` por padrão.
3. Para virar `admin` (ou outro cargo), no Supabase vá em
   **Table Editor → profiles** e edite o campo `cargo` manualmente
   (a tela de gestão de cargos pelo próprio sistema é uma próxima fase,
   dentro do módulo **Configurações**).

## Estrutura de pastas

```
frontend/
  src/
    pages/          Telas (Login/Cadastro, Dashboard e cada módulo)
    components/      TopNav, menu de perfil, placeholders reutilizáveis
    context/         AuthContext (sessão do usuário)
    lib/             cliente axios (api.js) e lista de módulos (modules.js)
    styles/          tema visual global (cores, tipografia, botões)
backend/
  src/
    routes/          /api/auth (login, cadastro, sessão) e /api/profile
    middleware/       validação do token do Supabase
    supabaseClient.js clientes admin e anon do Supabase
supabase/
  schema.sql          tabelas, cargos, trigger de perfil e RLS
```

## Módulos já entregues

- **Autenticação** — login/cadastro com Supabase Auth.
- **Quadro de Tarefas (Kanban)** — múltiplos quadros (projetos), colunas
  editáveis, cartões com responsável/prioridade/prazo e arrastar-e-soltar
  entre colunas. Rotas em `backend/src/routes/boards.routes.js`.

## Próximas fases sugeridas

1. **Tesouraria** — lançamentos, mensalidades por membro, saldo e relatórios.
2. **Calendário** — eventos do capítulo com confirmação de presença.
3. **Documentos** — upload de atas/arquivos via Supabase Storage.
4. **Configurações** — gestão de cargos/permissões pela própria interface
   (hoje feita manualmente no Supabase).

Cada módulo já tem sua tabela inicial em `schema.sql` e sua tela em
`frontend/src/pages/`, prontos para ganhar a lógica real quando priorizarmos.
