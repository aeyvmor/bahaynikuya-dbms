import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  /** number of grid columns to span (1 or 2) */
  colSpan?: 1 | 2;
  step?: string;
}

interface EntityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FieldDef[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  submitting?: boolean;
  submitLabel?: string;
}

function blankValues(fields: FieldDef[]): Record<string, any> {
  const v: Record<string, any> = {};
  for (const f of fields) {
    v[f.name] = f.type === 'select' && f.options?.length ? '' : '';
  }
  return v;
}

export function EntityModal({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialValues,
  onSubmit,
  submitting,
  submitLabel = 'Save',
}: EntityModalProps) {
  const [values, setValues] = useState<Record<string, any>>(blankValues(fields));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const base = blankValues(fields);
      const merged = { ...base, ...(initialValues ?? {}) };
      // normalise null -> '' for inputs
      for (const k of Object.keys(merged)) if (merged[k] === null || merged[k] === undefined) merged[k] = '';
      setValues(merged);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setField = (name: string, value: any) => setValues((prev) => ({ ...prev, [name]: value }));

  function validate(): boolean {
    const e: Record<string, string> = {};
    for (const f of fields) {
      const raw = values[f.name];
      const val = typeof raw === 'string' ? raw.trim() : raw;
      if (f.required && (val === '' || val === undefined || val === null)) {
        e[f.name] = `${f.label} is required.`;
        continue;
      }
      if (val && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        e[f.name] = 'Enter a valid email address.';
      }
      if (val && f.type === 'number' && Number(val) <= 0) {
        e[f.name] = `${f.label} must be greater than 0.`;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    // strip empty optional strings to undefined so the server uses defaults
    const payload: Record<string, any> = {};
    for (const f of fields) {
      const v = values[f.name];
      if (v === '' && !f.required) continue;
      payload[f.name] = v;
    }
    await onSubmit(payload);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.name} className={cn('space-y-1.5', f.colSpan === 2 ? 'col-span-2' : 'col-span-2 sm:col-span-1')}>
              <Label htmlFor={f.name}>
                {f.label}
                {f.required && <span className="ml-0.5 text-destructive">*</span>}
              </Label>

              {f.type === 'select' ? (
                <Select value={values[f.name] ? String(values[f.name]) : ''} onValueChange={(v) => setField(f.name, v)}>
                  <SelectTrigger id={f.name}>
                    <SelectValue placeholder={f.placeholder ?? 'Select…'} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options?.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : f.type === 'textarea' ? (
                <Textarea
                  id={f.name}
                  value={values[f.name] ?? ''}
                  placeholder={f.placeholder}
                  onChange={(e) => setField(f.name, e.target.value)}
                />
              ) : (
                <Input
                  id={f.name}
                  type={f.type}
                  step={f.step}
                  value={values[f.name] ?? ''}
                  placeholder={f.placeholder}
                  onChange={(e) => setField(f.name, e.target.value)}
                />
              )}

              {errors[f.name] && <p className="text-xs text-destructive">{errors[f.name]}</p>}
            </div>
          ))}

          <DialogFooter className="col-span-2 mt-2 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
