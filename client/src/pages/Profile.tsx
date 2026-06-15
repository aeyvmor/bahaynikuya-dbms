import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Shield, Calendar, Save, KeyRound } from 'lucide-react';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate, humanize } from '@/lib/format';
import type { User } from '@/types';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  email: z.string().trim().email('Enter a valid email address.'),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
    confirm: z.string().min(1, 'Please confirm the new password.'),
  })
  .refine((d) => d.newPassword === d.confirm, { message: 'Passwords do not match.', path: ['confirm'] });
type PasswordValues = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user, setUser } = useAuth();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  async function saveProfile(values: ProfileValues) {
    try {
      const res = await api.put<{ user: User }>('/auth/profile', values);
      setUser(res.user);
      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e.message || 'Could not update profile');
    }
  }

  async function changePassword(values: PasswordValues) {
    try {
      await api.put('/auth/password', { currentPassword: values.currentPassword, newPassword: values.newPassword });
      passwordForm.reset();
      toast.success('Password changed');
    } catch (e: any) {
      toast.error(e.message || 'Could not change password');
    }
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account details and password." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Summary card */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {initials}
            </div>
            <h2 className="mt-4 text-lg font-semibold">{user?.name}</h2>
            <Badge variant="blue" className="mt-2 capitalize">
              {humanize(user?.role)}
            </Badge>

            <div className="mt-6 w-full space-y-3 border-t pt-5 text-left text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Shield className="h-4 w-4 shrink-0" />
                <span className="capitalize">{humanize(user?.role)} account</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Member since {formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" /> Account details
              </CardTitle>
              <CardDescription>Update your display name and email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(saveProfile)} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" {...profileForm.register('name')} />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...profileForm.register('email')} />
                  {profileForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                    <Save className="h-4 w-4" /> {profileForm.formState.isSubmitting ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" /> Change password
              </CardTitle>
              <CardDescription>Use at least 6 characters for your new password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(changePassword)} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input id="currentPassword" type="password" autoComplete="current-password" {...passwordForm.register('currentPassword')} />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input id="newPassword" type="password" autoComplete="new-password" {...passwordForm.register('newPassword')} />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm new password</Label>
                  <Input id="confirm" type="password" autoComplete="new-password" {...passwordForm.register('confirm')} />
                  {passwordForm.formState.errors.confirm && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.confirm.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="outline" disabled={passwordForm.formState.isSubmitting}>
                    <KeyRound className="h-4 w-4" /> {passwordForm.formState.isSubmitting ? 'Updating…' : 'Update password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
