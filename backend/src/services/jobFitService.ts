import { ICandidateProfile, IJobFitAssessment } from '../models/CandidateProfile';
import { analyzeSkillGaps, SkillGapAnalysisResult } from './skillGapService';

const clamp = (value: number): number => Math.max(0, Math.min(100, value));

export interface JobFitPrediction extends IJobFitAssessment {
  rationale: string;
  readinessScore: number;
  referencedSkillGap: SkillGapAnalysisResult;
}

export const predictJobFit = (
  profile: ICandidateProfile,
  role: string,
  customRequirements?: string[]
): JobFitPrediction => {
  const gap = analyzeSkillGaps(profile, role, customRequirements);
  const baseScore = profile.scores?.overall ?? 60;
  const tenureBoost = Math.min((profile.experience?.length || 0) * 3, 15);

  const skillMatchScore = gap.missingSkills.length
    ? 100 - Math.min((gap.missingSkills.length / (gap.missingSkills.length + gap.matchingSkills.length + 1)) * 100, 60)
    : 95;

  const suitability = clamp(Math.round(0.55 * baseScore + 0.35 * skillMatchScore + 0.1 * tenureBoost));

  const recommendations = gap.recommendedLearning.slice(0, 5);

  return {
    role,
    suitability,
    matchingSkills: gap.matchingSkills,
    missingSkills: gap.missingSkills,
    recommendations,
    analyzedAt: new Date(),
    rationale: `Combined readiness score of ${gap.readinessScore}% with competency average ${baseScore} produces ${suitability}% role fit.`,
    readinessScore: gap.readinessScore,
    referencedSkillGap: gap,
  };
};
