'use client';

import { useAuthStore } from '../store/useStore';
import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { Search, MessageSquare, ThumbsUp, PlusCircle, AlertCircle, Sparkles, Filter, ChevronDown, Check, Lock, Trash2, User, Unlock } from 'lucide-react';
import type { ForumThread } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';

function ForumFeed() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Umum');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showOnlyMyThreads, setShowOnlyMyThreads] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  
  const categories = ['Skrining', 'Dukungan Emosional', 'Pemulihan', 'Umum'];

  
  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/forum', window.location.origin);
      if (selectedCategory) url.searchParams.set('category', selectedCategory);
      if (searchQuery) url.searchParams.set('search', searchQuery);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
      }
    } catch (err) {
      console.error('Error fetching threads:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat !== null) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  
  const handleCategorySelect = (category: string) => {
    const nextCategory = selectedCategory === category ? '' : category;
    setSelectedCategory(nextCategory);
    
    
    const params = new URLSearchParams(window.location.search);
    if (nextCategory) {
      params.set('category', nextCategory);
    } else {
      params.delete('category');
    }
    router.push(`/forum?${params.toString()}`);
  };

  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    router.push(`/forum?${params.toString()}`);
    fetchThreads();
  };

  
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!newTitle.trim() || !newContent.trim()) {
      setSubmitError('Judul dan isi diskusi tidak boleh kosong.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          isAnonymous,
          isPrivate,
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        setIsAnonymous(false);
        setIsPrivate(false);
        setNewCategory('Umum');
        
        fetchThreads();
      } else {
        const errData = await res.json();
        setSubmitError(errData.error || 'Gagal membuat diskusi.');
      }
    } catch {
      setSubmitError('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  
  const handleDeleteThread = async (threadId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus diskusi ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const res = await fetch(`/api/forum/${threadId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        
        setThreads((prev) => prev.filter((t) => t.id !== threadId));
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus diskusi.');
      }
    } catch (err) {
      console.error('Error deleting thread:', err);
      alert('Terjadi kesalahan jaringan.');
    }
  };

  
  const handleTogglePrivacy = async (threadId: string, currentPrivate: boolean) => {
    const nextPrivate = !currentPrivate;

    
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            isPrivate: nextPrivate,
          };
        }
        return t;
      })
    );

    try {
      const res = await fetch(`/api/forum/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrivate: nextPrivate }),
      });

      if (!res.ok) {
        fetchThreads();
      }
    } catch {
      fetchThreads();
    }
  };

  
  const displayedThreads = threads.filter((t) => !showOnlyMyThreads || t.userId === user?.id);

  
  const handleToggleLike = async (threadId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          const liked = !t.likedByCurrentUser;
          return {
            ...t,
            likedByCurrentUser: liked,
            likesCount: liked ? t.likesCount + 1 : t.likesCount - 1,
          };
        }
        return t;
      })
    );

    try {
      const res = await fetch(`/api/forum/${threadId}/like`, {
        method: 'POST',
      });
      if (!res.ok) {
        
        fetchThreads();
      }
    } catch {
      
      fetchThreads();
    }
  };

  
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Skrining':
        return 'bg-teal-50 text-teal-700 border-teal-200/50';
      case 'Dukungan Emosional':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
      case 'Pemulihan':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-8 h-8 text-primary" /> Forum Komunitas
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-xl text-base">
            Ruang aman dan suportif bagi semua orang untuk berbagi kisah, mendiskusikan hasil tes, dan saling menguatkan.
          </p>
        </div>
        
        
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Cari diskusi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm transition-all"
          />
          <Search className="absolute left-4 top-3.5 h-5 h-5 text-secondary" />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-sm font-bold text-on-surface flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-primary" /> Filter Kategori:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  const params = new URLSearchParams(window.location.search);
                  params.delete('category');
                  router.push(`/forum?${params.toString()}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  !selectedCategory
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-surface hover:bg-slate-100 border-border/40 text-secondary'
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-surface hover:bg-slate-100 border-border/40 text-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}

              {isAuthenticated && (
                <button
                  onClick={() => {
                    setShowOnlyMyThreads(!showOnlyMyThreads);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    showOnlyMyThreads
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                      : 'bg-surface hover:bg-slate-100 border-border/40 text-secondary'
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Diskusi Saya
                </button>
              )}
            </div>
          </div>

          
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container/60 animate-pulse space-y-4">
                  <div className="h-4 bg-muted/60 rounded w-1/4" />
                  <div className="h-6 bg-muted/60 rounded w-3/4" />
                  <div className="h-4 bg-muted/60 rounded w-5/6" />
                  <div className="flex gap-4">
                    <div className="h-8 bg-muted/60 rounded-full w-20" />
                    <div className="h-8 bg-muted/60 rounded-full w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedThreads.length === 0 ? (
            <div className="bg-surface-container-lowest p-12 text-center rounded-2xl border border-surface-container/60 shadow-sm">
              <AlertCircle className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-on-surface">Tidak Ada Diskusi</h3>
              <p className="text-on-surface-variant text-sm mt-1 max-w-sm mx-auto">
                {showOnlyMyThreads 
                  ? 'Anda belum memiliki diskusi di forum ini. Silakan buat diskusi pertama Anda!'
                  : 'Belum ada topik diskusi yang sesuai dengan kriteria filter pencarian Anda. Jadilah yang pertama membuat diskusi!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedThreads.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container/60 shadow-sm hover:shadow transition-all duration-300"
                >
                  
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadgeClass(thread.category)}`}>
                        {thread.category}
                      </span>
                      {thread.isPrivate && (
                        <span className="bg-red-50 text-red-700 border-red-200/50 px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Privat
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant">
                      {new Date(thread.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  
                  <h3 className="text-lg font-bold text-on-surface mb-2 hover:text-primary transition-colors">
                    <Link href={`/forum/${thread.id}`}>{thread.title}</Link>
                  </h3>

                  
                  <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-4 line-clamp-3">
                    {thread.content}
                  </p>

                  
                  <div className="flex items-center justify-between border-t border-border/10 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-primary">
                        {thread.isAnonymous ? 'A' : (thread.userName?.charAt(0).toUpperCase() || 'U')}
                      </div>
                      <span className="text-xs font-semibold text-on-surface">
                        {thread.isAnonymous ? 'Anonim' : thread.userName}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      
                      {user && (user.id === thread.userId || user.role === 'admin') && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleTogglePrivacy(thread.id, thread.isPrivate);
                          }}
                          className="p-1.5 rounded-lg border border-border/40 hover:bg-slate-50 text-secondary transition-all flex items-center justify-center"
                          title={thread.isPrivate ? 'Jadikan Publik' : 'Jadikan Privat'}
                        >
                          {thread.isPrivate ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                      )}

                      
                      {user && (user.id === thread.userId || user.role === 'admin') && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteThread(thread.id);
                          }}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-all flex items-center justify-center"
                          title="Hapus Diskusi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      
                      <button
                        onClick={() => handleToggleLike(thread.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                          thread.likedByCurrentUser
                            ? 'bg-primary/5 border-primary/20 text-primary'
                            : 'bg-surface hover:bg-slate-50 border-border/40 text-secondary'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${thread.likedByCurrentUser ? 'fill-primary' : ''}`} />
                        <span>{thread.likesCount}</span>
                      </button>

                      
                      <Link
                        href={`/forum/${thread.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border/40 bg-surface hover:bg-slate-50 text-secondary transition-all"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{thread.commentsCount}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container/60 shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-border/10 pb-3">
              <PlusCircle className="w-5 h-5 text-primary" /> Mulai Diskusi Baru
            </h2>

            {authLoading ? (
              <div className="h-40 bg-muted/30 rounded animate-pulse" />
            ) : !isAuthenticated ? (
              <div className="text-center py-6 bg-surface p-4 rounded-xl border border-border/20">
                <AlertCircle className="w-10 h-10 text-secondary mx-auto mb-3" />
                <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed mb-4">
                  Anda perlu masuk ke akun terlebih dahulu untuk berpartisipasi dan memulai diskusi baru.
                </p>
                <Link
                  href="/login?redirect=/forum"
                  className="inline-block w-full text-center px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/95 transition-all shadow-sm"
                >
                  Masuk Sekarang
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCreateThread} className="space-y-4">
                {submitError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2 border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary tracking-wider mb-1">
                    Judul Diskusi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Mengatasi kecemasan saat bekerja"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold uppercase text-secondary tracking-wider mb-1">
                    Kategori Topik
                  </label>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full p-2.5 bg-surface border border-border/50 rounded-xl text-sm focus:outline-none focus:border-primary flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span>{newCategory}</span>
                    <ChevronDown className={`w-4 h-4 text-secondary transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <ul className="absolute z-20 w-full mt-1.5 bg-surface-container-lowest border border-border/30 rounded-xl shadow-lg py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                        {categories.map((cat) => (
                          <li key={cat}>
                            <button
                              type="button"
                              onClick={() => {
                                setNewCategory(cat);
                                setDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-surface transition-colors flex items-center justify-between ${
                                newCategory === cat ? 'text-primary font-bold bg-primary/5' : 'text-on-surface'
                              }`}
                            >
                              <span>{cat}</span>
                              {newCategory === cat && <Check className="w-4 h-4 text-primary" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary tracking-wider mb-1">
                    Isi Pembahasan
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tuliskan pengalaman atau pertanyaan Anda secara rinci..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border/50 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${
                        isAnonymous 
                          ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20' 
                          : 'border-border/60 bg-surface hover:border-primary/40'
                      }`}
                    >
                      {isAnonymous && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span 
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className="text-xs font-semibold text-secondary cursor-pointer select-none"
                    >
                      Kirim secara Anonim (Tanpa Nama)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPrivate(!isPrivate)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${
                        isPrivate 
                          ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20' 
                          : 'border-border/60 bg-surface hover:border-primary/40'
                      }`}
                    >
                      {isPrivate && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span 
                      onClick={() => setIsPrivate(!isPrivate)}
                      className="text-xs font-semibold text-secondary cursor-pointer select-none"
                    >
                      Privatkan Diskusi (Hanya Anda & Admin)
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/95 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : 'Posting Diskusi'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForumPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant font-semibold">Memuat forum...</p>
      </div>
    }>
      <ForumFeed />
    </Suspense>
  );
}
