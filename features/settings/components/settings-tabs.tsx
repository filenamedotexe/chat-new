'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, FormToggle } from '@chat/ui';
import { IconUser, IconPalette, IconBell, IconShield, IconMail, IconFlask } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: 'profile', label: 'Profile', icon: IconUser },
  { id: 'appearance', label: 'Appearance', icon: IconPalette },
  { id: 'notifications', label: 'Notifications', icon: IconBell },
  { id: 'security', label: 'Security', icon: IconShield },
  { id: 'email', label: 'Email', icon: IconMail },
  { id: 'beta', label: 'Beta Features', icon: IconFlask },
];

interface SettingsTabsProps {
  children: React.ReactNode;
}

export function SettingsTabs({ children }: SettingsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profile';

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      {/* Desktop Tabs */}
      <div className="hidden md:block mb-8">
        <nav className="flex space-x-8 border-b" aria-label="Settings tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                )}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Tabs - Horizontal Scrolling */}
      <div className="md:hidden mb-6 -mx-4 px-4">
        <div className="flex overflow-x-auto scrollbar-hide space-x-4 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
                data-testid={`mobile-tab-${tab.id}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>{children}</div>
    </div>
  );
}

// Individual tab content components
export function ProfileTab({ session }: { session: any }) {
  return (
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
  );
}

export function AppearanceTab() {
  return (
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
  );
}

export function NotificationsTab() {
  const [notifications, setNotifications] = React.useState({
    messages: true,
    tasks: true,
    projects: true,
  });

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <IconBell className="h-6 w-6 text-muted-foreground mt-1" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <FormToggle
              label="New Messages"
              description="Get notified when you receive new messages"
              checked={notifications.messages}
              onChange={(checked) => setNotifications(prev => ({ ...prev, messages: checked }))}
              data-testid="toggle-messages"
            />
            <FormToggle
              label="Task Updates"
              description="Stay informed about task assignments and status changes"
              checked={notifications.tasks}
              onChange={(checked) => setNotifications(prev => ({ ...prev, tasks: checked }))}
              data-testid="toggle-tasks"
            />
            <FormToggle
              label="Project Updates"
              description="Receive updates about project milestones and changes"
              checked={notifications.projects}
              onChange={(checked) => setNotifications(prev => ({ ...prev, projects: checked }))}
              data-testid="toggle-projects"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-6 p-3 bg-muted/50 rounded-md">
            Note: Email notifications are not currently implemented.
          </p>
        </div>
      </div>
    </Card>
  );
}

export function SecurityTab() {
  return (
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
  );
}

export function EmailTab() {
  const [emailPrefs, setEmailPrefs] = React.useState({
    weeklySummary: true,
    dailyReminders: false,
    newsletter: true,
  });

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <IconMail className="h-6 w-6 text-muted-foreground mt-1" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-4">Email Preferences</h2>
          <div className="space-y-4">
            <FormToggle
              label="Weekly Project Summaries"
              description="Receive a weekly digest of project progress and updates"
              checked={emailPrefs.weeklySummary}
              onChange={(checked) => setEmailPrefs(prev => ({ ...prev, weeklySummary: checked }))}
              data-testid="toggle-weekly-summary"
            />
            <FormToggle
              label="Daily Task Reminders"
              description="Get daily reminders about upcoming and overdue tasks"
              checked={emailPrefs.dailyReminders}
              onChange={(checked) => setEmailPrefs(prev => ({ ...prev, dailyReminders: checked }))}
              data-testid="toggle-daily-reminders"
            />
            <FormToggle
              label="Monthly Newsletter"
              description="Stay updated with platform news and feature announcements"
              checked={emailPrefs.newsletter}
              onChange={(checked) => setEmailPrefs(prev => ({ ...prev, newsletter: checked }))}
              data-testid="toggle-newsletter"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}