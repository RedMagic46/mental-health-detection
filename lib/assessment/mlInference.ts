import dassWeights from '../../public/model/dass21_weights.json';

export interface MLPrediction {
  score: number;
  predictedClass: number;
  level: 'Normal' | 'Ringan' | 'Sedang' | 'Parah' | 'Sangat Parah';
  probabilities: number[];
}

export interface MLAssessmentResult {
  depression: MLPrediction;
  anxiety: MLPrediction;
  stress: MLPrediction;
  overallLabel: 'normal' | 'at_risk' | 'critical';
  recommendation: string;
}

const LEVEL_MAP = ['Normal', 'Ringan', 'Sedang', 'Parah', 'Sangat Parah'] as const;

const DEP_INDICES = [3, 5, 10, 13, 16, 17, 21];
const ANX_INDICES = [2, 4, 7, 9, 15, 19, 20];
const STR_INDICES = [1, 6, 8, 11, 12, 14, 18];

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map((val) => Math.exp(val - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((val) => val / sum);
}

function predictCategory(
  features: number[],
  modelData: { coef: number[][]; intercept: number[]; classes: number[] }
): Omit<MLPrediction, 'score'> {
  const { coef, intercept } = modelData;
  const nClasses = intercept.length;

  const logits = new Array<number>(nClasses).fill(0);

  for (let c = 0; c < nClasses; c++) {
    let score = intercept[c];
    for (let f = 0; f < features.length; f++) {
      score += coef[c][f] * features[f];
    }
    logits[c] = score;
  }

  const probs = softmax(logits);
  let maxProbIndex = 0;
  let maxProb = probs[0];

  for (let c = 1; c < nClasses; c++) {
    if (probs[c] > maxProb) {
      maxProb = probs[c];
      maxProbIndex = c;
    }
  }

  return {
    predictedClass: maxProbIndex,
    level: LEVEL_MAP[maxProbIndex] || 'Normal',
    probabilities: probs,
  };
}

export function runMLInference(answers: Record<number, number>): MLAssessmentResult {
  const features = new Array<number>(21).fill(0);
  for (let i = 0; i < 21; i++) {
    const qId = i + 1;
    features[i] = answers[qId] !== undefined ? Math.max(0, Math.min(3, answers[qId])) : 0;
  }

  const calcScore = (indices: number[]) => {
    return indices.reduce((sum, idx) => sum + (answers[idx] || 0), 0) * 2;
  };

  const depScore = calcScore(DEP_INDICES);
  const anxScore = calcScore(ANX_INDICES);
  const strScore = calcScore(STR_INDICES);

  const depPred = predictCategory(features, dassWeights.depression);
  const anxPred = predictCategory(features, dassWeights.anxiety);
  const strPred = predictCategory(features, dassWeights.stress);

  const maxClass = Math.max(
    depPred.predictedClass,
    anxPred.predictedClass,
    strPred.predictedClass
  );

  const totalScore = depScore + anxScore + strScore;
  const percentage = Math.round((totalScore / 126) * 100);

  let overallLabel: MLAssessmentResult['overallLabel'] = 'normal';
  let recommendation = '';

  if (percentage > 66 || maxClass === 4) {
    overallLabel = 'critical';
    recommendation =
      'Hasil penilaian mendeteksi indikasi tingkat keparahan yang sangat signifikan (Sangat Parah) pada salah satu aspek kesehatan emosional Anda atau total skor yang tinggi. Kami sangat menganjurkan Anda untuk segera melakukan konsultasi dengan psikolog atau psikiater profesional kami. Jika Anda mengalami krisis emosional hebat, hubungi hotline layanan darurat kesehatan jiwa (119 ext 8).';
  } 
  else if (percentage > 33 || maxClass >= 2) {
    overallLabel = 'at_risk';
    recommendation =
      'Anda terdeteksi memiliki tingkat kecemasan, depresi, atau stres tingkat Sedang hingga Parah pada salah satu aspek, atau total skor menunjukkan risiko awal. Kami menyarankan Anda untuk mengambil waktu istirahat, berbicara dengan orang terdekat, dan mempertimbangkan konsultasi dengan psikolog di MindCare.';
  } 
  else {
    overallLabel = 'normal';
    recommendation =
      'Kondisi kesehatan mental Anda saat ini tampak berada dalam batas normal. Pertahankan gaya hidup seimbang dengan istirahat cukup, interaksi sosial yang sehat, serta rutin mempraktekkan relaksasi mandiri.';
  }

  return {
    depression: { ...depPred, score: depScore },
    anxiety: { ...anxPred, score: anxScore },
    stress: { ...strPred, score: strScore },
    overallLabel,
    recommendation,
  };
}
