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
import { Search, FlaskConical, Building2, User, Phone, MapPin, Eye, Printer, MessageSquare, Calendar, Zap, Loader2, Clock } from 'lucide-react';
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
  const { orders, loading, updateOrderStatus } = useOrders();
  const { activeProvider } = useShipping();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSample, setSelectedSample] = useState<Order | null>(null);
  const [isShippingLoading, setIsShippingLoading] = useState(false);

  const samples = useMemo(() => orders.filter(o => o.orderType === 'sample'), [orders]);

  const filteredSamples = useMemo(() => {
    return samples.filter(o => 
      (o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       o.companyName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [samples, searchQuery]);

  const handleUpdateStatus = async (id: string, newStatus: OrderStatus, tracking?: string) => {
    const currentSample = samples.find(s => s.id === id);
    
    try {
      await updateOrderStatus(id, newStatus, tracking);
      
      const timestamp = new Date().toISOString();
      
      // تسجيل النشاط في السجلات
      if (currentSample) {
        addAuditLog('sample', 'تحديث حالة', `تغيير حالة عينة ${currentSample.companyName} إلى ${newStatus}`);
      }

      // تحديث حالة العينة المختارة المعروضة في النافذة المنبثقة (Modal)
      if (selectedSample?.id === id) {
        setSelectedSample(prev => prev ? { 
          ...prev, 
          status: newStatus, 
          trackingNumber: tracking ?? prev.trackingNumber, 
          statusHistory: [...(prev.statusHistory || []), { status: newStatus, timestamp }] 
        } : null);
      }
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "فشل تغيير حالة العينة، يرجى المحاولة لاحقاً",
        variant: "destructive"
      });
    }
  };

  const handleRegisterShipping = (order: Order) => {
    if (!activeProvider) return;
    setIsShippingLoading(true);
    
    setTimeout(() => {
      const prefix = activeProvider.name.substring(0, 3).toUpperCase();
      const trackingNum = `${prefix}-SMP-${Math.floor(1000000 + Math.random() * 9000000)}`;
      
      handleUpdateStatus(order.id, 'shipped', trackingNum);
      addAuditLog('sample', 'تسجيل شحن', `تم تسجيل شحن عينة ${order.companyName} مع ${activeProvider.name} برقم تتبع ${trackingNum}`);
      setIsShippingLoading(false);
      
      toast({
        title: "✓ تم تسجيل العينة للشحن",
        description: `رقم التتبع: ${trackingNum} (${activeProvider.name})`,
        className: "bg-green/10 border-green text-green font-bold",
      });
    }, 1800);
  };

  const handlePrintSample = (order: Order) => {
    addAuditLog('sample', 'طباعة بطاقة', `تمت طباعة بطاقة عينة ${order.companyName}`);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: "خطأ", description: "يرجى السماح بالنوافذ المنبثقة", variant: "destructive" });
      return;
    }
    
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>بطاقة عينة B2B - ${order.companyName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700&display=swap');
            body { font-family: 'Sora', sans-serif; padding: 40px; color: #0a1a1d; line-height: 1.6; }
            .card { border: 2px solid #d2b26b; border-radius: 16px; padding: 30px; position: relative; }
            .header { text-align: center; border-bottom: 2px solid #d2b26b; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #b8903f; margin: 0; font-size: 28px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 10px; text-transform: uppercase; color: #b8903f; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #eee; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .info-box { background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
            .product-box { background: #55aab410; border: 1px solid #55aab430; padding: 15px; border-radius: 12px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #aaa; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header"><h1>MUSHEAS BIOTECH</h1><p>بطاقة عينة B2B للبحث والتطوير</p></div>
            <div class="section">
              <div class="section-title">بيانات المؤسسة والمختبر</div>
              <div class="grid">
                <div class="info-box"><strong>اسم المؤسسة:</strong><br>${order.companyName}</div>
                <div class="info-box"><strong>المسؤول التقني:</strong><br>${order.name}</div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">المادة الأولية</div>
              <div class="product-box"><strong>المنتج:</strong> ${order.items[0]?.product_name || 'N/A'}</div>
            </div>
            <div class="footer">تتبع: ${order.trackingNumber || 'بانتظار الشحن'} | تاريخ: ${new Date().toLocaleDateString('ar-DZ')}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center text-teal">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-headline text-gold">طلبات عينات B2B</h3>
            <p className="text-[10px] text-muted uppercase font-bold tracking-widest mt-1">إدارة العينات التقنية والمخبرية</p>
          </div>
        </div>
        
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الشركة..." 
            className="pr-10 bg-surface1 border-border-strong text-right h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredSamples.map((order) => (
          <Card key={order.id} className="bg-surface1 border-border p-5 space-y-4 hover:border-teal/30 transition-all group">
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="border-teal/30 text-teal font-bold uppercase text-[9px]">طلب عينة مخبرية</Badge>
              <StatusBadge status={order.status} scale={0.8} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface2 border border-border/50 flex items-center justify-center text-gold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate">{order.companyName}</h4>
                  <p className="text-[10px] text-muted">{order.name} - {order.jobTitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-surface2/40 p-2 rounded-lg border border-border/30">
                  <p className="text-muted mb-0.5">الولاية</p>
                  <p className="font-bold">{order.wilaya.split(' - ')[1] || order.wilaya}</p>
                </div>
                <div className="bg-surface2/40 p-2 rounded-lg border border-border/30">
                  <p className="text-muted mb-0.5">تاريخ الطلب</p>
                  <p className="font-bold">{format(new Date(order.createdAt), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/20 flex gap-2">
              <Button 
                className="flex-1 bg-surface2 text-teal border-teal/20 h-9 text-[10px] font-bold gap-2"
                onClick={() => setSelectedSample(order)}
              >
                <Eye className="w-3.5 h-3.5" /> مراجعة العينة
              </Button>
              <Button variant="ghost" size="icon" className="text-muted hover:text-green hover:bg-green/10 h-9 w-9">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedSample} onOpenChange={() => setSelectedSample(null)}>
        <DialogContent className="bg-surface1 border-border max-w-2xl text-text p-0 overflow-hidden w-[95vw]" dir="rtl">
          {selectedSample && (
            <div className="flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-border bg-teal/5 relative">
                <div className="absolute top-6 left-6">
                   <StatusBadge status={selectedSample.status} />
                </div>
                <DialogHeader className="sm:text-right">
                  <DialogTitle className="text-xl sm:text-2xl font-headline text-gold">{selectedSample.companyName}</DialogTitle>
                  <DialogDescription className="text-xs text-muted uppercase tracking-widest font-bold mt-1">طلب تقييم تقني للمواد الأولية</DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-border bg-surface2/10">
                <div className="space-y-1">
                   <p className="text-[9px] text-muted uppercase font-bold flex items-center gap-2"><User className="w-3 h-3 text-teal" /> المسؤول التقني</p>
                   <p className="text-sm font-bold">{selectedSample.name}</p>
                   <p className="text-[10px] text-muted">{selectedSample.phone}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] text-muted uppercase font-bold flex items-center gap-2"><MapPin className="w-3 h-3 text-teal" /> الوجهة</p>
                   <p className="text-sm font-bold">{selectedSample.wilaya}</p>
                   <p className="text-[10px] text-teal font-bold">{selectedSample.trackingNumber ? `تتبع: ${selectedSample.trackingNumber}` : 'بانتظار الشحن'}</p>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto hide-scrollbar">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-teal uppercase tracking-widest flex items-center gap-2">
                    <FlaskConical className="w-3.5 h-3.5" /> العينة المطلوبة
                  </h4>
                  {selectedSample.items.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl border border-teal/20 bg-teal/5 flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-bold">{item.product_name}</p>
                        <p className="text-[10px] text-muted">الكمية: {item.quantity} عينة</p>
                      </div>
                      <Badge className="bg-teal text-white border-none">B2B Sample</Badge>
                    </div>
                  ))}
                </div>

                {selectedSample.status === 'confirmed' && !selectedSample.trackingNumber && (
                   <div className="p-4 bg-teal/10 rounded-xl border border-teal/20 space-y-3">
                     <div className="flex items-center gap-3">
                       <Zap className="w-5 h-5 text-teal animate-pulse" />
                       <p className="text-xs font-bold">تسجيل سريع مع {activeProvider?.name}</p>
                     </div>
                     <Button 
                       disabled={isShippingLoading} 
                       onClick={() => handleRegisterShipping(selectedSample)} 
                       className="w-full bg-teal text-white font-bold h-11 text-sm shadow-lg shadow-teal/10 active:scale-95 transition-transform"
                     >
                       {isShippingLoading ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الربط...</> : `تسجيل العينة الآن`}
                     </Button>
                   </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> سجل الحركة</h4>
                  <div className="space-y-3 pr-2 border-r-2 border-border/30 mr-2">
                    {selectedSample.statusHistory?.slice().reverse().map((h, i) => (
                      <div key={i} className="relative pr-6">
                        <div className={cn("absolute right-[-11px] top-1 w-5 h-5 rounded-full bg-surface1 border-2 flex items-center justify-center", i === 0 ? "border-teal" : "border-border")}>
                          <div className={cn("w-2 h-2 rounded-full", i === 0 ? "bg-teal" : "bg-muted")} />
                        </div>
                        <div className="text-[10px]">
                          <p className="font-bold">{h.status === 'new' ? 'تم استلام الطلب' : h.status === 'confirmed' ? 'تم التأكيد' : h.status === 'shipped' ? 'تم الشحن' : h.status}</p>
                          <p className="text-muted">{format(new Date(h.timestamp), 'dd/MM/yyyy HH:mm')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-border bg-surface2/30 flex gap-3">
                <Button onClick={() => handlePrintSample(selectedSample)} className="flex-1 gold-gradient text-background font-bold h-11 text-sm gap-2">
                  <Printer className="w-4 h-4" /> <span>طباعة بطاقة العينة</span>
                </Button>
                <Button variant="ghost" onClick={() => setSelectedSample(null)} className="text-muted text-xs font-bold">إغلاق</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
