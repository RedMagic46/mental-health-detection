import Link from 'next/link';
import { 
  ArrowRight, 
  Activity, 
  MessageCircle, 
  Handshake, 
  Star, 
  MessageSquare, 
  Users, 
  HeartPulse, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ThumbsUp
} from 'lucide-react';
import { successStoryRepo, forumRepo, faqRepo } from '@/lib/db';
import FaqSection from './components/FaqSection';


export const revalidate = 0;

function getCategoryBadgeClass(category: string) {
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
}

export default async function Home() {
  
  const successStories = await successStoryRepo.findAll();
  const popularThreads = await forumRepo.findPopularThreads(3, 7);
  const faqs = await faqRepo.findAll();

  return (
    <div className="flex flex-col min-h-screen">
      
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-surface-container">
        
        <div 
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30 mix-blend-multiply" 
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA6y1qON8DB2XZ4DYl-9uN3c6QIrNmiDvMr4k30mDRqsm5ynPHfitWWDMqQyglo9fGbtqTxVY78Pw8yv5gvSlZXNrASybLRRjqCWyzxlTItUJlaPDsNKlRuB2aFQpLct6ajO6xUlHtl-1QKTo_mAnK2127KMYlpPpV_ws2CIyN2rl8J3kJkPeS9vm6IB241Z5sg4nIMFfHY9afZnWlvNaZixmWjmzazNjJzdKKev4IEn9w_aTGvSsNL39mKPjfbnEyFGiyS1y4Kng')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface-container/60 to-background z-0" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-on-surface mb-5 max-w-3xl mx-auto leading-tight">
            Prioritaskan Kesehatan<br />Mental Anda Hari Ini
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant max-w-xl mx-auto mb-8 leading-relaxed">
            Pahami kondisi mental Anda melalui kuesioner deteksi dini yang dirancang secara profesional. Jangan tunggu sampai memburuk, ambil langkah pertama menuju kesejahteraan emosional.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3.5">
            <Link 
              href="/assessment" 
              className="text-sm font-semibold text-primary-foreground bg-primary px-6 py-3 rounded-lg hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5"
            >
              Mulai Tes Sekarang <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <Link 
              href="#features" 
              className="text-sm font-semibold text-primary bg-surface-container-lowest border border-primary/20 px-6 py-3 rounded-lg hover:bg-surface-container hover:border-primary/40 transition-all text-center"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </section>

      
      <section className="py-16 md:py-20 bg-background px-4 sm:px-6 lg:px-8 border-t border-border/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold tracking-wider uppercase text-primary">Data Kesehatan Mental</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-3">
            Tantangan Kesehatan Mental di Indonesia
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto mb-12 text-sm md:text-base">
            Kesehatan mental bukan lagi hal tabu, melainkan krisis nyata yang membutuhkan perhatian segera. Berikut adalah statistik resmi tantangan kesehatan jiwa di tanah air.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-surface-container/30 border border-border/20 rounded-xl hover:border-primary/20 hover:shadow-sm transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-3">19 Juta+</div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Gangguan Mental Emosional</h3>
              <p className="text-on-surface-variant leading-relaxed text-xs md:text-sm">
                Lebih dari 19 juta penduduk usia di atas 15 tahun di Indonesia mengalami gangguan mental emosional yang memengaruhi kualitas hidup mereka sehari-hari.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-secondary font-medium">
                <AlertCircle className="w-3 h-3" /> Sumber: Riskesdas Kemenkes RI 2018
              </div>
            </div>
            
            <div className="p-6 bg-surface-container/30 border border-border/20 rounded-xl hover:border-primary/20 hover:shadow-sm transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-3">1 dari 3</div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Masalah Mental Remaja</h3>
              <p className="text-on-surface-variant leading-relaxed text-xs md:text-sm">
                Sekitar 15,5 juta remaja Indonesia usia 10-17 tahun mengalami setidaknya satu masalah kesehatan mental dalam kurun waktu 12 month terakhir.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-secondary font-medium">
                <AlertCircle className="w-3 h-3" /> Sumber: I-NAMHS 2022
              </div>
            </div>
            
            <div className="p-6 bg-surface-container/30 border border-border/20 rounded-xl hover:border-primary/20 hover:shadow-sm transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-3">Hanya 2.6%</div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Akses Layanan Terbatas</h3>
              <p className="text-on-surface-variant leading-relaxed text-xs md:text-sm">
                Hanya sebagian kecil dari remaja bermasalah mental yang memiliki akses atau mencari layanan konseling profesional karena tingginya stigma sosial.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-secondary font-medium">
                <AlertCircle className="w-3 h-3" /> Sumber: I-NAMHS 2022
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section id="features" className="py-16 md:py-20 bg-surface px-4 sm:px-6 lg:px-8 border-t border-border/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Fitur Utama MindCare</h2>
            <p className="mt-3 text-on-surface-variant max-w-lg mx-auto text-xs md:text-sm">
              Solusi holistik yang dirancang untuk mendukung kesehatan dan kesejahteraan mental Anda secara aman.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-on-surface mb-1.5">Mood Tracking & Analisis</h3>
              <p className="text-on-surface-variant leading-relaxed text-xs md:text-sm">
                Skrining kesehatan mental berkala untuk memantau tren dan kecenderungan kondisi emosional Anda dari waktu ke waktu secara cerdas.
              </p>
            </div>
            
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-on-surface mb-1.5">Anonymous Chat</h3>
              <p className="text-on-surface-variant leading-relaxed text-xs md:text-sm">
                Hubungkan percakapan secara aman dan nyaman di ruang obrolan anonim tanpa khawatir membagikan identitas pribadi Anda.
              </p>
            </div>
            
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <Handshake className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-on-surface mb-1.5">Professional Matching</h3>
              <p className="text-on-surface-variant leading-relaxed text-xs md:text-sm">
                Dapatkan kecocokan terbaik dengan tenaga profesional, psikolog, atau psikiater klinis terdaftar yang paling sesuai dengan kebutuhan Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-16 md:py-20 bg-surface-container-low px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Cerita Sukses</h2>
            <p className="mt-3 text-on-surface-variant max-w-lg mx-auto text-xs md:text-sm">
              Dengarkan penuturan langsung dari mereka yang telah mengambil langkah pertama dan merasakan perubahan nyata bersama MindCare.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.slice(0, 3).map((story) => (
              <div key={story.id} className="bg-surface-container-lowest rounded-xl p-6 border border-border/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
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
                  <p className="text-on-surface-variant italic leading-relaxed text-xs md:text-sm mb-4">
                    &ldquo;{story.content}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
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

          <div className="text-center mt-10">
            <Link 
              href="/stories" 
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline hover:text-primary/95 transition-all text-sm md:text-base"
            >
              Lihat Semua Cerita Sukses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      
      <section className="py-16 md:py-20 bg-background px-4 sm:px-6 lg:px-8 border-t border-border/10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Forum Komunitas Aktif</h2>
            <p className="mt-3 text-on-surface-variant text-xs md:text-sm">
              Diskusi terpopuler dari komunitas kami dalam 7 hari terakhir. Bergabunglah untuk saling mendukung.
            </p>
          </div>
          
          <div className="space-y-3.5">
            {popularThreads.length === 0 ? (
              <div className="bg-surface-container-lowest p-6 text-center rounded-xl border border-surface-container overflow-hidden shadow-sm">
                <AlertCircle className="w-10 h-10 text-secondary mx-auto mb-3" />
                <h3 className="text-base font-bold text-on-surface">Belum ada diskusi populer</h3>
                <p className="text-on-surface-variant text-xs mt-1">
                  Mulai diskusi pertama Anda di forum komunitas kami.
                </p>
              </div>
            ) : (
              popularThreads.map((thread) => (
                <Link 
                  key={thread.id} 
                  href={`/forum/${thread.id}`}
                  className="block bg-surface-container-lowest p-5 rounded-xl border border-surface-container hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
                >
                  
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadgeClass(thread.category)}`}>
                      {thread.category}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {new Date(thread.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  
                  <h3 className="text-base font-bold text-on-surface mb-1.5 group-hover:text-primary transition-colors">
                    {thread.title}
                  </h3>

                  
                  <p className="text-on-surface-variant text-xs leading-relaxed mb-3 line-clamp-2">
                    {thread.content}
                  </p>

                  
                  <div className="flex items-center justify-between border-t border-border/10 pt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-[10px] font-bold text-primary">
                        {thread.isAnonymous ? 'A' : (thread.userName?.charAt(0).toUpperCase() || 'U')}
                      </div>
                      <span className="text-xs font-semibold text-on-surface">
                        {thread.isAnonymous ? 'Anonim' : thread.userName}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-secondary">
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className="w-4 h-4 text-secondary" />
                        <span>{thread.likesCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-secondary" />
                        <span>{thread.commentsCount}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              href="/forum" 
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline hover:text-primary/95 transition-all text-sm md:text-base"
            >
              Lihat Semua Diskusi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      
      <FaqSection faqs={faqs} />
    </div>
  );
}

