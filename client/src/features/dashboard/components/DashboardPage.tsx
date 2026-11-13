/* Hallmark · shape: app screen · genre: modern-minimal · theme: Coral (deal 1/3)
 * screen: dashboard · signature: top bar on board · states: idle
 * axes: light/grotesk-sans/warm · posture: restrained · contrast: pass · v2.0.0 */
import { useNavigate } from 'react-router-dom';
import { logout } from '../../auth/api.js';

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
    <div
      className="min-h-dvh flex flex-col"
      style={{ backgroundColor: 'var(--color-paper)', fontFamily: 'var(--font-display)' }}
    >
      {/* Board top bar */}
      <header
        className="flex items-center justify-between px-6 h-14 shrink-0"
        style={{ backgroundColor: 'var(--color-board)' }}
      >
        <span
          className="text-sm font-semibold tracking-tight"
          style={{
            color: 'var(--color-board-type)',
            fontFamily: 'var(--font-display)',
            letterSpacing: 'var(--tracking-tight)',
          }}
        >
          Accelerator
        </span>

        {/* Cotton card button — letterpress secondary */}
        <button
          type="button"
          onClick={handleLogout}
          className="h-8 px-3 rounded-[var(--radius-stock)] text-xs font-medium cursor-pointer"
          style={{
            backgroundColor: 'var(--color-cotton)',
            color: 'var(--color-print)',
            fontFamily: 'var(--font-display)',
            boxShadow: 'var(--edge-stock), var(--cast-stock)',
            transition: `transform var(--dur-short) var(--ease-out), box-shadow var(--dur-short) var(--ease-out)`,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = 'var(--edge-stock), var(--cast-stock-lift)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = 'var(--edge-stock), var(--cast-stock)';
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
        >
          Sign out
        </button>
      </header>

      {/* Rule under header */}
      <div style={{ height: '1px', backgroundColor: 'var(--color-rule)' }} />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-10">
        <div className="text-center">
          <h1
            className="text-3xl font-semibold mb-2"
            style={{
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--display-weight)',
              letterSpacing: 'var(--tracking-display)',
            }}
          >
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            You're in. Welcome aboard.
          </p>
        </div>
      </main>
    </div>
  );
}
