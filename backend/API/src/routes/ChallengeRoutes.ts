import { Router } from 'express';
import { ChallengeController } from '../controllers/ChallengeController';
import { auth } from '../middleware';
import { body } from 'express-validator';
import { validate } from '../middleware/Validator';

const router = Router();
const challengeController = new ChallengeController();

// Create a new challenge
router.post(
  '/',
  auth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('language').notEmpty().withMessage('Language is required'),
    body('type').notEmpty().withMessage('Challenge type is required'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('minDailyTime').isInt({ min: 1 }).withMessage('Minimum daily time must be a positive integer'),
    validate
  ],
  challengeController.createChallenge
);

// Get group chat messages
router.get(
  '/groups/:groupId/chat',
  auth,
  challengeController.getGroupChat
);

// Update user progress
router.post(
  '/progress',
  auth,
  [
    body('minutes').isInt({ min: 1 }).withMessage('Minutes must be a positive integer'),
    validate
  ],
  challengeController.updateProgress
);

// Get user challenges
router.get(
  '/user/:userId',
  auth,
  challengeController.getUserChallenges
);

// Join a challenge
router.post(
  '/:challengeId/join',
  auth,
  challengeController.joinChallenge
);

// Get challenge leaderboard
router.get(
  '/:challengeId/leaderboard',
  auth,
  challengeController.getLeaderboard
);

export default router; 