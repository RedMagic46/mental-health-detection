'use client';

import Link from 'next/link';
import { HeartPulse, User as UserIcon, LogOut, LayoutDashboard, ClipboardList, MessageSquare, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logoutApi, fetchUser, isLoading } = useAuthStore();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutApi();
    setIsDropdownOpen(false);
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
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center gap-4">
                  <Link href={user?.role === 'admin' ? "/admin/dashboard" : "/dashboard"} className="text-foreground hover:text-primary px-2 py-2 rounded-md text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                  {user?.role === 'user' && (
                    <>
                      <Link href="/assessment/category" className="text-foreground hover:text-primary px-2 py-2 rounded-md text-sm font-medium transition-colors">
                        Tes
                      </Link>
                      <Link href="/consultations" className="text-foreground hover:text-primary px-2 py-2 rounded-md text-sm font-medium transition-colors">
                        Konsultasi
                      </Link>
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <Link href="/admin/consultations" className="text-foreground hover:text-primary px-2 py-2 rounded-md text-sm font-medium transition-colors">
                        Konsultasi
                      </Link>
                      <Link href="/admin/questions" className="text-foreground hover:text-primary px-2 py-2 rounded-md text-sm font-medium transition-colors">
                        Pertanyaan
                      </Link>
                    </>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-foreground">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-2 border-b border-border mb-1">
                        <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>

                      <div className="md:hidden">
                        <Link
                          href={user?.role === 'admin' ? "/admin/dashboard" : "/dashboard"}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-slate-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                          Dashboard
                        </Link>
                        {user?.role === 'user' && (
                          <>
                            <Link
                              href="/assessment/category"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-slate-50 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <ClipboardList className="w-4 h-4 text-muted-foreground" />
                              Tes Mental
                            </Link>
                            <Link
                              href="/consultations"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-slate-50 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <MessageSquare className="w-4 h-4 text-muted-foreground" />
                              Konsultasi
                            </Link>
                          </>
                        )}
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-slate-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                        Profil Saya
                      </Link>

                      <div className="border-t border-border mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
