import { Router } from 'express';
import { auth } from '../middleware';
import { ChallengeController } from '../controllers/ChallengeController';

const router = Router();
const challengeController = new ChallengeController();

// Get group chat messages
router.get(
  '/:groupId/chat',
  auth,
  challengeController.getGroupChat
);

export default router; 