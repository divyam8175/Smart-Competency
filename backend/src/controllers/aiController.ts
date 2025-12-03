import { Request, Response } from 'express';
import { CandidateProfile } from '../models/CandidateProfile';
import { parseResume } from '../services/resumeParserService';
import { analyzeSkillGaps } from '../services/skillGapService';
import { predictJobFit } from '../services/jobFitService';

const resolveCandidateTarget = (req: Request): string | null => {
  if (req.params.candidateId) {
    return req.params.candidateId;
  }

  if (!req.user) return null;

  if (req.user.role === 'candidate') {
    return req.user.id;
  }

  return null;
};

const ensureCandidateAccess = (req: Request, targetUserId: string): boolean => {
  if (req.user?.role === 'candidate' && req.user.id !== targetUserId) {
    return false;
  }
  return true;
};

export const uploadAndParseResume = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'Resume file is required' });
      return;
    }

    const parsed = await parseResume(file);

    const profile = await CandidateProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        $setOnInsert: { user: req.user.id },
        resumeSnapshot: parsed.snapshot,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      snapshot: parsed.snapshot,
      autofill: parsed.autofill,
      profile,
    });
  } catch (error) {
    console.error('Resume parsing error', error);
    res.status(500).json({ message: 'Failed to parse resume' });
  }
};

export const generateSkillGapAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = resolveCandidateTarget(req);
    if (!candidateId) {
      res.status(400).json({ message: 'Candidate id is required' });
      return;
    }

    if (!ensureCandidateAccess(req, candidateId)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const profile = await CandidateProfile.findOne({ user: candidateId }).populate('user', 'name email role');
    if (!profile) {
      res.status(404).json({ message: 'Candidate profile not found' });
      return;
    }

    const { roleFocus, requirements } = req.body as { roleFocus?: string; requirements?: string[] };
    const result = analyzeSkillGaps(profile, roleFocus, requirements);

    profile.skillGapHistory.push(result);
    if (profile.skillGapHistory.length > 20) {
      profile.skillGapHistory = profile.skillGapHistory.slice(-20);
    }

    await profile.save();

    res.status(200).json({
      candidate: profile.user,
      analysis: result,
    });
  } catch (error) {
    console.error('Skill gap analysis error', error);
    res.status(500).json({ message: 'Failed to analyze skill gaps' });
  }
};

export const predictJobFitForCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = resolveCandidateTarget(req);
    if (!candidateId) {
      res.status(400).json({ message: 'Candidate id is required' });
      return;
    }

    if (!ensureCandidateAccess(req, candidateId)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const profile = await CandidateProfile.findOne({ user: candidateId }).populate('user', 'name email role');
    if (!profile) {
      res.status(404).json({ message: 'Candidate profile not found' });
      return;
    }

    const { role, requirements } = req.body as { role: string; requirements?: string[] };
    if (!role) {
      res.status(400).json({ message: 'Role is required' });
      return;
    }

    const prediction = predictJobFit(profile, role, requirements);

    profile.jobFitAssessments.push(prediction);
    if (profile.jobFitAssessments.length > 20) {
      profile.jobFitAssessments = profile.jobFitAssessments.slice(-20);
    }

    await profile.save();

    res.status(200).json({
      candidate: profile.user,
      prediction,
    });
  } catch (error) {
    console.error('Job fit prediction error', error);
    res.status(500).json({ message: 'Failed to predict job fit' });
  }
};
