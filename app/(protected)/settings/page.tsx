import { auth } from '@/lib/auth/auth.config';
import { redirect } from 'next/navigation';
import { Card } from '@chat/ui';
import { IconUser, IconPalette, IconBell, IconShield, IconMail } from '@tabler/icons-react';
import { BetaFeaturesSection } from './beta-features-section';

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <IconUser className="h-6 w-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="mt-1">{session.user.name || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="mt-1">{session.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <p className="mt-1 capitalize">{session.user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Appearance Settings */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <IconPalette className="h-6 w-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-4">Appearance</h2>
              <p className="text-sm text-muted-foreground">
                Theme preferences are automatically synced with your system settings.
              </p>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <IconBell className="h-6 w-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-4">Notifications</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Email notifications for new messages</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Email notifications for task updates</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Email notifications for project updates</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Note: Email notifications are not currently implemented.
              </p>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <IconShield className="h-6 w-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-4">Security</h2>
              <p className="text-sm text-muted-foreground">
                Password management and two-factor authentication settings will be available soon.
              </p>
            </div>
          </div>
        </Card>

        {/* Beta Features */}
        <BetaFeaturesSection />

        {/* Email Preferences */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <IconMail className="h-6 w-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-4">Email Preferences</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Weekly project summaries</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Daily task reminders</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Monthly newsletters</span>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}