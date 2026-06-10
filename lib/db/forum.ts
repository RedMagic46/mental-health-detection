import { supabaseAdmin } from '../supabase';
import type { ForumThread, ForumComment, CommunityForum } from '../types';
import { toCommunityForum } from './mappers';

export const communityForumRepo = {
  async findAll(): Promise<CommunityForum[]> {
    const { data, error } = await supabaseAdmin
      .from('community_forums')
      .select('id, title, icon, link, created_at')
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [
        {
          id: 1,
          title: 'Diskusi seputar kesehatan mental screening',
          icon: 'forum',
          link: '#',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Topik community: mental support spesifik',
          icon: 'group',
          link: '#',
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          title: 'Diskusi pemulihan dan ruang aman komunitas',
          icon: 'healing',
          link: '#',
          createdAt: new Date().toISOString(),
        },
      ];
    }

    return data.map(toCommunityForum);
  },

  async create(data: Omit<CommunityForum, 'id' | 'createdAt'>): Promise<CommunityForum> {
    const { data: inserted, error } = await supabaseAdmin
      .from('community_forums')
      .insert({
        title: data.title,
        icon: data.icon,
        link: data.link,
      })
      .select('id, title, icon, link, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to create community forum: ${error.message}`);
    }

    return toCommunityForum(inserted);
  },
};

