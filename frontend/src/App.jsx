import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardLayout from './pages/DashboardLayout.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import Tesouraria from './pages/Tesouraria.jsx';
import Documentos from './pages/Documentos.jsx';
import Calendario from './pages/Calendario.jsx';
import RegistroTarefas from './pages/RegistroTarefas.jsx';
import QuadroTarefas from './pages/QuadroTarefas.jsx';
import Configuracoes from './pages/Configuracoes.jsx';
import Perfil from './pages/Perfil.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  const { profile, carregando } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          !carregando && profile ? <Navigate to="/dashboard" replace /> : <AuthPage />
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="tesouraria" element={<Tesouraria />} />
        <Route path="documentos" element={<Documentos />} />
        <Route path="calendario" element={<Calendario />} />
        <Route path="registro-tarefas" element={<RegistroTarefas />} />
        <Route path="quadro-tarefas" element={<QuadroTarefas />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
