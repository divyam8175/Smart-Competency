export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Education {
  degree: string;
  institution: string;
  graduationYear: string;
}

export interface Project {
  name: string;
  description?: string;
  link?: string;
}

export interface Experience {
  organization: string;
  role: string;
  duration?: string;
  summary?: string;
}

export interface ScoreBreakdown {
  technical: number;
  cognitive: number;
  behavioral: number;
  communication: number;
  overall: number;
}

export interface ScoreHistoryEntry extends ScoreBreakdown {
  calculatedAt: string;
}

export interface CandidateProfile {
  _id?: string;
  phone?: string;
  education: Education[];
  skills: string[];
  projects: Project[];
  experience: Experience[];
  scores?: ScoreBreakdown | null;
  scoreHistory?: ScoreHistoryEntry[];
  resumeSnapshot?: ResumeSnapshot | null;
  skillGapHistory?: SkillGapAnalysis[];
  jobFitAssessments?: JobFitPrediction[];
}

export interface CandidateProfileRequest extends CandidateProfile {
  name?: string;
  email?: string;
}

export type ScoreInputPayload = Omit<ScoreBreakdown, 'overall'>;

export interface InsightSummary {
  strengths: string[];
  weaknesses: string[];
  focusAreas: string[];
}

export interface ResumeSnapshot {
  rawText: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  parsedAt: string;
  sourceName?: string;
}

export interface CandidateAutofillSuggestion {
  phone?: string;
  education: Education[];
  skills: string[];
  projects: Project[];
  experience: Experience[];
}

export interface ResumeParseResponse {
  snapshot: ResumeSnapshot;
  autofill: CandidateAutofillSuggestion;
  profile?: CandidateProfile;
}

export interface SkillGapAnalysis {
  roleFocus?: string;
  missingSkills: string[];
  matchingSkills: string[];
  recommendedLearning: string[];
  summary: string;
  analyzedAt: string;
  readinessScore: number;
  recommendedRoadmap: Array<{ skill: string; action: string }>;
}

export interface SkillGapResponse {
  candidate: User;
  analysis: SkillGapAnalysis;
}

export interface JobFitPrediction {
  role: string;
  suitability: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  analyzedAt: string;
  rationale: string;
  readinessScore: number;
}

export interface JobFitResponse {
  candidate: User;
  prediction: JobFitPrediction;
}

export interface RankedCandidate {
  candidateId: string;
  name: string;
  email: string;
  role: UserRole;
  overallScore: number | null;
  jobFit: JobFitPrediction;
  recentScoreDate?: string;
}
