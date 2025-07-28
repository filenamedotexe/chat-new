'use client';

import { signOut as supabaseSignOut } from '@/lib/supabase/auth-browser';
import { IconLogout, IconUser, IconSettings } from '@tabler/icons-react';
import { Avatar, Dropdown, DropdownItem, DropdownSeparator } from '@chat/ui';
import Link from 'next/link';

interface UserMenuProps {
  user: {
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted">
          <Avatar 
            src={user.image || undefined} 
            alt={user.name || user.email || 'User'} 
            fallback={user.name?.[0] || user.email?.[0] || 'U'}
            size="sm"
          />
          <span className="text-sm font-medium">
            {user.name || user.email}
          </span>
        </button>
      }
      align="right"
      className="w-56"
    >
      <div className="px-2 py-1.5">
        <p className="text-sm font-medium">{user.name || 'User'}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
      <DropdownSeparator />
      <DropdownItem onClick={() => window.location.href = '/profile'}>
        <IconUser className="h-4 w-4 mr-2" />
        Profile
      </DropdownItem>
      <DropdownItem onClick={() => window.location.href = '/settings'}>
        <IconSettings className="h-4 w-4 mr-2" />
        Settings
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem
        onClick={async () => {
          await supabaseSignOut();
          window.location.href = '/login';
        }}
        destructive
      >
        <IconLogout className="h-4 w-4 mr-2" />
        Sign Out
      </DropdownItem>
    </Dropdown>
  );
}