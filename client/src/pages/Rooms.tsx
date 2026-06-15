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
import { formatPeso, humanize } from '@/lib/format';
import type { Room } from '@/types';

const FIELDS: FieldDef[] = [
  { name: 'roomNumber', label: 'Room number', type: 'text', required: true },
  { name: 'floor', label: 'Floor', type: 'number', required: true },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'single', label: 'Single' },
      { value: 'double', label: 'Double' },
      { value: 'shared', label: 'Shared' },
    ],
  },
  { name: 'monthlyRate', label: 'Monthly rate (₱)', type: 'number', required: true, step: '0.01' },
  { name: 'maxOccupancy', label: 'Max occupancy', type: 'number', required: true },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'available', label: 'Available' },
      { value: 'occupied', label: 'Occupied' },
      { value: 'under_maintenance', label: 'Under maintenance' },
    ],
  },
];

export default function Rooms() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [toDelete, setToDelete] = useState<Room | null>(null);

  const query = qs({ search, status, type });
  const { data, isLoading } = useList<Room>('rooms', query);
  const { create, update, remove } = useCrudMutations('rooms', 'Room');

  const columns = useMemo<ColumnDef<Room>[]>(
    () => [
      {
        header: 'Room',
        accessorKey: 'roomNumber',
        cell: ({ row }) => <span className="font-medium">#{row.original.roomNumber}</span>,
      },
      { header: 'Floor', accessorKey: 'floor' },
      { header: 'Type', accessorKey: 'type', cell: ({ row }) => humanize(row.original.type) },
      {
        header: 'Monthly rate',
        accessorKey: 'monthlyRate',
        cell: ({ row }) => formatPeso(row.original.monthlyRate),
      },
      { header: 'Max occ.', accessorKey: 'maxOccupancy' },
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
  function openEdit(r: Room) {
    setEditing(r);
    setModalOpen(true);
  }

  async function handleSubmit(values: Record<string, any>) {
    if (editing) await update.mutateAsync({ id: editing.id, data: values });
    else await create.mutateAsync(values);
    setModalOpen(false);
  }

  return (
    <div>
      <PageHeader title="Rooms" description="Rooms available for lease, with rates and status.">
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Room
        </Button>
      </PageHeader>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search room number…" />
        <FilterSelect
          value={type}
          onChange={setType}
          placeholder="Type"
          options={[
            { value: 'all', label: 'All types' },
            { value: 'single', label: 'Single' },
            { value: 'double', label: 'Double' },
            { value: 'shared', label: 'Shared' },
          ]}
        />
        <FilterSelect
          value={status}
          onChange={setStatus}
          placeholder="Status"
          className="w-[180px]"
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'available', label: 'Available' },
            { value: 'occupied', label: 'Occupied' },
            { value: 'under_maintenance', label: 'Under maintenance' },
          ]}
        />
      </Toolbar>

      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} emptyMessage="No rooms found." />

      <EntityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'Edit Room' : 'Add Room'}
        description={editing ? `Update room #${editing.roomNumber}.` : 'Register a new room.'}
        fields={FIELDS}
        initialValues={editing ?? { status: 'available' }}
        onSubmit={handleSubmit}
        submitting={create.isPending || update.isPending}
        submitLabel={editing ? 'Save changes' : 'Add Room'}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete room?"
        description={
          toDelete
            ? `Room #${toDelete.roomNumber} will be permanently deleted. This is blocked if it still has leases or maintenance requests.`
            : ''
        }
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
