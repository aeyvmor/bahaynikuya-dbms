import { Link } from 'react-router-dom';
import { ArrowRight, Users, Receipt, Wrench, BarChart3, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WeaveBackdrop, SunBurst, HouseDoodle, SectionLabel } from '@/components/decor';

const FEATURES = [
  { icon: Users, title: 'People & rooms', desc: 'Keep tenants, rooms, and leases in one tidy place.' },
  { icon: Receipt, title: 'Payments', desc: 'Log rent and see who still owes at a glance.' },
  { icon: Wrench, title: 'Maintenance', desc: 'Track repairs by room until they are done.' },
  { icon: BarChart3, title: 'Reports', desc: 'Income and occupancy, always up to date.' },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <WeaveBackdrop className="absolute inset-0 h-full w-full text-brand-charcoal/[0.05]" />
        <SunBurst className="absolute -right-16 -top-16 h-64 w-64 text-brand-green/10" />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 sm:py-28">
          <SectionLabel>A community boarding house</SectionLabel>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Manage the house,
            <br />
            <span className="text-primary">the warm way.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Bahay ni Kuya keeps your tenants, rooms, payments, and repairs in one friendly place —
            so you can spend less time on paperwork and more time with people.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/register">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/features">Explore features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features preview */}
      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border-border/70 transition-transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* About preview */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-sidebar p-10 text-sidebar-foreground">
            <WeaveBackdrop className="absolute inset-0 h-full w-full text-white/[0.06]" />
            <div className="relative flex items-end justify-center gap-3">
              <HouseDoodle className="h-24 w-24 text-brand-cream/90" />
              <HouseDoodle className="h-32 w-32 text-white" />
              <HouseDoodle className="h-20 w-20 text-brand-blue/90" />
            </div>
            <p className="relative mt-6 text-center text-sm text-sidebar-muted">A home for every record.</p>
          </div>
          <div>
            <SectionLabel>About the project</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Built for a real boarding house</h2>
            <p className="mt-4 text-muted-foreground">
              Bahay ni Kuya is home to around 30 student boarders. This system replaces the old
              logbooks and paper receipts with something simple, reliable, and made just for the way
              the house runs.
            </p>
            <Button asChild variant="link" className="mt-3 px-0 text-primary">
              <Link to="/about">
                Read the story <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact preview */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center gap-5 p-10 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/20 text-[#2f5d86]">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Have a question?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We&apos;d love to hear from you — reach out anytime.
                </p>
              </div>
            </div>
            <Button asChild size="lg">
              <Link to="/contact">Contact us</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
