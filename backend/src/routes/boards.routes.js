import { Router } from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const COLUNAS_PADRAO = ['A Fazer', 'Em Andamento', 'Concluído'];
const CAMPOS_TAREFA = ['titulo', 'descricao', 'responsavel_id', 'prioridade', 'prazo'];
const SELECT_TAREFA = '*, responsavel:responsavel_id (id, nome_completo, cargo)';

// ---------------------------------------------------------------
// QUADROS
// ---------------------------------------------------------------

// GET /api/boards — lista os quadros existentes, com total de tarefas
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('quadros')
    .select('id, titulo, descricao, criado_em, criado_por, tarefas(count)')
    .order('criado_em', { ascending: true });

  if (error) return res.status(500).json({ error: 'Erro ao buscar quadros.' });

  const quadros = (data || []).map((q) => ({
    id: q.id,
    titulo: q.titulo,
    descricao: q.descricao,
    criado_em: q.criado_em,
    criado_por: q.criado_por,
    total_tarefas: q.tarefas?.[0]?.count ?? 0,
  }));

  return res.json({ quadros });
});

// POST /api/boards — cria um quadro novo, já com as 3 colunas padrão
router.post('/', requireAuth, async (req, res) => {
  const { titulo, descricao } = req.body;
  if (!titulo?.trim()) {
    return res.status(400).json({ error: 'Informe um título para o quadro.' });
  }

  const { data: quadro, error: erroQuadro } = await supabaseAdmin
    .from('quadros')
    .insert({ titulo: titulo.trim(), descricao: descricao?.trim() || null, criado_por: req.user.id })
    .select()
    .single();

  if (erroQuadro) return res.status(500).json({ error: 'Erro ao criar quadro.' });

  const colunasPadrao = COLUNAS_PADRAO.map((tituloColuna, ordem) => ({
    quadro_id: quadro.id,
    titulo: tituloColuna,
    ordem,
  }));

  const { error: erroColunas } = await supabaseAdmin.from('colunas').insert(colunasPadrao);
  if (erroColunas) {
    return res.status(500).json({ error: 'Quadro criado, mas houve erro ao criar as colunas padrão.' });
  }

  return res.status(201).json({ quadro });
});

// GET /api/boards/:id — quadro completo, com colunas e tarefas
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  const { data: quadro, error: erroQuadro } = await supabaseAdmin
    .from('quadros')
    .select('*')
    .eq('id', id)
    .single();
  if (erroQuadro || !quadro) return res.status(404).json({ error: 'Quadro não encontrado.' });

  const { data: colunas, error: erroColunas } = await supabaseAdmin
    .from('colunas')
    .select('*')
    .eq('quadro_id', id)
    .order('ordem', { ascending: true });
  if (erroColunas) return res.status(500).json({ error: 'Erro ao buscar colunas.' });

  const { data: tarefas, error: erroTarefas } = await supabaseAdmin
    .from('tarefas')
    .select(SELECT_TAREFA)
    .eq('quadro_id', id)
    .order('ordem', { ascending: true });
  if (erroTarefas) return res.status(500).json({ error: 'Erro ao buscar tarefas.' });

  const colunasComTarefas = colunas.map((coluna) => ({
    ...coluna,
    tarefas: tarefas.filter((t) => t.coluna_id === coluna.id),
  }));

  return res.json({ quadro, colunas: colunasComTarefas });
});

// PATCH /api/boards/:id — renomear/editar descrição do quadro
router.patch('/:id', requireAuth, async (req, res) => {
  const { titulo, descricao } = req.body;
  const atualizacoes = {};
  if (titulo !== undefined) atualizacoes.titulo = titulo.trim();
  if (descricao !== undefined) atualizacoes.descricao = descricao?.trim() || null;

  if (Object.keys(atualizacoes).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo válido para atualizar.' });
  }

  const { data, error } = await supabaseAdmin
    .from('quadros')
    .update(atualizacoes)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Erro ao atualizar quadro.' });
  return res.json({ quadro: data });
});

// DELETE /api/boards/:id — só quem criou o quadro ou um admin
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  const { data: quadro } = await supabaseAdmin.from('quadros').select('criado_por').eq('id', id).single();
  const { data: perfil } = await supabaseAdmin
    .from('profiles')
    .select('cargo')
    .eq('id', req.user.id)
    .single();

  const podeExcluir = quadro?.criado_por === req.user.id || perfil?.cargo === 'admin';
  if (!podeExcluir) {
    return res.status(403).json({ error: 'Só quem criou o quadro ou um admin pode excluí-lo.' });
  }

  const { error } = await supabaseAdmin.from('quadros').delete().eq('id', id);
  if (error) return res.status(500).json({ error: 'Erro ao excluir quadro.' });
  return res.status(204).send();
});

// ---------------------------------------------------------------
// COLUNAS
// ---------------------------------------------------------------

