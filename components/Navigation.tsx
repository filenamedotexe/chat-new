'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
  IconChevronDown,
  IconClipboardList,
  IconUserCircle,
  IconHelp
} from '@tabler/icons-react';
import { 
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  MobileMenu,
  Avatar,
  ThemeToggle,
  useTheme
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
  const { theme, setTheme } = useTheme();
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
          className={`text-sm font-medium transition-colors hover:text-primary relative ${
            pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          Dashboard
          {pathname === '/dashboard' && (
            <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-primary" />
          )}
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
          <>
            <Link
              href="/tasks"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith('/tasks') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Tasks
            </Link>
            
            <Link
              href="/organizations"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith('/organizations') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Organizations
            </Link>
          </>
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
        
        <ThemeToggle theme={theme} onToggle={toggleTheme} data-testid="theme-toggle" />
        
        <Dropdown
          align="right"
          trigger={
            <button 
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              aria-label="User menu"
            >
              <Avatar 
                fallback={user.name || user.email} 
                size="sm"
                className="ring-2 ring-background"
              />
              <span className="hidden md:inline-block max-w-[150px] truncate">
                {user.name || user.email}
              </span>
              <IconChevronDown className="h-3 w-3 opacity-50" />
            </button>
          }
        >
          <div className="w-56">
            <div className="flex items-center gap-3 p-4 border-b">
              <Avatar 
                fallback={user.name || user.email} 
                size="md"
              />
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            
            <div className="p-1">
              <DropdownItem onClick={() => router.push('/settings')}>
                <IconUserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownItem>
              <DropdownItem onClick={() => router.push('/settings')}>
                <IconSettings className="mr-2 h-4 w-4" />
                Settings
              </DropdownItem>
              <DropdownItem onClick={() => window.open('/help', '_blank')}>
                <IconHelp className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownItem>
            </div>
            
            <DropdownSeparator />
            
            <div className="p-1">
              <DropdownItem
                onClick={handleSignOut}
                destructive
                className="focus:bg-destructive/10"
              >
                <IconLogout className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownItem>
            </div>
          </div>
        </Dropdown>
      </nav>
    </nav>
  );
}

export function Navigation({ user }: NavigationProps) {
  const mobileMenu = useMobileMenuContext();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
        <nav className="flex flex-col gap-6">
          {/* Main Navigation */}
          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</h3>
            <div className="flex flex-col gap-1">
              <Link
                href="/dashboard"
                onClick={mobileMenu.close}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors ${
                  pathname === '/dashboard' ? 'bg-accent text-foreground' : ''
                }`}
              >
                <IconDashboard className="h-5 w-5" />
                Dashboard
              </Link>
            </div>
          </div>
          
          {/* Work Section */}
          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Work</h3>
            <div className="flex flex-col gap-1">
              <Link
                href="/projects"
                onClick={mobileMenu.close}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors ${
                  pathname.startsWith('/projects') ? 'bg-accent text-foreground' : ''
                }`}
              >
                <IconFolders className="h-5 w-5" />
                Projects
              </Link>
              
              {(user.role === 'admin' || user.role === 'team_member') && (
                <>
                  <Link
                    href="/tasks"
                    onClick={mobileMenu.close}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors ${
                      pathname.startsWith('/tasks') ? 'bg-accent text-foreground' : ''
                    }`}
                  >
                    <IconClipboardList className="h-5 w-5" />
                    Tasks
                  </Link>
                  
                  <Link
                    href="/organizations"
                    onClick={mobileMenu.close}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors ${
                      pathname.startsWith('/organizations') ? 'bg-accent text-foreground' : ''
                    }`}
                  >
                    <IconBriefcase className="h-5 w-5" />
                    Organizations
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Admin Section */}
          {user.role === 'admin' && (
            <div>
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</h3>
              <div className="flex flex-col gap-1">
                <Link
                  href="/admin"
                  onClick={mobileMenu.close}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors ${
                    pathname.startsWith('/admin') ? 'bg-accent text-foreground' : ''
                  }`}
                >
                  <IconShieldLock className="h-5 w-5" />
                  Admin Panel
                </Link>
                <Link
                  href="/users"
                  onClick={mobileMenu.close}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors ${
                    pathname.startsWith('/users') ? 'bg-accent text-foreground' : ''
                  }`}
                >
                  <IconUser className="h-5 w-5" />
                  Users
                </Link>
              </div>
            </div>
          )}
        </nav>
        
        {/* Account Section */}
        <div className="mb-auto">
          <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</h3>
          <div className="flex flex-col gap-1">
            <Link
              href="/settings"
              onClick={mobileMenu.close}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors ${
                pathname.startsWith('/settings') ? 'bg-accent text-foreground' : ''
              }`}
            >
              <IconSettings className="h-5 w-5" />
              Settings
            </Link>
          </div>
        </div>
        
        {/* Theme Toggle */}
        <div className="px-3 mb-4">
          <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Appearance</h3>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm">Theme</span>
            <ThemeToggle theme={theme} onToggle={toggleTheme} data-testid="mobile-theme-toggle" />
          </div>
        </div>
        
        {/* User info at bottom */}
        <div className="mt-auto pt-6 border-t">
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar 
              fallback={user.name || user.email} 
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="px-3 space-y-2 mt-2">
            <Link
              href="/settings"
              onClick={mobileMenu.close}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
            >
              <IconUserCircle className="h-5 w-5" />
              Profile Settings
            </Link>
            <button
              onClick={() => {
                handleSignOut();
                mobileMenu.close();
              }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <IconLogout className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </MobileMenu>
  );
}

Navigation.Header = NavigationHeader;