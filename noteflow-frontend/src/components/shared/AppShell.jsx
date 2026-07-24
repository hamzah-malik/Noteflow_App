import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Moon, Sun, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTheme } from '@/hooks/useTheme';

// Layout for authenticated pages - dark navy sidebar + light top bar,
// matching the reference design. The avatar/profile block lives in the
// sidebar now (see Sidebar.jsx), not duplicated here.
export default function AppShell() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[var(--bg-surface)]">
      <Sidebar />
      <div className="flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] px-6">
          <div className="flex max-w-md flex-1 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5">
            <Search size={16} className="text-[var(--text-secondary)]" />
            <input
              onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value) navigate(`/notes?search=${encodeURIComponent(e.currentTarget.value)}`); }}
              placeholder="Search notes by title, subject or owner..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-secondary)]"
            />
          </div>

          <div className="flex items-center gap-4">
            <Link to="/upload" className="btn-primary flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium">
              <Plus size={16} /> New Note
            </Link>
            <button onClick={toggleTheme} aria-label="Toggle theme" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/notifications" aria-label="Notifications" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <Bell size={18} />
            </Link>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
