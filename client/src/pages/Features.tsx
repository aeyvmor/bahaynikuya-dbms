import { Link } from 'react-router-dom';
import {
  Users,
  DoorOpen,
  FileText,
  Receipt,
  Wrench,
  LayoutDashboard,
  BarChart3,
  Database,
  Network,
  Save,
  Search,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SectionLabel } from '@/components/decor';

interface Feature {
  icon: any;
  title: string;
  desc: string;
  points: string[];
}

const GROUPS: { heading: string; blurb: string; items: Feature[] }[] = [
  {
    heading: 'Records Management',
    blurb: 'Full create, read, update, and delete for every part of the operation.',
    items: [
      { icon: Users, title: 'Tenants', desc: 'Manage boarder profiles and contact details.', points: ['Active / inactive status', 'Soft-delete keeps history', 'Search by name, email, phone'] },
      { icon: DoorOpen, title: 'Rooms', desc: 'Track every room and its availability.', points: ['Single, double, or shared', 'Monthly rate & capacity', 'Availability status'] },
      { icon: FileText, title: 'Leases', desc: 'Connect tenants to the rooms they occupy.', points: ['Start and end dates', 'Active / ended status', 'Linked to tenant and room'] },
      { icon: Receipt, title: 'Payments', desc: 'Record rent and flag balances.', points: ['Paid, partial, or overdue', 'Tied to a lease', 'Feeds income reports'] },
      { icon: Wrench, title: 'Maintenance', desc: 'Log and follow repair requests.', points: ['Priority levels', 'Pending → in progress → resolved', 'Filed against a room'] },
    ],
  },
  {
    heading: 'Insights & Reporting',
    blurb: 'Turn day-to-day records into clear, up-to-date numbers.',
    items: [
      { icon: LayoutDashboard, title: 'Dashboard', desc: 'The pulse of the house at a glance.', points: ['Income this month', 'Occupancy rate', 'Overdue & maintenance summary'] },
      { icon: BarChart3, title: 'Reports', desc: 'A presentation-ready report view.', points: ['Income & occupancy breakdown', 'Outstanding balances', 'Printable summary'] },
    ],
  },
  {
    heading: 'Data & Tools',
    blurb: 'Built-in utilities for transparency and peace of mind.',
    items: [
      { icon: Database, title: 'Database Inspector', desc: 'Browse the raw rows of any table.', points: ['Sortable & paginated', 'Read-only by design', 'Great for demos'] },
      { icon: Network, title: 'ER Diagram', desc: 'Visualize how the data connects.', points: ['Interactive canvas', 'PK / FK markers', 'Reflects the live schema'] },
      { icon: Save, title: 'Backup & Restore', desc: 'Never lose your records.', points: ['Export everything to JSON', 'Restore from a file', 'One-click download'] },
    ],
  },
  {
    heading: 'Platform',
    blurb: 'The foundations that keep everything reliable and secure.',
    items: [
      { icon: ShieldCheck, title: 'Secure Access', desc: 'Admin and staff sign in to manage records.', points: ['Password-protected accounts', 'Token-based sessions', 'Role labels'] },
      { icon: Search, title: 'Search & Filter', desc: 'Find any record without scrolling.', points: ['Per-module search', 'Status filters', 'Server-side queries'] },
    ],
  },
];

export default function Features() {
  return (
    <div>
      <section className="border-b bg-secondary/40">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <SectionLabel>Features &amp; Services</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Everything you need to manage the house</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete set of modules and tools — from daily record-keeping to reports, data
            inspection, and backups.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6">
        {GROUPS.map((group) => (
          <section key={group.heading}>
            <div className="flex flex-col gap-1 border-l-4 border-primary pl-4">
              <h2 className="text-2xl font-bold tracking-tight">{group.heading}</h2>
              <p className="text-muted-foreground">{group.blurb}</p>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((f) => (
                <Card key={f.title} className="flex flex-col transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-1 flex-col p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-semibold">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                    <ul className="mt-4 space-y-2 border-t pt-4">
                      {f.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}

        <div className="rounded-2xl bg-sidebar px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-bold tracking-tight">Try it for yourself</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/70">
            Sign in with the demo admin account and explore every module with live sample data.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/login">
                Sign in to the demo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
