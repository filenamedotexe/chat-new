'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  IconMessage, 
  IconDashboard, 
  IconFolders, 
  IconBriefcase, 
  IconShieldLock,
  IconUser,
  IconSettings,
  IconLogout,
  IconMenu2,
  IconX,
  IconChevronDown
} from '@tabler/icons-react';
import { 
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  MobileMenu
} from '@chat/ui';
import { useMobileMenuContext } from '@/lib/contexts/mobile-menu-context';
import type { UserRole } from '@chat/shared-types';

interface NavigationProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  };
}

function NavigationHeader({ user }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const mobileMenu = useMobileMenuContext();
  
  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST'
      });
      
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <nav className="w-full flex items-center justify-between">
      {/* Logo/Brand */}
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
        <IconMessage className="h-6 w-6" />
        <span className="hidden sm:inline">Agency Platform</span>
      </Link>
      
      {/* Mobile menu button */}
      <button
        onClick={mobileMenu.toggle}
        className="p-3 rounded-md hover:bg-accent md:hidden min-w-[44px] min-h-[44px]"
        aria-label="Toggle menu"
        data-mobile-menu-trigger
      >
        <IconMenu2 className="h-5 w-5" />
      </button>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        <Link
          href="/dashboard"
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          Dashboard
        </Link>
        
        <Link
          href="/projects"
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname.startsWith('/projects') ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          Projects
        </Link>
        
        {(user.role === 'admin' || user.role === 'team_member') && (
          <Link
            href="/organizations"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname.startsWith('/organizations') ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Organizations
          </Link>
        )}
        
        {user.role === 'admin' && (
          <Link
            href="/admin"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname.startsWith('/admin') ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Admin
          </Link>
        )}
        
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <IconUser className="h-4 w-4" />
              {user.name || user.email}
              <IconChevronDown className="h-3 w-3" />
            </button>
          }
        >
          <div className="p-2">
            <div className="flex flex-col space-y-1 px-2 py-1.5">
              <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <DropdownSeparator />
          <DropdownItem onClick={() => router.push('/settings')}>
            <IconSettings className="mr-2 h-4 w-4" />
            Settings
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem
            onClick={handleSignOut}
            destructive
          >
            <IconLogout className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownItem>
        </Dropdown>
      </nav>
    </nav>
  );
}

export function Navigation({ user }: NavigationProps) {
  const mobileMenu = useMobileMenuContext();
  const router = useRouter();
  
  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST'
      });
      
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <MobileMenu isOpen={mobileMenu.isOpen} onClose={mobileMenu.close}>
      <div className="flex flex-col h-full">
        {/* Close button */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-semibold">Menu</span>
          <button
            onClick={mobileMenu.close}
            className="p-3 rounded-md hover:bg-accent min-w-[44px] min-h-[44px]"
            aria-label="Close menu"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>
        
        {/* Mobile navigation links */}
        <nav className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            onClick={mobileMenu.close}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
          >
            <IconDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          
          <Link
            href="/projects"
            onClick={mobileMenu.close}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
          >
            <IconFolders className="h-5 w-5" />
            Projects
          </Link>
          
          {(user.role === 'admin' || user.role === 'team_member') && (
            <Link
              href="/organizations"
              onClick={mobileMenu.close}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
            >
              <IconBriefcase className="h-5 w-5" />
              Organizations
            </Link>
          )}
          
          {user.role === 'admin' && (
            <Link
              href="/admin"
              onClick={mobileMenu.close}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
            >
              <IconShieldLock className="h-5 w-5" />
              Admin
            </Link>
          )}
        </nav>
        
        {/* User info at bottom */}
        <div className="mt-auto pt-6 border-t">
          <div className="px-3 py-2">
            <p className="text-sm font-medium">{user.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 mt-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <IconLogout className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </MobileMenu>
  );
}

Navigation.Header = NavigationHeader;