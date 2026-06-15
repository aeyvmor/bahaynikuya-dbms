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
import type { Tenant } from '@/types';

const FIELDS: FieldDef[] = [
  { name: 'firstName', label: 'First name', type: 'text', required: true },
  { name: 'lastName', label: 'Last name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true, colSpan: 2 },
  { name: 'phone', label: 'Phone', type: 'tel', required: true },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
];

export default function Tenants() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [toDelete, setToDelete] = useState<Tenant | null>(null);

  const query = qs({ search, status });
  const { data, isLoading } = useList<Tenant>('tenants', query);
  const { create, update, remove } = useCrudMutations('tenants', 'Tenant');

  const columns = useMemo<ColumnDef<Tenant>[]>(
    () => [
      {
        header: 'Name',
        accessorFn: (r) => `${r.firstName} ${r.lastName}`,
        id: 'name',
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </span>
        ),
      },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Phone', accessorKey: 'phone' },
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
          <RowActions
            onEdit={() => openEdit(row.original)}
            onDelete={() => setToDelete(row.original)}
            deleteTitle="Archive (soft-delete)"
          />
        ),
      },
    ],
    []
  );

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(t: Tenant) {
    setEditing(t);
    setModalOpen(true);
  }

  async function handleSubmit(values: Record<string, any>) {
    if (editing) {
      await update.mutateAsync({ id: editing.id, data: values });
    } else {
      await create.mutateAsync(values);
    }
    setModalOpen(false);
  }

  return (
    <div>
      <PageHeader title="Tenants" description="Student boarders renting rooms in the house.">
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Tenant
        </Button>
      </PageHeader>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, email, phone…" />
        <FilterSelect
          value={status}
          onChange={setStatus}
          placeholder="Status"
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </Toolbar>

      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} emptyMessage="No tenants found." />

      <EntityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'Edit Tenant' : 'Add Tenant'}
        description={editing ? `Update ${editing.firstName} ${editing.lastName}.` : 'Register a new tenant.'}
        fields={FIELDS}
        initialValues={editing ?? { status: 'active' }}
        onSubmit={handleSubmit}
        submitting={create.isPending || update.isPending}
        submitLabel={editing ? 'Save changes' : 'Add Tenant'}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Archive tenant?"
        description={
          toDelete
            ? `${toDelete.firstName} ${toDelete.lastName} will be set to inactive (soft-delete). Their records are preserved.`
            : ''
        }
        confirmLabel="Archive"
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
