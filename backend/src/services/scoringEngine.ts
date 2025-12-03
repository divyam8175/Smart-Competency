export type RawScores = {
  technical: number;
  cognitive: number;
  behavioral: number;
  communication: number;
};

export const DEFAULT_WEIGHTS: RawScores = {
  technical: 0.4,
  cognitive: 0.25,
  behavioral: 0.2,
  communication: 0.15,
};

export interface ScoreResult {
  breakdown: RawScores;
  overall: number;
}

const clampScore = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
};

export const calculateScore = (rawScores: RawScores): ScoreResult => {
  const sanitized: RawScores = {
    technical: clampScore(rawScores.technical),
    cognitive: clampScore(rawScores.cognitive),
    behavioral: clampScore(rawScores.behavioral),
    communication: clampScore(rawScores.communication),
  };

  const overall =
    sanitized.technical * DEFAULT_WEIGHTS.technical +
    sanitized.cognitive * DEFAULT_WEIGHTS.cognitive +
    sanitized.behavioral * DEFAULT_WEIGHTS.behavioral +
    sanitized.communication * DEFAULT_WEIGHTS.communication;

  return {
    breakdown: sanitized,
    overall: Math.round(overall * 100) / 100,
  };
};
