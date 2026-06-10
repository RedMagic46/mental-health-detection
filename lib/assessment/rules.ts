import type { Question } from '../types';

export interface AssessmentResult {
  score: number;
  maxScore: number;
  percentage: number;
  label: 'normal' | 'at_risk' | 'critical';
  recommendation: string;
  subscores: Record<string, { score: number; max: number }>;
}

export function evaluateAssessment(
  answers: Record<number, number>,
  questions: Question[]
): AssessmentResult {
  let totalScore = 0;
  let maxPossible = 0;

  const subscores: Record<string, { score: number; max: number }> = {};

  for (const q of questions) {
    const answerValue = answers[q.id];
    if (answerValue === undefined) continue;

    const clamped = Math.max(0, Math.min(3, answerValue));
    const weighted = clamped * q.weight;

    totalScore += weighted;
    maxPossible += 3 * q.weight;

    if (!subscores[q.category]) {
      subscores[q.category] = { score: 0, max: 0 };
    }
    subscores[q.category].score += weighted;
    subscores[q.category].max += 3 * q.weight;
  }

  const percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

  let label: AssessmentResult['label'];
  let recommendation: string;

  if (percentage <= 33) {
    label = 'normal';
    recommendation =
      'Kondisi kesehatan mental Anda tampak baik. Pertahankan gaya hidup sehat dengan tidur cukup, olahraga teratur, dan menjaga hubungan sosial yang positif. Tetap lakukan self-check secara berkala.';
  } else if (percentage <= 66) {
    label = 'at_risk';
    recommendation =
      'Anda menunjukkan beberapa tanda yang perlu diperhatikan. Disarankan untuk mulai menerapkan teknik relaksasi, berbicara dengan orang yang Anda percaya, dan mempertimbangkan konsultasi dengan profesional kesehatan mental untuk evaluasi lebih lanjut.';
  } else {
    label = 'critical';
    recommendation =
      'Hasil skrining menunjukkan gejala yang signifikan. Sangat disarankan untuk segera berkonsultasi dengan psikolog atau psikiater profesional. Jangan ragu untuk menghubungi layanan darurat kesehatan jiwa (119 ext 8) jika Anda merasa membutuhkan bantuan segera.';
  }

  return {
    score: totalScore,
    maxScore: maxPossible,
    percentage,
    label,
    recommendation,
    subscores,
  };
}
