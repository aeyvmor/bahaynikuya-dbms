import { Link } from 'react-router-dom';
import { Target, Eye, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SectionLabel } from '@/components/decor';

const OBJECTIVES = [
  'Centralize tenant, room, lease, payment, and maintenance records in one database.',
  'Make vacancies, overdue balances, and pending repairs findable in seconds.',
  'Replace error-prone paper receipts with reliable, searchable digital records.',
  'Give the owner an at-a-glance view of income and occupancy each month.',
];

const PROBLEMS = [
  { problem: 'Payment records were lost in logbooks and paper receipts.', solution: 'Every payment is logged and tied to a lease and tenant.' },
  { problem: 'No fast way to check vacancies or who was overdue.', solution: 'Search, filters, and a dashboard surface this instantly.' },
  { problem: 'Maintenance requests were forgotten.', solution: 'Requests are tracked by room with priority and status.' },
];

export default function About() {
  return (
    <div>
      {/* Header */}
      <section className="border-b bg-secondary/40">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <SectionLabel>About the System</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Built for how the house really runs</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Bahay ni Kuya is a boarding house of around 30 student tenants. For years it was managed
            with logbooks and paper receipts. This system brings that operation online — accurate,
            searchable, and ready for daily use.
          </p>
        </div>
      </section>

      {/* Background */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Background</h2>
            <p className="mt-4 text-muted-foreground">
              Running a boarding house by hand means juggling who lives where, which rooms are free,
              who has paid, and what still needs fixing. As the house grew, paper records made these
              everyday questions slow and unreliable.
            </p>
            <p className="mt-4 text-muted-foreground">
              The Bahay ni Kuya Boarding House Management System digitizes the entire workflow into
              five connected modules backed by a real PostgreSQL database, so the records stay
              consistent and the answers are always one search away.
            </p>
          </div>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold">Project Purpose</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Deliver a complete, reliable records and reporting system for the boarding house —
                covering tenants, rooms, leases, payments, and maintenance.
              </p>
              <h4 className="mt-6 text-sm font-semibold">Objectives</h4>
              <ul className="mt-3 space-y-2.5">
                {OBJECTIVES.map((o) => (
                  <li key={o} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="border-y bg-secondary/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Our Mission</h3>
              <p className="mt-2 text-muted-foreground">
                To give boarding house owners a simple, dependable tool that keeps every record
                accurate and every payment accounted for — so they can focus on caring for tenants,
                not chasing paperwork.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Our Vision</h3>
              <p className="mt-2 text-muted-foreground">
                A boarding house where information is never lost, decisions are backed by clear
                reports, and managing tenants and rooms is effortless from day one.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Problem we solve */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight">The problem we solve</h2>
          <p className="mt-3 text-muted-foreground">From manual guesswork to a single, trustworthy record.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((p) => (
            <Card key={p.problem}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                  <AlertCircle className="h-4 w-4" /> Before
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.problem}</p>
                <div className="my-4 h-px bg-border" />
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-green">
                  <CheckCircle2 className="h-4 w-4" /> Now
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.solution}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link to="/features">
              See the features <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
