import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DoorOpen,
  FileText,
  Receipt,
  Wrench,
  Database,
  Network,
  Save,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tenants', label: 'Tenants', icon: Users },
  { to: '/rooms', label: 'Rooms', icon: DoorOpen },
  { to: '/leases', label: 'Leases', icon: FileText },
  { to: '/payments', label: 'Payments', icon: Receipt },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
];

const TOOLS = [
  { to: '/database', label: 'Database', icon: Database },
  { to: '/er-diagram', label: 'ER Diagram', icon: Network },
  { to: '/backup', label: 'Backup & Restore', icon: Save },
];

function NavItem({ to, label, icon: Icon, end }: { to: string; label: string; icon: any; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-sidebar-accent text-white'
            : 'text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground'
        )
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </NavLink>
  );
}

export function AppSidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent">
          <Home className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-base font-semibold">Bahay ni Kuya</div>
          <div className="text-xs text-sidebar-muted">Boarding House Manager</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
          Management
        </div>
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
          Data & Tools
        </div>
        {TOOLS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="px-5 py-4 text-xs text-sidebar-muted">
        <div className="rounded-lg bg-white/5 p-3">
          <div className="font-medium text-sidebar-foreground">Admin</div>
          <div>Owner / Manager</div>
        </div>
      </div>
    </aside>
  );
}
