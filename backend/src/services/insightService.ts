import { IScoreBreakdown } from '../models/CandidateProfile';

export interface InsightSummary {
  strengths: string[];
  weaknesses: string[];
  focusAreas: string[];
}

const LABELS: Record<keyof IScoreBreakdown, string> = {
  technical: 'Technical',
  cognitive: 'Cognitive',
  behavioral: 'Behavioral',
  communication: 'Communication',
  overall: 'Overall',
};

export const generateInsights = (scores?: IScoreBreakdown | null): InsightSummary => {
  if (!scores) {
    return {
      strengths: [],
      weaknesses: [],
      focusAreas: ['No scores available yet. Capture a score to unlock insights.'],
    };
  }

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const focusAreas: string[] = [];

  (['technical', 'cognitive', 'behavioral', 'communication'] as Array<keyof IScoreBreakdown>).forEach((key) => {
    const value = scores[key];
    if (value >= 80) {
      strengths.push(`${LABELS[key]} competency is a strong area (${value})`);
    } else if (value < 60) {
      weaknesses.push(`${LABELS[key]} competency needs improvement (${value})`);
      focusAreas.push(`Improve ${LABELS[key]} skills via targeted practice and mentoring.`);
    }
  });

  if (!strengths.length) {
    strengths.push('Developing baseline strengths. Continue consistent effort.');
  }

  if (!weaknesses.length) {
    weaknesses.push('No critical weak areas detected at the moment.');
  }

  if (!focusAreas.length) {
    focusAreas.push('Maintain current performance and seek stretch assignments.');
  }

  return { strengths, weaknesses, focusAreas };
};
