import { Badge } from '@/components/ui/badge';
import { humanize } from '@/lib/format';

type Variant = 'green' | 'red' | 'yellow' | 'blue' | 'gray';

const MAP: Record<string, Variant> = {
  // tenant / lease
  active: 'green',
  inactive: 'gray',
  ended: 'gray',
  // room
  available: 'green',
  occupied: 'blue',
  under_maintenance: 'yellow',
  // payment
  paid: 'green',
  partial: 'yellow',
  overdue: 'red',
  // maintenance status
  pending: 'yellow',
  in_progress: 'blue',
  resolved: 'green',
  // priority
  low: 'gray',
  medium: 'yellow',
  high: 'red',
};

export function StatusBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return <Badge variant={MAP[value] ?? 'gray'}>{humanize(value)}</Badge>;
}
