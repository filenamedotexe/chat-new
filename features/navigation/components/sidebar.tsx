'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  IconDashboard, 
  IconUsers, 
  IconFolders, 
  IconChecklist,
  IconMessage,
  IconSettings,
  IconShield,
  IconFiles,
  IconChartBar,
  IconBuilding
} from '@tabler/icons-react';
import { UserRole } from '@/lib/auth/permissions';

interface NavItem {
  title: string;
  href: string | ((userId: string) => string);
  icon: React.ReactNode;
  roles?: UserRole[];
}

const getNavItems = (userId: string): NavItem[] => [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <IconDashboard className="h-5 w-5" />,
  },
  {
    title: 'Admin Panel',
    href: '/admin',
    icon: <IconShield className="h-5 w-5" />,
    roles: ['admin'],
  },
  {
    title: 'Organizations',
    href: '/organizations',
    icon: <IconBuilding className="h-5 w-5" />,
    roles: ['admin', 'team_member'],
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: <IconFolders className="h-5 w-5" />,
  },
  {
    title: 'My Tasks',
    href: '/tasks',
    icon: <IconChecklist className="h-5 w-5" />,
  },
  {
    title: 'My Files',
    href: `/users/${userId}/files`,
    icon: <IconFiles className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <IconSettings className="h-5 w-5" />,
  },
];

interface SidebarProps {
  userRole: UserRole;
  userId: string;
}

export function Sidebar({ userRole, userId }: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItems(userId);

  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true; // Show to all roles
    return item.roles.includes(userRole);
  });

  return (
    <nav className="space-y-1">
      {filteredItems.map((item) => {
        const href = typeof item.href === 'function' ? item.href(userId) : item.href;
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={`
              flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }
            `}
          >
            {item.icon}
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}