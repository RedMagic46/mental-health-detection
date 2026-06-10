'use client';

import { useAuthStore } from '../../store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, X, Loader2, Search, Shield, Filter, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'consultant';
  createdAt: string;
  lastActiveAt?: string | null;
}

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [mountedTime] = useState(() => Date.now());

  const getStatusText = (lastActiveAt?: string | null, createdAt?: string) => {
    const activeTimeStr = lastActiveAt || createdAt;
    if (!activeTimeStr) return { text: 'Offline', isOnline: false };
    const lastActive = new Date(activeTimeStr).getTime();
    const diffMs = mountedTime - lastActive;
    
    if (lastActiveAt && diffMs < 3 * 60 * 1000) {
      return { text: 'Online', isOnline: true };
    }
    
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 60) {
      return { text: `Offline, ${diffMins}m lalu`, isOnline: false };
    }
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return { text: `Offline, ${diffHours}j lalu`, isOnline: false };
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays <= 7) {
      return { text: `Offline, ${diffDays}h lalu`, isOnline: false };
    }
    
    const dateStr = new Date(activeTimeStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
    return { text: `Offline, ${dateStr}`, isOnline: false };
  };
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'consultant'>('all');

  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', email: '', password: '', role: 'user' as 'user' | 'admin' | 'consultant' });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', role: 'user' as 'user' | 'admin' | 'consultant' });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);

  
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat daftar user.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!newForm.name.trim() || !newForm.email.trim() || !newForm.password.trim()) {
      setMessage({ type: 'error', text: 'Semua kolom wajib diisi.' });
      return;
    }

    if (newForm.password.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers([data.user, ...users]);
        setNewForm({ name: '', email: '', password: '', role: 'user' });
        setIsAddModalOpen(false);
        setMessage({ type: 'success', text: 'User baru berhasil ditambahkan.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      } else {
        const errData = await res.json();
        setMessage({ type: 'error', text: errData.error || 'Gagal menambahkan user.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSubmitting(false);
    }
  };

  
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setMessage({ type: '', text: '' });

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setMessage({ type: 'error', text: 'Nama dan email tidak boleh kosong.' });
      return;
    }

    if (editForm.password && editForm.password.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(users.map((u) => (u.id === editingUser.id ? data.user : u)));
        setEditingUser(null);
        setEditForm({ name: '', email: '', password: '', role: 'user' });
        setMessage({ type: 'success', text: 'Data user berhasil diperbarui.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      } else {
        const errData = await res.json();
        setMessage({ type: 'error', text: errData.error || 'Gagal memperbarui user.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSubmitting(false);
    }
  };

  
  const handleDeleteUser = async (id: string) => {
    if (id === user?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus user ini secara permanen?')) return;

    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
        setMessage({ type: 'success', text: 'User berhasil dihapus.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      } else {
        const errData = await res.json();
        setMessage({ type: 'error', text: errData.error || 'Gagal menghapus user.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    }
  };

  
  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
    });
    setIsEditRoleOpen(false);
  };

  
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-10">
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        {message.text && (
          <div
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              message.type === 'success'
                ? 'bg-teal-50 text-teal-700 border-teal-100'
                : 'bg-red-50 text-red-700 border-red-100'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen User</h1>
          <p className="text-slate-500 mt-1 text-sm">Kelola akun, tingkatkan peranan, dan atur hak akses.</p>
        </div>
        <button
          onClick={() => {
            setMessage({ type: '', text: '' });
            setIsAddModalOpen(true);
            setIsAddRoleOpen(false);
          }}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-center"
        >
          <Plus className="w-5 h-5" /> Tambah User Baru
        </button>
      </div>

      
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>

        
        <div className="flex items-center gap-3 w-full md:w-auto self-start md:self-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5 text-primary" /> Filter Peranan:
          </span>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            {(['all', 'admin', 'consultant', 'user'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize flex-1 md:flex-none ${
                  roleFilter === role
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {role === 'all' ? 'Semua' : role === 'consultant' ? 'konsultan' : role}
              </button>
            ))}
          </div>
        </div>
      </div>

      
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div className="h-4 w-1/4 bg-slate-100 animate-pulse rounded-md"></div>
            <div className="h-4 w-12 bg-slate-100 animate-pulse rounded-md"></div>
          </div>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-b-0 animate-pulse">
              <div className="flex items-center gap-3 flex-grow max-w-[200px]">
                <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-24 bg-slate-100 rounded-md"></div>
                  <div className="h-2 w-32 bg-slate-100 rounded-md"></div>
                </div>
              </div>
              <div className="h-4 w-24 bg-slate-100 rounded-md"></div>
              <div className="h-5 w-16 bg-slate-100 rounded-full"></div>
              <div className="h-4 w-20 bg-slate-100 rounded-md"></div>
              <div className="flex justify-end gap-1.5">
                <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
                <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
          Tidak ada data user yang cocok dengan pencarian Anda.
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Nama</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Email</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Peranan</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 max-w-[140px] sm:max-w-[220px] truncate" title={u.name}>{u.name}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-[180px] sm:max-w-[280px] truncate" title={u.email}>{u.email}</td>
                  <td className="px-6 py-4">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        <Shield className="w-3 h-3 fill-indigo-100" /> Admin
                      </span>
                    ) : u.role === 'consultant' ? (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        <Shield className="w-3 h-3 fill-amber-100" /> Konsultan
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-slate-100 text-slate-600 border border-slate-200/50 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const status = getStatusText(u.lastActiveAt, u.createdAt);
                      return (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full ${status.isOnline ? 'bg-primary animate-pulse' : 'bg-slate-300'}`} />
                          <span className={status.isOnline ? 'font-semibold text-primary' : 'text-slate-500'}>
                            {status.text}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-all"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user?.id}
                        className={`p-2 rounded-lg transition-all ${
                          u.id === user?.id
                            ? 'text-slate-200 cursor-not-allowed'
                            : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={u.id === user?.id ? 'Tidak dapat menghapus diri sendiri' : 'Hapus User'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-slate-800">Tambah User Baru</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-500 mb-6 text-xs">Buat akun pengguna baru atau administrator baru.</p>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="Ketik nama lengkap..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={newForm.email}
                  onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                  placeholder="Ketik email..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={newForm.password}
                  onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
                  placeholder="Minimal 6 karakter..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Peranan (Role)</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAddRoleOpen(!isAddRoleOpen)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                  >
                    <span>
                      {newForm.role === 'user' ? 'User Biasa' : 
                       newForm.role === 'consultant' ? 'Konsultan' : 'Admin'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isAddRoleOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isAddRoleOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsAddRoleOpen(false)} />
                      <ul className="absolute left-0 mt-1.5 z-30 w-full bg-white border border-slate-200/60 rounded-xl shadow-lg py-1.5">
                        {[
                          { value: 'user', label: 'User Biasa' },
                          { value: 'consultant', label: 'Konsultan' },
                          { value: 'admin', label: 'Admin' }
                        ].map(item => (
                          <li key={item.value}>
                            <button
                              type="button"
                              onClick={() => {
                                setNewForm({ ...newForm, role: item.value as any });
                                setIsAddRoleOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-slate-50 flex items-center justify-between ${
                                newForm.role === item.value ? 'text-primary font-bold bg-primary/5' : 'text-slate-600'
                              }`}
                            >
                              <span>{item.label}</span>
                              {newForm.role === item.value && <Check className="w-3.5 h-3.5 text-primary" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md text-sm flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-slate-800">Ubah Data User</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-500 mb-6 text-xs">Ubah detail profil user atau atur ulang sandi.</p>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Ketik nama lengkap..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Ketik email..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Password Baru <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Biarkan kosong jika tidak diubah..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Peranan (Role)</label>
                {editingUser.id === user?.id ? (
                  <div className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 text-sm cursor-not-allowed flex items-center justify-between">
                    <span>Admin</span>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsEditRoleOpen(!isEditRoleOpen)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                    >
                      <span>
                        {editForm.role === 'user' ? 'User Biasa' : 
                         editForm.role === 'consultant' ? 'Konsultan' : 'Admin'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isEditRoleOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isEditRoleOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setIsEditRoleOpen(false)} />
                        <ul className="absolute left-0 mt-1.5 z-30 w-full bg-white border border-slate-200/60 rounded-xl shadow-lg py-1.5">
                          {[
                            { value: 'user', label: 'User Biasa' },
                            { value: 'consultant', label: 'Konsultan' },
                            { value: 'admin', label: 'Admin' }
                          ].map(item => (
                            <li key={item.value}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditForm({ ...editForm, role: item.value as any });
                                  setIsEditRoleOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-slate-50 flex items-center justify-between ${
                                  editForm.role === item.value ? 'text-primary font-bold bg-primary/5' : 'text-slate-600'
                                }`}
                              >
                                <span>{item.label}</span>
                                {editForm.role === item.value && <Check className="w-3.5 h-3.5 text-primary" />}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
                {editingUser.id === user?.id && (
                  <p className="text-[10px] text-slate-400 mt-1">Anda tidak dapat menurunkan peranan admin Anda sendiri.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md text-sm flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