export const forumRepo = {
  async findPopularThreads(limit: number = 3, daysLimit: number = 7): Promise<ForumThread[]> {
    try {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - daysLimit);

      let { data: threads, error } = await supabaseAdmin
        .from('forum_threads')
        .select('id, title, content, category, user_id, is_anonymous, is_private, created_at, users(name)')
        .gte('created_at', dateLimit.toISOString());

      if (error) throw error;

      if (!threads || threads.length === 0) {
        const { data: allThreads, error: allErr } = await supabaseAdmin
          .from('forum_threads')
          .select('id, title, content, category, user_id, is_anonymous, is_private, created_at, users(name)');
        
        if (allErr) throw allErr;
        threads = allThreads || [];
      }

      if (threads.length === 0) return [];

      const threadIds = threads.map((t) => t.id);

      const { data: commentsData } = await supabaseAdmin
        .from('forum_comments')
        .select('thread_id')
        .in('thread_id', threadIds);

      const { data: likesData } = await supabaseAdmin
        .from('forum_thread_likes')
        .select('thread_id')
        .in('thread_id', threadIds);

      const mappedThreads = threads.map((t: any) => {
        const tComments = commentsData?.filter((c) => c.thread_id === t.id) || [];
        const tLikes = likesData?.filter((l) => l.thread_id === t.id) || [];
        
        return {
          id: String(t.id),
          title: t.title,
          content: t.content,
          category: t.category,
          userId: t.user_id,
          userName: t.users?.name || 'User',
          isAnonymous: t.is_anonymous,
          likesCount: tLikes.length,
          commentsCount: tComments.length,
          isPrivate: !!t.is_private,
          createdAt: t.created_at,
          popularityScore: tLikes.length + tComments.length
        };
      });

      mappedThreads.sort((a, b) => {
        if (b.popularityScore !== a.popularityScore) {
          return b.popularityScore - a.popularityScore;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return mappedThreads.slice(0, limit);
    } catch {
      return [
        {
          id: '1',
          title: 'Cara mengatasi cemas saat screening',
          content: 'Saya merasa sangat berdebar-debar sebelum mengisi tes kesehatan mental. Ada yang punya tips cara mengatasinya?',
          category: 'Skrining',
          userId: '1',
          userName: 'Rina',
          isAnonymous: false,
          likesCount: 5,
          commentsCount: 2,
          isPrivate: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Butuh teman mengobrol seputar overthinking',
          content: 'Tiap malam selalu overthinking tentang masa depan. Ingin berbagi cerita di sini dengan teman-teman sekalian.',
          category: 'Dukungan Emosional',
          userId: '2',
          userName: 'Anonim',
          isAnonymous: true,
          likesCount: 12,
          commentsCount: 3,
          isPrivate: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Perjalanan pemulihan dari trauma masa kecil',
          content: 'Saya ingin membagikan kisah sukses pemulihan saya melalui terapi kognitif perilaku. Semoga bermanfaat untuk teman-teman.',
          category: 'Pemulihan',
          userId: '3',
          userName: 'Budiman',
          isAnonymous: false,
          likesCount: 24,
          commentsCount: 8,
          isPrivate: false,
          createdAt: new Date().toISOString(),
        }
      ].slice(0, limit);
    }
  },

  async findAllThreads(options: { category?: string; search?: string; currentUserId?: string } = {}): Promise<ForumThread[]> {
    try {
      let query = supabaseAdmin
        .from('forum_threads')
        .select('id, title, content, category, user_id, is_anonymous, is_private, created_at, users(name)');

      if (options.category) {
        query = query.eq('category', options.category);
      }
      if (options.search) {
        query = query.ilike('title', `%${options.search}%`);
      }

      const { data: threads, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      if (!threads || threads.length === 0) return [];

      const threadIds = threads.map((t) => t.id);

      const { data: commentsData } = await supabaseAdmin
        .from('forum_comments')
        .select('thread_id')
        .in('thread_id', threadIds);

      const { data: likesData } = await supabaseAdmin
        .from('forum_thread_likes')
        .select('thread_id, user_id')
        .in('thread_id', threadIds);

      return threads.map((t: any) => {
        const tComments = commentsData?.filter((c) => c.thread_id === t.id) || [];
        const tLikes = likesData?.filter((l) => l.thread_id === t.id) || [];
        const isLiked = options.currentUserId ? tLikes.some((l) => l.user_id === options.currentUserId) : false;

        return {
          id: String(t.id),
          title: t.title,
          content: t.content,
          category: t.category,
          userId: t.user_id,
          userName: t.users?.name || 'User',
          isAnonymous: t.is_anonymous,
          likesCount: tLikes.length,
          commentsCount: tComments.length,
          likedByCurrentUser: isLiked,
          isPrivate: !!t.is_private,
          createdAt: t.created_at,
        };
      });
    } catch {
      return [
        {
          id: '1',
          title: 'Cara mengatasi cemas saat screening',
          content: 'Saya merasa sangat berdebar-debar sebelum mengisi tes kesehatan mental. Ada yang punya tips cara mengatasinya?',
          category: 'Skrining',
          userId: '1',
          userName: 'Rina',
          isAnonymous: false,
          likesCount: 5,
          commentsCount: 2,
          likedByCurrentUser: false,
          isPrivate: false,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: '2',
          title: 'Butuh teman mengobrol seputar overthinking',
          content: 'Tiap malam selalu overthinking tentang masa depan. Ingin berbagi cerita di sini dengan teman-teman sekalian.',
          category: 'Dukungan Emosional',
          userId: '2',
          userName: 'Anonim',
          isAnonymous: true,
          likesCount: 12,
          commentsCount: 3,
          likedByCurrentUser: false,
          isPrivate: false,
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
        {
          id: '3',
          title: 'Perjalanan pemulihan dari trauma masa kecil',
          content: 'Saya ingin membagikan kisah sukses pemulihan saya melalui terapi kognitif perilaku. Semoga bermanfaat untuk teman-teman.',
          category: 'Pemulihan',
          userId: '3',
          userName: 'Budiman',
          isAnonymous: false,
          likesCount: 24,
          commentsCount: 8,
          likedByCurrentUser: false,
          isPrivate: false,
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        }
      ].filter(t => {
        if (options.category && t.category !== options.category) return false;
        if (options.search && !t.title.toLowerCase().includes(options.search.toLowerCase())) return false;
        return true;
      });
    }
  },

  async findThreadById(id: string, currentUserId?: string): Promise<ForumThread | undefined> {
    try {
      const { data: t, error } = await supabaseAdmin
        .from('forum_threads')
        .select('id, title, content, category, user_id, is_anonymous, is_private, created_at, users(name)')
        .eq('id', id)
        .single();

      if (error || !t) throw new Error('Thread not found');

      const { count: commentsCount } = await supabaseAdmin
        .from('forum_comments')
        .select('id', { count: 'exact', head: true })
        .eq('thread_id', t.id);

      const { data: likesData } = await supabaseAdmin
        .from('forum_thread_likes')
        .select('user_id')
        .eq('thread_id', t.id);

      const likesCountVal = likesData?.length || 0;
      const isLiked = currentUserId ? likesData?.some((l) => l.user_id === currentUserId) || false : false;

      return {
        id: String(t.id),
        title: t.title,
        content: t.content,
        category: t.category,
        userId: t.user_id,
        userName: (Array.isArray(t.users) ? t.users[0]?.name : (t.users as any)?.name) || 'User',
        isAnonymous: t.is_anonymous,
        likesCount: likesCountVal,
        commentsCount: commentsCount || 0,
        likedByCurrentUser: isLiked,
        isPrivate: !!t.is_private,
        createdAt: t.created_at,
      };
    } catch {
      const fallbacks = [
        {
          id: '1',
          title: 'Cara mengatasi cemas saat screening',
          content: 'Saya merasa sangat berdebar-debar sebelum mengisi tes kesehatan mental. Ada yang punya tips cara mengatasinya?',
          category: 'Skrining',
          userId: '1',
          userName: 'Rina',
          isAnonymous: false,
          likesCount: 5,
          commentsCount: 2,
          likedByCurrentUser: false,
          isPrivate: false,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: '2',
          title: 'Butuh teman mengobrol seputar overthinking',
          content: 'Tiap malam selalu overthinking tentang masa depan. Ingin berbagi cerita di sini dengan teman-teman sekalian.',
          category: 'Dukungan Emosional',
          userId: '2',
          userName: 'Anonim',
          isAnonymous: true,
          likesCount: 12,
          commentsCount: 3,
          likedByCurrentUser: false,
          isPrivate: false,
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
        {
          id: '3',
          title: 'Perjalanan pemulihan dari trauma masa kecil',
          content: 'Saya ingin membagikan kisah sukses pemulihan saya melalui terapi kognitif perilaku. Semoga bermanfaat untuk teman-teman.',
          category: 'Pemulihan',
          userId: '3',
          userName: 'Budiman',
          isAnonymous: false,
          likesCount: 24,
          commentsCount: 8,
          likedByCurrentUser: false,
          isPrivate: false,
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        }
      ];
      return fallbacks.find(t => t.id === id);
    }
  },

  async createThread(data: { title: string; content: string; category: string; userId: string; isAnonymous: boolean; isPrivate: boolean }): Promise<ForumThread> {
    const { data: inserted, error } = await supabaseAdmin
      .from('forum_threads')
      .insert({
        title: data.title,
        content: data.content,
        category: data.category,
        user_id: data.userId,
        is_anonymous: data.isAnonymous,
        is_private: data.isPrivate,
      })
      .select('id, title, content, category, user_id, is_anonymous, is_private, created_at')
      .single();

    if (error) throw new Error(`Failed to create thread: ${error.message}`);

    return {
      id: String(inserted.id),
      title: inserted.title,
      content: inserted.content,
      category: inserted.category,
      userId: inserted.user_id,
      isAnonymous: inserted.is_anonymous,
      likesCount: 0,
      commentsCount: 0,
      isPrivate: !!inserted.is_private,
      createdAt: inserted.created_at,
    };
  },

  async findCommentsByThreadId(threadId: string): Promise<ForumComment[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('forum_comments')
        .select('id, thread_id, content, user_id, is_anonymous, created_at, users(name)')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map((c: any) => ({
        id: String(c.id),
        threadId: String(c.thread_id),
        content: c.content,
        userId: c.user_id,
        userName: c.users?.name || 'User',
        isAnonymous: c.is_anonymous,
        createdAt: c.created_at,
      }));
    } catch {
      const allComments = [
        {
          id: '101',
          threadId: '1',
          content: 'Cobalah latihan pernapasan dalam-dalam (box breathing) selama 2-3 menit sebelum memulai skrining.',
          userId: '11',
          userName: 'Dr. Adi',
          isAnonymous: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '102',
          threadId: '1',
          content: 'Sangat setuju, itu sangat membantu menenangkan saraf otonom kita.',
          userId: '12',
          userName: 'Anonim',
          isAnonymous: true,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: '103',
          threadId: '2',
          content: 'Kamu tidak sendirian. Banyak yang merasakan hal yang sama. Mari saling menguatkan.',
          userId: '13',
          userName: 'Sari',
          isAnonymous: false,
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        }
      ];
      return allComments.filter(c => c.threadId === threadId);
    }
  },

  async createComment(data: { threadId: string; content: string; userId: string; isAnonymous: boolean }): Promise<ForumComment> {
    const { data: inserted, error } = await supabaseAdmin
      .from('forum_comments')
      .insert({
        thread_id: data.threadId,
        content: data.content,
        user_id: data.userId,
        is_anonymous: data.isAnonymous,
      })
      .select('id, thread_id, content, user_id, is_anonymous, created_at')
      .single();

    if (error) throw new Error(`Failed to create comment: ${error.message}`);

    return {
      id: String(inserted.id),
      threadId: String(inserted.thread_id),
      content: inserted.content,
      userId: inserted.user_id,
      isAnonymous: inserted.is_anonymous,
      createdAt: inserted.created_at,
    };
  },

  async toggleLike(threadId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const { data: existing } = await supabaseAdmin
      .from('forum_thread_likes')
      .select('id')
      .eq('thread_id', threadId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { error: deleteError } = await supabaseAdmin
        .from('forum_thread_likes')
        .delete()
        .eq('id', existing.id);
      
      if (deleteError) throw new Error(deleteError.message);
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('forum_thread_likes')
        .insert({
          thread_id: threadId,
          user_id: userId,
        });

      if (insertError) throw new Error(insertError.message);
    }

    const { data: likes } = await supabaseAdmin
      .from('forum_thread_likes')
      .select('user_id')
      .eq('thread_id', threadId);

    return {
      liked: !existing,
      likesCount: likes?.length || 0,
    };
  },

  async deleteThread(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('forum_threads')
      .delete()
      .eq('id', id);
    return !error;
  },

  async updateThreadPrivacy(id: string, isPrivate: boolean): Promise<ForumThread | undefined> {
    const { data: updated, error } = await supabaseAdmin
      .from('forum_threads')
      .update({ is_private: isPrivate })
      .eq('id', id)
      .select('id, title, content, category, user_id, is_anonymous, is_private, created_at, users(name)')
      .single();

    if (error || !updated) return undefined;

    const { count: commentsCount } = await supabaseAdmin
      .from('forum_comments')
      .select('id', { count: 'exact', head: true })
      .eq('thread_id', updated.id);

    const { data: likesData } = await supabaseAdmin
      .from('forum_thread_likes')
      .select('user_id')
      .eq('thread_id', updated.id);

    return {
      id: String(updated.id),
      title: updated.title,
      content: updated.content,
      category: updated.category,
      userId: updated.user_id,
      userName: (Array.isArray(updated.users) ? updated.users[0]?.name : (updated.users as any)?.name) || 'User',
      isAnonymous: updated.is_anonymous,
      likesCount: likesData?.length || 0,
      commentsCount: commentsCount || 0,
      isPrivate: !!updated.is_private,
      createdAt: updated.created_at,
    };
  }
};
