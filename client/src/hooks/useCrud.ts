import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export function useList<T>(resource: string, query = '') {
  return useQuery<T[]>({
    queryKey: [resource, query],
    queryFn: () => api.get<T[]>(`/${resource}${query}`),
  });
}

export function useCrudMutations(resource: string, label: string) {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [resource] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    qc.invalidateQueries({ queryKey: ['backup'] });
    // related joins (e.g. payments depend on leases/tenants/rooms)
    ['tenants', 'rooms', 'leases', 'payments', 'maintenance'].forEach((r) =>
      qc.invalidateQueries({ queryKey: [r] })
    );
  };

  const create = useMutation({
    mutationFn: (data: any) => api.post(`/${resource}`, data),
    onSuccess: () => {
      invalidate();
      toast.success(`${label} created`);
    },
    onError: (e: any) => toast.error(e.message || `Failed to create ${label.toLowerCase()}`),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/${resource}/${id}`, data),
    onSuccess: () => {
      invalidate();
      toast.success(`${label} updated`);
    },
    onError: (e: any) => toast.error(e.message || `Failed to update ${label.toLowerCase()}`),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.del(`/${resource}/${id}`),
    onSuccess: (res: any) => {
      invalidate();
      toast.success(res?.softDeleted ? `${label} archived (set inactive)` : `${label} deleted`);
    },
    onError: (e: any) => toast.error(e.message || `Failed to delete ${label.toLowerCase()}`),
  });

  return { create, update, remove };
}
