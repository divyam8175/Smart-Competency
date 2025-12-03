import { Router } from 'express';
import { createProfile, getCandidateById, getMyProfile, updateProfile } from '../controllers/candidateController';
import { protect, requireRoles } from '../middleware/authMiddleware';

const router = Router();

router.post('/profile', protect, requireRoles('candidate'), createProfile);
router.put('/profile', protect, requireRoles('candidate'), updateProfile);
router.get('/profile', protect, requireRoles('candidate'), getMyProfile);
router.get('/:id', protect, requireRoles('recruiter', 'admin'), getCandidateById);

export default router;
