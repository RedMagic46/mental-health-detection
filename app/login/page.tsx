'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useStore';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginApi } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginApi(email, password);
    setLoading(false);
    if (result.ok) {
      // Refetch user to get role for redirect
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(result.error || 'Login gagal.');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-border">
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Masuk ke MindCare</h2>
          <p className="text-muted-foreground mt-2">Selamat datang kembali! Silakan masuk ke akun Anda.</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="nama@email.com"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                Lupa password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akun?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Daftar sekarang
          </Link>
        </div>
        
        <div className="mt-8 text-center text-xs text-muted-foreground pt-6 border-t border-border">
          <Link href="/admin/login" className="hover:text-foreground transition-colors">
            Masuk sebagai Administrator
          </Link>
        </div>
      </div>
    </div>
  );
}
