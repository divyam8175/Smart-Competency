import axios from 'axios';
import {
  AuthResponse,
  CandidateProfile,
  CandidateProfileRequest,
  InsightSummary,
  JobFitResponse,
  RankedCandidate,
  ResumeParseResponse,
  ScoreBreakdown,
  ScoreHistoryEntry,
  ScoreInputPayload,
  SkillGapResponse,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('scd_token');
  if (!config.headers) {
    config.headers = {};
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  } else if (import.meta.env.DEV) {
    console.warn('[api] Missing auth token for request', config.url);
  }

  return config;
});

export const registerUser = async (data: { name: string; email: string; password: string; role: string }): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const loginUser = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const createProfile = async (profile: CandidateProfileRequest): Promise<CandidateProfile> => {
  const response = await api.post<CandidateProfile>('/candidates/profile', profile);
  return response.data;
};

export const updateProfile = async (profile: CandidateProfileRequest): Promise<CandidateProfile> => {
  const response = await api.put<CandidateProfile>('/candidates/profile', profile);
  return response.data;
};

export const getProfile = async (): Promise<CandidateProfile> => {
  const response = await api.get<CandidateProfile>('/candidates/profile');
  return response.data;
};

export const calculateCandidateScore = async (
  candidateId: string,
  payload: ScoreInputPayload
): Promise<{ scores: ScoreBreakdown; insights: InsightSummary }> => {
  const response = await api.post<{ scores: ScoreBreakdown; insights: InsightSummary }>(`/scores/calculate/${candidateId}`, payload);
  return response.data;
};

export const fetchCandidateScore = async (
  candidateId?: string
): Promise<{ scores: ScoreBreakdown | null; insights: InsightSummary }> => {
  if (!candidateId) throw new Error('Candidate ID required');
  const response = await api.get<{ scores: ScoreBreakdown | null; insights: InsightSummary }>(`/scores/${candidateId}`);
  return response.data;
};

export const fetchScoreHistory = async (candidateId?: string): Promise<ScoreHistoryEntry[]> => {
  if (!candidateId) throw new Error('Candidate ID required');
  const response = await api.get<{ history: ScoreHistoryEntry[] }>(`/scores/history/${candidateId}`);
  return response.data.history;
};

export const uploadResumeForParsing = async (file: File): Promise<ResumeParseResponse> => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await api.post<ResumeParseResponse>('/ai/resume/parse', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const runSkillGapAnalysis = async (payload: { roleFocus?: string; requirements?: string[]; candidateId?: string }): Promise<SkillGapResponse> => {
  const { candidateId, ...body } = payload;
  const endpoint = candidateId ? `/ai/skill-gaps/${candidateId}` : '/ai/skill-gaps';
  const response = await api.post<SkillGapResponse>(endpoint, body);
  return response.data;
};

export const requestJobFitPrediction = async (payload: { role: string; requirements?: string[]; candidateId?: string }): Promise<JobFitResponse> => {
  const { candidateId, ...body } = payload;
  const endpoint = candidateId ? `/ai/job-fit/${candidateId}` : '/ai/job-fit';
  const response = await api.post<JobFitResponse>(endpoint, body);
  return response.data;
};

export const fetchSmartRanking = async (params?: { role?: string; limit?: number }): Promise<RankedCandidate[]> => {
  const response = await api.get<{ ranking: RankedCandidate[] }>('/recruiter/candidates/ranking', { params });
  return response.data.ranking;
};

export const fetchRoleMatches = async (params?: { role?: string; limit?: number }): Promise<RankedCandidate[]> => {
  const response = await api.get<{ matches: RankedCandidate[] }>('/recruiter/candidates/matches', { params });
  return response.data.matches;
};

export const compareCandidates = async (candidateIds: string[]): Promise<RankedCandidate[]> => {
  const response = await api.get<{ comparison: RankedCandidate[] }>('/recruiter/candidates/compare', {
    params: { ids: candidateIds.join(',') },
  });
  return response.data.comparison;
};

export const downloadCandidateReport = async (candidateId: string): Promise<Blob> => {
  const response = await api.get(`/reports/candidate/${candidateId}`, { responseType: 'blob' });
  return response.data as Blob;
};

export default api;
