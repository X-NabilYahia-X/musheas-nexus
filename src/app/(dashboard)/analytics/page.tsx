
"use client";

import { Card } from '@/components/ui/card';
import { Trophy, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const TOP_PRODUCTS = [
  { name: 'Turkey Tail Extract', sales: 45, progress: 100 },
  { name: "Lion's Mane Extract", sales: 32, progress: 71 },
  { name: 'Oyster Extract', sales: 28, progress: 62 },
  { name: 'Kefir Ferment', sales: 12, progress: 26 },
];

const BY_STATUS = [
  { status: 'delivered', count: 18 },
  { status: 'shipped', count: 4 },
  { status: 'new', count: 3 },
  { status: 'cancelled', count: 2 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8" dir="rtl">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-surface1 border-border flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center text-gold border border-gold/20 group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs text-muted uppercase font-bold">المنتج الأكثر طلباً</p>
            <h4 className="text-lg font-headline">Turkey Tail Extract</h4>
            <span className="text-[10px] text-gold font-code">تم بيع 45 وحدة</span>
          </div>
        </Card>

        <Card className="p-6 bg-surface1 border-border flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-lg bg-green/10 flex items-center justify-center text-green border border-green/20 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs text-muted uppercase font-bold">نسبة التسليم</p>
            <h4 className="text-2xl font-bold text-green">92%</h4>
            <span className="text-[10px] text-muted font-code flex items-center gap-1 justify-end">
               +4% هذا الشهر <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </Card>

        <Card className="p-6 bg-surface1 border-border flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center text-gold border border-gold/20 group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs text-muted uppercase font-bold">متوسط الطلبية</p>
            <h4 className="text-2xl font-bold font-code text-gold">4,250 DA</h4>
            <span className="text-[10px] text-muted uppercase tracking-tighter">السوق الوطني / B2B</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales by Product */}
        <Card className="p-6 bg-surface1 border-border">
          <h3 className="text-lg font-headline text-gold mb-6 text-right">المبيعات حسب المنتج</h3>
          <div className="space-y-6">
            {TOP_PRODUCTS.map((product) => (
              <div key={product.name} className="space-y-2">
                <div className="flex justify-between text-xs flex-row-reverse">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-muted font-code">{product.sales} وحدة</span>
                </div>
                <div className="h-2 w-full bg-surface2 rounded-full overflow-hidden">
                  <div 
                    className="h-full gold-gradient transition-all duration-1000" 
                    style={{ width: `${product.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Orders by Status */}
        <Card className="p-6 bg-surface1 border-border">
          <h3 className="text-lg font-headline text-gold mb-6 text-right">توزيع الطلبات حسب الحالة</h3>
          <div className="space-y-4">
            {BY_STATUS.map((item) => (
              <div key={item.status} className="flex items-center justify-between p-3 rounded-lg bg-surface2/30 hover:bg-surface2/50 transition-colors flex-row-reverse">
                <StatusBadge status={item.status as any} />
                <div className="flex items-center gap-3 flex-row-reverse">
                  <span className="text-lg font-bold font-code">{item.count}</span>
                  <span className="text-[10px] text-muted uppercase">طلبية</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
