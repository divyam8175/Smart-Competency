import { Request, Response } from 'express';
import { CandidateProfile } from '../models/CandidateProfile';
import { calculateScore, RawScores } from '../services/scoringEngine';
import { generateInsights } from '../services/insightService';

const validateScores = (payload: Partial<RawScores>): payload is RawScores => {
  const required: Array<keyof RawScores> = ['technical', 'cognitive', 'behavioral', 'communication'];
  return required.every((key) => typeof payload[key] === 'number');
};

const ensureCandidateSelfAccess = (req: Request, candidateUserId: string): boolean => {
  if (req.user?.role === 'candidate' && req.user.id !== candidateUserId) {
    return false;
  }
  return true;
};

export const calculateCandidateScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = req.params.candidateId;
    if (!candidateId) {
      res.status(400).json({ message: 'Candidate id is required' });
      return;
    }

    if (!validateScores(req.body)) {
      res.status(400).json({ message: 'All score fields (0-100) are required' });
      return;
    }

    const profile = await CandidateProfile.findOne({ user: candidateId }).populate('user', 'name email role');

    if (!profile) {
      res.status(404).json({ message: 'Candidate profile not found' });
      return;
    }

    const { breakdown, overall } = calculateScore(req.body);

    profile.scores = { ...breakdown, overall };
    profile.scoreHistory.push({ ...breakdown, overall, calculatedAt: new Date() });

    if (profile.scoreHistory.length > 50) {
      profile.scoreHistory = profile.scoreHistory.slice(-50);
    }

    await profile.save();

    res.status(200).json({
      candidate: profile.user,
      scores: profile.scores,
      historyCount: profile.scoreHistory.length,
      insights: generateInsights(profile.scores),
    });
  } catch (error) {
    console.error('Score calculation error', error);
    res.status(500).json({ message: 'Failed to calculate score' });
  }
};

export const getCandidateScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = req.params.candidateId;
    if (!candidateId) {
      res.status(400).json({ message: 'Candidate id is required' });
      return;
    }

    if (!ensureCandidateSelfAccess(req, candidateId)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const profile = await CandidateProfile.findOne({ user: candidateId }).populate('user', 'name email role');

    if (!profile) {
      res.status(404).json({ message: 'Candidate profile not found' });
      return;
    }

    res.status(200).json({
      candidate: profile.user,
      scores: profile.scores,
      insights: generateInsights(profile.scores),
    });
  } catch (error) {
    console.error('Get score error', error);
    res.status(500).json({ message: 'Failed to fetch score' });
  }
};

export const getCandidateScoreHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = req.params.candidateId;
    if (!candidateId) {
      res.status(400).json({ message: 'Candidate id is required' });
      return;
    }

    if (!ensureCandidateSelfAccess(req, candidateId)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const profile = await CandidateProfile.findOne({ user: candidateId }).select('scoreHistory user');

    if (!profile) {
      res.status(404).json({ message: 'Candidate profile not found' });
      return;
    }

    res.status(200).json({
      candidateId,
      history: profile.scoreHistory,
    });
  } catch (error) {
    console.error('Get history error', error);
    res.status(500).json({ message: 'Failed to fetch score history' });
  }
};
