import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { MODULOS } from '../lib/modules.js';
import './TopNav.css';

/**
 * Reproduz a barra de ícones do wireframe: um botão por módulo, com a
 * etiqueta de versão à esquerda e um menu "hambúrguer" que colapsa os
 * ícones em uma lista vertical no celular.
 */
export default function TopNav() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="topnav">
      <div className="topnav-bar">
        <span className="topnav-versao mono">v0.1</span>

        <nav className={`topnav-modulos ${aberto ? 'is-aberto' : ''}`}>
          {MODULOS.map(({ path, label, icon: Icon, fim }) => (
            <NavLink
              key={path}
              to={path}
              end={fim}
              className={({ isActive }) => `topnav-item ${isActive ? 'is-active' : ''}`}
              onClick={() => setAberto(false)}
              title={label}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span className="topnav-item-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="topnav-toggle"
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={aberto}
        >
          {aberto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
