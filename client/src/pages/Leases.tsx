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
import { formatDate } from '@/lib/format';
import type { Lease, Room, Tenant } from '@/types';

export default function Leases() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lease | null>(null);
  const [toDelete, setToDelete] = useState<Lease | null>(null);

  const query = qs({ search, status });
  const { data, isLoading } = useList<Lease>('leases', query);
  const { data: tenants } = useList<Tenant>('tenants', '');
  const { data: rooms } = useList<Room>('rooms', '');
  const { create, update, remove } = useCrudMutations('leases', 'Lease');

  const fields = useMemo<FieldDef[]>(
    () => [
      {
        name: 'tenantId',
        label: 'Tenant',
        type: 'select',
        required: true,
        colSpan: 2,
        options: (tenants ?? []).map((t) => ({ value: String(t.id), label: `${t.firstName} ${t.lastName}` })),
      },
      {
        name: 'roomId',
        label: 'Room',
        type: 'select',
        required: true,
        colSpan: 2,
        options: (rooms ?? []).map((r) => ({ value: String(r.id), label: `Room #${r.roomNumber} (${r.type})` })),
      },
      { name: 'startDate', label: 'Start date', type: 'date', required: true },
      { name: 'endDate', label: 'End date (optional)', type: 'date' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        colSpan: 2,
        options: [
          { value: 'active', label: 'Active' },
          { value: 'ended', label: 'Ended' },
        ],
      },
    ],
    [tenants, rooms]
  );

  const columns = useMemo<ColumnDef<Lease>[]>(
    () => [
      {
        header: 'Tenant',
        id: 'tenant',
        accessorFn: (r) => (r.tenant ? `${r.tenant.firstName} ${r.tenant.lastName}` : ''),
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.tenant ? `${row.original.tenant.firstName} ${row.original.tenant.lastName}` : `#${row.original.tenantId}`}
          </span>
        ),
      },
      {
        header: 'Room',
        id: 'room',
        accessorFn: (r) => r.room?.roomNumber ?? '',
        cell: ({ row }) => (row.original.room ? `#${row.original.room.roomNumber}` : `#${row.original.roomId}`),
      },
      { header: 'Start date', accessorKey: 'startDate', cell: ({ row }) => formatDate(row.original.startDate) },
      { header: 'End date', accessorKey: 'endDate', cell: ({ row }) => formatDate(row.original.endDate) },
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
  function openEdit(l: Lease) {
    setEditing(l);
    setModalOpen(true);
  }

  async function handleSubmit(values: Record<string, any>) {
    if (editing) await update.mutateAsync({ id: editing.id, data: values });
    else await create.mutateAsync(values);
    setModalOpen(false);
  }

  const editInitial = editing
    ? {
        tenantId: editing.tenantId,
        roomId: editing.roomId,
        startDate: editing.startDate,
        endDate: editing.endDate,
        status: editing.status,
      }
    : { status: 'active' };

  return (
    <div>
      <PageHeader title="Leases" description="Rental contracts linking tenants to rooms.">
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Lease
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
            { value: 'active', label: 'Active' },
            { value: 'ended', label: 'Ended' },
          ]}
        />
      </Toolbar>

      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} emptyMessage="No leases found." />

      <EntityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'Edit Lease' : 'Add Lease'}
        description={editing ? 'Update lease contract details.' : 'Create a new lease contract.'}
        fields={fields}
        initialValues={editInitial}
        onSubmit={handleSubmit}
        submitting={create.isPending || update.isPending}
        submitLabel={editing ? 'Save changes' : 'Add Lease'}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete lease?"
        description="This lease will be permanently deleted. Blocked if it still has payments."
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
