import { Wallet } from 'lucide-react';
import PlaceholderModulo from '../components/PlaceholderModulo.jsx';

export default function Tesouraria() {
  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1 className="display">Tesouraria</h1>
          <p>Mensalidades, receitas e despesas do capítulo</p>
        </div>
      </div>
      <PlaceholderModulo
        icon={Wallet}
        titulo="Módulo em construção"
        descricao="Aqui entrarão lançamentos financeiros, controle de mensalidades dos membros e relatórios de caixa."
        tabela="tesouraria_lancamentos"
      />
    </>
  );
}
