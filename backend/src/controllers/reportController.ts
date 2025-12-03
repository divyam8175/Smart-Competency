import { Request, Response } from 'express';
import { CandidateProfile } from '../models/CandidateProfile';
import { generateInsights } from '../services/insightService';
import { generateCandidateReport } from '../services/reportService';

const ensureReportAccess = (req: Request, candidateUserId: string): boolean => {
  if (req.user?.role === 'candidate' && req.user.id !== candidateUserId) {
    return false;
  }
  return true;
};

export const streamCandidateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = req.params.candidateId;
    if (!candidateId) {
      res.status(400).json({ message: 'Candidate id is required' });
      return;
    }

    if (!ensureReportAccess(req, candidateId)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const profile = await CandidateProfile.findOne({ user: candidateId }).populate('user', 'name email role');
    if (!profile) {
      res.status(404).json({ message: 'Candidate profile not found' });
      return;
    }

    const userInfo = profile.user as unknown as { name: string; email: string };

    const reportContext = {
      candidate: profile,
      userMeta: userInfo,
      insights: generateInsights(profile.scores),
      scoreHistory: profile.scoreHistory,
    } as Parameters<typeof generateCandidateReport>[0];

    if (profile.skillGapHistory.length) {
      const lastGap = profile.skillGapHistory[profile.skillGapHistory.length - 1];
      if (lastGap) {
        reportContext.latestSkillGap = lastGap;
      }
    }

    if (profile.jobFitAssessments.length) {
      const lastFit = profile.jobFitAssessments[profile.jobFitAssessments.length - 1];
      if (lastFit) {
        reportContext.latestJobFit = lastFit;
      }
    }

    const buffer = await generateCandidateReport(reportContext);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${userInfo.name || 'candidate'}-report.pdf"`);
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Report generation error', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};
