import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Envolve rotas que exigem usuário autenticado.
 * Enquanto a sessão ainda está sendo verificada, mostra um loading simples
 * para evitar um "flash" da tela de login.
 */
export default function ProtectedRoute({ children }) {
  const { profile, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="tela-carregando">
        <div className="spinner" aria-label="Carregando" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  return children;
}
