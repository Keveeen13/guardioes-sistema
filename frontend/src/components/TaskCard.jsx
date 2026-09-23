import { CalendarDays } from 'lucide-react';

function formatarPrazo(prazo) {
  if (!prazo) return null;
  const data = new Date(`${prazo}T00:00:00`);
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function prazoVencido(prazo) {
  if (!prazo) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return new Date(`${prazo}T00:00:00`) < hoje;
}

export default function TaskCard({ tarefa, onArrastarInicio, onArrastarSobre, onClicar }) {
  const vencida = prazoVencido(tarefa.prazo);

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onArrastarInicio(e, tarefa)}
      onDragOver={(e) => onArrastarSobre(e, tarefa)}
      onClick={() => onClicar(tarefa)}
      role="button"
      tabIndex={0}
    >
      <div className="task-card-topo">
        <span className={`badge-prioridade ${tarefa.prioridade}`}>
          {tarefa.prioridade === 'alta' ? 'Alta' : tarefa.prioridade === 'baixa' ? 'Baixa' : 'Média'}
        </span>
      </div>

      <p className="task-card-titulo">{tarefa.titulo}</p>

      <div className="task-card-rodape">
        {tarefa.prazo && (
          <span className={`task-card-prazo ${vencida ? 'is-vencido' : ''}`}>
            <CalendarDays size={12} /> {formatarPrazo(tarefa.prazo)}
          </span>
        )}
        {tarefa.responsavel && (
          <span className="task-card-responsavel" title={tarefa.responsavel.nome_completo}>
            {tarefa.responsavel.nome_completo
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join('')}
          </span>
        )}
      </div>
    </div>
  );
}
