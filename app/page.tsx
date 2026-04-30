import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-grow flex flex-col justify-center items-center text-center px-4 py-20 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight">
            Prioritaskan <span className="text-primary">Kesehatan Mental</span> Anda Hari Ini.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Pahami kondisi mental Anda melalui kuesioner deteksi dini yang dirancang secara profesional. Jangan tunggu sampai memburuk, ambil langkah pertama menuju kesejahteraan emosional.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
            >
              Mulai Tes Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-white text-primary border border-primary/20 rounded-full font-semibold text-lg hover:bg-primary/5 transition-all"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">Mengapa Memilih MindCare?</h2>
            <p className="mt-4 text-muted-foreground">Platform deteksi dini yang aman, cepat, dan terpercaya.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck className="w-10 h-10 text-primary" />,
                title: "Privasi Terjamin",
                desc: "Data Anda dienkripsi dan kami menjamin kerahasiaan hasil tes Anda sepenuhnya.",
              },
              {
                icon: <CheckCircle2 className="w-10 h-10 text-primary" />,
                title: "Akurat & Profesional",
                desc: "Kuesioner disusun berdasarkan standar psikologi untuk deteksi dini yang akurat.",
              },
              {
                icon: <Heart className="w-10 h-10 text-primary" />,
                title: "Konsultasi Lanjutan",
                desc: "Dapatkan akses mudah untuk booking sesi dengan psikolog profesional jika diperlukan.",
              },
            ].map((feat, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="bg-teal-100/50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
