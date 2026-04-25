import { NavLink } from 'react-router-dom';
import './DashboardLayout.css';

export default function DashboardLayout({ children }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-title">资产 Dashboard</div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            总览
          </NavLink>
          <NavLink to="/accounts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            账户管理
          </NavLink>
          <NavLink to="/valuation-history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            更新记录
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
