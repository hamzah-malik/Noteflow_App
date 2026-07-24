import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import Logo from './Logo';

// Public marketing-site nav only (Landing/Login/Register). Authenticated
// pages use AppShell's sidebar + top bar instead - see AppShell.jsx.
export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={28} />
          <span className="font-[var(--font-display)] text-xl font-bold tracking-tight text-[var(--text-primary)]">NoteFlow</span>
        </Link>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Log in
          </Link>
          <Link to="/register" className="rounded-full bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 transition-colors">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
