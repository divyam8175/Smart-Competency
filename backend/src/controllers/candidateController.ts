import { Request, Response } from 'express';
import { CandidateProfile } from '../models/CandidateProfile';
import { User } from '../models/User';

export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const existing = await CandidateProfile.findOne({ user: userId });
    if (existing) {
      res.status(400).json({ message: 'Profile already exists. Use update instead.' });
      return;
    }

    const { phone, education = [], skills = [], projects = [], experience = [], name, email } = req.body;

    const userUpdates: Record<string, unknown> = {};
    if (name) {
      userUpdates.name = name;
    }

    if (email) {
      const emailInUse = await User.findOne({ email, _id: { $ne: userId } });
      if (emailInUse) {
        res.status(409).json({ message: 'Email already in use' });
        return;
      }
      userUpdates.email = email;
    }

    if (Object.keys(userUpdates).length) {
      await User.findByIdAndUpdate(userId, userUpdates, { new: true });
    }

    const profile = await CandidateProfile.create({
      user: userId,
      phone,
      education,
      skills,
      projects,
      experience,
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error('Create profile error', error);
    res.status(500).json({ message: 'Failed to create profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { phone, education = [], skills = [], projects = [], experience = [], name, email } = req.body;

    const userUpdates: Record<string, unknown> = {};
    if (name) {
      userUpdates.name = name;
    }

    if (email) {
      const emailInUse = await User.findOne({ email, _id: { $ne: userId } });
      if (emailInUse) {
        res.status(409).json({ message: 'Email already in use' });
        return;
      }
      userUpdates.email = email;
    }

    if (Object.keys(userUpdates).length) {
      await User.findByIdAndUpdate(userId, userUpdates, { new: true });
    }

    const updated = await CandidateProfile.findOneAndUpdate(
      { user: userId },
      {
        phone,
        education,
        skills,
        projects,
        experience,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update profile error', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const profile = await CandidateProfile.findOne({ user: userId }).populate('user', 'name email role');

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Get profile error', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

export const getCandidateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.id;

    if (!targetUserId) {
      res.status(400).json({ message: 'Candidate id is required' });
      return;
    }

    const profile = await CandidateProfile.findOne({ user: targetUserId }).populate('user', 'name email role');

    if (!profile) {
      res.status(404).json({ message: 'Candidate not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Get candidate error', error);
    res.status(500).json({ message: 'Failed to fetch candidate' });
  }
};
