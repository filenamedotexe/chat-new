'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { IconLogout, IconDashboard, IconShieldLock, IconPalette } from '@tabler/icons-react';
import { Avatar, Dropdown, DropdownItem, DropdownSeparator, ThemeToggle } from '@chat/ui';
import { useTheme } from '@chat/ui';
import type { User } from '@chat/shared-types';

interface NavigationProps {
  user: User;
}

export function Navigation({ user }: NavigationProps) {
  const router = useRouter();
  const { theme, setTheme, themes } = useTheme();
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const toggleTheme = () => {
    const themeNames = Object.keys(themes) as Array<keyof typeof themes>;
    const currentIndex = themeNames.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    setTheme(themeNames[nextIndex]);
  };

  return (
    <nav className="flex items-center justify-between w-full">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-bold">
          {process.env.NEXT_PUBLIC_APP_NAME || 'Chat App'}
        </Link>
        
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          
          {user.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconShieldLock className="h-4 w-4" />
              Admin
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 p-1 rounded-md hover:bg-accent transition-colors">
              <IconPalette className="h-5 w-5" />
            </button>
          }
          align="right"
        >
          <div className="p-2">
            <p className="text-sm font-medium mb-2">Select Theme</p>
            {Object.keys(themes).map((themeName) => (
              <DropdownItem
                key={themeName}
                onClick={() => setTheme(themeName as keyof typeof themes)}
                className={theme === themeName ? 'bg-accent' : ''}
              >
                {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
              </DropdownItem>
            ))}
          </div>
        </Dropdown>

        <ThemeToggle theme={theme} onToggle={toggleTheme} />

        <Dropdown
          trigger={
            <Avatar
              fallback={user.name || user.email}
              className="cursor-pointer"
            />
          }
          align="right"
        >
          <div className="p-2">
            <p className="text-sm font-medium">{user.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownSeparator />
          <DropdownItem onClick={handleSignOut} destructive>
            <IconLogout className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownItem>
        </Dropdown>
      </div>
    </nav>
  );
}