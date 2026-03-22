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
import { Search, FlaskConical, Building2, Eye, Printer, Zap, Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { addAuditLog } from '@/lib/logger';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminSamplesPage() {
  const { toast } = useToast();
  const { orders, updateOrderStatus } = useOrders();
  const { activeProvider } = useShipping();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSample, setSelectedSample] = useState<Order | null>(null);
  const [isShippingLoading, setIsShippingLoading] = useState(false);

  const samples = useMemo(() => orders.filter(o => o.orderType === 'sample'), [orders]);
  const filteredSamples = useMemo(() => samples.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  ), [samples, searchQuery]);

  const handleUpdateStatus = async (id: string, newStatus: OrderStatus, tracking?: string) => {
    try {
      await updateOrderStatus(id, newStatus, tracking);
      toast({ title: "تم تحديث الحالة" });
    } catch (e) {
      toast({ title: "خطأ في التحديث", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold flex items-center gap-2 text-gold"><FlaskConical /> عينات MUSHEAS</h3>
        <Input className="w-64" placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredSamples.map(order => (
          <Card key={order.id} className="p-4 border-border">
            <div className="flex justify-between mb-2"><StatusBadge status={order.status} /><Badge>B2B</Badge></div>
            <h4 className="font-bold">{order.companyName}</h4>
            <Button className="w-full mt-4" onClick={() => setSelectedSample(order)}><Eye className="ml-2 w-4 h-4" /> مراجعة</Button>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedSample} onOpenChange={() => setSelectedSample(null)}>
        <DialogContent dir="rtl">
          {selectedSample && (
            <div className="space-y-4">
              <DialogHeader><DialogTitle>{selectedSample.companyName}</DialogTitle></DialogHeader>
              <div className="bg-muted p-4 rounded-lg">
                 <p><strong>المسؤول:</strong> {selectedSample.name}</p>
                 <p><strong>الولاية:</strong> {selectedSample.wilaya}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
