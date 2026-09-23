import { Router } from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/profile — dados do usuário logado
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(500).json({ error: 'Erro ao buscar perfil.' });
  return res.json({ profile: data });
});

// PATCH /api/profile — atualizar nome, telefone, avatar etc.
router.patch('/', requireAuth, async (req, res) => {
  const camposPermitidos = ['nome_completo', 'telefone', 'avatar_url'];
  const atualizacoes = Object.fromEntries(
    Object.entries(req.body).filter(([chave]) => camposPermitidos.includes(chave))
  );

  if (Object.keys(atualizacoes).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo válido para atualizar.' });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(atualizacoes)
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  return res.json({ profile: data });
});

export default router;
