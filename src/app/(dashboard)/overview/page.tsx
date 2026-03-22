"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useOrders } from '@/hooks/useOrders';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

function StatCardSkeleton() {
  return <Card className="p-6 bg-surface1 border-border"><Skeleton className="h-8 w-8 mb-2" /><Skeleton className="h-3 w-24 mb-1" /><Skeleton className="h-7 w-16" /></Card>;
}

export default function OverviewPage() {
  const { orders, loading: ordersLoading } = useOrders();
  const { analytics, wilayaRevenue, dailyRevenue, loading: analyticsLoading } = useAnalytics();

  const isLoading = ordersLoading || analyticsLoading;

  const stats = useMemo(() => [
    { label: 'إجمالي الطلبات', value: analytics?.total_orders?.toString() ?? '—', icon: '📦' },
    { label: 'إجمالي الدخل', value: analytics ? `${analytics.total_revenue.toLocaleString('fr-DZ')} DA` : '—', icon: '💰', font: 'font-code' },
    { label: 'بانتظار التأكيد', value: analytics?.new_orders?.toString() ?? '—', icon: '⏳', color: 'text-red' },
    { label: 'تم التسليم', value: analytics?.delivered_orders?.toString() ?? '—', icon: '✅', color: 'text-green' },
  ], [analytics]);

  const wilayaData = useMemo(() =>
    wilayaRevenue.slice(0, 6).map(w => ({
      name: w.wilaya.split(' - ')[1] ?? w.wilaya,
      count: w.order_count,
    })), [wilayaRevenue]);

  const revenueData = useMemo(() =>
    dailyRevenue.map(d => ({
      day: format(new Date(d.date), 'EEE', { locale: ar }),
      amount: d.revenue,
    })), [dailyRevenue]);

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);

  return (
    <div className="space-y-8" dir="rtl">
      {/* Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat) => (
            <Card key={stat.label} className="p-6 border-border hover:border-gold/30 transition-all hover:-translate-y-1 bg-surface1 text-right">
              <span className="text-2xl mb-2 block">{stat.icon}</span>
              <p className="text-xs text-muted font-medium mb-1 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color ?? ''} ${stat.font ?? ''}`}>{stat.value}</p>
            </Card>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="bg-surface1 border-border overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border text-right">
            <h3 className="text-lg font-headline text-gold">آخر الطلبيات</h3>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-surface2/50">
                <tr>
                  <th className="px-6 py-3 text-right text-[10px] text-muted font-bold uppercase tracking-widest">#</th>
                  <th className="px-6 py-3 text-right text-[10px] text-muted font-bold uppercase tracking-widest">الزبون</th>
                  <th className="px-6 py-3 text-right text-[10px] text-muted font-bold uppercase tracking-widest">الولاية</th>
                  <th className="px-6 py-3 text-right text-[10px] text-muted font-bold uppercase tracking-widest">المبلغ</th>
                  <th className="px-6 py-3 text-right text-[10px] text-muted font-bold uppercase tracking-widest">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ordersLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td></tr>
                  ))
                  : recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gold/5 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-xs font-code text-gold">#{order.orderNumber}</td>
                      <td className="px-6 py-4 text-xs font-medium">{order.name}</td>
                      <td className="px-6 py-4 text-xs text-muted">{order.wilaya}</td>
                      <td className="px-6 py-4 text-xs font-code">{order.total.toLocaleString('fr-DZ')} DA</td>
                      <td className="px-6 py-4"><StatusBadge status={order.status} className="scale-90 origin-right" /></td>
                    </tr>
                  ))}
                {!ordersLoading && recentOrders.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted text-sm italic">لا توجد طلبات بعد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Wilayas Chart */}
        <Card className="bg-surface1 border-border p-6 text-right">
          <h3 className="text-lg font-headline text-gold mb-6">أفضل الولايات</h3>
          {analyticsLoading ? <Skeleton className="h-[300px] w-full" /> : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wilayaData.length > 0 ? wilayaData : [{ name: 'لا توجد بيانات', count: 0 }]} layout="vertical" margin={{ right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0d2226" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(230,240,238,.58)', fontSize: 12 }} orientation="right" />
                  <Tooltip cursor={{ fill: 'rgba(210,178,107,.05)' }} contentStyle={{ backgroundColor: '#0a1a1d', borderColor: 'rgba(210,178,107,.25)', borderRadius: '12px', fontSize: '12px', textAlign: 'right' }} />
                  <Bar dataKey="count" fill="#d2b26b" radius={[4, 0, 0, 4]} barSize={20}>
                    {wilayaData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#d2b26b' : '#b8903f'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-surface1 border-border p-6 text-right">
        <h3 className="text-lg font-headline text-gold mb-6">دخل الـ 7 أيام الأخيرة</h3>
        {analyticsLoading ? <Skeleton className="h-[300px] w-full" /> : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d2b26b" />
                    <stop offset="100%" stopColor="#b8903f" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0d2226" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(230,240,238,.58)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(230,240,238,.58)', fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} orientation="right" />
                <Tooltip cursor={{ fill: 'rgba(210,178,107,.05)' }} contentStyle={{ backgroundColor: '#0a1a1d', borderColor: 'rgba(210,178,107,.25)', borderRadius: '12px', fontSize: '12px', textAlign: 'right' }} formatter={(v) => [`${v} DA`, 'الدخل']} />
                <Bar dataKey="amount" fill="url(#goldGradient)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
