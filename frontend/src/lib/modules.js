import {
  LayoutDashboard,
  Settings,
  Wallet,
  FileText,
  CalendarDays,
  ListChecks,
  KanbanSquare,
} from 'lucide-react';

// Baseado no wireframe da barra superior: cada módulo tem ícone, rótulo e rota.
// Adicionar um novo módulo no futuro é só incluir um item aqui.
export const MODULOS = [
  { path: '/dashboard', label: 'Início', icon: LayoutDashboard, fim: true },
  { path: '/dashboard/tesouraria', label: 'Tesouraria', icon: Wallet },
  { path: '/dashboard/documentos', label: 'Documentos', icon: FileText },
  { path: '/dashboard/calendario', label: 'Calendário', icon: CalendarDays },
  { path: '/dashboard/registro-tarefas', label: 'Registro e Tarefas', icon: ListChecks },
  { path: '/dashboard/quadro-tarefas', label: 'Quadro de Tarefas', icon: KanbanSquare },
  { path: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
];
