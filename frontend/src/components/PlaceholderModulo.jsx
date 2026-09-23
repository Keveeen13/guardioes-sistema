/**
 * Tela de "em construção" para módulos cuja tabela no Supabase já existe
 * (ver supabase/schema.sql) mas cuja interface ainda será construída nas
 * próximas fases do projeto.
 */
export default function PlaceholderModulo({ icon: Icon, titulo, descricao, tabela }) {
  return (
    <div className="card placeholder-modulo">
      <Icon size={36} strokeWidth={1.5} />
      <h2>{titulo}</h2>
      <p>{descricao}</p>
      {tabela && (
        <p className="mono" style={{ marginTop: 12, fontSize: '0.75rem', opacity: 0.7 }}>
          tabela: public.{tabela}
        </p>
      )}
    </div>
  );
}
