import { Outlet } from 'react-router-dom';
import TopNav from '../components/TopNav.jsx';
import ProfileMenu from '../components/ProfileMenu.jsx';
import './DashboardLayout.css';

export default function DashboardLayout() {
  return (
    <div className="dashboard-shell">
      <TopNav />
      <main className="dashboard-conteudo">
        <Outlet />
      </main>
      <ProfileMenu />
    </div>
  );
}
