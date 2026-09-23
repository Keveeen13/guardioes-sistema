import { FileText } from 'lucide-react';
import PlaceholderModulo from '../components/PlaceholderModulo.jsx';

export default function Documentos() {
  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1 className="display">Documentos</h1>
          <p>Atas, editais e arquivos oficiais do capítulo</p>
        </div>
      </div>
      <PlaceholderModulo
        icon={FileText}
        titulo="Módulo em construção"
        descricao="Aqui entrará o repositório de atas, ofícios e arquivos do capítulo, com upload para o Supabase Storage."
        tabela="documentos"
      />
    </>
  );
}
