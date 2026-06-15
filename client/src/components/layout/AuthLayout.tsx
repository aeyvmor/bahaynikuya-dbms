import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { WeaveBackdrop, SunBurst } from '@/components/decor';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <WeaveBackdrop className="absolute inset-0 h-full w-full text-brand-charcoal/[0.05]" />
      <SunBurst className="absolute -bottom-24 -left-24 h-80 w-80 text-brand-green/[0.07]" />

      <div className="relative w-full max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <Logo to="/" />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>

        <Card className="shadow-[0_8px_40px_-12px_rgba(66,75,84,0.18)]">
          <CardContent className="p-7 sm:p-9">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
