import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[supabaseClient] Faltam variáveis de ambiente do Supabase. Copie backend/.env.example para backend/.env e preencha os valores.'
  );
}

// Cliente com privilégios de administrador — só é usado no servidor,
// nunca deve ser exposto ao frontend.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Cliente "anon" — usado para operações que devem respeitar o usuário
// autenticado (ex: login), sem privilégios de admin.
export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
