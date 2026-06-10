import { userRepo, successStoryRepo, communityForumRepo, faqRepo } from './db';
import { hashPassword } from './auth';
import { supabaseAdmin } from './supabase';

export async function seedAdmin() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL dan ADMIN_PASSWORD harus di-set di environment variables.');
  }

  const existing = await userRepo.findByEmail(ADMIN_EMAIL);
  if (existing) return existing;

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const admin = await userRepo.create({
    name: 'Administrator',
    email: ADMIN_EMAIL,
    passwordHash,
    role: 'admin',
  });

  return admin;
}

export async function seedSuccessStories() {
  try {
    const { count, error } = await supabaseAdmin
      .from('success_stories')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    if (count && count > 0) {
      return;
    }

    await successStoryRepo.create({
      title: 'Sangat Membantu',
      content: 'Mental Health Screening yang disediakan MindCare sangat membantu saya menyadari kondisi emosional saya akhir-akhir ini.',
      authorName: 'Amalia',
      authorRole: 'Pengguna',
      rating: 5
    });
    await successStoryRepo.create({
      title: 'Konseling Tepat Sasaran',
      content: 'Sistem matching-nya luar biasa. Saya mendapatkan psikolog yang benar-benar mengerti permasalahan yang saya hadapi.',
      authorName: 'Ivan S.',
      authorRole: 'Pengguna Konseling',
      rating: 5
    });
    await successStoryRepo.create({
      title: 'Nyaman Berbagi',
      content: 'Fitur anonymous chat membuat saya tidak ragu untuk menceritakan hal-hal yang membebani pikiran saya selama ini.',
      authorName: 'Rafles R.',
      authorRole: 'Pengguna Forum',
      rating: 4
    });
  } catch (err: any) {
    console.error('[seed] Could not seed success stories:', err.message);
  }
}

export async function seedCommunityForums() {
  try {
    const { count, error } = await supabaseAdmin
      .from('community_forums')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    if (count && count > 0) {
      return;
    }

    await communityForumRepo.create({
      title: 'Diskusi seputar kesehatan mental screening',
      icon: 'forum',
      link: '/forum?category=Skrining'
    });
    await communityForumRepo.create({
      title: 'Topik community: mental support spesifik',
      icon: 'group',
      link: '/forum?category=Dukungan Emosional'
    });
    await communityForumRepo.create({
      title: 'Diskusi pemulihan dan ruang aman komunitas',
      icon: 'healing',
      link: '/forum?category=Pemulihan'
    });
  } catch (err: any) {
    console.error('[seed] Could not seed community forums:', err.message);
  }
}

export async function seedFaqs() {
  try {
    const { count, error } = await supabaseAdmin
      .from('faqs')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    if (count && count > 0) {
      return;
    }

    await faqRepo.create({
      question: 'Apakah hasil tes kesehatan mental ini akurat?',
      answer: 'Hasil tes kesehatan mental di MindCare dirancang menggunakan kuesioner standar psikologi (seperti DASS-21 atau SRQ-20) untuk keperluan skrining awal (deteksi dini). Hasil ini menunjukkan tingkat kecenderungan atau kecemasan, depresi, atau stres, namun tidak dapat menggantikan diagnosis klinis formal oleh psikolog atau psikiater profesional.'
    });
    await faqRepo.create({
      question: 'Bagaimana kerahasiaan data saya dijamin?',
      answer: 'Kami sangat menghargai privasi Anda. Semua informasi pribadi, jawaban kuesioner, dan data riwayat hasil skrining dienkripsi dengan aman dalam sistem kami. Kami tidak akan membagikan data pribadi Anda kepada pihak ketiga tanpa persetujuan eksplisit dari Anda.'
    });
    await faqRepo.create({
      question: 'Apakah saya bisa memilih psikolog sendiri?',
      answer: 'Ya, setelah Anda melakukan skrining mandiri, platform kami akan merekomendasikan psikolog atau psikiater yang memiliki keahlian paling relevan dengan kebutuhan Anda. Anda bebas memilih psikolog yang terdaftar sesuai dengan profil, ketersediaan jadwal, dan preferensi Anda.'
    });
    await faqRepo.create({
      question: 'Berapa lama proses pemulihan biasanya berlangsung?',
      answer: 'Proses pemulihan kesehatan mental bervariasi bagi setiap individu tergantung pada kondisi masing-masing, jenis tantangan emosional, tingkat keparahan, serta kepatuhan menjalani terapi. Konseling atau terapi secara rutin dapat membantu Anda berproses dengan lebih terarah.'
    });
    await faqRepo.create({
      question: 'Apakah platform ini bisa digunakan dalam keadaan darurat?',
      answer: 'Tidak. MindCare adalah platform untuk deteksi dini, edukasi, dan konseling non-darurat. Jika Anda atau orang terdekat sedang mengalami krisis emosional hebat, berpikiran untuk menyakiti diri sendiri, atau berada dalam situasi darurat medis, silakan segera hubungi hotline kesehatan jiwa nasional 119 ext 8 atau kunjungi fasilitas kesehatan terdekat.'
    });
  } catch (err: any) {
    console.error('[seed] Could not seed FAQs:', err.message);
  }
}

export async function seedAll() {
  const admin = await seedAdmin();
  await seedSuccessStories();
  await seedCommunityForums();
  await seedFaqs();
  return admin;
}
