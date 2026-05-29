'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, ClipboardList, LayoutDashboard, Package, Store } from 'lucide-react';

const LINKS = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'Đơn hàng', icon: ClipboardList },
  { href: '/dashboard/analytics', label: 'Phân tích', icon: BarChart3 },
  { href: '/dashboard/catalog', label: 'Catalog', icon: Package },
  { href: '/browse', label: 'Marketplace', icon: Store },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 mb-8">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-base transition-colors',
              active
                ? 'border-primary/30 bg-primary/10 text-foreground'
                : 'border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
