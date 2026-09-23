import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import './ProfileMenu.css';

/**
 * Avatar flutuante no canto inferior direito, como indicado no wireframe
 * ("Perfil" apontando para o círculo no rodapé da tela).
 */
export default function ProfileMenu() {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function aoClicarFora(e) {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  const iniciais = (profile?.nome_completo || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  function aoSair() {
    logout();
    navigate('/');
  }

  return (
    <div className="profile-menu" ref={ref}>
      {aberto && (
        <div className="profile-menu-popover card">
          <div className="profile-menu-header">
            <strong>{profile?.nome_completo}</strong>
            <span className="profile-menu-cargo">{formatarCargo(profile?.cargo)}</span>
          </div>
          <button
            type="button"
            className="profile-menu-option"
            onClick={() => {
              setAberto(false);
              navigate('/dashboard/perfil');
            }}
          >
            <User size={16} /> Meu perfil
          </button>
          <button
            type="button"
            className="profile-menu-option"
            onClick={() => {
              setAberto(false);
              navigate('/dashboard/configuracoes');
            }}
          >
            <Settings size={16} /> Configurações
          </button>
          <button type="button" className="profile-menu-option is-sair" onClick={aoSair}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}

      <button
        type="button"
        className="profile-menu-avatar"
        onClick={() => setAberto((v) => !v)}
        aria-label="Abrir menu de perfil"
        aria-expanded={aberto}
      >
        {iniciais}
      </button>
    </div>
  );
}

function formatarCargo(cargo) {
  if (!cargo) return '';
  return cargo
    .split('_')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}
