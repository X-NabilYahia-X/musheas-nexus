import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/BottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar - Desktop Only */}
      <Sidebar className="hidden md:flex fixed left-0 top-0 w-[228px] border-r border-border" />
      
      <div className="flex-1 md:ml-[228px] flex flex-col min-h-screen relative pb-16 md:pb-0">
        <Topbar />
        <main className="p-4 sm:p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
        {/* Bottom Navigation - Mobile Only */}
        <BottomNav />
      </div>
    </div>
  );
}
