import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import { EntityModal, type FieldDef } from '@/components/EntityModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { RowActions } from '@/components/RowActions';
import { Toolbar, SearchInput, FilterSelect } from '@/components/Toolbar';
import { useList, useCrudMutations } from '@/hooks/useCrud';
import { qs } from '@/lib/api';
import { formatDate, formatPeso } from '@/lib/format';
import type { Lease, Payment } from '@/types';

function leaseLabel(l: Lease): string {
  const who = l.tenant ? `${l.tenant.firstName} ${l.tenant.lastName}` : `Tenant #${l.tenantId}`;
  const room = l.room ? `Room #${l.room.roomNumber}` : `Room #${l.roomId}`;
  return `Lease #${l.id} — ${who} (${room})`;
}

export default function Payments() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [toDelete, setToDelete] = useState<Payment | null>(null);

  const query = qs({ search, status });
  const { data, isLoading } = useList<Payment>('payments', query);
  const { data: leases } = useList<Lease>('leases', '');
  const { create, update, remove } = useCrudMutations('payments', 'Payment');

  const fields = useMemo<FieldDef[]>(
    () => [
      {
        name: 'leaseId',
        label: 'Lease',
        type: 'select',
        required: true,
        colSpan: 2,
        options: (leases ?? []).map((l) => ({ value: String(l.id), label: leaseLabel(l) })),
      },
      { name: 'amount', label: 'Amount (₱)', type: 'number', required: true, step: '0.01' },
      { name: 'paymentDate', label: 'Payment date', type: 'date', required: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        colSpan: 2,
        options: [
          { value: 'paid', label: 'Paid' },
          { value: 'partial', label: 'Partial' },
          { value: 'overdue', label: 'Overdue' },
        ],
      },
    ],
    [leases]
  );

  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        header: 'Tenant',
        id: 'tenant',
        accessorFn: (r) => (r.lease?.tenant ? `${r.lease.tenant.firstName} ${r.lease.tenant.lastName}` : ''),
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.lease?.tenant
              ? `${row.original.lease.tenant.firstName} ${row.original.lease.tenant.lastName}`
              : `Lease #${row.original.leaseId}`}
          </span>
        ),
      },
      {
        header: 'Room',
        id: 'room',
        accessorFn: (r) => r.lease?.room?.roomNumber ?? '',
        cell: ({ row }) => (row.original.lease?.room ? `#${row.original.lease.room.roomNumber}` : '—'),
      },
      {
        header: 'Amount',
        accessorKey: 'amount',
        cell: ({ row }) => <span className="font-medium">{formatPeso(row.original.amount)}</span>,
      },
      { header: 'Date', accessorKey: 'paymentDate', cell: ({ row }) => formatDate(row.original.paymentDate) },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge value={row.original.status} />,
      },
      {
        header: () => <div className="text-right">Actions</div>,
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <RowActions onEdit={() => openEdit(row.original)} onDelete={() => setToDelete(row.original)} />
        ),
      },
    ],
    []
  );

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(p: Payment) {
    setEditing(p);
    setModalOpen(true);
  }

  async function handleSubmit(values: Record<string, any>) {
    if (editing) await update.mutateAsync({ id: editing.id, data: values });
    else await create.mutateAsync(values);
    setModalOpen(false);
  }

  const editInitial = editing
    ? { leaseId: editing.leaseId, amount: editing.amount, paymentDate: editing.paymentDate, status: editing.status }
    : { status: 'paid' };

  return (
    <div>
      <PageHeader title="Payments" description="Rent payments recorded against leases.">
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Payment
        </Button>
      </PageHeader>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search tenant or room…" />
        <FilterSelect
          value={status}
          onChange={setStatus}
          placeholder="Status"
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'paid', label: 'Paid' },
            { value: 'partial', label: 'Partial' },
            { value: 'overdue', label: 'Overdue' },
          ]}
        />
      </Toolbar>

      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} emptyMessage="No payments found." />

      <EntityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'Edit Payment' : 'Add Payment'}
        description={editing ? 'Update payment record.' : 'Record a new rent payment.'}
        fields={fields}
        initialValues={editInitial}
        onSubmit={handleSubmit}
        submitting={create.isPending || update.isPending}
        submitLabel={editing ? 'Save changes' : 'Add Payment'}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete payment?"
        description={toDelete ? `This ${formatPeso(toDelete.amount)} payment will be permanently deleted.` : ''}
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={async () => {
          if (toDelete) await remove.mutateAsync(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
