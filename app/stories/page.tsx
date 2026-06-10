import Link from 'next/link';
import { ArrowLeft, Star, ArrowRight, MessageSquare } from 'lucide-react';
import { successStoryRepo } from '@/lib/db';

export const revalidate = 0;

export default async function StoriesPage() {
  const successStories = await successStoryRepo.findAll();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow">
      
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline hover:text-primary/95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
      </div>

      
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight mb-3">
          Semua Cerita Sukses
        </h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Kumpulan kisah nyata perjalanan pemulihan, penemuan diri, dan pencarian dukungan mental dari teman-teman yang telah mempercayakan perjalanannya bersama MindCare.
        </p>
      </div>

      
      {successStories.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-low rounded-2xl border border-surface-container">
          <p className="text-on-surface-variant italic">Belum ada cerita sukses yang dibagikan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {successStories.map((story) => (
            <div
              key={story.id}
              className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < story.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-surface-variant fill-surface-variant'
                      }`}
                    />
                  ))}
                </div>
                <h3 className="text-base font-bold text-on-surface mb-2">{story.title}</h3>
                <p className="text-on-surface-variant italic leading-relaxed text-xs md:text-sm mb-6">
                  &ldquo;{story.content}&rdquo;
                </p>
              </div>

              
              <div className="flex items-center gap-3 border-t border-border/10 pt-4">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold shadow-inner text-xs">
                  {story.authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-on-surface text-xs md:text-sm">{story.authorName}</div>
                  <div className="text-[10px] md:text-xs text-on-surface-variant">{story.authorRole}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      
      <div className="bg-gradient-to-r from-primary/5 to-indigo-500/5 rounded-2xl border border-primary/10 p-6 md:p-8 text-center max-w-3xl mx-auto shadow-sm">
        <h2 className="text-lg md:text-xl font-bold text-on-surface mb-2">Ingin Berbagi Cerita Sukses Anda?</h2>
        <p className="text-on-surface-variant text-xs md:text-sm max-w-lg mx-auto mb-6">
          Bagikan pengalaman pemulihan atau perjalanan kesehatan mental Anda dengan komunitas untuk saling menyemangati dan menguatkan. sampaikan melalui Forum Komunitas kami.
        </p>
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground bg-primary px-5 py-2.5 rounded-lg hover:bg-primary/95 transition-all shadow-sm"
        >
          Bagikan Kisah di Forum <ArrowRight className="w-4.5 h-4.5" />
        </Link>
      </div>
    </div>
  );
}
