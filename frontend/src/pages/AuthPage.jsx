import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import StarEmblem from '../assets/StarEmblem.jsx';
import './AuthPage.css';

export default function AuthPage() {
  const [aba, setAba] = useState('entrar'); // 'entrar' | 'cadastrar'
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const { login, registrar } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nomeCompleto: '',
    email: '',
    senha: '',
  });

  function atualizarCampo(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  }

  function trocarAba(novaAba) {
    setAba(novaAba);
    setErro('');
    setSucesso('');
  }

  async function aoEnviar(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);
    try {
      if (aba === 'entrar') {
        await login(form.email, form.senha);
        navigate('/dashboard');
      } else {
        await registrar(form.nomeCompleto, form.email, form.senha);
        setSucesso('Cadastro realizado! Você já pode entrar com seu e-mail e senha.');
        setAba('entrar');
      }
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível concluir a operação.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-starfield" aria-hidden="true" />

      <div className="auth-card card">
        <div className="auth-brand">
          <StarEmblem size={64} />
          <h1 className="display auth-title">Guardiões do Cruzeiro do Sul</h1>
          <p className="auth-subtitle">Capítulo DeMolay — sistema de gestão</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${aba === 'entrar' ? 'is-active' : ''}`}
            onClick={() => trocarAba('entrar')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`auth-tab ${aba === 'cadastrar' ? 'is-active' : ''}`}
            onClick={() => trocarAba('cadastrar')}
          >
            Cadastrar
          </button>
        </div>

        <form className="auth-form" onSubmit={aoEnviar}>
          {aba === 'cadastrar' && (
            <div className="field">
              <label htmlFor="nomeCompleto">Nome completo</label>
              <input
                id="nomeCompleto"
                type="text"
                placeholder="Seu nome como membro do capítulo"
                value={form.nomeCompleto}
                onChange={atualizarCampo('nomeCompleto')}
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="voce@exemplo.com"
              value={form.email}
              onChange={atualizarCampo('email')}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={form.senha}
              onChange={atualizarCampo('senha')}
              minLength={6}
              required
            />
          </div>

          {erro && <div className="form-error">{erro}</div>}
          {sucesso && <div className="form-success">{sucesso}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={carregando}>
            {carregando ? 'Aguarde…' : aba === 'entrar' ? 'Entrar' : 'Criar minha conta'}
          </button>
        </form>
      </div>
    </div>
  );
}
