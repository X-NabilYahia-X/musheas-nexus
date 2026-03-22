
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { UserRole } from '@/types';

export function BottomNav() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('musheas_session');
    if (session) {
      const { role } = JSON.parse(session);
      setUserRole(role);
    } else {
      setUserRole('delivery');
    }
  }, []);

  if (userRole === null) return null;

  const NAV_ITEMS = [
    ...(userRole === 'admin' ? [{ label: 'الرئيسية', icon: LayoutDashboard, href: '/overview' }] : []),
    { label: 'الطلبات', icon: ShoppingCart, href: '/orders' },
    ...(userRole === 'admin' ? [
      { label: 'المنتجات', icon: Package, href: '/products' },
      { label: 'الإدارة', icon: LayoutGrid, href: '/admin' }
    ] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface1 border-t border-border flex items-center justify-around z-50 md:hidden px-2 backdrop-blur-lg bg-surface1/90">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 flex-1 py-1 relative",
              isActive ? "text-gold scale-110" : "text-muted hover:text-text"
            )}
          >
            <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
            <span className="text-[9px] font-bold whitespace-nowrap uppercase tracking-tighter">{item.label}</span>
            {isActive && (
              <span className="absolute -top-1 w-1 h-1 bg-gold rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
