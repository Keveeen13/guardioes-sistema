import { CalendarDays } from 'lucide-react';
import PlaceholderModulo from '../components/PlaceholderModulo.jsx';

export default function Calendario() {
  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1 className="display">Calendário</h1>
          <p>Reuniões, eventos e cerimônias do capítulo</p>
        </div>
      </div>
      <PlaceholderModulo
        icon={CalendarDays}
        titulo="Módulo em construção"
        descricao="Aqui entrará o calendário de reuniões, cerimônias e eventos do capítulo, com confirmação de presença."
        tabela="eventos_calendario"
      />
    </>
  );
}
