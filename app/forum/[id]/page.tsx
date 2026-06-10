'use client';

import { useAuthStore } from '../../store/useStore';
import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, ThumbsUp, AlertCircle, Send, Check, Lock, Unlock, Trash2 } from 'lucide-react';
import type { ForumThread, ForumComment } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface ForumDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ForumDetailPage({ params }: ForumDetailPageProps) {
  
  const resolvedParams = use(params);
  const threadId = resolvedParams.id;

  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  
  const [commentContent, setCommentContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  
  const fetchThreadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/forum/${threadId}`);
      if (res.ok) {
        const data = await res.json();
        setThread(data.thread);
        setComments(data.comments || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Diskusi tidak ditemukan.');
      }
    } catch {
      setError('Gagal memuat data diskusi.');
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchThreadData();
  }, [fetchThreadData]);

  
  const handleDeleteThread = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus diskusi ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const res = await fetch(`/api/forum/${threadId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/forum');
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus diskusi.');
      }
    } catch (err) {
      console.error('Error deleting thread:', err);
      alert('Terjadi kesalahan jaringan.');
    }
  };

  
  const handleTogglePrivacy = async () => {
    if (!thread) return;
    const nextPrivate = !thread.isPrivate;

    try {
      const res = await fetch(`/api/forum/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrivate: nextPrivate }),
      });

      if (res.ok) {
        const data = await res.json();
        setThread(data.thread);
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal mengubah status privasi.');
      }
    } catch (err) {
      console.error('Error toggling privacy:', err);
      alert('Terjadi kesalahan jaringan.');
    }
  };

  
  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!thread) return;

    
    const liked = !thread.likedByCurrentUser;
    setThread({
      ...thread,
      likedByCurrentUser: liked,
      likesCount: liked ? thread.likesCount + 1 : thread.likesCount - 1,
    });

    try {
      const res = await fetch(`/api/forum/${threadId}/like`, {
        method: 'POST',
      });
      if (!res.ok) {
        fetchThreadData();
      }
    } catch {
      fetchThreadData();
    }
  };

  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!commentContent.trim()) {
      setSubmitError('Isi komentar tidak boleh kosong.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forum/${threadId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentContent,
          isAnonymous,
        }),
      });

      if (res.ok) {
        setCommentContent('');
        setIsAnonymous(false);
        fetchThreadData(); 
      } else {
        const errData = await res.json();
        setSubmitError(errData.error || 'Gagal mengirim komentar.');
      }
    } catch {
      setSubmitError('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow space-y-6">
        <div className="h-6 bg-muted/65 rounded w-24 animate-pulse" />
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-container/60 animate-pulse space-y-4">
          <div className="h-4 bg-muted/65 rounded w-1/4" />
          <div className="h-8 bg-muted/65 rounded w-2/3" />
          <div className="h-4 bg-muted/65 rounded w-full" />
          <div className="h-4 bg-muted/65 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow text-center">
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-container/60 shadow-sm max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-on-surface">Terjadi Kesalahan</h2>
          <p className="text-on-surface-variant text-sm mt-2">{error || 'Diskusi tidak ditemukan.'}</p>
          <Link
            href="/forum"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-8">
      
      <div>
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline hover:text-primary/95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Forum
        </Link>
      </div>

      
      <article className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-surface-container/60 shadow-sm">
        
        <div className="flex items-center justify-between gap-4 mb-4">
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
            Diposting pada {new Date(thread.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight leading-snug mb-4">
          {thread.title}
        </h1>

        
        <div className="text-on-surface-variant text-sm md:text-base leading-relaxed whitespace-pre-wrap mb-6 border-b border-border/10 pb-6">
          {thread.content}
        </div>

        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-sm font-bold text-primary shadow-inner">
              {thread.isAnonymous ? 'A' : (thread.userName?.charAt(0).toUpperCase() || 'U')}
            </div>
            <div>
              <div className="font-semibold text-on-surface text-sm md:text-base">
                {thread.isAnonymous ? 'Anonim' : thread.userName}
              </div>
              <div className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Pembuat Topik</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            
            {user && (user.id === thread.userId || user.role === 'admin') && (
              <button
                onClick={handleTogglePrivacy}
                className="flex items-center gap-2 text-xs md:text-sm font-semibold px-3 py-2 rounded-xl border border-border/40 bg-surface hover:bg-slate-50 text-secondary transition-all"
                title={thread.isPrivate ? 'Jadikan Publik' : 'Jadikan Privat'}
              >
                {thread.isPrivate ? (
                  <>
                    <Unlock className="w-4.5 h-4.5" />
                    <span>Jadikan Publik</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4.5 h-4.5" />
                    <span>Jadikan Privat</span>
                  </>
                )}
              </button>
            )}

            
            {user && (user.id === thread.userId || user.role === 'admin') && (
              <button
                onClick={handleDeleteThread}
                className="flex items-center gap-2 text-xs md:text-sm font-semibold px-3 py-2 rounded-xl border border-red-200 bg-surface hover:bg-red-50 text-red-600 transition-all"
                title="Hapus Diskusi"
              >
                <Trash2 className="w-4.5 h-4.5" />
                <span>Hapus</span>
              </button>
            )}

            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-2 text-xs md:text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${
                thread.likedByCurrentUser
                  ? 'bg-primary/5 border-primary/20 text-primary shadow-sm'
                  : 'bg-surface hover:bg-slate-50 border-border/40 text-secondary'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${thread.likedByCurrentUser ? 'fill-primary' : ''}`} />
              <span>Sukai ({thread.likesCount})</span>
            </button>
          </div>
        </div>
      </article>

      
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> Komentar ({comments.length})
        </h2>

        
        {comments.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-surface-container/30">
            <p className="text-on-surface-variant text-sm italic">Belum ada tanggapan. Jadilah yang pertama memberikan respon suportif!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container/60 shadow-sm flex items-start gap-4"
              >
                
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 shadow-inner">
                  {comment.isAnonymous ? 'A' : (comment.userName?.charAt(0).toUpperCase() || 'U')}
                </div>

                
                <div className="flex-grow space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs md:text-sm font-bold text-on-surface">
                      {comment.isAnonymous ? 'Anonim' : comment.userName}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container/60 shadow-sm">
          <h3 className="text-sm font-bold uppercase text-secondary tracking-wider mb-4">
            Kirim Tanggapan Suportif
          </h3>

          {!isAuthenticated ? (
            <div className="text-center py-4 bg-surface p-4 rounded-xl border border-border/20">
              <AlertCircle className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-xs text-on-surface-variant mb-3">
                Anda perlu masuk ke akun terlebih dahulu untuk mengirim komentar.
              </p>
              <Link
                href={`/login?redirect=/forum/${threadId}`}
                className="inline-block px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/95 transition-all shadow-sm"
              >
                Masuk Sekarang
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              {submitError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <textarea
                required
                rows={3}
                placeholder="Tuliskan komentar atau kata-kata penyemangat di sini..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full p-3 bg-surface border border-border/50 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                    Balas sebagai Anonim (Tanpa Nama)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : (
                    <>
                      Kirim Balasan <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
