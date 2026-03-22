
"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FlaskConical, 
  Users, 
  History, 
  ShieldCheck, 
  Settings, 
  ArrowLeft,
  ChevronLeft,
  Activity,
  UserCheck,
  Truck,
  Database
} from 'lucide-react';
import Link from 'next/link';

const ADMIN_MODULES = [
  {
    title: 'عينات B2B',
    description: 'إدارة وتتبع عينات البحث والتطوير للمختبرات.',
    icon: FlaskConical,
    href: '/admin/samples',
    color: 'text-teal',
    bg: 'bg-teal/10',
    stats: '5 نشطة'
  },
  {
    title: 'سجل العملاء (CRM)',
    description: 'قاعدة بيانات شاملة لزبائن Musheas وتحليلاتهم.',
    icon: Users,
    href: '/admin/customers',
    color: 'text-gold',
    bg: 'bg-gold/10',
    stats: '128 عميل'
  },
  {
    title: 'سجل العمليات',
    description: 'مراقبة كافة التغييرات والعمليات في النظام.',
    icon: History,
    href: '/admin/logs',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    stats: 'اليوم: 24'
  },
  {
    title: 'إعدادات الشحن',
    description: 'إدارة الربط مع Yalidine وشركاء التوصيل.',
    icon: ShieldCheck,
    href: '/admin/shipping',
    color: 'text-green',
    bg: 'bg-green/10',
    stats: 'نشط: Yalidine'
  },
  {
    title: 'الإعدادات العامة',
    description: 'تخصيص نصوص الموقع، الأسعار، والبيانات العامة.',
    icon: Settings,
    href: '/settings',
    color: 'text-muted',
    bg: 'bg-surface2',
    stats: 'آخر تحديث: أمس'
  }
];

export default function AdminHubPage() {
  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <div className="flex flex-col gap-2">
        <h3 className="text-3xl font-headline text-gold">مركز إدارة النظام</h3>
        <p className="text-xs text-muted uppercase font-bold tracking-widest">تحكم كامل في مفاصل Musheas Nexus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} href={module.href}>
              <Card className="p-6 bg-surface1 border-border hover:border-gold/40 transition-all group cursor-pointer relative overflow-hidden h-full">
                <div className={`w-14 h-14 rounded-2xl ${module.bg} flex items-center justify-center ${module.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xl font-bold group-hover:text-gold transition-colors">{module.title}</h4>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">{module.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/20 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">{module.stats}</span>
                  <div className="flex items-center gap-1 text-gold text-xs font-bold">
                    دخول <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all" />
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Overview Stats for Admin Only */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
        <div className="p-4 bg-surface2/50 rounded-xl border border-border flex items-center gap-4">
           <Activity className="w-5 h-5 text-gold" />
           <div>
             <p className="text-[10px] text-muted uppercase font-bold">حالة النظام</p>
             <p className="text-sm font-bold">مستقر (v2.4.0)</p>
           </div>
        </div>
        <div className="p-4 bg-surface2/50 rounded-xl border border-border flex items-center gap-4">
           <UserCheck className="w-5 h-5 text-teal" />
           <div>
             <p className="text-[10px] text-muted uppercase font-bold">الجلسة الحالية</p>
             <p className="text-sm font-bold">مدير النظام (Admin)</p>
           </div>
        </div>
        <div className="p-4 bg-surface2/50 rounded-xl border border-border flex items-center gap-4">
           <Database className="w-5 h-5 text-green" />
           <div>
             <p className="text-[10px] text-muted uppercase font-bold">قاعدة البيانات</p>
             <p className="text-sm font-bold">متصلة (Realtime)</p>
           </div>
        </div>
      </div>
    </div>
  );
}
