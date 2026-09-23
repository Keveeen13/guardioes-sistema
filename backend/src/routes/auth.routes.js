import { Router } from 'express';
import { supabaseAdmin, supabaseAnon } from '../supabaseClient.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 * body: { nomeCompleto, email, senha }
 * Cria o usuário no Supabase Auth (confirmação de e-mail já habilitada)
 * e o trigger do banco cria automaticamente a linha em "profiles".
 */
router.post('/register', async (req, res) => {
  const { nomeCompleto, email, senha } = req.body;

  if (!nomeCompleto || !email || !senha) {
    return res.status(400).json({ error: 'Preencha nome completo, e-mail e senha.' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true, // marque como false se quiser exigir confirmação por e-mail
    user_metadata: { nome_completo: nomeCompleto },
  });

  if (error) {
    const status = error.status && error.status >= 400 ? error.status : 400;
    return res.status(status).json({ error: traduzErroSupabase(error.message) });
  }

  return res.status(201).json({
    message: 'Cadastro realizado com sucesso. Você já pode entrar.',
    userId: data.user.id,
  });
});

/**
 * POST /api/auth/login
 * body: { email, senha }
 * Retorna a sessão (access_token / refresh_token) e o perfil do usuário.
 */
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    return res.status(401).json({ error: traduzErroSupabase(error.message) });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    return res.status(500).json({ error: 'Login ok, mas não foi possível carregar o perfil.' });
  }

  return res.json({
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    },
    profile,
  });
});

/**
 * POST /api/auth/logout
 * body: { refreshToken }
 */
router.post('/logout', requireAuth, async (req, res) => {
  await supabaseAnon.auth.signOut();
  return res.json({ message: 'Sessão encerrada.' });
});

/**
 * GET /api/auth/me
 * Retorna o perfil do usuário autenticado (via header Authorization).
 */
router.get('/me', requireAuth, async (req, res) => {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) {
    return res.status(500).json({ error: 'Não foi possível carregar o perfil.' });
  }

  return res.json({ profile });
});

function traduzErroSupabase(mensagem = '') {
  const mapa = {
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'User already registered': 'Já existe uma conta cadastrada com este e-mail.',
    'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
  };
  return mapa[mensagem] || mensagem || 'Ocorreu um erro inesperado.';
}

export default router;
