import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DoorOpen,
  FileText,
  Receipt,
  Wrench,
  BarChart3,
  Database,
  Network,
  Save,
  LogOut,
  UserCircle,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import { humanize } from '@/lib/format';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/tenants', label: 'Tenants', icon: Users },
  { to: '/app/rooms', label: 'Rooms', icon: DoorOpen },
  { to: '/app/leases', label: 'Leases', icon: FileText },
  { to: '/app/payments', label: 'Payments', icon: Receipt },
  { to: '/app/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/app/reports', label: 'Reports', icon: BarChart3 },
];

const TOOLS = [
  { to: '/app/database', label: 'Database', icon: Database },
  { to: '/app/er-diagram', label: 'ER Diagram', icon: Network },
  { to: '/app/backup', label: 'Backup & Restore', icon: Save },
];

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: any;
  end?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-sidebar-accent text-white' : 'text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground'
        )
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </NavLink>
  );
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5">
        <Logo to="/app" variant="light" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
          Management
        </div>
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} onNavigate={onNavigate} />
        ))}

        <div className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
          Data & Tools
        </div>
        {TOOLS.map((item) => (
          <NavItem key={item.to} {...item} onNavigate={onNavigate} />
        ))}

        <div className="mt-auto pt-4">
          <a
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-muted transition-colors hover:bg-white/5 hover:text-sidebar-foreground"
          >
            <ExternalLink className="h-[18px] w-[18px]" />
            View public site
          </a>
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <NavLink
          to="/app/profile"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg p-2 transition-colors',
              isActive ? 'bg-white/10' : 'hover:bg-white/5'
            )
          }
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-white">
            {initials}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-medium text-sidebar-foreground">{user?.name}</span>
            <span className="block text-xs text-sidebar-muted">{humanize(user?.role)}</span>
          </span>
          <UserCircle className="ml-auto h-4 w-4 text-sidebar-muted" />
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-muted transition-colors hover:bg-white/5 hover:text-sidebar-foreground"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
