import type { Question } from '../types';

/**
 * Default mental health screening questions.
 * Based on PHQ-9 (depression) and GAD-7 (anxiety) instruments.
 * Each answer is scored 0-3:
 *   0 = Tidak pernah
 *   1 = Beberapa hari
 *   2 = Lebih dari separuh waktu
 *   3 = Hampir setiap hari
 */
export const defaultQuestions: Question[] = [
  {
    id: 1,
    text: 'Dalam 2 minggu terakhir, seberapa sering Anda merasa sedih, tertekan, atau putus asa?',
    category: 'Depresi',
    weight: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    text: 'Seberapa sering Anda kehilangan minat atau kesenangan dalam melakukan aktivitas sehari-hari?',
    category: 'Anhedonia',
    weight: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    text: 'Seberapa sering Anda merasa cemas, gugup, atau gelisah?',
    category: 'Kecemasan',
    weight: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 4,
    text: 'Seberapa sering Anda mengalami kesulitan tidur atau tidur terlalu banyak?',
    category: 'Tidur',
    weight: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 5,
    text: 'Seberapa sering Anda merasa mudah lelah atau tidak memiliki energi?',
    category: 'Energi',
    weight: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 6,
    text: 'Seberapa sering Anda merasa buruk tentang diri sendiri, atau merasa Anda gagal?',
    category: 'Harga Diri',
    weight: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 7,
    text: 'Seberapa sering Anda sulit berkonsentrasi, misalnya saat membaca atau menonton TV?',
    category: 'Konsentrasi',
    weight: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 8,
    text: 'Seberapa sering Anda merasa tidak bisa menghentikan atau mengendalikan rasa khawatir?',
    category: 'Kecemasan',
    weight: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 9,
    text: 'Seberapa sering Anda merasa takut seolah-olah sesuatu yang buruk akan terjadi?',
    category: 'Kecemasan',
    weight: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 10,
    text: 'Seberapa sering Anda merasa nafsu makan menurun atau makan berlebihan?',
    category: 'Nafsu Makan',
    weight: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

/** Answer options for the assessment */
export const answerOptions = [
  { value: 0, label: 'Tidak pernah' },
  { value: 1, label: 'Beberapa hari' },
  { value: 2, label: 'Lebih dari separuh waktu' },
  { value: 3, label: 'Hampir setiap hari' },
] as const;
