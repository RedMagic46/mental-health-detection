'use client';

import { useAuthStore } from '../store/useStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  FileQuestion, 
  MessageSquare, 
  HelpCircle,
  LogOut, 
  Menu, 
  X, 
  Heart,
  HeartPulse,
  Loader2,
  Activity
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logoutApi, fetchUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role === 'consultant') {
        router.push('/consultant/consultations');
      } else if (user?.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [isAuthenticated, user, router, isLoading]);

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      await logoutApi();
      router.push('/login');
    }
  };


  
  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-slate-500 font-medium">Memverifikasi akses admin...</p>
        </div>
      </div>
    );
  }

  const sidebarLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { href: '/admin/assessments', label: 'Riwayat Tes', icon: <Activity className="w-5 h-5" /> },
    { href: '/admin/consultations', label: 'Consultations', icon: <CalendarCheck className="w-5 h-5" /> },
    { href: '/admin/questions', label: 'Questions', icon: <FileQuestion className="w-5 h-5" /> },
    { href: '/admin/forum', label: 'Forum', icon: <MessageSquare className="w-5 h-5" /> },
    { href: '/admin/faq', label: 'FAQ', icon: <HelpCircle className="w-5 h-5" /> },
    { href: '/admin/stories', label: 'Cerita Sukses', icon: <Heart className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen flex bg-background text-on-surface font-sans w-full relative">
      
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container py-6 gap-2 border-r border-border/30 z-40">
        <div className="px-6 mb-6 flex flex-col items-start gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-1.5 rounded-xl">
              <HeartPulse className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary leading-tight">MindCare</h1>
              <p className="text-xs text-on-surface-variant">Admin Panel</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col px-4 gap-1 overflow-y-auto">
          {sidebarLinks.map((link, idx) => {
            const active = pathname === link.href;
            return (
              <Link
                key={idx}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  active 
                    ? 'text-primary bg-secondary-fixed shadow-sm' 
                    : 'text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 flex flex-col gap-1 border-t border-border/10 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-destructive hover:bg-red-50 hover:text-red-700 rounded-lg text-sm font-semibold transition-all w-full text-left"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          
          <aside className="relative flex flex-col h-full w-64 bg-surface-container py-6 gap-2 border-r border-border/30 z-50">
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="px-6 mb-6 flex flex-col items-start gap-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-1.5 rounded-xl">
                  <HeartPulse className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-primary leading-tight">MindCare</h1>
                  <p className="text-xs text-on-surface-variant">Admin Panel</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 flex flex-col px-4 gap-1 overflow-y-auto">
              {sidebarLinks.map((link, idx) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={idx}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      active 
                        ? 'text-primary bg-secondary-fixed shadow-sm' 
                        : 'text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto px-4 flex flex-col gap-1 border-t border-border/10 pt-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-destructive hover:bg-red-50 hover:text-red-700 rounded-lg text-sm font-semibold transition-all w-full text-left"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      
      <div className="flex-grow md:ml-64 flex flex-col min-h-screen relative w-full overflow-x-hidden">
        
        <header className="flex justify-between items-center px-6 py-4 w-full sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border/20 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors cursor-pointer active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        
        <main className="flex-grow flex flex-col w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}
