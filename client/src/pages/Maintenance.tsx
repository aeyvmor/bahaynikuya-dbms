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
import type { MaintenanceRequest, Room } from '@/types';

export default function Maintenance() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRequest | null>(null);
  const [toDelete, setToDelete] = useState<MaintenanceRequest | null>(null);

  const query = qs({ search, status, priority });
  const { data, isLoading } = useList<MaintenanceRequest>('maintenance', query);
  const { data: rooms } = useList<Room>('rooms', '');
  const { create, update, remove } = useCrudMutations('maintenance', 'Request');

  const fields = useMemo<FieldDef[]>(
    () => [
      {
        name: 'roomId',
        label: 'Room',
        type: 'select',
        required: true,
        colSpan: 2,
        options: (rooms ?? []).map((r) => ({ value: String(r.id), label: `Room #${r.roomNumber} (${r.type})` })),
      },
      { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
      {
        name: 'priority',
        label: 'Priority',
        type: 'select',
        required: true,
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ],
      },
      { name: 'reportedDate', label: 'Reported date', type: 'date', required: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        colSpan: 2,
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'in_progress', label: 'In progress' },
          { value: 'resolved', label: 'Resolved' },
        ],
      },
    ],
    [rooms]
  );

  const columns = useMemo<ColumnDef<MaintenanceRequest>[]>(
    () => [
      {
        header: 'Room',
        id: 'room',
        accessorFn: (r) => r.room?.roomNumber ?? '',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.room ? `#${row.original.room.roomNumber}` : `#${row.original.roomId}`}</span>
        ),
      },
      {
        header: 'Description',
        accessorKey: 'description',
        cell: ({ row }) => <span className="line-clamp-2 max-w-sm">{row.original.description}</span>,
      },
      {
        header: 'Priority',
        accessorKey: 'priority',
        cell: ({ row }) => <StatusBadge value={row.original.priority} />,
      },
      { header: 'Reported', accessorKey: 'reportedDate', cell: ({ row }) => formatDate(row.original.reportedDate) },
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
  function openEdit(m: MaintenanceRequest) {
    setEditing(m);
    setModalOpen(true);
  }

  async function handleSubmit(values: Record<string, any>) {
    if (editing) await update.mutateAsync({ id: editing.id, data: values });
    else await create.mutateAsync(values);
    setModalOpen(false);
  }

  const editInitial = editing
    ? {
        roomId: editing.roomId,
        description: editing.description,
        priority: editing.priority,
        reportedDate: editing.reportedDate,
        status: editing.status,
      }
    : { priority: 'low', status: 'pending' };

  return (
    <div>
      <PageHeader title="Maintenance" description="Repair and maintenance requests per room.">
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Request
        </Button>
      </PageHeader>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search description or room…" />
        <FilterSelect
          value={priority}
          onChange={setPriority}
          placeholder="Priority"
          options={[
            { value: 'all', label: 'All priorities' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
        />
        <FilterSelect
          value={status}
          onChange={setStatus}
          placeholder="Status"
          className="w-[170px]"
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In progress' },
            { value: 'resolved', label: 'Resolved' },
          ]}
        />
      </Toolbar>

      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} emptyMessage="No maintenance requests found." />

      <EntityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'Edit Request' : 'Add Request'}
        description={editing ? 'Update maintenance request.' : 'Log a new maintenance request.'}
        fields={fields}
        initialValues={editInitial}
        onSubmit={handleSubmit}
        submitting={create.isPending || update.isPending}
        submitLabel={editing ? 'Save changes' : 'Add Request'}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete request?"
        description="This maintenance request will be permanently deleted."
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
