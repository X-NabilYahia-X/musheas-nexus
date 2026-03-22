"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuditLogs } from '@/lib/logger';
import { AuditLogEntry } from '@/types';
import { History, User, Clock, FileText, Tag, ShoppingCart, FlaskConical, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getAuditLogs();
    setLogs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const getTypeIcon = (type: AuditLogEntry['type']) => {
    switch (type) {
      case 'product': return <Tag className="w-4 h-4 text-gold" />;
      case 'order': return <ShoppingCart className="w-4 h-4 text-teal" />;
      case 'sample': return <FlaskConical className="w-4 h-4 text-green" />;
      case 'system': return <Settings className="w-4 h-4 text-muted" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-headline text-gold">سجل العمليات</h3>
            <p className="text-[10px] text-muted uppercase font-bold tracking-widest mt-1">مراقبة كافة التغييرات في النظام</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="border-border text-muted hover:border-gold/30 hover:text-gold gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      <Card className="bg-surface1 border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-surface2/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-[10px] text-muted font-bold uppercase tracking-widest">التوقيت</th>
                <th className="px-6 py-4 text-[10px] text-muted font-bold uppercase tracking-widest">المستخدم</th>
                <th className="px-6 py-4 text-[10px] text-muted font-bold uppercase tracking-widest">نوع العملية</th>
                <th className="px-6 py-4 text-[10px] text-muted font-bold uppercase tracking-widest">الحدث</th>
                <th className="px-6 py-4 text-[10px] text-muted font-bold uppercase tracking-widest">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted text-sm italic">
                    لا توجد عمليات مسجلة حالياً
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[10px] font-code text-muted">
                        <Clock className="w-3 h-3" />
                        {format(new Date(log.timestamp), 'dd/MM HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface2 border border-border flex items-center justify-center">
                          <User className="w-3 h-3 text-gold" />
                        </div>
                        <span className="text-xs font-bold">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(log.type)}
                        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">{log.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="border-gold/30 text-gold text-[10px] py-0">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-text/80 max-w-[300px] truncate md:max-w-md lg:whitespace-normal">
                        {log.details}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
