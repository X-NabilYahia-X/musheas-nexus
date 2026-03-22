"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings, useShipping } from '@/hooks/useSettings';
import { Save, User, Truck, Globe, Bell, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AppSettings } from '@/types';

function FieldSkeleton() {
  return <div className="space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-11 w-full" /></div>;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { settings, loading, saving, saveSettings } = useSettings();
  const { providers, setActiveProvider } = useShipping();

  // Local form state — seeded from DB, then user can edit freely
  const [form, setForm] = useState<Partial<AppSettings>>({});

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const set = (field: keyof AppSettings, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async (section: string, fields: (keyof AppSettings)[]) => {
    const updates: Partial<AppSettings> = {};
    fields.forEach(f => { (updates as any)[f] = (form as any)[f]; });
    const ok = await saveSettings(updates);
    if (ok) {
      toast({ title: `✓ تم حفظ ${section}`, className: "bg-gold/10 border-gold text-gold" });
    } else {
      toast({ title: "خطأ في الحفظ", variant: "destructive" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* Contact Card */}
      <Card className="bg-surface1 border-border p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-gold" />
          <h3 className="text-lg font-headline text-gold">معلومات الاتصال</h3>
        </div>
        <div className="space-y-4 flex-1">
          {loading ? <><FieldSkeleton /><div className="grid grid-cols-2 gap-4"><FieldSkeleton /><FieldSkeleton /></div><FieldSkeleton /></>
          : <>
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted uppercase font-bold">الاسم الكامل</label>
              <Input value={form.contact_name ?? ''} onChange={e => set('contact_name', e.target.value)} className="bg-surface2 border-border-strong h-11" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase font-bold">الهاتف</label>
                <Input value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} className="bg-surface2 border-border-strong h-11 font-code" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase font-bold">الدور</label>
                <Input value={form.role ?? ''} onChange={e => set('role', e.target.value)} className="bg-surface2 border-border-strong h-11" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted uppercase font-bold">البريد الإلكتروني</label>
              <Input value={form.email ?? ''} onChange={e => set('email', e.target.value)} className="bg-surface2 border-border-strong h-11" />
            </div>
          </>}
        </div>
        <Button disabled={saving || loading} onClick={() => handleSave('الاتصال', ['contact_name', 'phone', 'role', 'email'])} className="mt-6 border-border-strong bg-surface2 hover:bg-gold hover:text-background font-bold h-11 transition-all">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} حفظ
        </Button>
      </Card>

      {/* Delivery Card */}
      <Card className="bg-surface1 border-border p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <Truck className="w-5 h-5 text-gold" />
          <h3 className="text-lg font-headline text-gold">التوصيل والرسوم</h3>
        </div>
        <div className="space-y-4 flex-1">
          {loading ? <><div className="grid grid-cols-2 gap-4"><FieldSkeleton /><FieldSkeleton /></div><FieldSkeleton /></>
          : <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase font-bold">رسوم الشحن (دج)</label>
                <Input type="number" value={form.shipping_fee ?? 0} onChange={e => set('shipping_fee', Number(e.target.value))} className="bg-surface2 border-border-strong h-11 font-code" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase font-bold">الحد الأدنى للطلب (دج)</label>
                <Input type="number" value={form.min_order ?? 0} onChange={e => set('min_order', Number(e.target.value))} className="bg-surface2 border-border-strong h-11 font-code" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted uppercase font-bold">مدة التوصيل</label>
              <Input value={form.shipping_delay ?? ''} onChange={e => set('shipping_delay', e.target.value)} className="bg-surface2 border-border-strong h-11" />
            </div>

            {/* Shipping Providers */}
            {providers.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/30">
                <label className="text-[10px] text-muted uppercase font-bold">مزود الشحن النشط</label>
                <div className="space-y-2">
                  {providers.map(p => (
                    <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${p.isActive ? 'bg-gold/10 border-gold/40' : 'bg-surface2 border-border'}`}>
                      <div className="flex items-center gap-2">
                        {p.isActive ? <Wifi className="w-4 h-4 text-gold" /> : <WifiOff className="w-4 h-4 text-muted" />}
                        <span className="text-xs font-bold">{p.name}</span>
                      </div>
                      {!p.isActive && (
                        <Button size="sm" variant="outline" className="h-7 text-[10px] border-gold/20 text-gold hover:bg-gold/10" onClick={() => setActiveProvider(p.id)}>
                          تفعيل
                        </Button>
                      )}
                      {p.isActive && <span className="text-[10px] text-gold font-bold">نشط</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>}
        </div>
        <Button disabled={saving || loading} onClick={() => handleSave('التوصيل', ['shipping_fee', 'min_order', 'shipping_delay'])} className="mt-6 border-border-strong bg-surface2 hover:bg-gold hover:text-background font-bold h-11 transition-all">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} حفظ
        </Button>
      </Card>

      {/* Website Texts Card */}
      <Card className="bg-surface1 border-border p-6 flex flex-col lg:col-span-1">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-gold" />
          <h3 className="text-lg font-headline text-gold">نصوص الموقع</h3>
        </div>
        <div className="space-y-4 flex-1">
          {loading ? <><FieldSkeleton /><FieldSkeleton /><div className="grid grid-cols-2 gap-4"><FieldSkeleton /><FieldSkeleton /></div></>
          : <>
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted uppercase font-bold">شعار الصفحة الرئيسية</label>
              <Input value={form.hero_slogan ?? ''} onChange={e => set('hero_slogan', e.target.value)} className="bg-surface2 border-border-strong h-11" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted uppercase font-bold">النص التعريفي</label>
              <Textarea value={form.hero_lead ?? ''} onChange={e => set('hero_lead', e.target.value)} className="bg-surface2 border-border-strong text-sm resize-none min-h-[100px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase font-bold">العنوان الفرعي</label>
                <Input value={form.hero_kicker ?? ''} onChange={e => set('hero_kicker', e.target.value)} className="bg-surface2 border-border-strong h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase font-bold">ملاحظة أسفل الصفحة</label>
                <Input value={form.hero_note ?? ''} onChange={e => set('hero_note', e.target.value)} className="bg-surface2 border-border-strong h-11" />
              </div>
            </div>
          </>}
        </div>
        <Button disabled={saving || loading} onClick={() => handleSave('النصوص', ['hero_slogan', 'hero_lead', 'hero_kicker', 'hero_note'])} className="mt-6 border-border-strong bg-surface2 hover:bg-gold hover:text-background font-bold h-11 transition-all">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} حفظ
        </Button>
      </Card>

      {/* Notifications Card */}
      <Card className="bg-surface1 border-border p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-gold" />
          <h3 className="text-lg font-headline text-gold">تفضيلات الإشعارات</h3>
        </div>
        <div className="space-y-6 flex-1">
          {loading ? <><FieldSkeleton /><FieldSkeleton /><FieldSkeleton /></>
          : <>
            {([
              { field: 'notif_sound' as const, label: 'صوت الطلبات الجديدة', desc: 'تنبيه صوتي عند وصول طلب' },
              { field: 'notif_whatsapp' as const, label: 'تنبيه WhatsApp تلقائي', desc: 'إرسال رسالة تأكيد للزبون' },
              { field: 'notif_report' as const, label: 'تقرير أسبوعي', desc: 'ملخص PDF عبر البريد كل إثنين' },
            ]).map(({ field, label, desc }) => (
              <div key={field} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-[10px] text-muted">{desc}</p>
                </div>
                <Switch
                  checked={!!(form as any)[field]}
                  onCheckedChange={v => set(field, v)}
                  className="data-[state=checked]:bg-gold"
                />
              </div>
            ))}
          </>}
        </div>
        <Button disabled={saving || loading} onClick={() => handleSave('الإشعارات', ['notif_sound', 'notif_whatsapp', 'notif_report'])} className="mt-6 border-border-strong bg-surface2 hover:bg-gold hover:text-background font-bold h-11 transition-all">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} حفظ
        </Button>
      </Card>
    </div>
  );
}
