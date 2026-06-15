import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Where the logo links to. Pass null to render a non-clickable mark. */
  to?: string | null;
  /** Color the wordmark for dark backgrounds. */
  variant?: 'default' | 'light';
  className?: string;
}

export function Logo({ to = '/', variant = 'default', className }: LogoProps) {
  const inner = (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Building2 className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <span className={cn('block text-base font-bold tracking-tight', variant === 'light' ? 'text-white' : 'text-foreground')}>
          Bahay ni Kuya
        </span>
        <span className={cn('block text-[11px]', variant === 'light' ? 'text-white/70' : 'text-muted-foreground')}>
          Boarding House System
        </span>
      </span>
    </span>
  );

  if (to === null) return inner;
  return (
    <Link to={to} className="inline-flex">
      {inner}
    </Link>
  );
}