// POST /api/boards/:id/colunas — nova coluna no fim do quadro
router.post('/:id/colunas', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { titulo } = req.body;
  if (!titulo?.trim()) return res.status(400).json({ error: 'Informe um título para a coluna.' });

  const { count } = await supabaseAdmin
    .from('colunas')
    .select('id', { count: 'exact', head: true })
    .eq('quadro_id', id);

  const { data, error } = await supabaseAdmin
    .from('colunas')
    .insert({ quadro_id: id, titulo: titulo.trim(), ordem: count ?? 0 })
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Erro ao criar coluna.' });
  return res.status(201).json({ coluna: { ...data, tarefas: [] } });
});

// PATCH /api/boards/colunas/:colunaId — renomear coluna
router.patch('/colunas/:colunaId', requireAuth, async (req, res) => {
  const { titulo } = req.body;
  if (!titulo?.trim()) return res.status(400).json({ error: 'Informe um título para a coluna.' });

  const { data, error } = await supabaseAdmin
    .from('colunas')
    .update({ titulo: titulo.trim() })
    .eq('id', req.params.colunaId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Erro ao renomear coluna.' });
  return res.json({ coluna: data });
});

// DELETE /api/boards/colunas/:colunaId — remove a coluna e suas tarefas
router.delete('/colunas/:colunaId', requireAuth, async (req, res) => {
  const { error } = await supabaseAdmin.from('colunas').delete().eq('id', req.params.colunaId);
  if (error) return res.status(500).json({ error: 'Erro ao excluir coluna.' });
  return res.status(204).send();
});

// ---------------------------------------------------------------
// TAREFAS (cartões)
// ---------------------------------------------------------------

// POST /api/boards/tarefas — cria um cartão no fim da coluna
router.post('/tarefas', requireAuth, async (req, res) => {
  const { quadro_id, coluna_id, titulo, descricao, responsavel_id, prioridade, prazo } = req.body;

  if (!quadro_id || !coluna_id || !titulo?.trim()) {
    return res.status(400).json({ error: 'Preencha ao menos o título e a coluna da tarefa.' });
  }

  const { count } = await supabaseAdmin
    .from('tarefas')
    .select('id', { count: 'exact', head: true })
    .eq('coluna_id', coluna_id);

  const { data, error } = await supabaseAdmin
    .from('tarefas')
    .insert({
      quadro_id,
      coluna_id,
      titulo: titulo.trim(),
      descricao: descricao?.trim() || null,
      responsavel_id: responsavel_id || null,
      prioridade: prioridade || 'media',
      prazo: prazo || null,
      ordem: count ?? 0,
      criado_por: req.user.id,
    })
    .select(SELECT_TAREFA)
    .single();

  if (error) return res.status(500).json({ error: 'Erro ao criar tarefa.' });
  return res.status(201).json({ tarefa: data });
});

// PATCH /api/boards/tarefas/:tarefaId — edita campos do cartão
router.patch('/tarefas/:tarefaId', requireAuth, async (req, res) => {
  const atualizacoes = Object.fromEntries(
    Object.entries(req.body).filter(([chave]) => CAMPOS_TAREFA.includes(chave))
  );

  if (Object.keys(atualizacoes).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo válido para atualizar.' });
  }
  if (atualizacoes.titulo !== undefined && !atualizacoes.titulo.trim()) {
    return res.status(400).json({ error: 'O título não pode ficar vazio.' });
  }

  const { data, error } = await supabaseAdmin
    .from('tarefas')
    .update(atualizacoes)
    .eq('id', req.params.tarefaId)
    .select(SELECT_TAREFA)
    .single();

  if (error) return res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  return res.json({ tarefa: data });
});

// DELETE /api/boards/tarefas/:tarefaId
router.delete('/tarefas/:tarefaId', requireAuth, async (req, res) => {
  const { error } = await supabaseAdmin.from('tarefas').delete().eq('id', req.params.tarefaId);
  if (error) return res.status(500).json({ error: 'Erro ao excluir tarefa.' });
  return res.status(204).send();
});

// POST /api/boards/tarefas/:tarefaId/mover
// Move o cartão para (possivelmente) outra coluna e persiste a nova
// ordem de toda a coluna de destino, recebida já ordenada do frontend.
router.post('/tarefas/:tarefaId/mover', requireAuth, async (req, res) => {
  const { tarefaId } = req.params;
  const { coluna_id, ordem_lista } = req.body;

  if (!coluna_id || !Array.isArray(ordem_lista)) {
    return res.status(400).json({ error: 'Dados de movimentação inválidos.' });
  }

  const { error: erroMover } = await supabaseAdmin
    .from('tarefas')
    .update({ coluna_id })
    .eq('id', tarefaId);
  if (erroMover) return res.status(500).json({ error: 'Erro ao mover a tarefa.' });

  const atualizacoes = await Promise.all(
    ordem_lista.map((idTarefa, ordem) =>
      supabaseAdmin.from('tarefas').update({ ordem }).eq('id', idTarefa)
    )
  );
  const falhou = atualizacoes.find((r) => r.error);
  if (falhou) return res.status(500).json({ error: 'Erro ao reordenar as tarefas.' });

  return res.json({ ok: true });
});

export default router;
