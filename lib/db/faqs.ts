import { supabaseAdmin } from '../supabase';
import type { Faq } from '../types';
import { toFaq } from './mappers';

export const faqRepo = {
  async findAll(): Promise<Faq[]> {
    const { data, error } = await supabaseAdmin
      .from('faqs')
      .select('id, question, answer, created_at')
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [
        {
          id: 1,
          question: 'Apakah hasil tes kesehatan mental ini akurat?',
          answer: 'Hasil tes kesehatan mental di MindCare dirancang menggunakan kuesioner standar psikologi (seperti DASS-21 atau SRQ-20) untuk keperluan skrining awal (deteksi dini). Hasil ini menunjukkan tingkat kecenderungan atau kecemasan, depresi, atau stres, namun tidak dapat menggantikan diagnosis klinis formal oleh psikolog atau psikiater profesional.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          question: 'Bagaimana kerahasiaan data saya dijamin?',
          answer: 'Kami sangat menghargai privasi Anda. Semua informasi pribadi, jawaban kuesioner, dan data riwayat hasil skrining dienkripsi dengan aman dalam sistem kami. Kami tidak akan membagikan data pribadi Anda kepada pihak ketiga tanpa persetujuan eksplisit dari Anda.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          question: 'Apakah saya bisa memilih psikolog sendiri?',
          answer: 'Ya, setelah Anda melakukan skrining mandiri, platform kami akan merekomendasikan psikolog atau psikiater yang memiliki keahlian paling relevan dengan kebutuhan Anda. Anda bebas memilih psikolog yang terdaftar sesuai dengan profil, ketersediaan jadwal, dan preferensi Anda.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 4,
          question: 'Berapa lama proses pemulihan biasanya berlangsung?',
          answer: 'Proses pemulihan kesehatan mental bervariasi bagi setiap individu tergantung pada kondisi masing-masing, jenis tantangan emosional, tingkat keparahan, serta kepatuhan menjalani terapi. Konseling atau terapi secara rutin dapat membantu Anda berproses dengan lebih terarah.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 5,
          question: 'Apakah platform ini bisa digunakan dalam keadaan darurat?',
          answer: 'Tidak. MindCare adalah platform untuk deteksi dini, edukasi, dan konseling non-darurat. Jika Anda atau orang terdekat sedang mengalami krisis emosional hebat, berpikiran untuk menyakiti diri sendiri, atau berada dalam situasi darurat medis, silakan segera hubungi hotline kesehatan jiwa nasional 119 ext 8 atau kunjungi fasilitas kesehatan terdekat.',
          createdAt: new Date().toISOString(),
        },
      ];
    }

    return data.map(toFaq);
  },

  async create(data: Omit<Faq, 'id' | 'createdAt'>): Promise<Faq> {
    const { data: inserted, error } = await supabaseAdmin
      .from('faqs')
      .insert({
        question: data.question,
        answer: data.answer,
      })
      .select('id, question, answer, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to create FAQ: ${error.message}`);
    }

    return toFaq(inserted);
  },

  async update(id: number, data: Partial<Omit<Faq, 'id' | 'createdAt'>>): Promise<Faq | undefined> {
    const updateData: any = {};
    if (data.question) updateData.question = data.question;
    if (data.answer) updateData.answer = data.answer;

    const { data: updated, error } = await supabaseAdmin
      .from('faqs')
      .update(updateData)
      .eq('id', id)
      .select('id, question, answer, created_at')
      .single();

    if (error || !updated) return undefined;
    return toFaq(updated);
  },

  async delete(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('faqs')
      .delete()
      .eq('id', id);
    return !error;
  },
};
