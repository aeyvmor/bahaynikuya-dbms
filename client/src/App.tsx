import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

import { Layout } from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Tenants from '@/pages/Tenants';
import Rooms from '@/pages/Rooms';
import Leases from '@/pages/Leases';
import Payments from '@/pages/Payments';
import Maintenance from '@/pages/Maintenance';
import DatabasePage from '@/pages/DatabasePage';
import ERDiagram from '@/pages/ERDiagram';
import Backup from '@/pages/Backup';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 10_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/leases" element={<Leases />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/database" element={<DatabasePage />} />
            <Route path="/er-diagram" element={<ERDiagram />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" closeButton />
    </QueryClientProvider>
  );
}
