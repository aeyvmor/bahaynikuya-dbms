import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, Upload, FileJson, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { api } from '@/lib/api';

export default function Backup() {
  const qc = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [pending, setPending] = useState<{ name: string; payload: any } | null>(null);
  const [restoring, setRestoring] = useState(false);

  async function handleExport() {
    try {
      setExporting(true);
      const data = await api.get<any>('/backup');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `bahay-ni-kuya-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Backup exported');
    } catch (e: any) {
      toast.error(e.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result));
        setPending({ name: file.name, payload });
      } catch {
        toast.error('That file is not valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function confirmRestore() {
    if (!pending) return;
    try {
      setRestoring(true);
      const res = await api.post<any>('/restore', pending.payload);
      await qc.invalidateQueries();
      toast.success(
        `Restored — ${res?.counts?.tenants ?? '?'} tenants, ${res?.counts?.rooms ?? '?'} rooms, ${
          res?.counts?.payments ?? '?'
        } payments`
      );
      setPending(null);
    } catch (e: any) {
      toast.error(e.message || 'Restore failed');
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div>
      <PageHeader title="Backup & Restore" description="Export all data to a file, or restore from a previous backup." />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-4 w-4 text-emerald-600" /> Export Backup
            </CardTitle>
            <CardDescription>
              Download every table (tenants, rooms, leases, payments, maintenance) as a single JSON file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
              <FileJson className="h-5 w-5 shrink-0" />
              <span>
                Saved as <span className="font-mono">bahay-ni-kuya-backup-YYYY-MM-DD.json</span>
              </span>
            </div>
            <Button onClick={handleExport} disabled={exporting}>
              <Download className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export to JSON'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-600" /> Restore Backup
            </CardTitle>
            <CardDescription>Upload a backup JSON file to replace all current data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>Restoring overwrites the entire database. Export a backup first if unsure.</span>
            </div>
            <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={onFilePicked} />
            <Button variant="outline" onClick={() => fileInput.current?.click()}>
              <Upload className="h-4 w-4" /> Choose backup file…
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title="Restore from backup?"
        description={
          pending ? (
            <>
              This will <strong>replace all current data</strong> with the contents of{' '}
              <span className="font-mono">{pending.name}</span>. This cannot be undone.
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Restore & overwrite"
        destructive
        loading={restoring}
        onConfirm={confirmRestore}
      />
    </div>
  );
}
