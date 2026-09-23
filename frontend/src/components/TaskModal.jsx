import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import './TaskModal.css';

const PRIORIDADES = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
];

/**
 * Modal usado tanto para criar quanto para editar uma tarefa.
 * Quando `tarefa` é passada, o formulário abre preenchido e mostra
 * a opção de excluir.
 */
export default function TaskModal({ tarefa, membros, onFechar, onSalvar, onExcluir }) {
  const [titulo, setTitulo] = useState(tarefa?.titulo || '');
  const [descricao, setDescricao] = useState(tarefa?.descricao || '');
  const [responsavelId, setResponsavelId] = useState(tarefa?.responsavel_id || '');
  const [prioridade, setPrioridade] = useState(tarefa?.prioridade || 'media');
  const [prazo, setPrazo] = useState(tarefa?.prazo || '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function aoSubmeter(e) {
    e.preventDefault();
    if (!titulo.trim()) {
      setErro('Dê um título para a tarefa.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      await onSalvar({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        responsavel_id: responsavelId || null,
        prioridade,
        prazo: prazo || null,
      });
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível salvar a tarefa.');
      setSalvando(false);
    }
  }

  return (
    <div className="task-modal-backdrop" onMouseDown={onFechar}>
      <form
        className="card task-modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={aoSubmeter}
      >
        <div className="task-modal-header">
          <h2 style={{ fontSize: '1.05rem' }}>{tarefa ? 'Editar tarefa' : 'Nova tarefa'}</h2>
          <button type="button" className="task-modal-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="field">
          <label htmlFor="tm-titulo">Título</label>
          <input
            id="tm-titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Reservar salão para a reunião solene"
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label htmlFor="tm-descricao">Descrição</label>
          <textarea
            id="tm-descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Detalhes, links, observações…"
          />
        </div>

        <div className="task-modal-linha">
          <div className="field">
            <label htmlFor="tm-responsavel">Responsável</label>
            <select id="tm-responsavel" value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)}>
              <option value="">— Sem responsável —</option>
              {membros.map((m) => (
                <option key={m.id} value={m.id}>{m.nome_completo}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="tm-prioridade">Prioridade</label>
            <select id="tm-prioridade" value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
              {PRIORIDADES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="tm-prazo">Prazo</label>
          <input id="tm-prazo" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
        </div>

        {erro && <div className="form-error">{erro}</div>}

        <div className="task-modal-acoes">
          {tarefa && (
            <button type="button" className="btn btn-ghost task-modal-excluir" onClick={() => onExcluir(tarefa.id)}>
              <Trash2 size={16} /> Excluir
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button type="button" className="btn btn-ghost" onClick={onFechar}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
