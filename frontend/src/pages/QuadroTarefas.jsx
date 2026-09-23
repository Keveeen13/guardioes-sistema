import { KanbanSquare } from 'lucide-react';
import PlaceholderModulo from '../components/PlaceholderModulo.jsx';

export default function QuadroTarefas() {
  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1 className="display">Quadro de Tarefas</h1>
          <p>Kanban de projetos e demandas do capítulo</p>
        </div>
      </div>
      <PlaceholderModulo
        icon={KanbanSquare}
        titulo="Módulo em construção"
        descricao="Aqui entrará o quadro estilo Trello/ClickUp, com colunas de status e cartões arrastáveis para cada tarefa."
        tabela="tarefas"
      />
    </>
  );
}
