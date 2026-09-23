import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';

export default function Perfil() {
  const { profile, atualizarPerfilLocal } = useAuth();
  const [nomeCompleto, setNomeCompleto] = useState(profile?.nome_completo || '');
  const [telefone, setTelefone] = useState(profile?.telefone || '');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  async function aoSalvar(e) {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');
    setErro('');
    try {
      const { data } = await api.patch('/profile', { nome_completo: nomeCompleto, telefone });
      atualizarPerfilLocal?.(data.profile);
      setMensagem('Perfil atualizado com sucesso.');
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível salvar as alterações.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1 className="display">Meu perfil</h1>
          <p>Seus dados como membro do capítulo</p>
        </div>
      </div>

      <form className="card" style={{ padding: 24, maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={aoSalvar}>
        <div className="field">
          <label htmlFor="nome">Nome completo</label>
          <input id="nome" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" value={profile?.email || ''} disabled />
        </div>

        <div className="field">
          <label htmlFor="cargo">Cargo</label>
          <input id="cargo" value={formatarCargo(profile?.cargo)} disabled />
        </div>

        <div className="field">
          <label htmlFor="telefone">Telefone</label>
          <input
            id="telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </div>

        {erro && <div className="form-error">{erro}</div>}
        {mensagem && <div className="form-success">{mensagem}</div>}

        <button type="submit" className="btn btn-primary" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </form>
    </>
  );
}

function formatarCargo(cargo) {
  if (!cargo) return '';
  return cargo
    .split('_')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}
