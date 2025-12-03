import { CandidateProfile, ICandidateProfile } from '../models/CandidateProfile';
import { predictJobFit, JobFitPrediction } from './jobFitService';

export interface RankedCandidate {
  candidateId: string;
  name: string;
  email: string;
  role: string;
  overallScore: number | null;
  jobFit: JobFitPrediction;
  recentScoreDate?: Date;
}

type PopulatedUser = { _id?: string; id?: string; name: string; email: string; role: string };

const getTail = <T>(list?: T[]): T | undefined => {
  if (!list || !list.length) return undefined;
  return list[list.length - 1];
};

const summarizeProfile = (profile: ICandidateProfile): RankedCandidate => {
  const user = profile.user as unknown as PopulatedUser;
  const lastRole = getTail(profile.jobFitAssessments)?.role || 'Generalist';
  const jobFit = predictJobFit(profile, lastRole);

  const ranked: RankedCandidate = {
    candidateId: user._id || user.id || (profile.user as unknown as { toString: () => string }).toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    overallScore: profile.scores?.overall ?? null,
    jobFit,
  };

  const recentEntry = getTail(profile.scoreHistory);
  if (recentEntry) {
    ranked.recentScoreDate = recentEntry.calculatedAt;
  }

  return ranked;
};

export const buildCandidateRanking = async (role?: string, limit = 25): Promise<RankedCandidate[]> => {
  const profiles = await CandidateProfile.find()
    .populate('user', 'name email role')
    .limit(limit)
    .sort({ updatedAt: -1 });

  const enriched = profiles.map((profile) => {
    const prediction = predictJobFit(profile, role || 'Generalist');
    return {
      candidate: profile,
      jobFit: prediction,
    };
  });

  return enriched
    .map(({ candidate, jobFit }) => {
      const user = candidate.user as unknown as PopulatedUser;
      const ranked: RankedCandidate = {
        candidateId: user._id || user.id || (candidate.user as unknown as { toString: () => string }).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        overallScore: candidate.scores?.overall ?? null,
        jobFit,
      };

      const recentEntry = getTail(candidate.scoreHistory);
      if (recentEntry) {
        ranked.recentScoreDate = recentEntry.calculatedAt;
      }

      return ranked;
    })
    .sort((a, b) => (b.jobFit.suitability || 0) - (a.jobFit.suitability || 0));
};

export const compareCandidates = async (candidateIds: string[]): Promise<RankedCandidate[]> => {
  const profiles = await CandidateProfile.find({ user: { $in: candidateIds } }).populate('user', 'name email role');
  return profiles.map((profile) => summarizeProfile(profile));
};
