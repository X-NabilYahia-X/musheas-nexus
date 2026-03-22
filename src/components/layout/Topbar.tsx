
"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { RefreshCw, Bell, Save, Menu, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import Link from 'next/link';

const TITLES: Record<string, string> = {
  '/overview': 'نظرة عامة',
  '/orders': 'إدارة الطلبات',
  '/products': 'كتالوج المنتجات',
  '/analytics': 'التحليلات والتقارير',
  '/admin': 'مركز إدارة النظام',
  '/admin/samples': 'عينات B2B',
  '/admin/customers': 'سجل العملاء',
  '/admin/logs': 'سجل العمليات',
  '/admin/shipping': 'إعدادات الشحن',
  '/settings': 'الإعدادات العامة',
};

export function Topbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const title = TITLES[pathname] || 'مشرف النظام';

  return (
    <header className="h-20 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-md z-30">
      <div className="flex items-center gap-4">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-gold hover:bg-gold/10">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 border-l border-border bg-surface1 w-[280px]">
            <Sidebar onItemClick={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        <h2 className="text-xl md:text-2xl font-headline text-gold">{title}</h2>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Link href="/admin" className="hidden lg:block">
          <Button variant="outline" size="sm" className="gap-2 text-xs border-gold/20 hover:bg-gold/10 text-gold font-bold">
            <LayoutGrid className="w-4 h-4" />
            مركز الإدارة
          </Button>
        </Link>
        <div className="relative">
          <Button variant="ghost" size="icon" className="text-muted hover:text-text">
            <Bell className="w-5 h-5" />
          </Button>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red rounded-full ring-2 ring-background" />
        </div>
        <Button className="gold-gradient text-background font-bold px-4 md:px-6 border-none shadow-lg shadow-gold/10 hidden sm:flex h-10 text-sm active:scale-95 transition-transform">
          <Save className="w-4 h-4 mr-2" />
          حفظ التغييرات
        </Button>
      </div>
    </header>
  );
}
