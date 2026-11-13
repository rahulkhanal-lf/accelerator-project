import { useNavigate } from 'react-router-dom';
import { logout } from '../../auth/api.js';
import './DashboardPage.css';

export function DashboardPage(): React.ReactElement {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <span className="dashboard-brand">Accelerator</span>
        <button className="btn-logout" type="button" onClick={handleLogout}>
          Sign out
        </button>
      </header>

      <main className="dashboard-main">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">You're in. Welcome aboard.</p>
      </main>
    </div>
  );
}
