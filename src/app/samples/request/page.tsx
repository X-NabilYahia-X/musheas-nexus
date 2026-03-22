
"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sprout, Building2, User, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { ALGERIA_WILAYAS } from '@/lib/constants';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SampleRequestPage() {
  const { toast } = useToast();
  const { products } = useProducts();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    jobTitle: '',
    wilaya: '',
    product: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      toast({
        title: "تم استلام طلبك بنجاح",
        description: "سيقوم فريقنا التقني بالتواصل معك قريباً.",
        className: "bg-surface1 border-gold text-gold"
      });
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full p-8 text-center space-y-6 bg-surface1 border-gold/30">
          <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center mx-auto text-green">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-headline text-gold">شكراً لاهتمامكم بـ Musheas</h2>
          <p className="text-muted text-sm leading-relaxed">
            لقد تم تسجيل طلب العينة الخاص بمخبركم بنجاح. سنقوم بمراجعة الطلب وإرسال العينة المطلوبة عبر شريكنا Yalidine Express فور التأكد من البيانات التقنية.
          </p>
          <Button onClick={() => window.location.href = '/'} className="w-full gold-gradient text-background font-bold h-11">
            العودة للموقع
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 text-gold mb-4">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-headline text-gold">بوابة B2B للعينات المخبرية</h1>
          <p className="text-muted text-sm uppercase tracking-widest font-bold">للمختبرات ومراكز البحث وصناع التجميل</p>
        </div>

        <Card className="bg-surface1 border-border p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* بيانات الشخص */}
              <div className="space-y-4">
                <h3 className="text-gold font-bold text-xs uppercase tracking-tighter border-b border-gold/20 pb-2">البيانات الشخصية</h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted uppercase font-bold pr-1">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="pr-10 bg-surface2 border-border-strong text-right h-11" placeholder="أدخل اسمك..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted uppercase font-bold pr-1">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="pr-10 bg-surface2 border-border-strong text-right h-11 font-code" placeholder="05/06/07..." />
                  </div>
                </div>
              </div>

              {/* بيانات المؤسسة */}
              <div className="space-y-4">
                <h3 className="text-gold font-bold text-xs uppercase tracking-tighter border-b border-gold/20 pb-2">بيانات المؤسسة</h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted uppercase font-bold pr-1">اسم الشركة / المخبر</label>
                  <div className="relative">
                    <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="pr-10 bg-surface2 border-border-strong text-right h-11" placeholder="مثال: مخبر الأبحاث التجميلية" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted uppercase font-bold pr-1">المسمى الوظيفي</label>
                  <Input required value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} className="bg-surface2 border-border-strong text-right h-11" placeholder="مثال: مدير تقني" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase font-bold pr-1">الولاية (مقر العمل)</label>
                <Select required value={formData.wilaya} onValueChange={val => setFormData({...formData, wilaya: val})}>
                  <SelectTrigger className="bg-surface2 border-border-strong h-11 text-right">
                    <SelectValue placeholder="اختر الولاية" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface1 border-border text-text h-64">
                    {ALGERIA_WILAYAS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase font-bold pr-1">العينة المطلوبة</label>
                <Select required value={formData.product} onValueChange={val => setFormData({...formData, product: val})}>
                  <SelectTrigger className="bg-surface2 border-border-strong h-11 text-right">
                    <SelectValue placeholder="اختر المادة الأولية" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface1 border-border text-text">
                    {products.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-muted uppercase font-bold pr-1">الغرض من العينة (اختياري)</label>
              <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-surface2 border-border-strong text-right min-h-[100px]" placeholder="أخبرنا المزيد عن مشروعكم..." />
            </div>

            <Button type="submit" className="w-full gold-gradient text-background font-bold h-12 text-lg shadow-xl shadow-gold/10 active:scale-95 transition-all">
              <Send className="w-5 h-5 ml-2" /> إرسال طلب العينة
            </Button>
          </form>
        </Card>
        
        <p className="text-center text-[10px] text-muted uppercase tracking-widest">
          نحن نضمن سرية بياناتكم التقنية واتفاقيات عدم الإفصاح (NDA)
        </p>
      </div>
    </div>
  );
}
