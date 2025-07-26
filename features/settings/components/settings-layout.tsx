'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { IconUser, IconPalette, IconBell, IconShield, IconMail, IconFlask } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  description?: string;
}

const sidebarItems: SidebarItem[] = [
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: IconUser,
    description: 'Manage your personal information'
  },
  { 
    id: 'appearance', 
    label: 'Appearance', 
    icon: IconPalette,
    description: 'Customize your interface'
  },
  { 
    id: 'notifications', 
    label: 'Notifications', 
    icon: IconBell,
    description: 'Configure alerts and updates'
  },
  { 
    id: 'security', 
    label: 'Security', 
    icon: IconShield,
    description: 'Password and authentication'
  },
  { 
    id: 'email', 
    label: 'Email Preferences', 
    icon: IconMail,
    description: 'Manage email communications'
  },
  { 
    id: 'beta', 
    label: 'Beta Features', 
    icon: IconFlask,
    description: 'Try experimental features'
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
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
    <div className="flex gap-8">
      {/* Sidebar Navigation - Desktop Only */}
      <aside className="hidden lg:block w-64 flex-shrink-0" data-testid="settings-sidebar">
        <div className="sticky top-24">
          <nav className="space-y-1" aria-label="Settings navigation">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all group',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  data-testid={`sidebar-${item.id}`}
                >
                  <Icon 
                    className={cn(
                      'h-5 w-5 mt-0.5 flex-shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )} 
                  />
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'font-medium text-sm',
                      isActive ? 'text-primary' : ''
                    )}>
                      {item.label}
                    </div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {item.description}
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <div className="w-1 h-full bg-primary rounded-full absolute left-0 top-0" />
                  )}
                </button>
              );
            })}
          </nav>
          
          {/* Help Section */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Need help?</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Check our documentation or contact support for assistance.
            </p>
            <button className="text-xs text-primary hover:underline">
              View Documentation →
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}

// Mobile Tabs Component (reuse from settings-tabs.tsx for consistency)
export function MobileSettingsTabs({ children }: SettingsLayoutProps) {
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
      {/* Mobile Tabs - Horizontal Scrolling */}
      <div className="lg:hidden mb-6 -mx-4 px-4">
        <div className="flex overflow-x-auto scrollbar-hide space-x-4 pb-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
                data-testid={`mobile-tab-${item.id}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Content */}
      <div>{children}</div>
    </div>
  );
}