
import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

const STYLES: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  new: {
    bg: 'bg-[#55aab4]/15',
    text: 'text-[#7dd4de]',
    label: 'جديد'
  },
  confirmed: {
    bg: 'bg-[#d2b26b]/13',
    text: 'text-[#d2b26b]',
    label: 'مؤكد'
  },
  shipped: {
    bg: 'bg-[#5de0a0]/15',
    text: 'text-[#5de0a0]',
    label: 'مع شركة التوصيل'
  },
  delivered: {
    bg: 'bg-[#3dba7e]/20',
    text: 'text-[#3dba7e]',
    label: 'مُسلَّم'
  },
  cancelled: {
    bg: 'bg-[#e05c5c]/12',
    text: 'text-[#f08080]',
    label: 'ملغى'
  }
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const style = STYLES[status];
  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap", style.bg, style.text, className)}>
      <div className={cn("w-1.5 h-1.5 rounded-full", style.text.replace('text-', 'bg-'))} />
      {style.label}
    </div>
  );
}
