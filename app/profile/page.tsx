'use client';

import { useAuthStore } from '../store/useStore';
import { User, Mail, Shield, Calendar, ArrowLeft, Edit2, Save, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updateProfileApi } = useAuthStore();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const result = await updateProfileApi(name, email);
    
    setIsSaving(false);
    if (result.ok) {
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: result.error || 'Gagal memperbarui profil.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Profil Saya</h1>
          <p className="text-muted-foreground">Kelola informasi akun dan pengaturan profil Anda.</p>
        </div>
        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profil
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1">
          <div className="bg-white border border-border rounded-2xl p-6 text-center shadow-sm">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-primary/5 mx-auto mb-4">
              <User className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold text-foreground truncate">{user.name}</h2>
            <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
            
            <div className="mt-6 pt-6 border-t border-border">
               <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-slate-50 py-2 rounded-lg">
                 <Calendar className="w-3.5 h-3.5" />
                 <span>
                   Terdaftar sejak {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '2024'}
                 </span>
               </div>
            </div>
          </div>
        </div>

        
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Informasi Pribadi</h3>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setIsEditing(false); setName(user.name); setEmail(user.email); }}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isSaving}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Nama lengkap Anda"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Alamat Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="email@contoh.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="flex-grow flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium disabled:opacity-70"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Simpan Perubahan
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-slate-50 transition-all font-medium"
                      disabled={isSaving}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-slate-100 rounded-lg">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                      <p className="text-lg font-semibold text-foreground">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-slate-100 rounded-lg">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Alamat Email</p>
                      <p className="text-lg font-semibold text-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-slate-100 rounded-lg">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Peran Akun</p>
                      <p className="text-lg font-semibold text-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
            <div className="text-amber-500">
              <Shield className="w-5 h-5" />
            </div>
            <p className="text-sm text-amber-800">
              Data profil Anda bersifat rahasia dan hanya digunakan untuk keperluan pelayanan kesehatan mental di MindCare.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
