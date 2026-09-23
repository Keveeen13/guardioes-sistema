import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../lib/api.js';

const AuthContext = createContext(null);

const SESSION_KEY = 'gcs.session';

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregarSessao = useCallback(async () => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      setCarregando(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setProfile(data.profile);
    } catch (err) {
      localStorage.removeItem(SESSION_KEY);
      setProfile(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarSessao();
  }, [carregarSessao]);

  async function login(email, senha) {
    const { data } = await api.post('/auth/login', { email, senha });
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.session));
    setProfile(data.profile);
    return data.profile;
  }

  async function registrar(nomeCompleto, email, senha) {
    const { data } = await api.post('/auth/register', { nomeCompleto, email, senha });
    return data;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setProfile(null);
  }

  function atualizarPerfilLocal(novoPerfil) {
    setProfile(novoPerfil);
  }

  return (
    <AuthContext.Provider
      value={{ profile, carregando, login, registrar, logout, atualizarPerfilLocal }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
