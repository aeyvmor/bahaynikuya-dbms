import { useQuery } from '@tanstack/react-query';
import { Banknote, BedDouble, AlertTriangle, FileText, Wrench, PartyPopper } from 'lucide-react';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/decor';
import { api } from '@/lib/api';
import { formatPeso, humanize } from '@/lib/format';
import type { Dashboard as DashboardData } from '@/types';

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: any;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="truncate text-2xl font-bold">{value}</div>
          {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

const MAINT_META: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-500' },
  in_progress: { label: 'In progress', color: 'bg-brand-blue' },
  resolved: { label: 'Resolved', color: 'bg-brand-green' },
};

export default function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardData>('/dashboard'),
  });

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of income, occupancy, overdue balances, and maintenance." />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-xl" />)
        ) : (
          <>
            <StatCard
              title={`Income — ${data.month}`}
              value={formatPeso(data.incomeThisMonth)}
              hint="Sum of paid payments this month"
              icon={Banknote}
              accent="bg-brand-green/15 text-brand-green"
            />
            <StatCard
              title="Occupancy rate"
              value={`${data.occupancy.rate}%`}
              hint={`${data.occupancy.occupied} of ${data.occupancy.total} rooms occupied`}
              icon={BedDouble}
              accent="bg-brand-blue/25 text-[#2f5d86]"
            />
            <StatCard
              title="Overdue payments"
              value={formatPeso(data.overdueTotal)}
              hint={`${data.overdue.length} outstanding payment${data.overdue.length === 1 ? '' : 's'}`}
              icon={AlertTriangle}
              accent="bg-brand-red/15 text-brand-red"
            />
            <StatCard
              title="Active leases"
              value={String(data.activeLeases)}
              hint={`${data.activeTenants} active tenants`}
              icon={FileText}
              accent="bg-brand-charcoal/10 text-brand-charcoal"
            />
          </>
        )}
      </div>

      {/* Overdue + Maintenance */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Overdue list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Overdue Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {isLoading || !data ? (
              <div className="space-y-2 px-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data.overdue.length === 0 ? (
              <EmptyState
                icon={PartyPopper}
                title="All settled!"
                description="No overdue or partial balances right now — everyone's paid up."
                className="py-10"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Tenant</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Days overdue</TableHead>
                    <TableHead className="pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.overdue.map((o) => (
                    <TableRow key={o.paymentId}>
                      <TableCell className="pl-6 font-medium">{o.tenant}</TableCell>
                      <TableCell>#{o.roomNumber}</TableCell>
                      <TableCell>{formatPeso(o.amount)}</TableCell>
                      <TableCell>
                        <span className={o.daysOverdue > 0 ? 'font-semibold text-destructive' : 'text-muted-foreground'}>
                          {o.daysOverdue} day{o.daysOverdue === 1 ? '' : 's'}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6">
                        <StatusBadge value={o.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Maintenance summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" /> Maintenance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(['pending', 'in_progress', 'resolved'] as const).map((key) => {
                  const count = data.maintenanceByStatus[key] ?? 0;
                  const total = data.maintenanceTotal || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{MAINT_META[key].label}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className={`h-full ${MAINT_META[key].color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <div className="border-t pt-3 text-sm text-muted-foreground">
                  {data.maintenanceTotal} total request{data.maintenanceTotal === 1 ? '' : 's'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
