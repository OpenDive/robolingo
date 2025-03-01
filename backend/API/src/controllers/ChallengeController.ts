import { Request, Response, NextFunction } from 'express';
import Challenge from '../models/Challenge.model';
import User from '../models/User.model';
import Group from '../models/Group.model';
import Message from '../models/Message.model';

export class ChallengeController {
  async createChallenge(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, language, type, stake, duration, minDailyTime, participants } = req.body;
      const creator = req.user as User;

      // Create group first
      const group = await Group.create({
        name: `${title} Group`,
        language,
        creatorId: creator.id,
        avatar: title.charAt(0).toUpperCase()
      });

      // Create challenge
      const challenge = await Challenge.create({
        title,
        language,
        type,
        stake,
        duration,
        minDailyTime,
        creatorId: creator.id,
        groupId: group.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      });

      // Add participants
      await group.addMembers([creator.id, ...participants].map(id => id as string));
      
      res.status(201).json({ challenge, group });
    } catch (error) {
      next(error);
    }
  }

  async getGroupChat(req: Request, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const messages = await Message.findAll({
        where: { groupId },
        include: [User]
      });
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const { minutes } = req.body;
      
      // Update daily progress
      const today = new Date().toISOString().split('T')[0];
      user.dailyProgress[today] = (user.dailyProgress[today] || 0) + minutes;
      
      // Update streak
      if (user.currentChallenge?.minDailyTime != null && minutes >= user.currentChallenge?.minDailyTime) {
        user.streak += 1;
      } else {
        user.streak = 0;
      }

      await user.save();
      res.json({ progress: user.dailyProgress[today], streak: user.streak });
    } catch (error) {
      next(error);
    }
  }
} 