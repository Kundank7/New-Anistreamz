import { getSession } from '@/lib/auth';
import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Operator Panel',
  description: 'Manage Anistreamz database and scraper operations',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get('sidebar_collapsed')?.value === 'true';

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-secondary/30 selection:text-secondary">
      {/* Mobile Blocker */}
      <div className="md:hidden fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 text-center border-t-4 border-danger">
        <div className="w-16 h-16 mb-6 bg-danger/10 flex items-center justify-center border border-danger/20" style={{ clipPath: 'polygon(0 10px, 10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
          <span className="text-danger font-black text-2xl">!</span>
        </div>
        <h1 className="text-2xl font-black font-serif uppercase tracking-widest text-danger mb-4">Access Denied</h1>
        <p className="text-muted-text font-mono text-sm leading-relaxed max-w-[280px]">
          Operator panel requires a workstation interface. Mobile access is strictly prohibited.
        </p>
      </div>

      <div className="hidden md:flex h-full w-full">
        {/* Sidebar Navigation */}
        <AdminSidebar initialCollapsed={isCollapsed} />
        
        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto bg-background relative">
          {children}
        </main>
      </div>
    </div>
  );
}
