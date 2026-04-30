// ============================================================
// Rule-based Mental Health Detection Engine
// Runs server-side — never expose internals to client.
// ============================================================

import type { Question } from '../types';

export interface AssessmentResult {
  score: number;
  maxScore: number;
  percentage: number;
  label: 'normal' | 'at_risk' | 'critical';
  recommendation: string;
  subscores: Record<string, { score: number; max: number }>;
}

/**
 * Evaluate mental health assessment answers using rule-based scoring.
 *
 * @param answers - Map of questionId → answer value (0-3)
 * @param questions - The questions used in this assessment
 * @returns Scored result with label and recommendation
 */
export function evaluateAssessment(
  answers: Record<number, number>,
  questions: Question[]
): AssessmentResult {
  // 1. Calculate total score with weights
  let totalScore = 0;
  let maxPossible = 0;

  // 2. Calculate subscores by category
  const subscores: Record<string, { score: number; max: number }> = {};

  for (const q of questions) {
    const answerValue = answers[q.id];
    if (answerValue === undefined) continue;

    // Clamp answer to valid range 0-3
    const clamped = Math.max(0, Math.min(3, answerValue));
    const weighted = clamped * q.weight;

    totalScore += weighted;
    maxPossible += 3 * q.weight;

    // Accumulate subscore
    if (!subscores[q.category]) {
      subscores[q.category] = { score: 0, max: 0 };
    }
    subscores[q.category].score += weighted;
    subscores[q.category].max += 3 * q.weight;
  }

  // 3. Calculate percentage
  const percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

  // 4. Determine label based on percentage thresholds
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
