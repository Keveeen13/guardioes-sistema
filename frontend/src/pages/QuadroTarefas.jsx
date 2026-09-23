import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, KanbanSquare } from 'lucide-react';
import api from '../lib/api.js';
import BoardColumn from '../components/BoardColumn.jsx';
import TaskModal from '../components/TaskModal.jsx';
import './QuadroTarefas.css';

export default function QuadroTarefas() {
  const [quadros, setQuadros] = useState([]);
  const [quadroAtualId, setQuadroAtualId] = useState(null);
  const [detalhe, setDetalhe] = useState(null); // { quadro, colunas }
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [formNovoQuadro, setFormNovoQuadro] = useState(false);
  const [tituloNovoQuadro, setTituloNovoQuadro] = useState('');
  const [descricaoNovoQuadro, setDescricaoNovoQuadro] = useState('');
  const [salvandoQuadro, setSalvandoQuadro] = useState(false);

  const [formNovaColuna, setFormNovaColuna] = useState(false);
  const [tituloNovaColuna, setTituloNovaColuna] = useState('');

  const [modalTarefa, setModalTarefa] = useState(null); // { tarefa, colunaId } | null

  const arrastando = useRef(null); // { tarefaId, colunaOrigemId }
  const dragOverInfo = useRef(null); // { colunaId, index }

  // ---- carregamento inicial ----
  useEffect(() => {
    (async () => {
      try {
        const [{ data: dadosQuadros }, { data: dadosMembros }] = await Promise.all([
          api.get('/boards'),
          api.get('/profile/membros'),
        ]);
        setQuadros(dadosQuadros.quadros);
        setMembros(dadosMembros.membros);
        if (dadosQuadros.quadros.length > 0) {
          setQuadroAtualId(dadosQuadros.quadros[0].id);
        } else {
          setCarregando(false);
        }
      } catch (err) {
        setErro('Não foi possível carregar os quadros.');
        setCarregando(false);
      }
    })();
  }, []);

  const carregarDetalhe = useCallback(async (id) => {
    setCarregando(true);
    setErro('');
    try {
      const { data } = await api.get(`/boards/${id}`);
      setDetalhe(data);
    } catch (err) {
      setErro('Não foi possível carregar este quadro.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (quadroAtualId) carregarDetalhe(quadroAtualId);
  }, [quadroAtualId, carregarDetalhe]);

  // ---- quadros ----
  async function aoCriarQuadro(e) {
    e.preventDefault();
    if (!tituloNovoQuadro.trim()) return;
    setSalvandoQuadro(true);
    try {
      const { data } = await api.post('/boards', {
        titulo: tituloNovoQuadro,
        descricao: descricaoNovoQuadro,
      });
      setQuadros((atual) => [...atual, { ...data.quadro, total_tarefas: 0 }]);
      setQuadroAtualId(data.quadro.id);
      setFormNovoQuadro(false);
      setTituloNovoQuadro('');
      setDescricaoNovoQuadro('');
    } catch (err) {
      setErro('Não foi possível criar o quadro.');
    } finally {
      setSalvandoQuadro(false);
    }
  }

  // ---- colunas ----
  async function aoCriarColuna(e) {
    e.preventDefault();
    if (!tituloNovaColuna.trim() || !detalhe) return;
    try {
      const { data } = await api.post(`/boards/${detalhe.quadro.id}/colunas`, {
        titulo: tituloNovaColuna,
      });
      setDetalhe((atual) => ({ ...atual, colunas: [...atual.colunas, data.coluna] }));
      setTituloNovaColuna('');
      setFormNovaColuna(false);
    } catch (err) {
      setErro('Não foi possível criar a coluna.');
    }
  }

  async function aoRenomearColuna(colunaId, novoTitulo) {
    setDetalhe((atual) => ({
      ...atual,
      colunas: atual.colunas.map((c) => (c.id === colunaId ? { ...c, titulo: novoTitulo } : c)),
    }));
    try {
      await api.patch(`/boards/colunas/${colunaId}`, { titulo: novoTitulo });
    } catch (err) {
      setErro('Não foi possível renomear a coluna.');
      carregarDetalhe(quadroAtualId);
    }
  }

  async function aoExcluirColuna(colunaId) {
    if (!window.confirm('Excluir esta coluna e todas as tarefas dentro dela?')) return;
    setDetalhe((atual) => ({ ...atual, colunas: atual.colunas.filter((c) => c.id !== colunaId) }));
    try {
      await api.delete(`/boards/colunas/${colunaId}`);
    } catch (err) {
      setErro('Não foi possível excluir a coluna.');
      carregarDetalhe(quadroAtualId);
    }
  }

  // ---- tarefas ----
  function aoAbrirNovaTarefa(colunaId) {
    setModalTarefa({ tarefa: null, colunaId });
  }

  function aoAbrirTarefa(tarefa) {
    setModalTarefa({ tarefa, colunaId: tarefa.coluna_id });
  }

  async function aoSalvarTarefa(dados) {
    if (modalTarefa.tarefa) {
      const { data } = await api.patch(`/boards/tarefas/${modalTarefa.tarefa.id}`, dados);
      setDetalhe((atual) => ({
        ...atual,
        colunas: atual.colunas.map((c) => ({
          ...c,
          tarefas: c.tarefas.map((t) => (t.id === data.tarefa.id ? data.tarefa : t)),
        })),
      }));
    } else {
      const { data } = await api.post('/boards/tarefas', {
        quadro_id: detalhe.quadro.id,
        coluna_id: modalTarefa.colunaId,
        ...dados,
      });
      setDetalhe((atual) => ({
        ...atual,
        colunas: atual.colunas.map((c) =>
          c.id === modalTarefa.colunaId ? { ...c, tarefas: [...c.tarefas, data.tarefa] } : c
        ),
      }));
      setQuadros((atual) =>
        atual.map((q) => (q.id === detalhe.quadro.id ? { ...q, total_tarefas: q.total_tarefas + 1 } : q))
      );
    }
    setModalTarefa(null);
  }

  async function aoExcluirTarefa(tarefaId) {
    if (!window.confirm('Excluir esta tarefa?')) return;
    setDetalhe((atual) => ({
      ...atual,
      colunas: atual.colunas.map((c) => ({ ...c, tarefas: c.tarefas.filter((t) => t.id !== tarefaId) })),
    }));
    setModalTarefa(null);
    try {
      await api.delete(`/boards/tarefas/${tarefaId}`);
    } catch (err) {
      setErro('Não foi possível excluir a tarefa.');
      carregarDetalhe(quadroAtualId);
    }
  }

  // ---- drag and drop ----
  function aoArrastarInicio(e, tarefa) {
    e.dataTransfer.setData('text/plain', tarefa.id);
    arrastando.current = { tarefaId: tarefa.id, colunaOrigemId: tarefa.coluna_id };
  }

  function aoArrastarSobreCard(e, colunaId, tarefaSobre) {
    e.preventDefault();
    const coluna = detalhe.colunas.find((c) => c.id === colunaId);
    const index = coluna.tarefas.findIndex((t) => t.id === tarefaSobre.id);
    dragOverInfo.current = { colunaId, index };
  }

  function aoArrastarSobreColuna(e, colunaId) {
    e.preventDefault();
    if (e.target !== e.currentTarget) return; // deixa o card definir o índice preciso
    const coluna = detalhe.colunas.find((c) => c.id === colunaId);
    dragOverInfo.current = { colunaId, index: coluna.tarefas.length };
  }

  function aoSoltar(colunaDestinoId) {
    const origem = arrastando.current;
    if (!origem) return;
    const info =
      dragOverInfo.current && dragOverInfo.current.colunaId === colunaDestinoId
        ? dragOverInfo.current
        : null;

    setDetalhe((atual) => {
      const colunas = atual.colunas.map((c) => ({ ...c, tarefas: [...c.tarefas] }));
      const colunaOrigem = colunas.find((c) => c.id === origem.colunaOrigemId);
      const colunaDestino = colunas.find((c) => c.id === colunaDestinoId);
      const idxOrigem = colunaOrigem.tarefas.findIndex((t) => t.id === origem.tarefaId);
      if (idxOrigem === -1) return atual;

      const [tarefaMovida] = colunaOrigem.tarefas.splice(idxOrigem, 1);
      let indiceDestino = info ? info.index : colunaDestino.tarefas.length;
      if (origem.colunaOrigemId === colunaDestinoId && idxOrigem < indiceDestino) {
        indiceDestino -= 1;
      }
      colunaDestino.tarefas.splice(indiceDestino, 0, { ...tarefaMovida, coluna_id: colunaDestinoId });

      const ordemLista = colunaDestino.tarefas.map((t) => t.id);
      api
        .post(`/boards/tarefas/${origem.tarefaId}/mover`, {
          coluna_id: colunaDestinoId,
          ordem_lista: ordemLista,
        })
        .catch(() => {
          setErro('Não foi possível salvar a nova posição da tarefa.');
          carregarDetalhe(quadroAtualId);
        });

      return { ...atual, colunas };
    });

    arrastando.current = null;
    dragOverInfo.current = null;
  }

  // ---- render ----
  if (carregando && quadros.length === 0 && !erro) {
    return (
      <>
        <Cabecalho />
        <div className="card placeholder-modulo">
          <KanbanSquare size={36} strokeWidth={1.5} />
          <p>Carregando…</p>
        </div>
      </>
    );
  }

  if (quadros.length === 0) {
    return (
      <>
        <Cabecalho />
        {formNovoQuadro ? (
          <FormNovoQuadro
            titulo={tituloNovoQuadro}
            descricao={descricaoNovoQuadro}
            setTitulo={setTituloNovoQuadro}
            setDescricao={setDescricaoNovoQuadro}
            onSubmit={aoCriarQuadro}
            onCancelar={() => setFormNovoQuadro(false)}
            salvando={salvandoQuadro}
          />
        ) : (
          <div className="card placeholder-modulo">
            <KanbanSquare size={36} strokeWidth={1.5} />
            <h2>Nenhum quadro ainda</h2>
            <p>Crie o primeiro quadro do capítulo para começar a organizar as tarefas em colunas.</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setFormNovoQuadro(true)}>
              <Plus size={16} /> Criar quadro
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Cabecalho />

      {erro && <div className="form-error" style={{ marginBottom: 14 }}>{erro}</div>}

      <div className="quadros-lista">
        {quadros.map((q) => (
          <button
            key={q.id}
            type="button"
            className={`quadro-chip ${q.id === quadroAtualId ? 'is-ativo' : ''}`}
            onClick={() => setQuadroAtualId(q.id)}
          >
            {q.titulo} · {q.total_tarefas}
          </button>
        ))}
        {formNovoQuadro ? null : (
          <button type="button" className="quadro-chip-novo" onClick={() => setFormNovoQuadro(true)}>
            <Plus size={14} /> Novo quadro
          </button>
        )}
      </div>

      {formNovoQuadro && (
        <FormNovoQuadro
          titulo={tituloNovoQuadro}
          descricao={descricaoNovoQuadro}
          setTitulo={setTituloNovoQuadro}
          setDescricao={setDescricaoNovoQuadro}
          onSubmit={aoCriarQuadro}
          onCancelar={() => setFormNovoQuadro(false)}
          salvando={salvandoQuadro}
        />
      )}

      {detalhe && !formNovoQuadro && (
        <div className="board-scroll">
          {detalhe.colunas.map((coluna) => (
            <BoardColumn
              key={coluna.id}
              coluna={coluna}
              onArrastarInicio={aoArrastarInicio}
              onArrastarSobre={aoArrastarSobreCard}
              onArrastarSobreColuna={aoArrastarSobreColuna}
              onSoltar={aoSoltar}
              onClicarTarefa={aoAbrirTarefa}
              onNovaTarefa={aoAbrirNovaTarefa}
              onRenomear={aoRenomearColuna}
              onExcluirColuna={aoExcluirColuna}
            />
          ))}

          {formNovaColuna ? (
            <form className="board-nova-coluna" style={{ flexDirection: 'column' }} onSubmit={aoCriarColuna}>
              <input
                autoFocus
                value={tituloNovaColuna}
                onChange={(e) => setTituloNovaColuna(e.target.value)}
                onBlur={() => !tituloNovaColuna.trim() && setFormNovaColuna(false)}
                placeholder="Nome da coluna"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  color: 'var(--starlight)',
                  width: '100%',
                }}
              />
            </form>
          ) : (
            <button type="button" className="board-nova-coluna" onClick={() => setFormNovaColuna(true)}>
              <Plus size={16} /> Nova coluna
            </button>
          )}
        </div>
      )}

      {modalTarefa && (
        <TaskModal
          tarefa={modalTarefa.tarefa}
          membros={membros}
          onFechar={() => setModalTarefa(null)}
          onSalvar={aoSalvarTarefa}
          onExcluir={aoExcluirTarefa}
        />
      )}
    </>
  );
}

function Cabecalho() {
  return (
    <div className="pagina-cabecalho">
      <div>
        <h1 className="display">Quadro de Tarefas</h1>
        <p>Organize projetos do capítulo em colunas, ao estilo Kanban</p>
      </div>
    </div>
  );
}

function FormNovoQuadro({ titulo, descricao, setTitulo, setDescricao, onSubmit, onCancelar, salvando }) {
  return (
    <form className="card novo-quadro-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="nq-titulo">Nome do quadro</label>
        <input
          id="nq-titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Reunião Solene 2026"
          autoFocus
          required
        />
      </div>
      <div className="field">
        <label htmlFor="nq-descricao">Descrição (opcional)</label>
        <textarea
          id="nq-descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Do que se trata este quadro?"
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={salvando}>
          {salvando ? 'Criando…' : 'Criar quadro'}
        </button>
      </div>
    </form>
  );
}
