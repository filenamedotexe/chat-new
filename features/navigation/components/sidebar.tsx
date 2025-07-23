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
  IconFileCheck,
  IconChartBar,
  IconBuilding
} from '@tabler/icons-react';
import { UserRole } from '@/lib/auth/permissions';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
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
    title: 'Tasks',
    href: '/tasks',
    icon: <IconChecklist className="h-5 w-5" />,
  },
  {
    title: 'Approvals',
    href: '/approvals',
    icon: <IconFileCheck className="h-5 w-5" />,
    roles: ['client'],
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: <IconMessage className="h-5 w-5" />,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: <IconChartBar className="h-5 w-5" />,
    roles: ['admin', 'team_member'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <IconSettings className="h-5 w-5" />,
  },
];

interface SidebarProps {
  userRole: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true; // Show to all roles
    return item.roles.includes(userRole);
  });

  return (
    <nav className="space-y-1">
      {filteredItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
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