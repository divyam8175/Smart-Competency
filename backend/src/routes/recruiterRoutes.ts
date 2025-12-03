import { Router } from 'express';
import { compareCandidatesTable, getCandidateJobMatches, getSmartRanking, matchCandidatesToRole } from '../controllers/recruiterController';
import { protect, requireRoles } from '../middleware/authMiddleware';

const router = Router();

router.get('/candidates/ranking', protect, requireRoles('recruiter', 'admin'), getSmartRanking);
router.get('/candidates/matches', protect, requireRoles('recruiter', 'admin'), matchCandidatesToRole);
router.get('/candidates/compare', protect, requireRoles('recruiter', 'admin'), compareCandidatesTable);
router.get('/candidates/:candidateId/job-fit', protect, requireRoles('recruiter', 'admin'), getCandidateJobMatches);

export default router;
