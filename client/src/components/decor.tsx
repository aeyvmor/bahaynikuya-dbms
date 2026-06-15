import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function WeaveBackdrop({ className, scale = 22 }: { className?: string; scale?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={cn('pointer-events-none', className)} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={`weave-${id}`} width={scale} height={scale} patternUnits="userSpaceOnUse">
          <path
            d={`M${scale / 2} 1 L${scale - 1} ${scale / 2} L${scale / 2} ${scale - 1} L1 ${scale / 2} Z`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#weave-${id})`} />
    </svg>
  );
}

export function SunBurst({ className, rays = 12 }: { className?: string; rays?: number }) {
  const spokes = Array.from({ length: rays });
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {spokes.map((_, i) => {
        const a = (i / rays) * Math.PI * 2;
        const w = 0.07;
        const tip = [50 + 46 * Math.cos(a), 50 + 46 * Math.sin(a)];
        const b1 = [50 + 24 * Math.cos(a - w), 50 + 24 * Math.sin(a - w)];
        const b2 = [50 + 24 * Math.cos(a + w), 50 + 24 * Math.sin(a + w)];
        return <path key={i} d={`M${b1[0]} ${b1[1]} L${tip[0]} ${tip[1]} L${b2[0]} ${b2[1]} Z`} />;
      })}
      <circle cx="50" cy="50" r="17" />
    </svg>
  );
}

export function HouseDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 44 L48 20 L78 44" />
      <path d="M26 40 V74 H70 V40" />
      <path d="M42 74 V58 H54 V74" />
      <circle cx="48" cy="46" r="3" />
      <path d="M70 18 l2.5 5 5 2.5 -5 2.5 -2.5 5 -2.5 -5 -5 -2.5 5 -2.5 z" />
    </svg>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary', className)}>
      <SunBurst className="h-4 w-4" rays={10} />
      {children}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  className,
}: {
  icon?: any;
  illustration?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      {illustration ?? (Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </div>
      ) : null)}
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
