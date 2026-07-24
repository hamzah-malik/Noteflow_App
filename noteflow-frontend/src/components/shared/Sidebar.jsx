import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, FileText, Users2, Share2, ShieldCheck, Users, Bell, Settings, LogOut } from 'lucide-react';
import { fetchDashboard } from '@/api/notes';
import { logout as logoutApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import Logo from './Logo';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  // Shared query cache with DashboardPage - badge counts stay in sync
  // without a second round trip most of the time.
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchDashboard().then((r) => r.data),
  });

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/notes', label: 'My Notes', icon: FileText },
    { to: '/friends-notes', label: "Friends' Notes", icon: Users2 },
    { to: '/shared', label: 'Shared with Me', icon: Share2 },
    { to: '/access-requests', label: 'Access Requests', icon: ShieldCheck, badge: data?.stats.pending_requests_count },
    { to: '/friends', label: 'Friends', icon: Users },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: data?.stats.unread_notifications_count },
  ];

  const handleLogout = async () => {
    try { await logoutApi(); } finally { queryClient.clear(); clearAuth(); navigate('/'); }
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between bg-[var(--color-navy-900)] px-4 py-6 md:flex">
      <div>
        <div className="flex items-center gap-2 px-2">
          <Logo size={30} />
          <span className="font-[var(--font-display)] text-lg font-bold text-white">NoteFlow</span>
        </div>

        {user && (
          <div className="mt-6 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-600 text-sm font-medium text-white">
              {(user.full_name || user.username || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user.full_name || user.username}</p>
              <p className="truncate text-xs text-[#8A93C7]">{user.email}</p>
            </div>
          </div>
        )}

        <nav className="mt-6 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent-500 text-white shadow-[0_2px_10px_rgba(76,107,58,0.35)]' : 'text-[#AEB6E0] hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="flex items-center gap-2.5">
                <Icon size={17} />
                {label}
              </span>
              {!!badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rejected-500 px-1.5 text-[11px] font-semibold text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-0.5 border-t border-[var(--color-navy-line)] pt-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-white/10 text-white' : 'text-[#AEB6E0] hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <Settings size={17} /> Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#AEB6E0] hover:bg-white/5 hover:text-rejected-500 transition-colors"
        >
          <LogOut size={17} /> Log out
        </button>
      </div>
    </aside>
  );
}
