
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, BarChart3, Settings, ShieldCheck, Users, LogOut, FlaskConical, History, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { useEffect, useState } from 'react';

export const NAV_ITEMS = [
  { label: 'نظرة عامة', icon: LayoutDashboard, href: '/overview', roles: ['admin'] },
  { label: 'إدارة الطلبات', icon: ShoppingCart, href: '/orders', badge: 3, roles: ['admin', 'delivery'] },
  { label: 'كتالوج المنتجات', icon: Package, href: '/products', roles: ['admin'] },
  { label: 'التحليلات', icon: BarChart3, href: '/analytics', roles: ['admin'] },
  { 
    label: 'مركز الإدارة', 
    icon: LayoutGrid, 
    href: '/admin', 
    roles: ['admin'],
    adminOnly: true 
  },
];

export function Sidebar({ className, onItemClick }: { className?: string; onItemClick?: () => void }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('musheas_session');
    if (session) {
      const { role, fullName } = JSON.parse(session);
      setUserRole(role);
      setFullName(fullName);
    } else {
      setUserRole('delivery'); // Fallback
    }
  }, []);

  if (userRole === null) return <aside className={cn("w-[228px] bg-surface1 border-r border-border", className)} />;

  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  const handleLogout = () => {
    localStorage.removeItem('musheas_session');
    window.location.href = '/login';
  };

  return (
    <aside className={cn("w-full h-full bg-surface1 flex flex-col z-40", className)}>
      <div className="p-8">
        <Link href={userRole === 'admin' ? '/overview' : '/orders'} onClick={onItemClick}>
          <h1 className="text-2xl font-headline text-gold tracking-tight">MUSHEAS</h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto hide-scrollbar">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                isActive ? "bg-gold/10 text-gold shadow-sm border border-gold/20" : "text-muted hover:text-text hover:bg-surface2/50"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-5 h-5", isActive ? "text-gold" : "text-muted group-hover:text-text")} />
                <span className="text-sm font-bold">
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span className="bg-red text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border space-y-4 bg-surface2/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm shadow-inner">
            {fullName ? fullName.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text">{fullName || 'مستخدم'}</span>
            <span className="text-[9px] text-gold uppercase font-bold tracking-tighter opacity-80">
              {userRole === 'admin' ? 'مدير النظام' : 'موظف توصيل'}
            </span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-[10px] text-red/70 hover:text-red font-bold uppercase tracking-widest transition-colors pt-2 group"
        >
          <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
