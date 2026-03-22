
"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, Truck, ShieldCheck, Key, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useShipping } from '@/hooks/useSettings';
import { ShippingProvider } from '@/types';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminShippingPage() {
  const { toast } = useToast();
  const { providers, updateProvider, setActiveProvider } = useShipping();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProvider, setNewProvider] = useState<Partial<ShippingProvider>>({
    name: '',
    type: 'api',
    isActive: false,
    logoColor: 'text-gold'
  });

  const handleToggleActive = async (id: string) => {
    const provider = providers.find(p => p.id === id);
    if (!provider) return;
    if (!provider.isActive) {
      await setActiveProvider(id);
      toast({ title: `✓ تم تفعيل ${provider.name}`, className: "bg-green/10 border-green text-green" });
    }
  };

  const handleAddProvider = () => {
    if (!newProvider.name) return;
    const provider: ShippingProvider = {
      ...newProvider as ShippingProvider,
      id: `sp-${Date.now()}`,
    };
    setProviders([...providers, provider]);
    setIsAddDialogOpen(false);
    setNewProvider({ name: '', type: 'api', isActive: false, logoColor: 'text-gold' });
    toast({ title: "تمت إضافة شركة الشحن بنجاح" });
  };

  const handleDeleteProvider = (id: string) => {
    setProviders(providers.filter(p => p.id !== id));
    toast({ title: "تم حذف شركة الشحن", variant: "destructive" });
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gold/10 rounded-xl border border-gold/20 text-gold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-headline text-gold">إعدادات الشحن المتقدمة</h3>
            <p className="text-xs text-muted uppercase font-bold tracking-widest mt-1">حصري للمسؤولين (ADMIN ONLY)</p>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-background font-bold h-11">
              <Plus className="w-4 h-4 ml-2" />
              إضافة شركة شحن جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface1 border-border text-text" dir="rtl">
            <DialogHeader>
              <DialogTitle className="font-headline text-gold text-right">إضافة شريك شحن جديد</DialogTitle>
              <DialogDescription className="text-right text-xs text-muted">قم بإدخال بيانات الربط البرمجي لشركة الشحن الجديدة.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase font-bold">اسم الشركة</label>
                <Input 
                  placeholder="مثال: Nord et Sud Express" 
                  value={newProvider.name}
                  onChange={e => setNewProvider({...newProvider, name: e.target.value})}
                  className="bg-surface2 border-border-strong text-right"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase font-bold">نوع الربط</label>
                <select 
                  className="w-full h-11 bg-surface2 border border-border-strong rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                  value={newProvider.type}
                  onChange={e => setNewProvider({...newProvider, type: e.target.value as any})}
                >
                  <option value="api">API (Yalidine Style)</option>
                  <option value="token">Token (Zr Express Style)</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddProvider} className="gold-gradient text-background font-bold w-full h-11">حفظ الشريك</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
        {providers.map((provider) => (
          <Card key={provider.id} className={cn("bg-surface1 border-border p-6 space-y-6 relative transition-all", provider.isActive && "ring-2 ring-gold/50 shadow-lg shadow-gold/5")}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg bg-surface2 flex items-center justify-center border border-border/50", provider.logoColor)}>
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{provider.name}</h4>
                  <p className="text-[10px] text-muted">{provider.type === 'api' ? 'ربط برمجي API' : 'ربط عبر Token'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {provider.isActive ? (
                  <Badge className="bg-green/20 text-green border-green/30">نشط حالياً</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted border-border">غير مفعل</Badge>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDeleteProvider(provider.id)} className="text-muted hover:text-red hover:bg-red/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase font-bold pr-1">مفتاح الربط (Key/Token)</label>
                <div className="relative">
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <Input type="password" placeholder="••••••••••••••••" className="pr-10 bg-surface2 border-border-strong font-code h-11" />
                </div>
              </div>
              {provider.type === 'api' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted uppercase font-bold pr-1">API ID</label>
                  <Input placeholder="ID-XXXXXXXX" className="bg-surface2 border-border-strong font-code h-11" />
                </div>
              )}
            </div>

            <div className="p-4 bg-surface2/50 rounded-lg border border-border/30 flex justify-between items-center">
              <div className="space-y-0.5">
                <p className="text-xs font-bold">تفعيل كخيار شحن افتراضي</p>
                <p className="text-[9px] text-muted">سيتم تسجيل الطلبات الجديدة عبر هذه الشركة تلقائياً</p>
              </div>
              <Switch 
                checked={provider.isActive} 
                onCheckedChange={() => handleToggleActive(provider.id)}
                className="data-[state=checked]:bg-gold" 
              />
            </div>

            <Button 
              className={cn("w-full h-11 font-bold transition-all", provider.isActive ? "gold-gradient text-background" : "bg-surface2 border-border text-gold hover:bg-gold/10")}
            >
              {provider.isActive ? <><CheckCircle2 className="w-4 h-4 ml-2" /> مفعل</> : "حفظ الإعدادات"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
