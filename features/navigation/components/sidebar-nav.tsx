'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  IconDashboard, 
  IconUsers, 
  IconFolders, 
  IconChecklist,
  IconMessage,
  IconSettings 
} from '@tabler/icons-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <IconDashboard className="h-5 w-5" />,
  },
  {
    title: 'Organizations',
    href: '/organizations',
    icon: <IconUsers className="h-5 w-5" />,
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
    title: 'Messages',
    href: '/messages',
    icon: <IconMessage className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <IconSettings className="h-5 w-5" />,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
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