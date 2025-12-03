import { Router } from 'express';
import { streamCandidateReport } from '../controllers/reportController';
import { protect, requireRoles } from '../middleware/authMiddleware';

const router = Router();

router.get('/candidate/:candidateId', protect, requireRoles('candidate', 'recruiter', 'admin'), streamCandidateReport);

export default router;
