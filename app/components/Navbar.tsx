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
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="bg-primary/10 p-1.5 rounded-xl">
                  <HeartPulse className="h-7 w-7 text-primary" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hidden sm:block">MindCare</span>
              </Link>
            </div>
            <div className="h-8 w-24 bg-muted/50 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-primary/10 p-1.5 rounded-xl">
                <HeartPulse className="h-7 w-7 text-primary" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hidden sm:block">MindCare</span>
            </Link>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="text-muted-foreground hover:text-primary px-4 py-2 rounded-full text-sm font-semibold transition-all hover:bg-primary/5">
                  Login
                </Link>
                <Link href="/register" className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Daftar
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center gap-1">
                  <Link href={user?.role === 'admin' ? "/admin/dashboard" : "/dashboard"} className="text-muted-foreground hover:text-primary hover:bg-primary/5 px-4 py-2 rounded-full text-sm font-semibold transition-all">
                    Dashboard
                  </Link>
                  {user?.role === 'user' && (
                    <>
                      <Link href="/assessment/category" className="text-muted-foreground hover:text-primary hover:bg-primary/5 px-4 py-2 rounded-full text-sm font-semibold transition-all">
                        Tes
                      </Link>
                      <Link href="/consultations" className="text-muted-foreground hover:text-primary hover:bg-primary/5 px-4 py-2 rounded-full text-sm font-semibold transition-all">
                        Konsultasi
                      </Link>
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <Link href="/admin/consultations" className="text-muted-foreground hover:text-primary hover:bg-primary/5 px-4 py-2 rounded-full text-sm font-semibold transition-all">
                        Konsultasi
                      </Link>
                      <Link href="/admin/questions" className="text-muted-foreground hover:text-primary hover:bg-primary/5 px-4 py-2 rounded-full text-sm font-semibold transition-all">
                        Pertanyaan
                      </Link>
                    </>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-50 transition-all focus:outline-none ring-2 ring-transparent hover:ring-primary/20"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-foreground pr-1">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-border/50 mb-1 bg-slate-50/50 mx-2 rounded-xl">
                        <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate font-medium mt-0.5">{user?.email}</p>
                      </div>

                      <div className="md:hidden px-2">
                        <Link
                          href={user?.role === 'admin' ? "/admin/dashboard" : "/dashboard"}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        {user?.role === 'user' && (
                          <>
                            <Link
                              href="/assessment/category"
                              className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <ClipboardList className="w-4 h-4" />
                              Tes Mental
                            </Link>
                            <Link
                              href="/consultations"
                              className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <MessageSquare className="w-4 h-4" />
                              Konsultasi
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="px-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all mt-1"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <UserIcon className="w-4 h-4" />
                          Profil Saya
                        </Link>
                      </div>

                      <div className="border-t border-border/50 mt-2 px-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition-all"
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
