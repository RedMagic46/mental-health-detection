'use client';

import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logoutApi, fetchUser, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    await logoutApi();
    router.push('/');
  };

  if (isLoading) {
    return (
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <HeartPulse className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl text-primary hidden sm:block">MindCare</span>
              </Link>
            </div>
            <div className="h-8 w-24 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <HeartPulse className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-primary hidden sm:block">MindCare</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link href="/register" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Daftar
                </Link>
              </>
            ) : (
              <>
                <Link href={user?.role === 'admin' ? "/admin/dashboard" : "/dashboard"} className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                {user?.role === 'user' && (
                  <>
                    <Link href="/assessment" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Tes
                    </Link>
                    <Link href="/consultations" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Konsultasi
                    </Link>
                  </>
                )}
                {user?.role === 'admin' && (
                  <>
                    <Link href="/admin/consultations" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Konsultasi
                    </Link>
                    <Link href="/admin/questions" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Pertanyaan
                    </Link>
                  </>
                )}
                <span className="text-sm text-muted-foreground hidden md:block">
                  {user?.name}
                </span>
                <button onClick={handleLogout} className="text-foreground hover:text-destructive px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
