import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RowActions({
  onEdit,
  onDelete,
  deleteTitle = 'Delete',
}: {
  onEdit: () => void;
  onDelete: () => void;
  deleteTitle?: string;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} title="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={onDelete}
        title={deleteTitle}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
