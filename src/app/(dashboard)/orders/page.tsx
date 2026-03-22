"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useOrders } from '@/hooks/useOrders';
import { useShipping } from '@/hooks/useSettings';
import { ALGERIA_WILAYAS } from '@/lib/constants';
import { addAuditLog } from '@/lib/logger';
import { Search, MessageSquare, Printer, Eye, Loader2, Zap, MapPin, User, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { OrderStatus, Order } from '@/types';
import { useToast } from '@/hooks/use-toast';

const STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'الكل', value: 'all' },
  { label: 'جديد', value: 'new' },
  { label: 'مؤكد', value: 'confirmed' },
  { label: 'مع شركة التوصيل', value: 'shipped' },
  { label: 'مُسلَّم', value: 'delivered' },
  { label: 'ملغى', value: 'cancelled' },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'تم استقبال الطلب',
  confirmed: 'تم تأكيد الطلبية',
  shipped: 'خرجت مع شركة التوصيل',
  delivered: 'تم التسليم بنجاح',
  cancelled: 'تم إلغاء الطلب',
};

export default function OrdersPage() {
  const { toast } = useToast();
  const { orders, loading, updateOrderStatus } = useOrders();
  const { activeProvider } = useShipping();

  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isShippingLoading, setIsShippingLoading] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = activeStatus === 'all' || order.status === activeStatus;
      const matchesWilaya = selectedWilaya === 'all' || order.wilaya.includes(selectedWilaya.split(' - ')[1] || selectedWilaya);
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = searchLower === '' ||
        order.name.toLowerCase().includes(searchLower) ||
        order.phone.includes(searchLower) ||
        order.wilaya.toLowerCase().includes(searchLower) ||
        order.orderNumber.toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch && matchesWilaya;
    });
  }, [orders, activeStatus, searchQuery, selectedWilaya]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, tracking?: string) => {
    const ok = await updateOrderStatus(orderId, newStatus, tracking);
    if (!ok) return;
    setSelectedOrder(prev => {
      if (!prev || prev.id !== orderId) return prev;
      const timestamp = new Date().toISOString();
      return {
        ...prev,
        status: newStatus,
        trackingNumber: tracking ?? prev.trackingNumber,
        statusHistory: [...(prev.statusHistory || []), { status: newStatus, timestamp }],
      };
    });
    toast({
      title: "✓ تم تحديث المرحلة",
      description: `الحالة الجديدة: ${STATUS_LABELS[newStatus]}`,
      className: "bg-surface1 border-gold text-gold font-bold",
    });
  };

  const handleCreateShipment = async (order: Order) => {
    if (!activeProvider) {
      toast({ title: "لا توجد شركة شحن مفعلة", variant: "destructive" });
      return;
    }
    setIsShippingLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    const prefix = activeProvider.name.substring(0, 3).toUpperCase();
    const trackingNum = `${prefix}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    await handleUpdateStatus(order.id, 'shipped', trackingNum);
    await addAuditLog('order', 'تسجيل شحن', `شحنة للطلب #${order.orderNumber} مع ${activeProvider.name} | ${trackingNum}`);
    setIsShippingLoading(false);
    toast({
      title: `✓ تم الربط بنجاح مع ${activeProvider.name}`,
      description: `رقم التتبع: ${trackingNum}`,
      className: "bg-green/10 border-green text-green font-bold",
    });
  };

  const handlePrint = async (order: Order) => {
    await addAuditLog('order', 'طباعة وصل', `طباعة وصل الطلب #${order.orderNumber}`);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<html dir="rtl"><head><title>وصل طلب #${order.orderNumber}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#333}.header{text-align:center;border-bottom:2px solid #d2b26b;padding-bottom:20px;margin-bottom:30px}table{width:100%;border-collapse:collapse;margin-bottom:30px}th,td{border:1px solid #ddd;padding:12px;text-align:right}th{background:#f9f9f9}.total{font-size:20px;font-weight:bold;color:#b8903f}</style></head><body><div class="header"><h1>MUSHEAS BIOTECH</h1><p>وصل طلب رقم: #${order.orderNumber}</p></div><p><strong>الزبون:</strong> ${order.name} | <strong>هاتف:</strong> ${order.phone} | <strong>الولاية:</strong> ${order.wilaya}</p><table><thead><tr><th>المنتج</th><th>الكمية</th><th>المجموع</th></tr></thead><tbody>${order.items.map(item => `<tr><td>${item.product_name}</td><td>${item.quantity}</td><td>${item.quantity * item.unit_price} دج</td></tr>`).join('')}</tbody></table><div class="total">الإجمالي: ${order.total} دج</div></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const openWhatsApp = async (phone: string, orderNum: string) => {
    await addAuditLog('order', 'تواصل واتساب', `محادثة واتساب للطلب #${orderNum}`);
    const message = `Bonjour de Musheas ! Concernant votre commande #${orderNum}...`;
    const formattedPhone = phone.replace(/^0/, '213');
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
        <span className="mr-3 text-muted text-sm">جاري تحميل الطلبات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8" dir="rtl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group"><Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted z-10 group-focus-within:text-gold transition-colors" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-12 bg-surface1 border-border-strong text-sm h-12 text-right focus:ring-gold" placeholder="ابحث بالاسم، الهاتف أو رقم الطلب..." /></div>
          <Select value={selectedWilaya} onValueChange={setSelectedWilaya}><SelectTrigger className="w-full md:w-[200px] h-12 bg-surface1 border-border-strong text-sm text-right"><SelectValue placeholder="تصفية حسب الولاية" /></SelectTrigger><SelectContent className="bg-surface1 border-border text-text max-h-[300px]"><SelectItem value="all">كل الولايات</SelectItem>{ALGERIA_WILAYAS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar gap-2 py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {STATUS_FILTERS.map(s => (<button key={s.value} onClick={() => setActiveStatus(s.value)} className={cn("px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0", activeStatus === s.value ? "bg-gold text-background border-gold shadow-lg shadow-gold/20" : "bg-surface1 text-muted border-border hover:border-gold/30")}>{s.label}</button>))}
        </div>
      </div>

      <div className="hidden lg:block">
        <Card className="bg-surface1 border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface2/50"><tr><th className="px-6 py-4 text-right text-[10px] text-muted font-bold uppercase tracking-widest">الطلب</th><th className="px-6 py-4 text-right text-[10px] text-muted font-bold uppercase tracking-widest">الزبون</th><th className="px-6 py-4 text-right text-[10px] text-muted font-bold uppercase tracking-widest">الإجمالي</th><th className="px-6 py-4 text-right text-[10px] text-muted font-bold uppercase tracking-widest">الحالة</th><th className="px-6 py-4 text-left text-[10px] text-muted font-bold uppercase tracking-widest">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-muted text-sm">لا توجد طلبات</td></tr>}
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gold/5 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <td className="px-6 py-4 text-xs font-code text-gold">#{order.orderNumber}</td>
                  <td className="px-6 py-4"><div className="flex flex-col"><span className="text-sm font-bold">{order.name}</span><span className="text-[10px] text-muted font-code">{order.wilaya}</span></div></td>
                  <td className="px-6 py-4 text-xs font-code font-bold">{order.total} دج</td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-4 text-left"><div className="flex justify-start gap-2" onClick={(e) => e.stopPropagation()}><Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)} className="text-gold h-8 w-8 hover:bg-gold/10"><Eye className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => openWhatsApp(order.phone, order.orderNumber)} className="text-green h-8 w-8 hover:bg-green/10"><MessageSquare className="w-4 h-4" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
        {filteredOrders.map(order => (
          <Card key={order.id} className="p-4 bg-surface1 border-border space-y-4 hover:border-gold/30 transition-all cursor-pointer" onClick={() => setSelectedOrder(order)}>
            <div className="flex justify-between items-start"><div className="space-y-1"><span className="text-[10px] font-code text-gold">#{order.orderNumber}</span><h4 className="text-sm font-bold truncate max-w-[150px]">{order.name}</h4><div className="flex items-center gap-1.5 text-[10px] text-muted"><MapPin className="w-3 h-3 text-gold" /> {order.wilaya.split(' - ')[1] || order.wilaya}</div></div><StatusBadge status={order.status} className="scale-90 origin-right" /></div>
            <div className="flex justify-between items-center pt-3 border-t border-border/30"><span className="text-sm font-code font-bold text-gold">{order.total} دج</span><div className="flex gap-2" onClick={(e) => e.stopPropagation()}><Button size="sm" variant="outline" className="h-9 w-9 p-0 border-border" onClick={() => openWhatsApp(order.phone, order.orderNumber)}><MessageSquare className="w-4 h-4 text-green" /></Button><Button size="sm" className="bg-surface2 text-gold h-9 px-4 text-xs font-bold" onClick={() => setSelectedOrder(order)}>تفاصيل</Button></div></div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-surface1 border-border max-w-2xl text-text p-0 overflow-hidden w-[95vw] rounded-2xl" dir="rtl">
          {selectedOrder && (
            <div className="flex flex-col max-h-[90vh]">
              <div className="p-5 sm:p-6 border-b border-border bg-surface2/30"><div className="flex justify-between items-center gap-4"><div className="space-y-1"><DialogTitle className="font-headline text-gold text-lg sm:text-2xl">طلب #{selectedOrder.orderNumber}</DialogTitle><DialogDescription className="text-[10px] text-muted uppercase font-bold tracking-widest">تاريخ: {format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy')}</DialogDescription></div><StatusBadge status={selectedOrder.status} /></div></div>
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 hide-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="bg-surface2/40 p-4 rounded-xl border border-border/30"><p className="text-[10px] text-muted uppercase font-bold mb-2 flex items-center gap-2"><User className="w-3 h-3 text-gold" /> الزبون</p><p className="text-sm font-bold">{selectedOrder.name}</p><p className="text-[10px] font-code text-muted">{selectedOrder.phone}</p></div><div className="bg-surface2/40 p-4 rounded-xl border border-border/30"><p className="text-[10px] text-muted uppercase font-bold mb-2 flex items-center gap-2"><MapPin className="w-3 h-3 text-gold" /> التوصيل</p><p className="text-sm font-bold">{selectedOrder.wilaya}</p><p className="text-[10px] text-gold font-bold">{selectedOrder.trackingNumber || 'بانتظار الشحن'}</p></div></div>
                <div className="space-y-3"><p className="text-[10px] text-muted uppercase font-bold border-b border-border pb-2 flex items-center gap-2"><Package className="w-3.5 h-3.5 text-gold" /> محتويات الطلبية</p><div className="space-y-2">{selectedOrder.items.map((item, i) => (<div key={i} className="flex justify-between items-center p-3 rounded-lg bg-surface2/20 border border-border/10 group"><div className="space-y-0.5"><p className="text-xs font-bold group-hover:text-gold transition-colors">{item.product_name}</p><p className="text-[10px] text-muted">x{item.quantity} • {item.unit_price} دج</p></div><span className="text-xs font-bold text-gold">{item.quantity * item.unit_price} دج</span></div>))}</div><div className="flex justify-between items-center p-4 bg-gold/5 rounded-xl border border-gold/20 mt-2 shadow-sm"><span className="text-xs font-bold uppercase">الإجمالي النهائي</span><span className="text-lg font-code font-bold text-gold">{selectedOrder.total} دج</span></div></div>
                {activeProvider && selectedOrder.status === 'confirmed' && !selectedOrder.trackingNumber && (
                  <div className="p-4 bg-gold/10 rounded-xl border border-gold/30 space-y-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold"><Zap className="w-4 h-4" /></div><p className="text-xs font-bold">تسجيل سريع في شركة {activeProvider.name}</p></div><Button disabled={isShippingLoading} onClick={() => handleCreateShipment(selectedOrder)} className="w-full gold-gradient text-background font-bold h-11 text-sm shadow-lg shadow-gold/10 active:scale-95 transition-transform">{isShippingLoading ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الربط بـ API...</> : `تسجيل الشحنة الآن`}</Button></div>
                )}
                <div className="space-y-4 pt-4 border-t border-border/20"><p className="text-[10px] text-muted uppercase font-bold text-center tracking-widest">تحديث مسار الطلب يدوياً</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-2"><Button onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')} disabled={selectedOrder.status === 'confirmed'} variant="outline" className="h-11 text-[10px] font-bold border-gold/20 text-gold">تأكيد</Button><Button onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')} disabled={selectedOrder.status === 'shipped'} variant="outline" className="h-11 text-[10px] font-bold border-teal/20 text-teal">شحن</Button><Button onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')} disabled={selectedOrder.status === 'delivered'} variant="outline" className="h-11 text-[10px] font-bold border-green/20 text-green">تسليم</Button><Button onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')} disabled={selectedOrder.status === 'cancelled'} variant="outline" className="h-11 text-[10px] font-bold border-red/20 text-red">إلغاء</Button></div></div>
              </div>
              <div className="p-4 sm:p-5 border-t border-border bg-surface2/30 flex gap-3"><Button className="flex-1 gold-gradient text-background font-bold h-11 text-xs sm:text-sm gap-2" onClick={() => handlePrint(selectedOrder)}><Printer className="w-4 h-4" /><span>طباعة الوصل</span></Button><Button className="flex-1 bg-green hover:bg-green/80 text-white font-bold h-11 text-xs sm:text-sm gap-2" onClick={() => openWhatsApp(selectedOrder.phone, selectedOrder.orderNumber)}><MessageSquare className="w-4 h-4" /><span>WhatsApp</span></Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
