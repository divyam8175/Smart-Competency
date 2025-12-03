import { Router } from 'express';
import { calculateCandidateScore, getCandidateScore, getCandidateScoreHistory } from '../controllers/scoreController';
import { protect, requireRoles } from '../middleware/authMiddleware';

const router = Router();

router.post('/calculate/:candidateId', protect, requireRoles('recruiter', 'admin'), calculateCandidateScore);
router.get('/history/:candidateId', protect, requireRoles('candidate', 'recruiter', 'admin'), getCandidateScoreHistory);
router.get('/:candidateId', protect, requireRoles('candidate', 'recruiter', 'admin'), getCandidateScore);

export default router;
