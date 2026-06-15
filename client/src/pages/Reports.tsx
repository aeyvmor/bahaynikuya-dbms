import { useQuery } from '@tanstack/react-query';
import { Banknote, BedDouble, AlertTriangle, FileText, Printer, Wrench } from 'lucide-react';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useList } from '@/hooks/useCrud';
import { api } from '@/lib/api';
import { formatPeso, humanize } from '@/lib/format';
import type { Dashboard as DashboardData, Room, MaintenanceRequest } from '@/types';

function SummaryCard({ icon: Icon, tone, label, value, hint }: { icon: any; tone: string; label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-3 text-2xl font-bold">{value}</div>
        {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

const PRIORITIES = ['high', 'medium', 'low'] as const;
const STATUSES = ['pending', 'in_progress', 'resolved'] as const;

export default function Reports() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardData>('/dashboard'),
  });
  const { data: rooms } = useList<Room>('rooms', '');
  const { data: maintenance } = useList<MaintenanceRequest>('maintenance', '');

  const generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const byPriority = (p: string) => (maintenance ?? []).filter((m) => m.priority === p).length;
  const byStatus = (s: string) => (maintenance ?? []).filter((m) => m.status === s).length;

  return (
    <div>
      <PageHeader title="Reports" description={`Operational summary · Generated ${generatedOn}`}>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer className="h-4 w-4" /> Print / Export
        </Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[120px] rounded-xl" />)
        ) : (
          <>
            <SummaryCard icon={Banknote} tone="bg-brand-green/15 text-brand-green" label={`Income — ${data.month}`} value={formatPeso(data.incomeThisMonth)} hint="Paid payments this month" />
            <SummaryCard icon={BedDouble} tone="bg-brand-blue/25 text-[#2f5d86]" label="Occupancy" value={`${data.occupancy.rate}%`} hint={`${data.occupancy.occupied} of ${data.occupancy.total} rooms`} />
            <SummaryCard icon={AlertTriangle} tone="bg-brand-red/15 text-brand-red" label="Outstanding" value={formatPeso(data.overdueTotal)} hint={`${data.overdue.length} payment(s)`} />
            <SummaryCard icon={FileText} tone="bg-brand-charcoal/10 text-brand-charcoal" label="Active leases" value={String(data.activeLeases)} hint={`${data.activeTenants} active tenants`} />
          </>
        )}
      </div>

      {/* Occupancy by room */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-muted-foreground" /> Room Occupancy
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Monthly rate</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rooms ?? []).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-6 font-medium">#{r.roomNumber}</TableCell>
                  <TableCell>{humanize(r.type)}</TableCell>
                  <TableCell>{formatPeso(r.monthlyRate)}</TableCell>
                  <TableCell>{r.maxOccupancy}</TableCell>
                  <TableCell className="pr-6">
                    <StatusBadge value={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Outstanding balances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Outstanding Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {!data || data.overdue.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">No outstanding balances.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Tenant</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.overdue.map((o) => (
                    <TableRow key={o.paymentId}>
                      <TableCell className="pl-6 font-medium">{o.tenant}</TableCell>
                      <TableCell>#{o.roomNumber}</TableCell>
                      <TableCell>{formatPeso(o.amount)}</TableCell>
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

        {/* Maintenance overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" /> Maintenance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">By status</div>
              <div className="grid grid-cols-3 gap-3">
                {STATUSES.map((s) => (
                  <div key={s} className="rounded-lg border p-3 text-center">
                    <div className="text-xl font-bold">{byStatus(s)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{humanize(s)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">By priority</div>
              <div className="space-y-2">
                {PRIORITIES.map((p) => (
                  <div key={p} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <StatusBadge value={p} />
                    </span>
                    <span className="font-semibold">{byPriority(p)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
