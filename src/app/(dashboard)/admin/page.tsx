"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useOrders } from '@/hooks/useOrders';
import { useShipping } from '@/hooks/useSettings';
import { Order, OrderStatus } from '@/types';
import { Search, FlaskConical, Building2, User, MapPin, Eye, Printer, Zap, Loader2, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { addAuditLog } from '@/lib/logger';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AdminSamplesPage() {
  const { toast } = useToast();
  const { orders, updateOrderStatus } = useOrders();
  const { activeProvider } = useShipping();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSample, setSelectedSample] = useState<Order | null>(null);
  const [isShippingLoading, setIsShippingLoading] = useState(false);

  // تصفية العينات فقط من قائمة الطلبات
  const samples = useMemo(() => orders.filter(o => o.orderType === 'sample'), [orders]);

  // تصفية البحث حسب الاسم أو الشركة
  const filteredSamples = useMemo(() => {
    return samples.filter(o => 
      (o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       o.companyName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [samples, searchQuery]);

  // دالة تحديث الحالة (تم إصلاح الأقواس المكسورة هنا)
  const handleUpdateStatus = async (id: string, newStatus: OrderStatus, tracking?: string) => {
    const currentSample = samples.find(s => s.id === id);
    try {
      await updateOrderStatus(id, newStatus, tracking);
      const timestamp = new Date().toISOString();

      if (currentSample) {
        addAuditLog('sample', 'تحديث حالة', `تغيير حالة عينة ${currentSample.companyName} إلى ${newStatus}`);
      }

      if (selectedSample?.id === id) {
        setSelectedSample(prev => prev ? { 
          ...prev, 
          status: newStatus, 
          trackingNumber: tracking ?? prev.trackingNumber, 
          statusHistory: [...(prev.statusHistory || []), { status: newStatus, timestamp }] 
        } : null);
      }
      toast({ title: "تم التحديث بنجاح" });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل تحديث الحالة", variant: "destructive" });
    }
  };

  const handleRegisterShipping = (order: Order) => {
    if (!activeProvider) return;
    setIsShippingLoading(true);
    
    setTimeout(() => {
      const prefix = activeProvider.name.substring(0, 3).toUpperCase();
      const trackingNum = `${prefix}-SMP-${Math.floor(1000000 + Math.random() * 9000000)}`;
      
      handleUpdateStatus(order.id, 'shipped', trackingNum);
      setIsShippingLoading(false);
      
      toast({
        title: "✓ تم تسجيل الشحن",
        description: `رقم التتبع: ${trackingNum}`,
      });
    }, 1800);
  };

  const handlePrintSample = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<html dir="rtl"><body><h1>بطاقة عينة: ${order.companyName}</h1></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gold">طلبات عينات B2B</h3>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">مختبر MUSHEAS</p>
          </div>
        </div>
        
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الشركة..." 
            className="pr-10 bg-surface1 text-right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSamples.map((order) => (
          <Card key={order.id} className="bg-surface1 border-border p-5 space-y-4 hover:border-teal/30 transition-all">
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="text-teal text-[9px]">طلب عينة مخبرية</Badge>
              <StatusBadge status={order.status} scale={0.8} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface2 flex items-center justify-center text-gold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{order.companyName}</h4>
                  <p className="text-[10px] text-muted">{order.name}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/20 flex gap-2">
              <Button className="flex-1 bg-surface2 text-teal h-9 text-[10px] font-bold" onClick={() => setSelectedSample(order)}>
                <Eye className="w-3.5 h-3.5 ml-1" /> مراجعة العينة
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedSample} onOpenChange={() => setSelectedSample(null)}>
        <DialogContent className="bg-surface1 border-border max-w-2xl" dir="rtl">
          {selectedSample && (
            <div className="space-y-6">
              <DialogHeader className="text-right">
                <DialogTitle className="text-gold text-xl">{selectedSample.companyName}</DialogTitle>
                <DialogDescription>تفاصيل طلب العينة التقنية</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface2 p-3 rounded-lg border border-border">
                  <p className="text-muted text-[10px] mb-1">المسؤول التقني</p>
                  <p className="font-bold text-sm">{selectedSample.name}</p>
                </div>
                <div className="bg-surface2 p-3 rounded-lg border border-border">
                  <p className="text-muted text-[10px] mb-1">الوجهة</p>
                  <p className="font-bold text-sm">{selectedSample.wilaya}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-teal flex items-center gap-2"><Clock className="w-3 h-3" /> سجل الحركة</h4>
                <div className="space-y-3 pr-4 border-r-2 border-border/30">
                  {selectedSample.statusHistory?.slice().reverse().map((h, i) => (
                    <div key={i} className="text-[10px]">
                      <p className="font-bold text-text">{h.status}</p>
                      <p className="text-muted">{format(new Date(h.timestamp), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => handlePrintSample(selectedSample)} className="flex-1 gold-gradient text-background font-bold">
                  <Printer className="w-4 h-4 ml-2" /> طباعة البطاقة
                </Button>
                <Button variant="ghost" onClick={() => setSelectedSample(null)}>إغلاق</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
