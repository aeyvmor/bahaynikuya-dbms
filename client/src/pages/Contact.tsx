import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Instagram, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SectionLabel } from '@/components/decor';
import { api } from '@/lib/api';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.'),
  email: z.string().trim().email('Enter a valid email address.'),
  subject: z.string().trim().min(2, 'Please enter a subject.'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.'),
});

type FormValues = z.infer<typeof schema>;

const INFO: { icon: any; label: string; value: string; href?: string }[] = [
  { icon: MapPin, label: 'Address', value: 'Mapúa University – Makati Campus, Pablo Ocampo St., Makati City' },
  { icon: Phone, label: 'Phone', value: '+127881872', href: 'tel:+127881872' },
  { icon: Mail, label: 'Email', value: 'jeffcostales@mapua.edu.ph', href: 'mailto:jeffcostales@mapua.edu.ph' },
  { icon: Instagram, label: 'Instagram', value: '@aeyvmor', href: 'https://instagram.com/aeyvmor' },
];

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await api.post('/contact', values);
      toast.success('Message sent — thank you for reaching out!');
      reset();
    } catch (e: any) {
      toast.error(e.message || 'Could not send your message. Please try again.');
    }
  }

  return (
    <div>
      <section className="border-b bg-secondary/40">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <SectionLabel>Contact</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Get in touch</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Questions about availability, rates, or the system? Send us a message and we&apos;ll get
            back to you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Info */}
          <div className="space-y-4 lg:col-span-2">
            {INFO.map((i) => (
              <Card key={i.label}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <i.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{i.label}</div>
                    {i.href ? (
                      <a
                        href={i.href}
                        target={i.href.startsWith('http') ? '_blank' : undefined}
                        rel={i.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="mt-0.5 block truncate text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {i.value}
                      </a>
                    ) : (
                      <div className="mt-0.5 text-sm text-muted-foreground">{i.value}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Form */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6 sm:p-8">
              {isSubmitSuccessful ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Message sent</h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Thanks for reaching out. We&apos;ve received your message and will respond shortly.
                  </p>
                  <Button className="mt-6" variant="outline" onClick={() => reset()}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Juan Dela Cruz" {...register('name')} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Room availability inquiry" {...register('subject')} />
                    {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" rows={5} placeholder="How can we help?" {...register('message')} />
                    {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                      <Send className="h-4 w-4" /> {isSubmitting ? 'Sending…' : 'Send message'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
