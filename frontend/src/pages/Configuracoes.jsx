import { Settings } from 'lucide-react';
import PlaceholderModulo from '../components/PlaceholderModulo.jsx';

export default function Configuracoes() {
  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1 className="display">Configurações</h1>
          <p>Preferências do capítulo e administração do sistema</p>
        </div>
      </div>
      <PlaceholderModulo
        icon={Settings}
        titulo="Módulo em construção"
        descricao="Aqui entrarão as configurações do capítulo, gestão de cargos/permissões e preferências gerais do sistema."
      />
    </>
  );
}
