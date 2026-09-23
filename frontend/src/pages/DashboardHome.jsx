import { Wallet, FileText, CalendarDays, KanbanSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardHome() {
  const { profile } = useAuth();
  const primeiroNome = profile?.nome_completo?.split(' ')[0];

  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1 className="display">Bem-vindo, {primeiroNome}</h1>
          <p>Painel do capítulo Guardiões do Cruzeiro do Sul</p>
        </div>
      </div>

      <div className="stats-grid">
        <AtalhoCard to="/dashboard/tesouraria" icon={Wallet} label="Tesouraria" valor="—" />
        <AtalhoCard to="/dashboard/documentos" icon={FileText} label="Documentos" valor="—" />
        <AtalhoCard to="/dashboard/calendario" icon={CalendarDays} label="Próximo evento" valor="—" />
        <AtalhoCard to="/dashboard/quadro-tarefas" icon={KanbanSquare} label="Tarefas abertas" valor="—" />
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: '1rem', marginBottom: 8 }}>Próximos passos</h2>
        <p style={{ color: 'var(--slate)', fontSize: '0.88rem', lineHeight: 1.6 }}>
          Esta é a base do sistema: autenticação, perfis de membros e a navegação entre
          módulos. As próximas fases vão preencher cada módulo (Tesouraria, Documentos,
          Calendário e Quadro de Tarefas) com dados reais do Supabase.
        </p>
      </div>
    </>
  );
}

function AtalhoCard({ to, icon: Icon, label, valor }) {
  return (
    <Link to={to} className="card stat-card" style={{ textDecoration: 'none' }}>
      <Icon size={18} color="var(--gold)" />
      <div className="stat-card-label" style={{ marginTop: 8 }}>{label}</div>
      <div className="stat-card-valor">{valor}</div>
    </Link>
  );
}
