"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/skeleton';
import { Order } from '@/types';
import { Search, User, Phone, MapPin, ShoppingBag, Calendar, Eye, ArrowRight, TrendingUp, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CustomerProfile {
  name: string;
  phone: string;
  wilaya: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: Order[];
}

export default function AdminCustomersPage() {
  const { orders, loading } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  const customers = useMemo(() => {
    const customerMap = new Map<string, CustomerProfile>();

    orders.forEach(order => {
      const existing = customerMap.get(order.phone);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += order.total;
        existing.orders.push(order);
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
        }
      } else {
        customerMap.set(order.phone, {
          name: order.name,
          phone: order.phone,
          wilaya: order.wilaya,
          totalOrders: 1,
          totalSpent: order.total,
          lastOrderDate: order.createdAt,
          orders: [order],
        });
      }
    });

    return Array.from(customerMap.values()).filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-headline text-gold">سجل العملاء (CRM)</h3>
          <p className="text-[10px] sm:text-xs text-muted uppercase font-bold tracking-widest mt-1">تتبع رحلة زبائن Musheas</p>
        </div>
        
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الهاتف..." 
            className="pr-10 bg-surface1 border-border-strong text-right h-11"
          />
        </div>
      </div>

      {/* عرض الحاسوب: جدول */}
      <div className="hidden md:block">
        <Card className="bg-surface1 border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface2/50">
                <tr>
                  <th className="px-6 py-4 text-right text-[10px] text-muted font-bold uppercase tracking-widest">العميل</th>
                  <th className="px-6 py-4 text-right text-[10px] text-muted font-bold uppercase tracking-widest">الولاية</th>
                  <th className="px-6 py-4 text-right text-[10px] text-muted font-bold uppercase tracking-widest">عدد الطلبات</th>
                  <th className="px-6 py-4 text-right text-[10px] text-muted font-bold uppercase tracking-widest">إجمالي الإنفاق</th>
                  <th className="px-6 py-4 text-right text-[10px] text-muted font-bold uppercase tracking-widest">آخر طلب</th>
                  <th className="px-6 py-4 text-left text-[10px] text-muted font-bold uppercase tracking-widest">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((customer) => (
                  <tr key={customer.phone} className="hover:bg-gold/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{customer.name}</span>
                          <span className="text-[10px] text-muted font-code">{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted">{customer.wilaya}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="border-gold/30 text-gold font-bold">
                        {customer.totalOrders} طلبات
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-code font-bold text-gold">{customer.totalSpent.toLocaleString()} DA</td>
                    <td className="px-6 py-4 text-xs text-muted">
                      {format(new Date(customer.lastOrderDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-gold hover:bg-gold/10"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        عرض الملف
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* عرض الهاتف: بطاقات */}
      <div className="grid grid-cols-1 gap-4 md:hidden pb-20">
        {customers.map((customer) => (
          <Card key={customer.phone} className="p-4 bg-surface1 border-border space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{customer.name}</h4>
                  <p className="text-[10px] text-muted font-code">{customer.phone}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-gold/30 text-gold font-bold scale-90">
                {customer.totalOrders} طلبات
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-surface2/50 p-2 rounded-lg border border-border/30">
                <p className="text-muted uppercase mb-1">الإنفاق الكلي</p>
                <p className="font-bold text-gold font-code">{customer.totalSpent.toLocaleString()} DA</p>
              </div>
              <div className="bg-surface2/50 p-2 rounded-lg border border-border/30">
                <p className="text-muted uppercase mb-1">الولاية</p>
                <p className="font-bold">{customer.wilaya.split(' - ')[1] || customer.wilaya}</p>
              </div>
            </div>

            <Button 
              className="w-full bg-surface2 border-border-strong text-gold h-10 text-xs font-bold"
              onClick={() => setSelectedCustomer(customer)}
            >
              <Eye className="w-3.5 h-3.5 ml-2" />
              عرض سجل الطلبيات
            </Button>
          </Card>
        ))}
      </div>

      {/* نافذة تفاصيل العميل - محسنة للموبايل */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="bg-surface1 border-border max-w-2xl text-text p-0 overflow-hidden w-[95vw] sm:w-full" dir="rtl">
          {selectedCustomer && (
            <div className="flex flex-col max-h-[90vh]">
              <div className="p-6 sm:p-8 border-b border-border bg-surface2/30 relative">
                <DialogHeader className="sm:text-right">
                  <DialogTitle className="text-xl sm:text-2xl font-headline text-gold">{selectedCustomer.name}</DialogTitle>
                  <DialogDescription className="sr-only">تفاصيل العميل وتاريخ الطلبيات</DialogDescription>
                  <div className="flex items-center gap-4 sm:gap-6 mt-4">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-lg shadow-gold/5">
                      <User className="w-7 h-7 sm:w-10 sm:h-10" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted">
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                          <Phone className="w-3.5 h-3.5 text-gold" /> {selectedCustomer.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                          <MapPin className="w-3.5 h-3.5 text-gold" /> {selectedCustomer.wilaya}
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="p-4 sm:p-8 grid grid-cols-3 gap-2 sm:gap-4 border-b border-border bg-surface2/10">
                <div className="p-2 sm:p-4 rounded-xl bg-surface2/40 border border-border/50 text-center">
                  <p className="text-[8px] sm:text-[10px] text-muted uppercase font-bold mb-1">الطلبات</p>
                  <p className="text-sm sm:text-xl font-bold text-gold">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="p-2 sm:p-4 rounded-xl bg-surface2/40 border border-border/50 text-center">
                  <p className="text-[8px] sm:text-[10px] text-muted uppercase font-bold mb-1">الإنفاق</p>
                  <p className="text-sm sm:text-xl font-bold text-gold font-code">{selectedCustomer.totalSpent.toLocaleString()}</p>
                </div>
                <div className="p-2 sm:p-4 rounded-xl bg-surface2/40 border border-border/50 text-center">
                  <p className="text-[8px] sm:text-[10px] text-muted uppercase font-bold mb-1">الولاء</p>
                  <div className="flex justify-center items-center gap-1 text-green">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-sm font-bold">V.I.P</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 hide-scrollbar">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="w-4 h-4 text-gold" />
                  <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gold">تاريخ الطلبيات</h4>
                </div>

                <div className="space-y-4">
                  {selectedCustomer.orders.map((order, idx) => (
                    <div key={order.id} className="p-4 rounded-xl border border-border/40 bg-surface2/20 hover:border-gold/30 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-code text-gold">#{order.orderNumber}</span>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted" />
                            <span className="text-[10px] font-medium">
                              {format(new Date(order.createdAt), 'dd MMMM yyyy', { locale: fr })}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-code font-bold">{order.total} DA</span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px] sm:text-[11px] text-muted-foreground bg-surface2/30 p-2 rounded-lg">
                            <span>{item.product_name}</span>
                            <span className="font-bold">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-surface2/30 border-t border-border flex justify-end">
                <Button variant="ghost" onClick={() => setSelectedCustomer(null)} className="text-muted text-xs sm:text-sm">إغلاق الملف</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
