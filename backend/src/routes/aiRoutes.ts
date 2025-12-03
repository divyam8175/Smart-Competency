import { Router } from 'express';
import multer from 'multer';
import { uploadAndParseResume, generateSkillGapAnalysis, predictJobFitForCandidate } from '../controllers/aiController';
import { protect, requireRoles } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 6 * 1024 * 1024 } });

router.post('/resume/parse', protect, requireRoles('candidate'), upload.single('resume'), uploadAndParseResume);
router.post('/skill-gaps', protect, requireRoles('candidate', 'recruiter', 'admin'), generateSkillGapAnalysis);
router.post('/skill-gaps/:candidateId', protect, requireRoles('candidate', 'recruiter', 'admin'), generateSkillGapAnalysis);
router.post('/job-fit', protect, requireRoles('candidate', 'recruiter', 'admin'), predictJobFitForCandidate);
router.post('/job-fit/:candidateId', protect, requireRoles('candidate', 'recruiter', 'admin'), predictJobFitForCandidate);

export default router;
