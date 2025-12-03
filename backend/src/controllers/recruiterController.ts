import { Request, Response } from 'express';
import { CandidateProfile } from '../models/CandidateProfile';
import { buildCandidateRanking, compareCandidates } from '../services/rankingService';
import { predictJobFit } from '../services/jobFitService';

export const getSmartRanking = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = typeof req.query.role === 'string' ? req.query.role : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 25;
    const ranking = await buildCandidateRanking(role, Number.isNaN(limit) ? 25 : limit);
    res.status(200).json({ ranking });
  } catch (error) {
    console.error('Ranking fetch error', error);
    res.status(500).json({ message: 'Failed to build ranking' });
  }
};

export const matchCandidatesToRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = typeof req.query.role === 'string' ? req.query.role : undefined;
    if (!role) {
      res.status(400).json({ message: 'Role query parameter is required' });
      return;
    }

    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const ranking = await buildCandidateRanking(role, Number.isNaN(limit) ? 10 : limit);
    res.status(200).json({ matches: ranking });
  } catch (error) {
    console.error('Role match error', error);
    res.status(500).json({ message: 'Failed to match candidates' });
  }
};

export const compareCandidatesTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const idsParam = typeof req.query.ids === 'string' ? req.query.ids : '';
    const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean);
    if (!ids.length) {
      res.status(400).json({ message: 'Provide candidate ids via ids query parameter' });
      return;
    }

    const comparison = await compareCandidates(ids);
    res.status(200).json({ comparison });
  } catch (error) {
    console.error('Comparison error', error);
    res.status(500).json({ message: 'Failed to compare candidates' });
  }
};

export const getCandidateJobMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = req.params.candidateId;
    const role = typeof req.query.role === 'string' ? req.query.role : undefined;

    if (!candidateId || !role) {
      res.status(400).json({ message: 'Candidate id and role are required' });
      return;
    }

    const profile = await CandidateProfile.findOne({ user: candidateId }).populate('user', 'name email role');
    if (!profile) {
      res.status(404).json({ message: 'Candidate profile not found' });
      return;
    }

    const prediction = predictJobFit(profile, role);
    res.status(200).json({ candidate: profile.user, prediction });
  } catch (error) {
    console.error('Candidate match error', error);
    res.status(500).json({ message: 'Failed to evaluate candidate' });
  }
};
