import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Database } from 'lucide-react';
import { PageHeader } from '@/components/layout/Layout';
import { DataTable } from '@/components/DataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useList } from '@/hooks/useCrud';
import { humanize } from '@/lib/format';

const TABLES = [
  { key: 'tenants', endpoint: 'tenants', table: 'tenants', label: 'tenants' },
  { key: 'rooms', endpoint: 'rooms', table: 'rooms', label: 'rooms' },
  { key: 'leases', endpoint: 'leases', table: 'leases', label: 'leases' },
  { key: 'payments', endpoint: 'payments', table: 'payments', label: 'payments' },
  { key: 'maintenance', endpoint: 'maintenance', table: 'maintenance_requests', label: 'maintenance_requests' },
];

export default function DatabasePage() {
  const [selected, setSelected] = useState(TABLES[0].key);
  const current = TABLES.find((t) => t.key === selected)!;
  const { data, isLoading } = useList<Record<string, any>>(current.endpoint, '');

  const columns = useMemo<ColumnDef<Record<string, any>>[]>(() => {
    const rows = data ?? [];
    if (!rows.length) return [];
    // raw scalar columns only (skip nested relation objects)
    const keys = Object.keys(rows[0]).filter((k) => {
      const v = rows[0][k];
      return v === null || typeof v !== 'object';
    });
    return keys.map((k) => ({
      accessorKey: k,
      header: k,
      cell: ({ row }) => {
        const v = row.original[k];
        if (v === null || v === undefined) return <span className="text-muted-foreground">null</span>;
        return <span className="font-mono text-xs">{String(v)}</span>;
      },
    }));
  }, [data]);

  return (
    <div>
      <PageHeader
        title="Database Inspector"
        description="Browse the raw rows of each PostgreSQL table — sortable and paginated (read-only)."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Database className="h-4 w-4" /> Table
        </div>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-[260px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TABLES.map((t) => (
              <SelectItem key={t.key} value={t.key}>
                {t.table}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="gray" className="font-mono">
          {data?.length ?? 0} rows
        </Badge>
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        emptyMessage={`No rows in ${current.table}.`}
        pageSize={15}
      />

      <p className="mt-3 text-xs text-muted-foreground">
        Showing scalar columns from <span className="font-mono">{current.table}</span>. Relations are normalised away
        (e.g. <span className="font-mono">tenant_id</span> as a foreign key). For full editing use the module pages or{' '}
        <span className="font-mono">npx prisma studio</span>.
      </p>
    </div>
  );
}
