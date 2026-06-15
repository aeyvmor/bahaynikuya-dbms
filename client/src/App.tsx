import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/lib/auth';
import { RequireAuth } from '@/components/RequireAuth';
import { Layout } from '@/components/layout/Layout';
import { PublicLayout } from '@/components/layout/PublicLayout';

import Landing from '@/pages/Landing';
import About from '@/pages/About';
import Features from '@/pages/Features';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';

import Dashboard from '@/pages/Dashboard';
import Tenants from '@/pages/Tenants';
import Rooms from '@/pages/Rooms';
import Leases from '@/pages/Leases';
import Payments from '@/pages/Payments';
import Maintenance from '@/pages/Maintenance';
import Reports from '@/pages/Reports';
import Profile from '@/pages/Profile';
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
        <AuthProvider>
          <Routes>
            {/* Public marketing site */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin app (requires sign in) */}
            <Route element={<RequireAuth />}>
              <Route path="/app" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="tenants" element={<Tenants />} />
                <Route path="rooms" element={<Rooms />} />
                <Route path="leases" element={<Leases />} />
                <Route path="payments" element={<Payments />} />
                <Route path="maintenance" element={<Maintenance />} />
                <Route path="reports" element={<Reports />} />
                <Route path="database" element={<DatabasePage />} />
                <Route path="er-diagram" element={<ERDiagram />} />
                <Route path="backup" element={<Backup />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster richColors position="top-right" closeButton />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
