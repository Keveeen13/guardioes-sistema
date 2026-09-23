import { supabaseAnon } from '../supabaseClient.js';

/**
 * Middleware que exige um usuário autenticado.
 * Espera o header: Authorization: Bearer <access_token>
 * Em caso de sucesso, popula req.user com os dados do usuário do Supabase Auth.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação ausente.' });
  }

  const { data, error } = await supabaseAnon.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }

  req.user = data.user;
  req.accessToken = token;
  next();
}
