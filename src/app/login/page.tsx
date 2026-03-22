"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sprout, Lock, Mail, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, loading, error } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) {
      toast({ title: "تم تسجيل الدخول بنجاح", className: "bg-surface1 border-gold text-gold" });
      router.push('/overview');
    } else {
      toast({ title: "خطأ في تسجيل الدخول", description: error ?? "بيانات الدخول غير صحيحة", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal/5 rounded-full blur-[120px]" />
      <Card className="w-full max-w-[440px] bg-surface1 border-border p-8 md:p-12 space-y-8 relative z-10 shadow-2xl border-t-4 border-t-gold">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mx-auto mb-6 border border-gold/20 shadow-[0_0_20px_rgba(210,178,107,0.1)]">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-headline text-gold tracking-tight">MUSHEAS NEXUS</h1>
          <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-bold">بوابة إدارة البيوتكنولوجيا</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setSelectedRole('admin')} className={cn("p-3 rounded-xl border flex flex-col items-center gap-2 transition-all", selectedRole === 'admin' ? "bg-gold/10 border-gold text-gold" : "bg-surface2 border-border-strong text-muted hover:border-gold/30")}>
            <ShieldCheck className="w-5 h-5" /><span className="text-[10px] font-bold uppercase">المدير</span>
          </button>
          <button type="button" onClick={() => setSelectedRole('delivery')} className={cn("p-3 rounded-xl border flex flex-col items-center gap-2 transition-all", selectedRole === 'delivery' ? "bg-teal/10 border-teal text-teal" : "bg-surface2 border-border-strong text-muted hover:border-teal/30")}>
            <Truck className="w-5 h-5" /><span className="text-[10px] font-bold uppercase">موظف توصيل</span>
          </button>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-muted uppercase font-bold px-1 tracking-wider">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-gold transition-colors" />
                <Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="admin@musheas.dz" className="pl-10 bg-surface2 border-border-strong h-12 focus:ring-gold focus:border-gold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-muted uppercase font-bold px-1 tracking-wider">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-gold transition-colors" />
                <Input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className="pl-10 bg-surface2 border-border-strong h-12 focus:ring-gold focus:border-gold" />
              </div>
            </div>
          </div>
          {error && <p className="text-red text-xs text-center bg-red/10 border border-red/20 rounded-lg p-3">{error}</p>}
          <Button type="submit" disabled={loading} className={cn("w-full font-bold h-12 text-lg group shadow-lg transition-all duration-300", selectedRole === 'admin' ? "gold-gradient text-background" : "bg-teal text-background hover:bg-teal/90")}>
            {loading ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />جاري التحقق...</div>
              : <div className="flex items-center justify-center gap-2">تسجيل الدخول<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></div>}
          </Button>
        </form>
        <div className="pt-6 text-center border-t border-border/50">
          <p className="text-[9px] text-muted uppercase tracking-[0.1em]">نظام Musheas Nexus مخصص للمصرح لهم فقط</p>
          <p className="text-[9px] text-gold/60 mt-2 font-code">© {new Date().getFullYear()} MUSHEAS ALGERIA - BIOTECH DIVISION</p>
        </div>
      </Card>
    </div>
  );
}
