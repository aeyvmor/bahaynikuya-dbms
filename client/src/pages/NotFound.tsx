import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo to="/" />
      <div className="mt-10">
        <div className="text-7xl font-bold tracking-tight text-primary">404</div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4" /> Back to home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app">
              <ArrowLeft className="h-4 w-4" /> Go to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
