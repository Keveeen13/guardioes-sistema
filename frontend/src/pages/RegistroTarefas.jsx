import { ListChecks } from 'lucide-react';
import PlaceholderModulo from '../components/PlaceholderModulo.jsx';

export default function RegistroTarefas() {
  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1 className="display">Registro e Tarefas</h1>
          <p>Registro de presença e atribuição de tarefas aos membros</p>
        </div>
      </div>
      <PlaceholderModulo
        icon={ListChecks}
        titulo="Módulo em construção"
        descricao="Aqui entrará o controle de presença nas reuniões e a atribuição de tarefas individuais aos membros."
        tabela="tarefas"
      />
    </>
  );
}
