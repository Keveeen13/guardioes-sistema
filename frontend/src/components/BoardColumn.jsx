import { useState } from 'react';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';
import TaskCard from './TaskCard.jsx';

export default function BoardColumn({
  coluna,
  onArrastarInicio,
  onArrastarSobre,
  onArrastarSobreColuna,
  onSoltar,
  onClicarTarefa,
  onNovaTarefa,
  onRenomear,
  onExcluirColuna,
}) {
  const [editando, setEditando] = useState(false);
  const [tituloEditado, setTituloEditado] = useState(coluna.titulo);
  const [menuAberto, setMenuAberto] = useState(false);

  function confirmarRenomeio() {
    setEditando(false);
    if (tituloEditado.trim() && tituloEditado.trim() !== coluna.titulo) {
      onRenomear(coluna.id, tituloEditado.trim());
    } else {
      setTituloEditado(coluna.titulo);
    }
  }

  return (
    <div className="board-column" onDragOver={(e) => e.preventDefault()} onDrop={() => onSoltar(coluna.id)}>
      <div className="board-column-header">
        {editando ? (
          <input
            className="board-column-titulo-input"
            value={tituloEditado}
            autoFocus
            onChange={(e) => setTituloEditado(e.target.value)}
            onBlur={confirmarRenomeio}
            onKeyDown={(e) => e.key === 'Enter' && confirmarRenomeio()}
          />
        ) : (
          <button type="button" className="board-column-titulo" onClick={() => setEditando(true)}>
            {coluna.titulo}
          </button>
        )}

        <span className="board-column-contagem">{coluna.tarefas.length}</span>

        <div className="board-column-menu-wrap">
          <button
            type="button"
            className="board-column-menu-btn"
            onClick={() => setMenuAberto((v) => !v)}
            aria-label="Opções da coluna"
          >
            <MoreVertical size={16} />
          </button>
          {menuAberto && (
            <div className="board-column-menu">
              <button type="button" onClick={() => { setMenuAberto(false); onExcluirColuna(coluna.id); }}>
                <Trash2 size={14} /> Excluir coluna
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="board-column-lista" onDragOver={(e) => onArrastarSobreColuna(e, coluna.id)}>
        {coluna.tarefas.map((tarefa) => (
          <TaskCard
            key={tarefa.id}
            tarefa={tarefa}
            onArrastarInicio={onArrastarInicio}
            onArrastarSobre={(e, t) => onArrastarSobre(e, coluna.id, t)}
            onClicar={onClicarTarefa}
          />
        ))}
      </div>

      <button type="button" className="board-column-nova-tarefa" onClick={() => onNovaTarefa(coluna.id)}>
        <Plus size={15} /> Nova tarefa
      </button>
    </div>
  );
}
